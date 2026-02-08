const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://supabase:supabase@localhost:5432/postgres" // Try 'supabase' user
});

async function setup() {
    try {
        await client.connect();
        console.log("Connected to DB!");

        // Create Schema
        await client.query(`CREATE SCHEMA IF NOT EXISTS ai_processing;`);
        console.log("Schema ai_processing ensured.");

        // Create Requests Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_processing.processing_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                filename TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                xero_invoice_id TEXT,
                processed_data JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log("Table processing_requests ensured.");

        // Create Logs Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_processing.processing_logs (
                id SERIAL PRIMARY KEY,
                request_id UUID REFERENCES ai_processing.processing_requests(id) ON DELETE CASCADE,
                agent_name TEXT NOT NULL,
                action TEXT NOT NULL,
                status TEXT NOT NULL,
                details JSONB,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log("Table processing_logs ensured.");

        // Grant permissions just in case
        await client.query(`GRANT USAGE ON SCHEMA ai_processing TO postgres;`);
        await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ai_processing TO postgres;`);

    } catch (err) {
        console.error("DB Setup Error:", err);
    } finally {
        await client.end();
    }
}

setup();
