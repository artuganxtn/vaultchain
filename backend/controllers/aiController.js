const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getAiAssistance = async (req, res) => {
    // Check for API key on each request. It must be set as an environment variable on your server.
    // Try both API_KEY and GEMINI_API_KEY for compatibility
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("AI service is not configured: Gemini API_KEY is missing.");
        console.error("Please set API_KEY or GEMINI_API_KEY environment variable.");
        return res.status(500).json({ 
            error: "AI service is not configured on the server.",
            message: "Please configure the Gemini API key in your environment variables."
        });
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
        
        const genAI = new GoogleGenerativeAI(apiKey);
        // Try gemini-2.0-flash-exp first, fallback to gemini-pro if not available
        let model;
        try {
            model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        } catch (modelError) {
            console.warn('gemini-2.0-flash-exp not available, using gemini-pro');
            model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        }

        const result = await model.generateContentStream(fullPrompt);

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                res.write(chunkText);
            }
        }
        res.end();

    } catch (error) {
        console.error("Gemini API stream error:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        
        // Send proper error response
        if (!res.headersSent) {
            res.status(500).json({ 
                error: "Error streaming response from AI service.",
                message: error.message || "An error occurred while processing your request."
            });
        } else {
            res.end();
        }
    }
};
