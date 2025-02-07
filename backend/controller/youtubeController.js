const YoutubeService = require("../service/youtubeService");

class YoutubeController {
    constructor() {
        this.youtubeService = new YoutubeService();
    }

    async getVideoInfo(req, res) {
        try {
            const videoId = this.youtubeService.extractVideoId(req.body.videoUrl);
            const response = await this.youtubeService.youtube.videos.list({
                part: ['snippet', 'statistics'],
                id: [videoId],
                key: process.env.YOUTUBE_API_KEY
            });
            if(!response.data.items || response.data.items.length === 0) {
                return res.status(404).json({ message: 'Video not found' });
            }

            const videoInfo = response.data.items[0];
            const { title, description, publishedAt, channelTitle } = videoInfo.snippet;
            const { viewCount, likeCount, commentCount } = videoInfo.statistics;

            res.json({
                videoId,
                title,
                description,
                publishedAt,
                channelTitle,
                statistics: {
                    views: viewCount,
                    likes: likeCount,
                    comments: commentCount
                }
            })

        } catch (error) {
            console.error('Error fetching youtube video info', error);
            res.status(500).json({ message: error.message, error: "Failed to fetch video info" });
        }
    }

    async getComments(req, res) {
        const { videoUrl, maxResults = 100 } = req.body;

        try{

        }catch (err){
            console.log("Error fetching comments:", error);
            res.status(500).json({ error: "Failed to fetch comments", message: error.message });
        }
    }

    async validateVideoUrl(req, res) {
        const { videoUrl } = req.body;

        try {
            const videoId = this.youtubeService.extractVideoId(videoUrl);
            const response = await this.youtubeService.youtube.videos.list({ 
                part: ['id'],
                id: [videoId],
                key: process.env.YOUTUBE_API_KEY
            });

            const isValid = response.data.items && response.data.items.length > 0;

            res.json({
                isValid,
                videoId: isValid ? videoId : null
            });
        } catch (e) {
            res.json({
                isValid: false,
                e: e.message
            });
        }
    }

    async checkCommentsEnabled(req, res) {
        const { videoUrl } = req.body;

        try {
            const videoId = this.youtubeService.extractVideoId(videoUrl);
            const response = await this.youtubeService.youtube.videos.list({ 
                part: ['statistics'],
                id: [videoId],
                key: process.env.YOUTUBE_API_KEY
            });

            if(!response.data.items || response.data.items.length === 0) {
                return res.status(404).json({ message: 'Video not found' });
            }

            const videoInfo = response.data.items[0];
            const hasComments = videoInfo.statistics.commentCount !== undefined;

            res.json({
                commentsEnabled: hasComments,
                commentCount: hasComments ? videoInfo.statistics.commentCount : 0
            });
        } catch (e) {
            console.log('Erro checking comments status: ', e);
            res.status(500).json({ error: "Failed to check comments status", message: e.message });
        }
    }
}

module.exports = YoutubeController;

