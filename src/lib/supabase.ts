import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://igyvsmjwdasncgkwsjqj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneXZzbWp3ZGFzbmNna3dzanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzY5ODYsImV4cCI6MjA4MzQxMjk4Nn0.EhbAhltlKobtwlJvdoqCiO0DQlJ8kp-mVFo--HrRNB4';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
