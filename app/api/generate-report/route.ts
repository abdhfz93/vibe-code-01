import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { context, sip_id, client_name, incident_date } = await req.json();

        if (!context) {
            return NextResponse.json({ error: "Context is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Google AI API Key not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                temperature: 0.2,
            }
        });

        const prompt = `
You are an expert technical support engineer. Your task is to analyze the following WhatsApp conversation context and generate a professional incident report.

### STEP 1: VALIDATION
First, check if the provided "Conversation Context" actually contains a technical support conversation, error logs, or relevant details about a technical issue.
- If the content is purely random characters (e.g. "abc123"), nonsense, or completely unrelated to technical support, output EXACTLY the word "INVALID_CONTEXT" and nothing else.

### STEP 2: REPORT GENERATION (Only if context is valid)
Output Format:
## Incident Summary
[Brief high-level summary of what happened]

## Impact
[Detailed impact on services and users]

## Timeline
- [HH:mm] — [Event description]
...

## Root Cause Analysis
[Technical explanation of the most likely root cause based on the conversation]

## Resolution
[How the issue was resolved]

## Follow-up Actions
- [Action item 1]
- [Action item 2]
...

Rules:
- Today is 2026. Use this context if dates are mentioned.
- Be technical and professional.
- If specific details are missing, make logical assumptions based on the technical patterns in the conversation.
- Use the exact headers provided above.

Conversation Context:
${context}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Handle validation failure
        if (text === "INVALID_CONTEXT") {
            return NextResponse.json({
                error: "The provided content doesn't look like a technical conversation. Please provide more context.",
                report: null
            });
        }

        // Calculate Title: Incident Report for Certis (sip66) - 22 Jan 2026
        let formattedDate = incident_date || new Date().toISOString().split('T')[0];
        try {
            const d = new Date(formattedDate);
            const day = String(d.getDate()).padStart(2, '0');
            const month = d.toLocaleString('en-GB', { month: 'short' });
            const year = d.getFullYear();
            formattedDate = `${day} ${month} ${year}`;
        } catch (e) { }

        const title = `Incident Report for ${client_name || 'N/A'} (${sip_id || 'N/A'}) - ${formattedDate}`;

        // Save to Supabase
        const { data: savedRecord, error: dbError } = await supabase
            .from('incident_reports')
            .insert([{
                title,
                content: text,
                sip_id,
                client_name,
                incident_date: incident_date || new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

        if (dbError) {
            console.error("DB Error Details:", dbError);
            return NextResponse.json({
                report: text,
                record: null,
                dbError: dbError.message,
                dbDetail: dbError.details,
                dbHint: dbError.hint
            });
        }

        return NextResponse.json({
            report: text,
            record: savedRecord
        });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
    }
}
