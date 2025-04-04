import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jpjluqaoljddqnmhaqqc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwamx1cWFvbGpkZHFubWhhcXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4ODAzODQsImV4cCI6MjA1ODQ1NjM4NH0.IkqaBiT7CW3hLCf0Gm3Uu6i6cLuYQv5E4v7acpE8vpI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'supabase.auth.token',
  },
});