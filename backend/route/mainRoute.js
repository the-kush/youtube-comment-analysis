const express = require('express');
const router = express.Router();
const analyzeController = require('../controller/analyzeController.js');

const analyzeControllerInstance = new analyzeController();

router.post('/analyze', (req, res) => analyzeControllerInstance.analyzeVideoComments(req, res));

router.get('/analyze/:videoId', async (req, res) => {
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


module.exports = router