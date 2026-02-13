'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

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

    const origin = headers().get('origin')

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
            emailRedirectTo: `${origin}/auth/confirm`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Signup successful! Please check your email to confirm your account.' }
}
