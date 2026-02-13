'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = createClient()

    const identifier = formData.get('identifier') as string // Can be email or username
    const password = formData.get('password') as string

    if (!identifier || !password) {
        return { error: 'Required fields are missing' }
    }

    let email = identifier

    // Basic check if identifier is NOT an email
    if (!identifier.includes('@')) {
        // Try to find email by username in profiles table
        const { data, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .single()

        if (profileError || !data) {
            return { error: 'Invalid username or password' }
        }
        email = data.email
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Invalid identifier or password' }
    }

    redirect('/')
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
