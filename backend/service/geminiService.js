const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async analyzeSentiment(comment, retries = 3) {
        if (!Array.isArray(comment)) comment = [comment];
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Analyze the sentiment of the following comment and classify it as 'agree', 'disagree', or 'neutral': 
        Comment: "${comment}"  
        Respond with ONLY one of these exact words: agree, disagree, or neutral.`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.candidates[0].content.parts[0].text.trim().toLowerCase(); // ✅ Corrected response parsing

            if (['agree', 'disagree', 'neutral'].includes(response)) {
                return response;
            }
            return 'neutral';

        } catch (error) {
            console.error('❌ Gemini Error analyzing sentiment:', error);

            if (error.status === 429 && retries > 0) { // ✅ Handle rate limiting
                console.warn(`⚠️ Rate limit exceeded. Retrying in 2s... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                return this.analyzeSentiment(comment, retries - 1);
            }

            throw error;
        }
    }
}

module.exports = GeminiService;
