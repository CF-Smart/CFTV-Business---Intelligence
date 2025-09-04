import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxoukmguwlyjrmdysbhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b3VrbWd1d2x5anJtZHlzYmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU4MzIsImV4cCI6MjA3MjU3MTgzMn0.wlo7OqxWulg8q3MfAtPQuLCApaMpxs5fDQG0NVzLLRc'; // Substitua por sua chave anon public

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
