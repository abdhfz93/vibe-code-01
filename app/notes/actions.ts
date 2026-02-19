'use server'

import { createClient } from '@/utils/supabase/server'
import { encrypt, decrypt } from '@/utils/encryption'
import { revalidatePath } from 'next/cache'

export async function getNote() {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('Auth error in getNote:', authError)
        return null
    }

    const { data, error } = await supabase
        .from('personal_notes')
        .select('encrypted_content')
        .eq('id', user.id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') { // Record not found
            return ''
        }
        console.error('Database error in getNote:', error)
        return null
    }

    if (!data?.encrypted_content) return ''

    try {
        return decrypt(data.encrypted_content)
    } catch (e) {
        console.error('Failed to decrypt note:', e)
        return 'Error: Could not decrypt note. The encryption key might have changed.'
    }
}

export async function saveNote(content: string) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Not authenticated' }
    }

    try {
        const encrypted = encrypt(content)

        const { error } = await supabase
            .from('personal_notes')
            .upsert({
                id: user.id,
                encrypted_content: encrypted,
                updated_at: new Date().toISOString()
            })

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/notes')
        return { success: true }
    } catch (e) {
        console.error('Encryption error in saveNote:', e)
        return { error: 'Failed to encrypt note' }
    }
}
