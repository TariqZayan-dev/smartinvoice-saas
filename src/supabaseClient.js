import { createClient } from '@supabase/supabase-js'

// --- YOUR PROJECT DETAILS ---
const SUPABASE_URL = "https://yyyaoxikbsmqbxwfvlcf.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5eWFveGlrYnNtcWJ4d2Z2bGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NjE1MjAsImV4cCI6MjA3OTIzNzUyMH0.GU4MyGjQARt-DRTVxMa2XXIGXVkyYtpoKYvI3QyqzMM"

// --- CREATE CLIENT ---
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

