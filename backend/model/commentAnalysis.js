const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({ 
    originalText: { type: String, required: true },
    maskedUsername: { type: String, required: true },
    sentiment: { type: String, enum: ['agree', 'disagree', 'neutral'], required: true },
}, { timestamps: true });

const videoAnalysisSchema = new mongoose.Schema({ 
    videoLink: { type: String, required: true, unique: true },
    totalComments: { type: Number, default: 0 },
    agreementCount: { type: Number, default: 0 },
    disagreementCount: { type: Number, default: 0 },
    neutralCount: { type: Number, default: 0 },
    comments: [commentSchema],
    monthlyCommentDistribution: [{ month: String, count: Number }],
    analyzedAt: { type: Date, default: Date.now }
});

const VideoAnalysisModel = mongoose.model('VideoAnalysis', videoAnalysisSchema);

module.exports = VideoAnalysisModel;  // ✅ Export only VideoAnalysisModel
