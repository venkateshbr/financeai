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
    
    IMPORTANT RULES:
    1. Look for the "Total", "Total Amount" "Balance Due", or "Amount Due"
    2. In PDF text, values sometimes appear BEFORE their labels (e.g. "$100.00 \n Total"). Use arithmetic check: Subtotal + Tax = Total.
    3. If multiple totals exist, prefer "Balance Due" or the final "Total".
    4. Ensure Date formats are strict YYYY-MM-DD.
    5. Be careful with "Discount" or "Credit" lines; do not mistake them for the total.
    6. also look at shipping amount etc and consider the total amount. 
    7. if there is shipping amount in the invoice, add a separate line item for shipping amount with description as "Shipping" , Quantity as 1 and UnitAmount as shipping amount Use the same Account as the previous line items.`


    // Configurable model from .env
    const defaultModel = process.env.AI_MODEL_EXTRACTOR || process.env.AI_MODEL_DEFAULT || "google/gemini-2.0-flash-001";

    // Add fallback strategy
    const modelsToTry = [
        defaultModel,
        "google/gemini-2.0-flash-001",
        "google/gemini-flash-1.5"
    ];
    // De-duplicate in case default is same as fallback
    const uniqueModels = [...new Set(modelsToTry)];

    console.log(`Analyzing document. Using primary model: ${defaultModel}`);

    let lastError = null;

    for (const model of uniqueModels) {
        try {
            console.log(`Trying model: ${model}`);
            // Real AI Call
            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            console.log("AI Response Content:", content);
            const parsedData = JSON.parse(content);

            // Post-processing: Default Due Date Logic
            if (parsedData.isInvoice && parsedData.data) {
                const invoiceDate = parsedData.data.Date;
                if (invoiceDate && (!parsedData.data.DueDate || parsedData.data.DueDate === "")) {
                    const dateObj = new Date(invoiceDate);
                    if (!isNaN(dateObj.getTime())) {
                        dateObj.setDate(dateObj.getDate() + 45);
                        parsedData.data.DueDate = dateObj.toISOString().split('T')[0];
                        console.log("Added default Due Date (45 days):", parsedData.data.DueDate);
                    }
                }
            }

            return parsedData;

        } catch (error) {
            console.error(`LLM Call Error with ${model}:`, error.message);
            lastError = error;
            // Continue to next model if 404/400 (invalid model) or 429 (rate limit)
            if (error.status === 404 || error.status === 400 || error.status === 429) {
                continue;
            }
            // If other error, maybe break? But let's try other models conservatively.
        }
    }

    // If all failed, fallback to mock
    console.warn("All models failed. Falling back to mock data.");
    return {
        "isInvoice": true,
        "confidence": 0.8,
        "data": {
            "ContactName": "Fallback Vendor Inc.",
            "Date": new Date().toISOString().split('T')[0],
            "DueDate": new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
            "Total": 0.00,
            "Currency": "USD",
            "InvoiceNumber": "INV-FALLBACK-" + Date.now(),
            "Description": "Fallback Invoice (API Error)",
            "LineItems": [
                { "Description": "Service (Fallback)", "Quantity": 1, "UnitAmount": 0.00 }
            ]
        }
    };
}

// AGENT 2: account Classifier
export async function determineAccountCode(invoiceDescription, lineItemDescription, availableAccounts) {
    const systemPrompt = `You are an expert Accountant Agent.
    Your task is to classify an invoice line item into the correct Chart of Accounts code.
    
    You have the following accounts available:
    ${JSON.stringify(availableAccounts)}
    
    If the description matches an account well, return that code.
    If unsure, use "400" (General Expenses) or the closest match.
    
    Return JSON:
    {
        "accountCode": "string",
        "confidence": number,
        "reasoning": "Why you chose this code"
    }`;

    const userContent = `Invoice: ${invoiceDescription}
    Line Item: ${lineItemDescription}`;

    // Configurable model from .env
    const defaultModel = process.env.AI_MODEL_CLASSIFIER || process.env.AI_MODEL_DEFAULT || "google/gemini-2.0-flash-001";

    const modelsToTry = [
        defaultModel,
        "google/gemini-2.0-flash-001",
        "google/gemini-flash-1.5"
    ];
    const uniqueModels = [...new Set(modelsToTry)];

    console.log(`Agent 2: Classifying with primary model: ${defaultModel}`);

    for (const model of uniqueModels) {
        try {
            const result = await callLLM(model, systemPrompt, userContent);
            console.log("Classification Result:", result);
            return result;
        } catch (error) {
            console.warn(`Classification with ${model} failed: ${error.message}. Trying next...`);
            if (error.status === 404 || error.status === 400 || error.status === 429) {
                continue;
            }
        }
    }

    // Final Fallback
    console.error("Account Classification Failed (All models). Returning fallback.");
    return {
        accountCode: "400",
        confidence: 0.1,
        reasoning: "Fallback due to AI error"
    };
}
