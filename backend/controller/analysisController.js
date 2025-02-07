const YoutubeService = require("../service/youtubeService");
const GeminiService = require("../service/geminiService");
const MaskingService = require("../service/maskingService");
const VideoAnalysisModel = require("../model/commentAnalysis");

class AnalysisController {
    constructor() {
        this.youtubeService = new YoutubeService();
        this.geminiService = new GeminiService();
        this.maskingService = new MaskingService();
    }

    
}