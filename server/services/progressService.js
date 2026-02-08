import { supabase } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory fallback
const memoryStore = {
    requests: new Map(),
    logs: new Map()
};

export const progressService = {
    async createRequest(filename) {
        const id = uuidv4();
        const request = {
            id,
            filename,
            status: 'pending',
            created_at: new Date().toISOString(),
            logs: []
        };

        if (supabase) {
            const { error } = await supabase
                .from('processing_requests')
                .insert([{ id, filename, status: 'pending' }]);
            if (error) console.error("Supabase Create Error:", error);
        }

        memoryStore.requests.set(id, request);
        memoryStore.logs.set(id, []);
        return id;
    },

    async logStep(requestId, agent, action, status, details = {}) {
        const logEntry = {
            agent_name: agent,
            action,
            status,
            details,
            timestamp: new Date().toISOString()
        };

        if (supabase) {
            const { error } = await supabase
                .from('processing_logs')
                .insert([{
                    request_id: requestId,
                    agent_name: agent,
                    action,
                    status,
                    details
                }]);
            if (error) console.error("Supabase Log Error:", error);
        }

        const logs = memoryStore.logs.get(requestId) || [];
        logs.push(logEntry);
        memoryStore.logs.set(requestId, logs);
    },

    async updateStatus(requestId, status, xeroInvoiceId = null) {
        if (supabase) {
            const update = { status };
            if (xeroInvoiceId) update.xero_invoice_id = xeroInvoiceId;

            const { error } = await supabase
                .from('processing_requests')
                .update(update)
                .eq('id', requestId);
            if (error) console.error("Supabase Update Error:", error);
        }

        const req = memoryStore.requests.get(requestId);
        if (req) {
            req.status = status;
            if (xeroInvoiceId) req.xero_invoice_id = xeroInvoiceId;
            memoryStore.requests.set(requestId, req);
        }
    },

    async getRequestStatus(requestId) {
        // Try memory first for speed/consistency if fallback is active
        // But if we want persistence, we should try DB first if available?
        // Actually, let's read from memory if available (latest), else DB.

        let request = memoryStore.requests.get(requestId);
        let logs = memoryStore.logs.get(requestId);

        if (!request && supabase) {
            const { data, error } = await supabase
                .from('processing_requests')
                .select('*')
                .eq('id', requestId)
                .single();
            if (data) {
                request = data;
                const logsRes = await supabase
                    .from('processing_logs')
                    .select('*')
                    .eq('request_id', requestId)
                    .order('timestamp', { ascending: true });
                logs = logsRes.data || [];
            }
        }

        if (!request) return null;
        return { ...request, logs: logs || [] };
    },

    async getLogsByInvoiceId(xeroInvoiceId) {
        if (supabase) {
            const { data: req } = await supabase
                .from('processing_requests')
                .select('id')
                .eq('xero_invoice_id', xeroInvoiceId)
                .single();

            if (req) {
                const { data: logs } = await supabase
                    .from('processing_logs')
                    .select('*')
                    .eq('request_id', req.id)
                    .order('timestamp', { ascending: true });
                return logs;
            }
        }
        // Fallback: limited memory search
        for (const [id, req] of memoryStore.requests) {
            if (req.xero_invoice_id === xeroInvoiceId) {
                return memoryStore.logs.get(id) || [];
            }
        }
        return [];
    }
};
