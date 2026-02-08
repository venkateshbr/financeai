import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Helper to call LLM with JSON enforcement
async function callLLM(model, systemPrompt, userContent) {
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("LLM Call Error:", error);
        throw new Error("Failed to process AI request");
    }
}

// AGENT 1: Validator & Extractor
export async function extractInvoiceData(input, mimeType = 'text/plain') {
    const isImage = mimeType.startsWith('image/');

    // Construct User Content based on input type
    let userContent;

    if (isImage) {
        // Input is Base64 string for images
        userContent = [
            { type: "text", text: "Analyze this image and extract invoice data." },
            {
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${input}`
                }
            }
        ];
    } else {
        // Input is text (from PDF)
        userContent = [{ type: "text", text: input }];
    }

    const systemPrompt = `You are an expert Invoice Data Extraction Agent.
    Your task is to analyze the provided text or image and determine if it represents a valid invoice.
    
    If it is NOT an invoice, return:
    { "isInvoice": false, "reason": "Explanation why..." }
    
    If it IS an invoice, extract the following fields and return JSON:
    {
        "isInvoice": true,
        "confidence": number (0-1),
        "data": {
            "ContactName": "Vendor/Supplier Name",
            "Date": "YYYY-MM-DD",
            "DueDate": "YYYY-MM-DD",
            "Total": number,
            "Currency": "USD/GBP/EUR/etc",
            "InvoiceNumber": "string",
            "Description": "Brief summary of line items (e.g. 'Consulting Services', 'Office Supplies')",
            "LineItems": [
                { "Description": "Item Name", "Quantity": number, "UnitAmount": number }
            ]
        }
    }
    If a field is missing, use null or a reasonable guess based on context (e.g. default Quantity=1).
    Ensure Date formats are strict YYYY-MM-DD.`;

    // Use a capable multimodal model
    // Note: 'free' models might not support vision reliably. 
    // Recommended: google/gemini-flash-1.5 or similar.
    // We will stick to the config constant if possible, or use a known multimodal string.
    // Use a capable multimodal model
    // Note: 'free' models might not support vision reliably. 
    // Recommended: google/gemini-flash-1.5 or similar.
    // We will stick to the config constant if possible, or use a known multimodal string.
    const model = process.env.AI_MODEL || "google/gemini-flash-1.5";

    try {
        console.log("MOCKING AGENT 1 RESPONSE (OpenRouter 404 workaround)");
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            "isInvoice": true,
            "confidence": 0.95,
            "data": {
                "ContactName": "Test Vendor Inc.",
                "Date": new Date().toISOString().split('T')[0],
                "DueDate": new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
                "Total": 1500.00,
                "Currency": "USD",
                "InvoiceNumber": "INV-TEST-001",
                "Description": "Test Invoice for PDF Parsing Verification",
                "LineItems": [
                    { "Description": "Software Development Services", "Quantity": 1, "UnitAmount": 1500.00 }
                ]
            }
        };

        /*
        // Real AI Call - Uncomment when model is available
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content);
        */
    } catch (error) {
        console.error("LLM Call Error:", error);
        throw new Error("Failed to process AI request: " + error.message);
    }
}

// AGENT 2: account Classifier
export async function determineAccountCode(invoiceDescription, lineItemDescription, availableAccounts) {
    console.log("MOCKING AGENT 2 RESPONSE (OpenRouter 404 workaround)");
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to find a valid code from availableAccounts if provided
    let mockCode = "400"; // Default Generic Expense
    if (availableAccounts && availableAccounts.length > 0) {
        mockCode = availableAccounts[0].Code;
    }

    return {
        accountCode: mockCode,
        confidence: 0.9,
        reasoning: "Mocked classification for testing."
    };

    /*
    const systemPrompt = `You are an expert Accountant Agent.
    ...
    */
    // return await callLLM("google/gemini-flash-1.5", systemPrompt, userContent);
}
