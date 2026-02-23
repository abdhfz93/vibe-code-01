'use server'

import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/url'

export async function signup(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    if (!email || !password || !username) {
        return { error: 'All fields are required' }
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' }
    }

    // 1. Check if username exists in profiles
    const { data: existingUsername, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

    if (usernameCheckError) {
        return { error: 'An error occurred while checking availability' }
    }

    if (existingUsername?.username) {
        return { error: 'Username is already taken' }
    }

    // 2. Check if email exists in profiles
    const { data: existingEmail, error: emailCheckError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle()

    if (emailCheckError) {
        return { error: 'An error occurred while checking availability' }
    }

    if (existingEmail?.email) {
        return { error: 'Email is already registered' }
    }

    // 3. Proceed with signup
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
            emailRedirectTo: `${getURL()}auth/confirm`,
        },
    })

    if (error) {
        if (error.message.includes('rate limit')) {
            return { error: 'Registration limit reached for now. Please try again in an hour or contact support.' }
        }
        return { error: error.message }
    }

    return { success: true, message: 'Signup successful! Please check your email to confirm your account.' }
}
