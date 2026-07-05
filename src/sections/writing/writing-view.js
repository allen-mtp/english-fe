'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import { TopicInput } from 'src/components/topic-input/topic-input';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TYPES = ['email', 'essay', 'story', 'description', 'letter', 'report', 'review'];

export function WritingView() {
  const [view, setView] = useState('home');
  const [level, setLevel] = useState('B1');
  const [type, setType] = useState('email');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState(null);
  const [userText, setUserText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get('/writing/history?limit=10');
      setHistory(res.data.submissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getPrompt = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ level, type });
      if (topic.trim()) params.append('topic', topic.trim());
      const res = await axiosInstance.get(`/writing/prompt?${params.toString()}`);
      setPrompt(res.data.prompt);
      setUserText('');
      setResult(null);
      setView('write');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get prompt');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!userText.trim() || userText.trim().split(/\s+/).length < 20) {
      setError('Please write at least 20 words');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await axiosInstance.post('/writing/submit', {
        prompt: prompt.prompt,
        promptType: prompt.promptType,
        level: prompt.level,
        topic: prompt.topic,
        text: userText,
      });
      setResult(res.data.submission);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  if (view === 'write' && prompt) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('home'); setPrompt(null); setResult(null); }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>Writing Practice</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={prompt.promptType} color="primary" />
              <Chip size="small" label={prompt.level} />
              <Chip size="small" label={prompt.topic} />
            </Stack>
          </Box>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Prompt:</Typography>
            <Typography variant="body1" paragraph>{prompt.prompt}</Typography>
            {prompt.tips?.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Tips:</Typography>
                {prompt.tips.map((t, i) => (
                  <Typography key={i} variant="body2">• {t}</Typography>
                ))}
              </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Suggested length: {prompt.minWords || 100} - {prompt.maxWords || 300} words
            </Typography>
          </CardContent>
        </Card>

        {!result ? (
          <>
            <TextField
              fullWidth
              multiline
              minRows={10}
              maxRows={20}
              placeholder="Write your text in English here..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="caption" color={wordCount < 20 ? 'error.main' : 'text.secondary'}>
                {wordCount} words
              </Typography>
              {error && <Alert severity="error" sx={{ flex: 1, ml: 2 }}>{error}</Alert>}
            </Stack>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={submit}
              disabled={submitting || wordCount < 20}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit for AI Feedback'}
            </Button>
          </>
        ) : (
          <Box>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5" fontWeight={800}>Your Score</Typography>
                  {result.feedback.bandScore && (
                    <Chip label={`Band ${result.feedback.bandScore}`} color="secondary" sx={{ fontWeight: 700 }} />
                  )}
                </Stack>
                <Typography variant="h3" fontWeight={900} color="primary" sx={{ mb: 1 }}>
                  {result.feedback.overallScore}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={result.feedback.overallScore}
                  color={result.feedback.overallScore >= 70 ? 'success' : result.feedback.overallScore >= 40 ? 'warning' : 'error'}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Grid container spacing={2}>
                  {[
                    { label: 'Grammar', score: result.feedback.grammarScore },
                    { label: 'Vocabulary', score: result.feedback.vocabularyScore },
                    { label: 'Coherence', score: result.feedback.coherenceScore },
                    { label: 'Task Achievement', score: result.feedback.taskAchievement },
                  ].map(item => (
                    <Grid item xs={6} sm={3} key={item.label}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="h6" fontWeight={700}>{item.score}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {result.feedback.corrections?.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Corrections:</Typography>
                  {result.feedback.corrections.map((c, i) => (
                    <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: '#fef3c7', borderRadius: 2 }}>
                      <Typography variant="body2">
                        <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{c.original}</span>
                        {' → '}
                        <span style={{ color: '#059669', fontWeight: 600 }}>{c.corrected}</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{c.explanation}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {result.feedback.strengths?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: '#f0fdf4' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>Strengths:</Typography>
                      {result.feedback.strengths.map((s, i) => (
                        <Stack key={i} direction="row" spacing={1} sx={{ mb: 0.5 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mt: 0.3 }} />
                          <Typography variant="body2">{s}</Typography>
                        </Stack>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {result.feedback.improvements?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: '#fef3c7' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>To Improve:</Typography>
                      {result.feedback.improvements.map((s, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {s}</Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {result.feedback.suggestions && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Suggestion:</Typography>
                  <Typography variant="body2">{result.feedback.suggestions}</Typography>
                </CardContent>
              </Card>
            )}

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => { setView('home'); setPrompt(null); setResult(null); }}>
                Back to Writing
              </Button>
              <Button variant="contained" onClick={getPrompt}>New Prompt</Button>
            </Stack>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Writing Practice</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Get AI feedback on your English writing</Typography>

      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Choose your practice:</Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Level:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {LEVELS.map(lvl => (
                <Chip
                  key={lvl}
                  label={lvl}
                  color={level === lvl ? 'primary' : 'default'}
                  onClick={() => setLevel(lvl)}
                  clickable
                />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Writing Type:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {TYPES.map(t => (
                <Chip
                  key={t}
                  label={t}
                  color={type === t ? 'secondary' : 'default'}
                  onClick={() => setType(t)}
                  clickable
                />
              ))}
            </Stack>
          </Box>
          <TopicInput
            value={topic}
            onChange={setTopic}
            label="Topic (optional)"
            placeholder="Type any topic you want to write about, or pick a suggestion"
            suggestions={['technology', 'environment', 'education', 'travel', 'culture', 'sports', 'health', 'business', 'society', 'personal experience', 'movies', 'music']}
            size="medium"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            onClick={getPrompt}
            disabled={loading}
          >
            {loading ? 'Getting Prompt...' : 'Get Writing Prompt'}
          </Button>
        </Stack>
      </Card>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Recent Submissions
      </Typography>

      {history.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <EditNoteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No submissions yet</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {history.map(sub => (
            <Grid item xs={12} sm={6} md={4} key={sub._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Chip size="small" label={sub.promptType} color="primary" />
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {sub.feedback?.overallScore}%
                    </Typography>
                  </Stack>
                  <Typography variant="body2" noWrap sx={{ mb: 1 }}>{sub.prompt}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={sub.topic} />
                    <Chip size="small" label={`${sub.wordCount} words`} variant="outlined" />
                    {sub.feedback?.bandScore && <Chip size="small" label={`Band ${sub.feedback.bandScore}`} color="secondary" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(sub.createdAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}