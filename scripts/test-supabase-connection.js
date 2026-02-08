import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log(`Connecting to ${supabaseUrl}...`);

    // 1. Check basic connection (Auth check is implicit in requests, but we'll try a simple select)
    // We try to select from a table we expect to exist.
    // If table doesn't exist, we get a specific error (404 or Postgres error).

    const { data, error } = await supabase
        .from('processing_requests')
        .select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === 'PGRST204' || (error.message && error.message.includes('does not exist'))) {
            console.log("⚠️ Connection successful, but 'processing_requests' table NOT found.");
            console.log("   Please run the SQL script 'setup_supabase.sql' in your Supabase Dashboard.");
        } else {
            console.error("❌ Connection Failed:", error.message, error.code);
        }
    } else {
        console.log("✅ Connection Successful!");
        console.log("✅ Table 'processing_requests' exists and is accessible.");
    }
}

checkConnection();
