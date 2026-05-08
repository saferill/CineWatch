import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase keys are missing! Check your .env.local file.');
} else {
  console.log('Supabase client initialized successfully.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
