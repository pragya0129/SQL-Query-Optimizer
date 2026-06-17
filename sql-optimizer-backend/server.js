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
app.post('/api/optimize', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "SQL query is required" });
        }

        // Define the strict behavior and JSON schema for the AI
        const systemPrompt = `
        You are an expert database performance engineer. Analyze the provided SQL query.
        You must respond in pure, valid JSON matching exactly this schema:
        {
            "originalHighlight": "The exact substring from the original query causing the bottleneck",
            "optimizedQuery": "The rewritten, highly optimized SQL query",
            "optimizedHighlight": "The exact substring in the optimized query showing the core change",
            "explanation": "A deep technical explanation of why the execution plan improved",
            "chartData": [
                { "metric": "Execution Cost", "Original": number, "Optimized": number },
                { "metric": "Rows Scanned", "Original": number, "Optimized": number },
                { "metric": "Latency (ms)", "Original": number, "Optimized": number }
            ]
        }
        Generate realistic mock numbers for the chartData based on standard DB query planners.
        Do not include markdown blocks, just the JSON.
        `;

        // Call the Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ],
            // Using Llama 3 70B for high reasoning capability
            model: "llama3-70b-8192",
            temperature: 0.1, // Low temperature for deterministic, analytical outputs
            response_format: { type: "json_object" } // Force Groq to output valid JSON
        });

        // Parse the AI's JSON response
        const aiResponse = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

        // Send the structured data back to the React frontend
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