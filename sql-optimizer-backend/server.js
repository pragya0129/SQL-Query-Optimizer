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
        const systemPrompt = `
        You are an expert database performance engineer. Analyze the provided SQL query.
        
        ${hasSchema
                ? "CONTEXT: A database schema is provided. RULE: You MUST cross-reference the query with the schema to find missing indexes or table scan bottlenecks. Output the 'CREATE INDEX...' statement in the optimizedQuery field if necessary. Mention the index in your explanation."
                : "CONTEXT: No schema is provided. RULE: Assume perfect indexing. Focus ONLY on SQL syntax (e.g., changing SELECT * to explicit columns). DO NOT suggest creating indexes. Start your explanation with exactly: 'Assuming optimal indexing as no schema was provided...'"}
        
        You must respond in pure, valid JSON matching exactly this schema:
        {
            "originalHighlight": "The exact substring causing the bottleneck",
            "optimizedQuery": "The rewritten SQL query, OR the CREATE INDEX statement",
            "optimizedHighlight": "The exact substring showing the core change",
            "explanation": "Deep technical explanation of the fix.",
            "chartData": [
                { "metric": "Execution Cost", "Original": number, "Optimized": number },
                { "metric": "Rows Scanned", "Original": number, "Optimized": number },
                { "metric": "Latency (ms)", "Original": number, "Optimized": number }
            ]
        }
        Generate realistic mock numbers for the chartData based on standard DB query planners.
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