import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type GenerateReportPayload = {
    context: string;
    sip_id: string;
    client_name: string;
    incident_date: string;
};

function parsePayload(value: unknown): GenerateReportPayload | null {
    if (!value || typeof value !== "object") return null;
    const obj = value as Record<string, unknown>;

    const context = typeof obj.context === "string" ? obj.context.trim() : "";
    const sip_id = typeof obj.sip_id === "string" ? obj.sip_id.trim() : "";
    const client_name = typeof obj.client_name === "string" ? obj.client_name.trim() : "";
    const incident_date = typeof obj.incident_date === "string" ? obj.incident_date.trim() : "";

    if (!context || context.length > 12000) return null;
    if (sip_id.length > 100 || client_name.length > 200) return null;
    if (incident_date && !/^\d{4}-\d{2}-\d{2}$/.test(incident_date)) return null;
    if (incident_date && Number.isNaN(Date.parse(`${incident_date}T00:00:00Z`))) return null;

    return {
        context,
        sip_id,
        client_name,
        incident_date
    };
}

export async function POST(req: Request) {
    try {
        const supabaseServer = createClient();
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let requestBody: unknown;
        try {
            requestBody = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const payload = parsePayload(requestBody);
        if (!payload) {
            return NextResponse.json(
                { error: "Invalid request payload" },
                { status: 400 }
            );
        }

        const { context, sip_id, client_name, incident_date } = payload;

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
        } catch { }

        const title = `Incident Report for ${client_name || 'N/A'} (${sip_id || 'N/A'}) - ${formattedDate}`;

        // Save to Supabase
        const { data: savedRecord, error: dbError } = await supabaseServer
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
            console.error("DB Error while saving incident report:", dbError);
            return NextResponse.json({
                report: text,
                record: null
            });
        }

        return NextResponse.json({
            report: text,
            record: savedRecord
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
