import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export const supabase = supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

if (!supabaseKey) {
    console.warn("⚠️ SUPABASE_SERVICE_KEY not found in .env. Persistence will be disabled.");
} else {
    console.log("✅ Supabase Client Initialized");
}
