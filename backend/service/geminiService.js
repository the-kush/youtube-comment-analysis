const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async analyzeSentiment(comment) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro"});

        const prompt = `Analyze the sentiment of the following comment and classify it as 'agree', 'disagree', or 'neutral': Comment:"${comment}"  Respond with ONLY one of these exact words: agree, disagree, or neutral.`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text().trim().toLowerCase();

            if(['agree', 'disagree', 'neutral'].includes(response)) {
                return response;
            }
            return 'neutral';
        } catch (error) {
            console.error('Gemini Error analyzing sentiment', error);
            throw error;
        }
    }
}

module.exports = GeminiService;