const express = require('express');
const router = express.Router();
const AnalysisController = require('../controller/analysisController.js');
const YoutubeController = require('../controller/youtubeController.js');

const analysisController = new AnalysisController();
const youtubeController = new YoutubeController();

router.post('/analyze', (req, res) => analyzeControllerInstance.analyzeVideoComments(req, res));

router.post('/analyze', (req, res) => {
    // Endpoint to perform comprehensive comment analysis
    // Expects: { videoUrl: string }
    // Returns: Detailed analysis of video comments including sentiment breakdown
    analysisController.analyzeVideoComments(req, res);
});

// GET route to retrieve a specific video analysis
router.get('/analysis/:videoId', (req, res) => {
    // Endpoint to fetch analysis for a specific video
    // URL Param: videoId (can be video ID or part of URL)
    // Returns: Detailed analysis of a previously analyzed video
    analysisController.getAnalysis(req, res);
});

// GET route to list all previous analyses
router.get('/analyses', (req, res) => {
    // Endpoint to retrieve paginated list of analyses
    // Query Params: 
    // - page (default: 1)
    // - limit (default: 10)
    // Returns: List of analyses with pagination metadata
    analysisController.getAllAnalyses(req, res);
});

// DELETE route to remove a specific analysis
router.delete('/analysis/:videoId', (req, res) => {
    // Endpoint to delete a specific video analysis
    // URL Param: videoId (can be video ID or part of URL)
    // Returns: Success message or error
    analysisController.deleteAnalysis(req, res);
});

// YouTube-specific routes
// POST route to get video information
router.post('/video/info', (req, res) => {
    // Endpoint to fetch basic video information
    // Expects: { videoUrl: string }
    // Returns: Video details like title, description, channel, etc.
    youtubeController.getVideoInfo(req, res);
});

// POST route to get video comments
router.post('/video/comments', (req, res) => {
    // Endpoint to retrieve video comments
    // Expects: { 
    //   videoUrl: string, 
    //   maxResults: number (optional, default: 100) 
    // }
    // Returns: List of comments for the video
    youtubeController.getComments(req, res);
});


// youtubeController.js
router.post('/video/info', (req, res) => youtubeController.getVideoInfo(req, res));
router.post('/video/comments', (req, res) => youtubeController.getComments(req, res));
router.post('/video/validate', (req, res) => youtubeController.validateVideoUrl(req, res));
router.post('/video/comments-status', (req, res) => youtubeController.checkCommentsEnabled(req, res));

module.exports = router