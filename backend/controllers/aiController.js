const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getAiAssistance = async (req, res) => {
    // Check for API key on each request. It must be set as an environment variable on your server.
    // Try both API_KEY and GEMINI_API_KEY for compatibility
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    console.log('[AI] Request received. API Key present:', !!apiKey);
    
    if (!apiKey) {
        console.error("[AI] Gemini API_KEY is missing.");
        console.error("[AI] Please set API_KEY or GEMINI_API_KEY environment variable.");
        return res.status(500).json({ 
            error: "AI service is not configured on the server.",
            message: "Please configure the Gemini API key in your environment variables."
        });
    }

    const { prompt, portfolioSummary, marketSummary } = req.body;

    if (!prompt) {
        console.warn('[AI] Request missing prompt');
        return res.status(400).json({ message: 'A prompt is required.' });
    }

    try {
        const systemInstruction = `You are an expert financial assistant for the 'VaultChain' platform. Your tone is helpful, professional, and slightly enthusiastic. 
        Analyze the user's question based on the provided portfolio and market context.
        Provide clear, concise answers. Use markdown for formatting like lists or bold text.
        IMPORTANT: Always conclude your response with a clear disclaimer: "Remember, this information is for educational purposes and is not financial advice."`;

        const fullPrompt = `${systemInstruction}\n\n[CONTEXT]\nUser Portfolio: ${portfolioSummary || 'No portfolio data'}\nMarket Data: ${marketSummary || 'No market data'}\n\n[USER QUESTION]\n${prompt}`;
        
        console.log('[AI] Initializing Gemini API...');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try models in order of preference (most stable first)
        const modelsToTry = [
            'gemini-1.0-pro',
            'gemini-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ];
        
        let model;
        let modelName = null;
        let lastError = null;
        
        for (const tryModelName of modelsToTry) {
            try {
                model = genAI.getGenerativeModel({ model: tryModelName });
                // Test if model works by checking it doesn't throw immediately
                modelName = tryModelName;
                console.log(`[AI] Using model: ${modelName}`);
                break;
            } catch (modelError) {
                lastError = modelError;
                // Continue to next model
                continue;
            }
        }
        
        if (!model) {
            throw new Error(`No available models found. Last error: ${lastError?.message || 'Unknown error'}`);
        }

        console.log('[AI] Generating content stream...');
        let result;
        try {
            result = await model.generateContentStream(fullPrompt);
        } catch (generateError) {
            console.error('[AI] Error generating content stream:', generateError);
            console.error('[AI] Error details:', JSON.stringify(generateError, null, 2));
            throw generateError;
        }

        // Set headers for streaming response
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        console.log('[AI] Streaming response...');
        for await (const chunk of result.stream) {
            try {
                const chunkText = chunk.text();
                if (chunkText) {
                    res.write(chunkText);
                }
            } catch (chunkError) {
                console.error('[AI] Error processing chunk:', chunkError);
                // Continue streaming even if one chunk fails
            }
        }
        console.log('[AI] Stream completed');
        res.end();

    } catch (error) {
        console.error("[AI] Error:", error);
        console.error("[AI] Error message:", error.message);
        console.error("[AI] Error code:", error.code);
        console.error("[AI] Error status:", error.status);
        console.error("[AI] Error stack:", error.stack);
        
        // Log full error object if available
        if (error.response) {
            console.error("[AI] Error response:", JSON.stringify(error.response, null, 2));
        }
        if (error.cause) {
            console.error("[AI] Error cause:", error.cause);
        }
        
        // Send proper error response
        if (!res.headersSent) {
            const errorMessage = error.message || "An error occurred while processing your request.";
            const errorCode = error.code || error.status || '';
            
            // Check for specific error types
            const isApiKeyError = errorMessage.includes('API_KEY') || 
                                 errorMessage.includes('API key') || 
                                 errorMessage.includes('API_KEY_INVALID') ||
                                 errorCode === 401 ||
                                 errorCode === 403;
            
            const isModelError = errorMessage.includes('model') || 
                                errorMessage.includes('Model') ||
                                errorMessage.includes('not found') ||
                                errorCode === 404;
            
            const isQuotaError = errorMessage.includes('quota') || 
                                errorMessage.includes('Quota') ||
                                errorCode === 429;
            
            let userMessage = "Sorry, I encountered an error. Please try again.";
            if (isApiKeyError) {
                userMessage = "AI service configuration error. The API key may be invalid or expired. Please contact support.";
            } else if (isQuotaError) {
                userMessage = "AI service quota exceeded. Please try again later.";
            } else if (isModelError) {
                userMessage = "AI model is temporarily unavailable. Please try again later.";
            }
            
            // Include more details in development
            const errorDetails = process.env.NODE_ENV === 'development' ? {
                message: errorMessage,
                code: errorCode,
                type: error.constructor.name
            } : undefined;
            
            res.status(500).json({ 
                error: "Error streaming response from AI service.",
                message: userMessage,
                details: errorDetails
            });
        } else {
            res.end();
        }
    }
};
