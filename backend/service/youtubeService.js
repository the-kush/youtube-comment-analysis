const { google } = require('googleapis');
require('dotenv').config();

class YoutubeService { 
    constructor() {
    this.youtube = google.youtube('v3');
    }

    async fetchVideoComments(videoId, maxResults = 100) {
        try {
            const response = await this.youtube.commentThreads.list({
                key: process.env.YOUTUBE_API_KEY,
                part: ['snippet'],
                videoId: videoId,
                maxResults: maxResults,
                key: process.env.YOUTUBE_API_KEY
            });

            return response.data.items?.map(item => ({
                text: item.snippet?.topLevelComment?.snippet?.textDisplay,
                username: item.snippet?.topLevelComment?.snippet?.authorDisplayName,
                publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt
            })) || [];
        } catch (error) {
            console.error('Error fetching youtube comments' ,error);
            throw error;
        }
    }

    extractVideoId(url) {
        const videoIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(videoIdRegex);
        if(!match) {
            throw new Error('Invalid youtube url');
        }
        return match[1];
    }
}

module.exports = YoutubeService;