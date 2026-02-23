# Security Best Practices Review Report

## Executive Summary
This review covered the Next.js + TypeScript codebase with focus on auth flows, API route hardening, redirect safety, and cryptography.

Four high/medium-impact issues were remediated in code during this pass:
- Open redirect exposure in auth confirmation flow.
- Unauthenticated access path to AI-powered report generation endpoint.
- Weak input validation and internal error leakage in report generation endpoint.
- Unauthenticated encryption mode for personal notes (moved to authenticated encryption with backward compatibility).

One critical residual risk remains in SQL setup: `maintenance_records` RLS policy currently allows all operations.

## Critical Findings

### SBP-001
- Severity: Critical
- Status: Open (not changed in this pass)
- Rule: NEXT-AUTH-001
- Location: `supabase/schema.sql:65`
- Evidence: policy uses `FOR ALL USING (true) WITH CHECK (true)`.
- Impact: any client with valid Supabase anon access can read/write all maintenance records if this schema is applied in production.
- Fix: replace with authenticated and ownership/role-based policies, e.g. `USING (auth.uid() IS NOT NULL)` plus table-specific ownership checks.
- Mitigation: restrict DB network exposure and rotate keys if policy was broadly deployed.

## High Findings

### SBP-002
- Severity: High
- Status: Fixed
- Rule: NEXT-REDIRECT-001
- Location: `app/auth/confirm/route.ts:4`
- Evidence: callback now enforces same-site relative redirect paths via `getSafeRedirectPath`.
- Impact: prevents abuse of `next` query parameter for open redirect phishing chains.
- Fix Applied: allow only paths beginning with `/` and reject protocol-relative/absolute forms.

### SBP-003
- Severity: High
- Status: Fixed
- Rule: NEXT-AUTH-001
- Location: `app/api/generate-report/route.ts:37`
- Evidence: endpoint now requires authenticated user (`supabaseServer.auth.getUser()`), otherwise returns `401`.
- Impact: prevents unauthenticated users from invoking LLM-backed server-side processing and DB writes.
- Fix Applied: explicit server-side auth gate before request handling.

## Medium Findings

### SBP-004
- Severity: Medium
- Status: Fixed
- Rule: NEXT-INPUT-001, NEXT-ERROR-001
- Location: `app/api/generate-report/route.ts:12`
- Evidence: strict payload parsing and bounds checks; invalid JSON and invalid payload return `400`; server now avoids returning raw DB internals.
- Impact: reduces malformed-input abuse and information disclosure in API responses.
- Fix Applied: `parsePayload` validation, JSON parse guard, and sanitized error responses.

### SBP-005
- Severity: Medium
- Status: Fixed
- Rule: NEXT-INJECT-003 (crypto misuse class)
- Location: `utils/encryption.ts:41`
- Evidence: switched from AES-CBC to AES-GCM with auth tag validation; legacy CBC decrypt retained for migration compatibility.
- Impact: prevents ciphertext tampering attacks that are possible with unauthenticated encryption modes.
- Fix Applied: new `v2:<iv>:<ciphertext>:<tag>` format with AES-256-GCM and strict key validation.

### SBP-006
- Severity: Medium
- Status: Fixed
- Rule: NEXT-HOST-001
- Location: `app/signup/actions.ts:59`
- Evidence: email confirmation redirect now uses canonical configured base URL from `getURL()` instead of request header-derived origin.
- Impact: reduces host-header poisoning risk in auth email links.
- Fix Applied: replaced `headers().get('origin')` with `getURL()`.

## Additional Hardening Applied

### SBP-007
- Severity: Low
- Status: Fixed
- Rule: NEXT-INPUT-001
- Location: `app/signup/actions.ts:21`
- Evidence: replaced `.or(...)` filter string composition with separate `.eq(...)` checks.
- Impact: avoids filter-string injection edge cases and improves query clarity.
- Fix Applied: separate username and email existence checks.

