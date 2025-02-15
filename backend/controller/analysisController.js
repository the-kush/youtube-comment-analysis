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

    async analyzeVideoComments(req, res) {
        const { videoUrl } = req.body;
    
        try {
          // Check if analysis already exists
          console.log("VideoAnalysisModel:", VideoAnalysisModel);
          const existingAnalysis = await VideoAnalysisModel.findOne({ videoUrl });

          if (existingAnalysis) {
            return res.json(this.formatAnalysisResponse(existingAnalysis));
          }
    
          const videoId = this.youtubeService.extractVideoId(videoUrl);
          
          // Get video info first
          const videoInfoResponse = await this.youtubeService.youtube.videos.list({
            part: ['snippet', 'statistics'],
            id: [videoId],
            key: process.env.YOUTUBE_API_KEY
          });
    
          if (!videoInfoResponse.data.items || videoInfoResponse.data.items.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
          }
    
          const videoInfo = videoInfoResponse.data.items[0].snippet;
          const comments = await this.youtubeService.fetchVideoComments(videoId);
    
          // Process comments in batches to avoid overwhelming the Gemini API
          const batchSize = 10;
          const enrichedComments = [];
          
          for (let i = 0; i < comments.length; i += batchSize) {
            const batch = comments.slice(i, i + batchSize);
            const batchPromises = batch.map(async (comment) => ({
              originalText: comment.text,
              maskedUsername: this.maskingService.maskUsername(comment.username),
              sentiment: await this.geminiService.analyzeSentiment(comment.text),
              timestamp: new Date(comment.publishedAt)
            }));
            
            const processedBatch = await Promise.all(batchPromises);
            enrichedComments.push(...processedBatch);
          }
    
          const sentimentCounts = this.calculateSentimentCounts(enrichedComments);
          const monthlyDistribution = this.calculateMonthlyDistribution(enrichedComments);
    
          const videoAnalysis = new VideoAnalysisModel({
            videoLink: videoUrl,
            videoId: videoId,
            videoTitle: videoInfo.title,
            channelTitle: videoInfo.channelTitle,
            publishedAt: videoInfo.publishedAt,
            totalComments: comments.length,
            ...sentimentCounts,
            comments: enrichedComments,
            monthlyCommentDistribution: monthlyDistribution,
            analyzedAt: new Date()
          });
    
          await videoAnalysis.save();
    
          res.json(this.formatAnalysisResponse(videoAnalysis));
        } catch (error) {
          console.error('Analysis error:', error);
          res.status(500).json({ 
            error: 'Failed to analyze video comments',
            message: error.message 
          });
        }
      }
    
      async getAnalysis(req, res) {
        try {
          const analysis = await VideoAnalysisModel.findOne({
            $or: [
              { videoId: req.params.videoId },
              { videoLink: { $regex: req.params.videoId, $options: 'i' } }
            ]
          });
    
          if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
          }
    
          res.json(this.formatAnalysisResponse(analysis));
        } catch (error) {
          console.error('Error fetching analysis:', error);
          res.status(500).json({ error: 'Failed to fetch analysis' });
        }
      }
    
      async getAllAnalyses(req, res) {
        try {
          const { page = 1, limit = 10 } = req.query;
          const skip = (page - 1) * limit;
    
          const analyses = await VideoAnalysisModel.find({})
            .select('-comments')  // Exclude comments array for performance
            .sort({ analyzedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
    
          const total = await VideoAnalysisModel.countDocuments();
    
          res.json({
            analyses,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalAnalyses: total
          });
        } catch (error) {
          console.error('Error fetching analyses:', error);
          res.status(500).json({ error: 'Failed to fetch analyses' });
        }
      }
    
      async deleteAnalysis(req, res) {
        try {
          const analysis = await VideoAnalysisModel.findOneAndDelete({
            $or: [
              { videoId: req.params.videoId },
              { videoLink: { $regex: req.params.videoId, $options: 'i' } }
            ]
          });
    
          if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
          }
    
          res.json({ message: 'Analysis deleted successfully' });
        } catch (error) {
          console.error('Error deleting analysis:', error);
          res.status(500).json({ error: 'Failed to delete analysis' });
        }
      }
    
      calculateSentimentCounts(comments) {
        return comments.reduce((acc, comment) => {
          acc[`${comment.sentiment}Count`]++;
          return acc;
        }, {
          agreementCount: 0,
          disagreementCount: 0,
          neutralCount: 0
        });
      }
    
      calculateMonthlyDistribution(comments) {
        const monthDistribution = new Map();
    
        comments.forEach(comment => {
          const monthKey = comment.timestamp.toLocaleString('default', { month: 'short', year: 'numeric' });
          monthDistribution.set(monthKey, (monthDistribution.get(monthKey) || 0) + 1);
        });
    
        return Array.from(monthDistribution, ([month, count]) => ({ month, count }))
          .sort((a, b) => new Date(b.month) - new Date(a.month));
      }
    
      formatAnalysisResponse(analysis) {
        return {
          videoId: analysis.videoId,
          videoTitle: analysis.videoTitle,
          channelTitle: analysis.channelTitle,
          totalComments: analysis.totalComments,
          agreementCount: analysis.agreementCount,
          disagreementCount: analysis.disagreementCount,
          neutralCount: analysis.neutralCount,
          monthlyCommentDistribution: analysis.monthlyCommentDistribution,
          analyzedAt: analysis.analyzedAt,
          sentimentPercentages: {
            agreement: ((analysis.agreementCount / analysis.totalComments) * 100).toFixed(1),
            disagreement: ((analysis.disagreementCount / analysis.totalComments) * 100).toFixed(1),
            neutral: ((analysis.neutralCount / analysis.totalComments) * 100).toFixed(1)
          }
        };
      }

}

module.exports = AnalysisController;