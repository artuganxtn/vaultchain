const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getAiAssistance = async (req, res) => {
    // Check for API key on each request. It must be set as an environment variable on your server.
    if (!process.env.API_KEY) {
        console.error("AI service is not configured: Gemini API_KEY is missing.");
        return res.status(500).json({ message: "AI service is not configured on the server." });
    }

    const { prompt, portfolioSummary, marketSummary } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'A prompt is required.' });
    }

    try {
        const systemInstruction = `You are an expert financial assistant for the 'VaultChain' platform. Your tone is helpful, professional, and slightly enthusiastic. 
        Analyze the user's question based on the provided portfolio and market context.
        Provide clear, concise answers. Use markdown for formatting like lists or bold text.
        IMPORTANT: Always conclude your response with a clear disclaimer: "Remember, this information is for educational purposes and is not financial advice."`;

        const fullPrompt = `${systemInstruction}\n\n[CONTEXT]\nUser Portfolio: ${portfolioSummary}\nMarket Data: ${marketSummary}\n\n[USER QUESTION]\n${prompt}`;

        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const stream = await model.generateContentStream({
            contents: [
                { role: 'user', parts: [{ text: fullPrompt }] }
            ]
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of stream.stream) {
            const chunkText = chunk.text();
            if (chunkText) res.write(chunkText);
        }
        res.end();

    } catch (error) {
        console.error("Gemini API stream error:", error);
        res.status(500).send("Error streaming response from AI service.");
    }
};
