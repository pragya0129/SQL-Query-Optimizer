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
app.post('/api/optimize', async (req, res) => {
    try {
        // 1. Extract both query and schema from the request body
        const { query, schema } = req.body;

        if (!query) {
            return res.status(400).json({ error: "SQL query is required" });
        }

        // 2. The core system behavior definition

        const systemPrompt = `
        You are an expert database performance engineer. Analyze the provided SQL query. 

        CRITICAL RULES FOR ANALYSIS:
        1. IF NO SCHEMA IS PROVIDED: You MUST assume the database already has perfect indexing. Focus ONLY on refactoring the SQL syntax itself (e.g., changing SELECT * to explicit columns, converting IN to EXISTS, optimizing JOINs). DO NOT suggest creating indexes. If the syntax is already optimal, state that no changes are needed.
        2. IF A SCHEMA IS PROVIDED: Cross-reference the query with the schema. If the syntax is fine but an index is missing, output the required 'CREATE INDEX...' statement in the optimizedQuery field.

        You must respond in pure, valid JSON matching exactly this schema:
        {
            "originalHighlight": "The exact substring causing the bottleneck (or null if perfect)",
            "optimizedQuery": "The rewritten SQL query, OR the CREATE INDEX statement if schema is provided and missing an index, OR 'Query is already optimal given the provided context.'",
            "optimizedHighlight": "The exact substring showing the core change (or null)",
            "explanation": "Deep technical explanation of the fix. If no schema was provided, explicitly state: 'Assuming optimal indexing as no schema was provided...'",
            "chartData": [
                { "metric": "Execution Cost", "Original": number, "Optimized": number },
                { "metric": "Rows Scanned", "Original": number, "Optimized": number },
                { "metric": "Latency (ms)", "Original": number, "Optimized": number }
            ]
        }
        Generate realistic mock numbers for the chartData based on standard DB query planners.
        Do not include markdown blocks, just the JSON.
        `;

        // 3. Dynamically build the User Prompt based on whether a schema was provided
        const userPrompt = schema && schema.trim() !== ""
            ? `DATABASE SCHEMA:\n${schema}\n\nRAW QUERY TO OPTIMIZE:\n${query}`
            : `RAW QUERY TO OPTIMIZE:\n${query}`;

        // 4. Call the Groq API
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