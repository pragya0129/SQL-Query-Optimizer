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
        You are an expert database performance engineer. Analyze the provided SQL query.
        
        CRITICAL RULES FOR ANALYSIS:
        1. ${hasSchema
                ? "CONTEXT: Schema provided. RULE: Evaluate all optimization paths. If rewriting the query (e.g., converting non-SARGable functions like YEAR() into date ranges) utilizes an existing index, YOU MUST PROVIDE THE REWRITTEN QUERY as the 'optimizedQuery'. DO NOT suggest creating a new index if a query rewrite solves the issue. Only output 'CREATE INDEX' if absolutely no query rewrite can fix the bottleneck."
                : "CONTEXT: No schema provided. RULE: Assume perfect indexing. Focus ONLY on SQL syntax."}
        2. EXPLANATION FORMAT: The explanation MUST be an array of distinct, concise bullet points explaining the architectural changes step-by-step.
        
        You must respond in pure, valid JSON matching exactly this schema:
        {
            "originalHighlight": "The exact substring causing the bottleneck",
            "optimizedQuery": "The single BEST rewritten SQL query, OR the CREATE INDEX statement",
            "optimizedHighlight": "The exact substring showing the core change",
            "explanation": ["Point 1 explaining the flaw", "Point 2 explaining the fix", "Point 3 explaining the resulting gain"],
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