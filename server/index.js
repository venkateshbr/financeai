
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { XeroClient } from 'xero-node';
import OpenAI from 'openai';
import cookieSession from 'cookie-session';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdfParse = require('pdf-parse');
// Handle ESM/CommonJS interop in newer Node versions
if (pdfParse.default) {
    pdfParse = pdfParse.default;
}

dotenv.config();

const app = express();
const port = 3156;

app.use(cors());
app.use(express.json());
app.use(cookieSession({
    name: 'session',
    keys: ['secret-key'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const upload = multer({ dest: 'uploads/' });

// Xero Config
const client_id = process.env.XERO_CLIENT_ID;
const client_secret = process.env.XERO_CLIENT_SECRET;
const redirectUrl = process.env.XERO_REDIRECT_URI || 'http://localhost:5173/api/auth/xero/callback';
const scopes = 'accounting.transactions accounting.settings.read accounting.contacts accounting.reports.read accounting.attachments';

const xero = new XeroClient({
    clientId: client_id,
    clientSecret: client_secret,
    grantType: 'client_credentials',
    scopes: scopes.split(' ')
});

// OpenAI (OpenRouter) Config
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Global Token Set
let globalTokenSet = null;

const initializeXero = async () => {
    try {
        // Client Credentials Flow
        const tokenSet = await xero.getClientCredentialsToken();
        globalTokenSet = tokenSet;
        xero.setTokenSet(tokenSet);
        console.log("Xero Client Credentials Auth Successful");

        await xero.updateTenants(false);
        const activeTenant = xero.tenants[0]; 
        if (activeTenant) {
            console.log("Active Tenant ID:", activeTenant.tenantId);
        } else {
            console.log("Warning: No active tenants found for this connection.");
        }
    } catch (error) {
        console.error("Error initializing Xero:", error);
    }
};

// Initialize Xero on start
initializeXero();

// Auth Routes (Deprecated/Modified for status)
app.get('/api/auth/xero', (req, res) => {
    res.send("Server is using Client Credentials Flow. No user auth required.");
});

app.get('/api/auth/xero/callback', (req, res) => {
    res.redirect('/client/dashboard');
});

app.get('/api/xero/connected', (req, res) => {
    res.json({ connected: !!globalTokenSet });
});

// Middleware to check Xero Auth
const ensureXeroAuth = async (req, res, next) => {
    try {
        if (!globalTokenSet) {
            await initializeXero();
        }

        if (!globalTokenSet) {
            return res.status(500).json({ error: 'Server not authenticated with Xero' });
        }

        // Check if expired and refresh if necessary (Client Credentials tokens expire too)
        // verify expiration requires a check against current time
        // The SDK might handle checking, but let's be safe:
        // xero-node's tokenSet.expired() checks local expiry time.

        if (globalTokenSet.expired()) {
            console.log("Token expired, refreshing via Client Credentials...");
            await initializeXero();
        }

        // Update SDK state just in case
        xero.setTokenSet(globalTokenSet);

        // For M2M Custom Connections, we must pass the Tenant ID
        if (xero.tenants && xero.tenants.length > 0) {
            req.xeroTenantId = xero.tenants[0].tenantId;
        } else {
            throw new Error('No Xero tenant available for this M2M connection');
        }

        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Data Routes
app.get('/api/xero/overview', ensureXeroAuth, async (req, res) => {

    try {
        const tenantId = req.xeroTenantId;

        // 1. Fetch Organisation Details
        const orgResponse = await xero.accountingApi.getOrganisations(tenantId);
        const organisationName = orgResponse.body.organisations[0].name;

        // 2. Fetch Yearly P&L (Last Calendar Year: 2025)
        const yearFromDate = "2025-01-01";
        const yearToDate = "2025-12-31";
        const plYearResponse = await xero.accountingApi.getReportProfitAndLoss(tenantId, yearFromDate, yearToDate);

        // 3. Fetch Monthly P&L (Last 6 Months) for Chart
        // We use the end of last month as the "To" date, and go back 5 periods (total 6)
        // Or simpler: Just rely on Xero's default "periods" argument
        const today = new Date();
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];

        // Fetch P&L ending last month, with 5 comparative periods (total 6 months)
        // timeframe="MONTH", periods=5
        const plMonthlyResponse = await xero.accountingApi.getReportProfitAndLoss(tenantId, endOfLastMonth, undefined, 5, "MONTH");

        res.json({
            organisationName,
            profitAndLossYear: plYearResponse.body,
            profitAndLossMonthly: plMonthlyResponse.body
        });
    } catch (error) {
        console.error("Error fetching overview:", error);
        res.status(500).json({ error: "Failed to fetch overview data" });
    }
});

// Imports at top
// const require = createRequire(import.meta.url);
// let pdfParse = require('pdf-parse');
// if (pdfParse.default) pdfParse = pdfParse.default;
// Replaced with import at top


import { extractInvoiceData, determineAccountCode } from './services/aiService.js';

// ... (Keep existing imports)

import { progressService } from './services/progressService.js';

// ... (existing code)

// Helper: Background Processing Function
// We need to pass the file object (after multer) and tenantId
async function processInvoiceBackground(file, tenantId, requestId) {
    try {
        await progressService.logStep(requestId, 'Document Ingestion Agent', 'File Received', 'started', { mimetype: file.mimetype });

        // 1. Read File Content
        let aiInputData = "";
        let mimeType = file.mimetype;
        const fileBuffer = fs.readFileSync(file.path);

        if (file.mimetype === 'application/pdf') {
            await progressService.logStep(requestId, 'Document Ingestion Agent', 'Parse PDF', 'in-progress');
            try {
                let PDFParseClass = pdfParse;
                if (pdfParse.PDFParse) {
                    PDFParseClass = pdfParse.PDFParse;
                } else if (pdfParse.default && pdfParse.default.PDFParse) {
                    PDFParseClass = pdfParse.default.PDFParse;
                }

                const uint8Buffer = new Uint8Array(fileBuffer);
                const parser = new PDFParseClass(uint8Buffer);
                const pdfData = await parser.getText();
                aiInputData = pdfData.text || "";
                aiInputData = aiInputData.substring(0, 10000);
                await progressService.logStep(requestId, 'Document Ingestion Agent', 'Parse PDF', 'completed');
            } catch (pdfError) {
                console.error("PDF Parse Error:", pdfError);
                await progressService.logStep(requestId, 'Document Ingestion Agent', 'Parse PDF', 'failed', { error: pdfError.message });
                await progressService.updateStatus(requestId, 'failed');
                throw new Error("Failed to parse PDF text: " + pdfError.message);
            }
        } else if (file.mimetype.startsWith('image/')) {
            await progressService.logStep(requestId, 'Document Ingestion Agent', 'Read Image', 'completed');
            aiInputData = fileBuffer.toString('base64');
        } else {
            await progressService.updateStatus(requestId, 'failed');
            throw new Error("Unsupported file type");
        }

        // 2. AGENT 1: Process with AI (Validate & Extract)
        console.log("Agent 1: Validating and Extracting...");
        await progressService.logStep(requestId, 'Extraction Agent', 'Extract Invoice Data', 'in-progress');

        const extractionResult = await extractInvoiceData(aiInputData, mimeType);

        if (!extractionResult.isInvoice) {
            fs.unlinkSync(file.path);
            await progressService.logStep(requestId, 'Extraction Agent', 'Validate Invoice', 'failed', { reason: extractionResult.reason });
            await progressService.updateStatus(requestId, 'rejected');
            return;
        }

        const invoiceData = extractionResult.data;
        console.log("Agent 1 Success:", invoiceData);
        await progressService.logStep(requestId, 'Extraction Agent', 'Extract Invoice Data', 'completed', { confidence: extractionResult.confidence });

        // 3. Setup Dependencies for Agent 2
        await progressService.logStep(requestId, 'Classification Agent', 'Fetch Chart of Accounts', 'in-progress');
        const accountsResponse = await xero.accountingApi.getAccounts(tenantId, undefined, 'Class=="EXPENSE" AND Status=="ACTIVE"');
        const expenseAccounts = accountsResponse.body.accounts || [];
        const simplifiedAccounts = expenseAccounts.map(a => ({ Code: a.code, Name: a.name }));
        await progressService.logStep(requestId, 'Classification Agent', 'Fetch Chart of Accounts', 'completed', { count: simplifiedAccounts.length });

        // 4. AGENT 2: Classify Line Items
        console.log("Agent 2: Classifying Line Items...");
        await progressService.logStep(requestId, 'Classification Agent', 'Classify Line Items', 'in-progress');

        const validLineItems = [];
        const rawItems = invoiceData.LineItems && invoiceData.LineItems.length > 0
            ? invoiceData.LineItems
            : [{ Description: invoiceData.Description || "Services", Quantity: 1, UnitAmount: invoiceData.Total }];

        for (const item of rawItems) {
            const classification = await determineAccountCode(
                invoiceData.Description || "Invoice",
                item.Description,
                simplifiedAccounts
            );

            validLineItems.push({
                description: item.Description,
                quantity: item.Quantity || 1,
                unitAmount: item.UnitAmount || 0,
                accountCode: classification.accountCode || "400",
            });
            await progressService.logStep(requestId, 'Classification Agent', 'Classify Item', 'completed', {
                item: item.Description,
                code: classification.accountCode,
                reason: classification.reasoning
            });
        }

        // 5. Create Draft Invoice in Xero
        await progressService.logStep(requestId, 'Integration Agent', 'Create Draft Invoice', 'in-progress');
        const invoices = {
            invoices: [{
                type: 'ACCPAY', // Bill
                contact: { name: invoiceData.ContactName || "Unknown Vendor" },
                date: invoiceData.Date,
                dueDate: invoiceData.DueDate,
                reference: invoiceData.InvoiceNumber,
                lineItems: validLineItems,
                status: 'DRAFT'
            }]
        };

        const invoiceResponse = await xero.accountingApi.createInvoices(tenantId, invoices);
        const newInvoice = invoiceResponse.body.invoices[0];
        console.log("Draft Invoice Created:", newInvoice.invoiceID);
        await progressService.logStep(requestId, 'Integration Agent', 'Create Draft Invoice', 'completed', { invoiceID: newInvoice.invoiceID });

        // 6. Attach File
        await progressService.logStep(requestId, 'Integration Agent', 'Upload Attachment', 'in-progress');
        await xero.accountingApi.createInvoiceAttachmentByFileName(tenantId, newInvoice.invoiceID, file.originalname, fileBuffer);
        await progressService.logStep(requestId, 'Integration Agent', 'Upload Attachment', 'completed');

        // Clean up
        fs.unlinkSync(file.path);

        // Finalize Request
        await progressService.updateStatus(requestId, 'completed', newInvoice.invoiceID);

    } catch (error) {

        console.error("Background Processing Error:", error);
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        await progressService.logStep(requestId, 'System', 'Processing', 'failed', { error: error.message });
        await progressService.updateStatus(requestId, 'failed');
    }
}

// Upload Route - Async
app.post('/api/upload', upload.single('file'), ensureXeroAuth, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const requestId = await progressService.createRequest(req.file.originalname);

        // Start background processing
        processInvoiceBackground(req.file, req.xeroTenantId, requestId);

        res.json({
            message: "Upload accepted. Processing started.",
            requestId: requestId,
            status: "pending"
        });

    } catch (error) {
        console.error("Upload initialization error:", error);
        res.status(500).json({ error: "Failed to initialize upload" });
    }
});

// Status Route
app.get('/api/processing/:id', async (req, res) => {
    const status = await progressService.getRequestStatus(req.params.id);
    if (!status) return res.status(404).json({ error: 'Request not found' });
    res.json(status);
});

// Logs by Invoice ID Route
app.get('/api/processing/logs/invoice/:xeroId', async (req, res) => {
    const logs = await progressService.getLogsByInvoiceId(req.params.xeroId);
    res.json(logs);
});

app.get('/api/xero/invoices', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const response = await xero.accountingApi.getInvoices(tenantId, undefined, 'Status=="DRAFT" AND Type=="ACCPAY"');
        res.json(response.body.invoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

app.post('/api/xero/invoices/:id/approve', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const invoiceID = req.params.id;

        const invoices = {
            invoices: [{
                invoiceID: invoiceID,
                status: 'AUTHORISED'
            }]
        };

        const response = await xero.accountingApi.updateInvoice(tenantId, invoiceID, invoices);
        res.json(response.body.invoices[0]);
    } catch (error) {
        console.error("Error approving invoice:", error);
        res.status(500).json({ error: "Failed to approve invoice" });
    }
});

// Internal Dashboard Stats
app.get('/api/internal/dashboard', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;

        // 1. Tenant Count (Mocked as 1 for now since we are using Custom Connection)
        const tenantCount = 1;

        // 2. Pending Reviews (Draft Invoices)
        // We need to count them. getInvoices returns a list.
        const pendingResponse = await xero.accountingApi.getInvoices(tenantId, undefined, 'Status=="DRAFT" AND Type=="ACCPAY"');
        const pendingReviews = pendingResponse.body.invoices.length;

        // 3. Processed Docs (Authorised Invoices)
        const processedResponse = await xero.accountingApi.getInvoices(tenantId, undefined, 'Status=="AUTHORISED" AND Type=="ACCPAY"');
        const processedDocs = processedResponse.body.invoices.length;

        // 4. Recent Activity (Latest 5 Draft Invoices)
        // We can reuse the pendingResponse, just slice the last 5 (or sort by date if needed)
        // Xero returns them usually sorted by UpdatedDate descending or we can sort manually.
        const recentActivity = pendingResponse.body.invoices
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by Date Descending
            .slice(0, 5);

        res.json({
            tenantCount,
            pendingReviews,
            processedDocs,
            recentActivity
        });

    } catch (error) {
        console.error("Error fetching internal dashboard stats:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

// Get Invoice Details (Single)
app.get('/api/xero/invoices/:id', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const invoiceID = req.params.id;
        const response = await xero.accountingApi.getInvoice(tenantId, invoiceID);
        res.json(response.body.invoices[0]);
    } catch (error) {
        console.error("Error fetching invoice details:", error);
    }
});

// List Active Accounts
app.get('/api/xero/accounts', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const response = await xero.accountingApi.getAccounts(tenantId, undefined, 'Status=="ACTIVE"');
        res.json(response.body.accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
});

// Get Invoice Attachments
app.get('/api/xero/invoices/:id/attachments', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const invoiceID = req.params.id;
        const response = await xero.accountingApi.getInvoiceAttachments(tenantId, invoiceID);

        if (response.body.attachments && response.body.attachments.length > 0) {
            res.json(response.body.attachments);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error("Error fetching invoice attachments:", error);
        res.status(500).json({ error: "Failed to fetch invoice attachments" });
    }
});

// Get Attachment Content - Proxy
app.get('/api/xero/invoices/:invoiceId/attachments/:attachmentId/content', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const { invoiceId, attachmentId } = req.params;

        // Use getInvoiceAttachmentById to fetch content
        // This endpoint returns the file content
        const response = await xero.accountingApi.getInvoiceAttachmentById(tenantId, invoiceId, attachmentId, "application/pdf");

        // The body should be the buffer
        res.setHeader('Content-Type', 'application/pdf');
        res.send(response.body);

    } catch (error) {
        console.error("Error fetching attachment content:", error);
        res.status(500).json({ error: "Failed to fetch attachment content" });
    }
});

// Update Invoice (PUT) - Before Approval
app.put('/api/xero/invoices/:id', ensureXeroAuth, async (req, res) => {
    try {
        const tenantId = req.xeroTenantId;
        const invoiceID = req.params.id;
        const { contact, date, dueDate, lineItems, reference } = req.body;

        const invoices = {
            invoices: [{
                invoiceID: invoiceID,
                contact: { contactID: contact.contactID }, // Only send ID to avoid Date serialization issues on other fields
                date: date ? new Date(date) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                lineItems: lineItems, // complete replacement of line items
                reference: reference
            }]
        };

        const response = await xero.accountingApi.updateInvoice(tenantId, invoiceID, invoices);
        res.json(response.body.invoices[0]);
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ error: "Failed to update invoice" });
    }
});

// Chat Proxy Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
        if (!n8nWebhookUrl) {
            console.error("Error: N8N_CHAT_WEBHOOK_URL is not defined in .env");
            return res.status(500).json({ error: "Chat service configuration missing." });
        }

        const logEntry = `[${new Date().toISOString()}] Proxying chat request to n8n: ${n8nWebhookUrl}\nRequest Body: ${JSON.stringify(req.body)}\n`;
        fs.appendFileSync('server_logs.txt', logEntry);

        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`n8n Error (${response.status}):`, errorText);
            fs.appendFileSync('server_logs.txt', `[${new Date().toISOString()}] n8n Error (${response.status}): ${errorText}\n`);
            throw new Error(`n8n responded with ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log("n8n Response:", JSON.stringify(data));
        fs.appendFileSync('server_logs.txt', `[${new Date().toISOString()}] n8n Response: ${JSON.stringify(data)}\n`);
        res.json(data);
    } catch (error) {
        console.error("Chat Proxy Error:", error);
        // Distinguish between connection errors (n8n down) and other errors
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            res.status(503).json({ error: "Chat service is currently unavailable (Connection Refused)." });
        } else {
            res.status(500).json({ error: "Failed to communicate with chat service.", details: error.message });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
