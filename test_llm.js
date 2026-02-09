import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const models = [
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "google/gemini-2.0-pro-exp-02-05:free",
    "google/gemini-2.0-flash-thinking-exp:free",
    "google/gemini-flash-1.5-8b",
    "google/gemini-2.0-flash-001"
];

async function test() {
    for (const model of models) {
        console.log(`Testing ${model}...`);
        try {
            const completion = await openai.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: "Hello, are you working?" }],
            });
            console.log(`SUCCESS: ${model}`);
            console.log(completion.choices[0].message.content);
            return; // Found a working one
        } catch (error) {
            console.error(`FAILED: ${model} - ${error.message}`);
        }
    }
}

test();
