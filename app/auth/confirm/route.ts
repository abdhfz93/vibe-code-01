import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

function getSafeRedirectPath(next: string | null): string {
    if (!next) return '/'
    // Only allow same-site relative paths and block protocol-relative URLs.
    if (!next.startsWith('/') || next.startsWith('//')) return '/'
    return next
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const nextPath = getSafeRedirectPath(searchParams.get('next'))

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(new URL(nextPath, request.url))
        }
    }

    // return the user to an error page with some instructions
    return NextResponse.redirect(new URL('/login?message=Could not verify email', request.url))
}
