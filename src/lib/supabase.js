import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both Supabase env vars are set. */
export const supabaseConfigured = Boolean(url && anonKey);

/** Shared client. Signed-in users' tokens are attached automatically. */
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
