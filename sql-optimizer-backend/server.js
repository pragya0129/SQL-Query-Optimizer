require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// The core optimization endpoint
// The core optimization endpoint
// The core optimization endpoint
app.post('/api/optimize', async (req, res) => {
    try {
        const { query, schema } = req.body;

        if (!query) {
            return res.status(400).json({ error: "SQL query is required" });
        }

        // Check if the user actually typed a schema
        const hasSchema = schema && schema.trim() !== "";

        // 1. Dynamic System Prompting
        // We only feed the AI the rules relevant to its current context.
        // 1. Dynamic System Prompting
        const systemPrompt = `
        You are an expert database performance engineer specializing in SQLite. Analyze the provided SQL query.
        
        CRITICAL RULES:
        1. CONTEXT: Schema provided from a local Edge-WASM SQLite instance. RULE: Prioritize rewriting the query to utilize existing indexes (e.g., converting non-SARGable functions).
        2. EXPLANATION: MUST be an array of distinct, concise bullet points explaining the architectural changes step-by-step.
        
        You must respond in pure, valid JSON matching exactly this schema:
        {
            "originalHighlight": "The exact substring causing the bottleneck",
            "optimizedQuery": "The single BEST rewritten SQL query",
            "optimizedHighlight": "The exact substring showing the core change",
            "explanation": ["Point 1", "Point 2", "Point 3"],
            "chartData": [
                { "metric": "Execution Cost", "Original": number, "Optimized": number },
                { "metric": "Rows Scanned", "Original": number, "Optimized": number },
                { "metric": "Latency (ms)", "Original": 0, "Optimized": 0 } 
            ]
        }
        Generate realistic mock numbers for Execution Cost and Rows Scanned. Keep Latency at 0 (the client edge node will inject real latency metrics).
        Do not include markdown blocks, just the JSON.
        `;

        // 2. Build the User Prompt
        const userPrompt = hasSchema
            ? `DATABASE SCHEMA:\n${schema}\n\nRAW QUERY TO OPTIMIZE:\n${query}`
            : `RAW QUERY TO OPTIMIZE:\n${query}`;

        // 3. Call the Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
        res.json(aiResponse);

    } catch (error) {
        console.error("Optimization Error:", error);
        res.status(500).json({ error: "Failed to process query optimization" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Optimizer API running on http://localhost:${PORT}`);
});