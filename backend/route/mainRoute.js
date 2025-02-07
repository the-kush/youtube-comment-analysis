const express = require('express');
const router = express.Router();
const AnalysisController = require('../controller/analysisController.js');
const YoutubeController = require('../controller/youtubeController.js');

const analysisController = new analyzeController();
const youtubeController = new YoutubeController();

router.post('/analyze', (req, res) => analyzeControllerInstance.analyzeVideoComments(req, res));

router.get('/analysis/:videoId', async (req, res) => {
    try {
        const videoAnalysis = await VideoAnalysisModel.findOne({
            videoLink: { $regex: req.params.videoId, $options: 'i' }
        })
        if(!videoAnalysis){
            return res.status(404).json({ message: 'Video not found' })
        }
    
        res.json(videoAnalysis)
    } catch (error) {
        console.error('Error fetching analysis', error)
        res.status(500).json({ message: error.message })
    }
})

router.get('/analyses', async (req, res) => {
    try {
        const analyses = await VideoAnalysisModel.find({})
        .select('videoLink totalComments agreementCount disagreementCount neutralCount analyzedAt')
        .sort({ analyzedAt: -1 });

        res.json(analyses);
    }catch(error){
        console.error('Error fetching analyses', error)
        res.status(500).json({ message: error.message })
    }
})

// youtubeController.js
router.post('/video/info', (req, res) => youtubeController.getVideoInfo(req, res));
router.post('/video/comments', (req, res) => youtubeController.getComments(req, res));
router.post('/video/validate', (req, res) => youtubeController.validateVideoUrl(req, res));
router.post('/video/comments-status', (req, res) => youtubeController.checkCommentsEnabled(req, res));

module.exports = router