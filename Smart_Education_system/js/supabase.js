// ============ Smart Education Portal — connection ============
// LATER (Step 0): after creating the Supabase project, replace these 2 values
// from: Supabase dashboard → Project Settings → API

const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co"; // ← replace later
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";              // ← replace later

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);