import { useState } from 'react';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Alert } from 'react-bootstrap';

const YouTubeAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please check the URL and try again.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-3">YouTube Comment Analyzer</h1>
      <p className="text-muted">Analyze sentiment of comments from any YouTube video</p>

      <div className="d-flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="form-control"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !url}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          {loading ? <Loader2 className="spinner-border spinner-border-sm" /> : <ArrowRight />}
          Analyze
        </button>
      </div>

      {error && (
        <Alert variant="danger" className="mt-3 d-flex align-items-center">
          <AlertCircle className="me-2" />
          {error}
        </Alert>
      )}

      {analysis && (
        <div className="mt-4">
          <div className="row">
            {['agreement', 'disagreement', 'neutral'].map((type, index) => (
              <div className="col-md-4" key={index}>
                <div className="card p-3">
                  <h5>{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                  <p className="display-6 text-center">
                    {analysis.sentimentPercentages[type]}%
                  </p>
                  <p className="text-muted">{analysis[`${type}Count`]} comments</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4 mt-4">
            <h5>Monthly Comment Distribution</h5>
            {analysis.monthlyCommentDistribution.map((item) => (
              <div key={item.month} className="d-flex align-items-center gap-3">
                <span className="w-25">{item.month}</span>
                <div className="progress w-100">
                  <div
                    className="progress-bar"
                    style={{ width: `${(item.count / analysis.totalComments) * 100}%` }}
                  ></div>
                </div>
                <span className="text-muted">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="card p-4 mt-4">
            <h5>Video Information</h5>
            <p><strong>Title:</strong> {analysis.videoTitle}</p>
            <p><strong>Channel:</strong> {analysis.channelTitle}</p>
            <p><strong>Total Comments:</strong> {analysis.totalComments}</p>
            <p><strong>Analyzed:</strong> {new Date(analysis.analyzedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeAnalyzer;
