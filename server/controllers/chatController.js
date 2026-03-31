const { GoogleGenerativeAI } = require('@google/generative-ai');

const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Gemini API Key is missing on the server.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        let model;
        try {
            // Priority 1: Gemini 2.0 Flash
            model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: "You are a highly knowledgeable and friendly AI assistant for farmers using the FarmGuide app. Your goal is to provide practical, accurate, and easy-to-understand advice on crop cultivation, soil management, disease treatment, weather impacts, and agricultural market trends. Keep your answers concise, actionable, and formatted nicely. Do not answer questions completely unrelated to agriculture or the FarmGuide app features."
            });
        } catch (e) {
            // Priority 2: Gemini Flash Latest
            model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                systemInstruction: "You are a highly knowledgeable and friendly AI assistant for farmers using the FarmGuide app..."
            });
        }

        // Convert the frontend history format to the Gemini SDK format
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.5,
            }
        });

        let result;
        try {
            result = await chat.sendMessage(message);
        } catch (sendError) {
            console.warn("Primary model sendMessage failed, trying gemini-pro fallback...", sendError.message);
            // Last Resort: Gemini Pro
            const backupModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const backupChat = backupModel.startChat({ history: formattedHistory });
            result = await backupChat.sendMessage(message);
        }

        const responseText = result.response.text();
        res.json({ success: true, response: responseText });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        const errorMsg = error.message?.includes('503') || error.message?.includes('overloaded') 
            ? 'The AI server is slightly busy right now. Please try your message again in a moment.' 
            : 'Failed to generate response. Please try again.';
        res.status(500).json({ success: false, message: errorMsg });
    }
};

module.exports = { handleChat };
