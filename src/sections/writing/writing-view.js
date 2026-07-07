'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import { clearTopicInput } from 'src/utils/api-helpers';
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
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TYPES = ['email', 'essay', 'story', 'description', 'letter', 'report', 'review'];

const gradientBtn = {
  borderRadius: 2.5,
  textTransform: 'none',
  fontWeight: 800,
  color: 'white',
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  '&:hover': {
    background: 'linear-gradient(135deg, #3730a3, #5b21b6)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  transition: 'all 0.2s',
};

export function WritingView() {
  const [view, setView] = useState('home');
  const [level, setLevel] = useState('A1');
  const [type, setType] = useState('email');
  const [topic, setTopic] = useState('');
  const [writingPrompt, setWritingPrompt] = useState(null);
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
    const topicValue = topic.trim();
    try {
      const params = new URLSearchParams({ level, type });
      if (topicValue) params.append('topic', topicValue);
      const res = await axiosInstance.get(`/writing/prompt?${params.toString()}`);
      clearTopicInput(setTopic);
      setWritingPrompt(res.data.prompt);
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
        prompt: writingPrompt.prompt,
        promptType: writingPrompt.promptType,
        level: writingPrompt.level,
        topic: writingPrompt.topic,
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

  if (view === 'write' && writingPrompt) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => { setView('home'); setWritingPrompt(null); setResult(null); }}
            sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800}>Writing Practice</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label={writingPrompt.promptType} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }} />
              <Chip size="small" label={writingPrompt.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }} />
              {writingPrompt.topic && <Chip size="small" label={writingPrompt.topic} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} />}
            </Stack>
          </Box>
        </Stack>

        <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', p: 3, pb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
                <EditNoteIcon sx={{ color: '#6366f1', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={800}>Your Prompt</Typography>
            </Stack>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>{writingPrompt.prompt}</Typography>
            {writingPrompt.tips?.length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: 'primary.main' }}>Tips</Typography>
                <Stack spacing={1}>
                  {writingPrompt.tips.map((t, i) => (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" key={i}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, mt: 0.25 }}>
                        {i + 1}
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
              Suggested length: {writingPrompt.minWords || 100} - {writingPrompt.maxWords || 300} words
            </Typography>
          </CardContent>
        </Card>

        {!result ? (
          <>
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={10}
                  maxRows={20}
                  placeholder="Write your text in English here..."
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  slotProps={{ input: { sx: { borderRadius: 3 } } }}
                />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} color={wordCount < 20 ? 'error.main' : 'text.secondary'}>
                    {wordCount} words {wordCount < 20 && `(need ${20 - wordCount} more)`}
                  </Typography>
                  {error && <Alert severity="error" sx={{ flex: 1, ml: 2, borderRadius: 3, py: 0 }}>{error}</Alert>}
                </Stack>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={submit}
              disabled={submitting || wordCount < 20}
              sx={{ ...gradientBtn, py: 1.5, fontSize: 16 }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit for AI Feedback'}
            </Button>
          </>
        ) : (
          <Box>
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', p: 4, color: 'white' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight={800}>Your Score</Typography>
                  {result.feedback.bandScore && (
                    <Chip label={`Band ${result.feedback.bandScore}`} sx={{ fontWeight: 700, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 2 }} />
                  )}
                </Stack>
                <Typography variant="h2" fontWeight={900} sx={{ mb: 1.5, lineHeight: 1 }}>
                  {result.feedback.overallScore}%
                </Typography>
                <Box sx={{ maxWidth: 400 }}>
                  <LinearProgress
                    variant="determinate"
                    value={result.feedback.overallScore}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: 'white' },
                    }}
                  />
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Grammar', score: result.feedback.grammarScore },
                    { label: 'Vocabulary', score: result.feedback.vocabularyScore },
                    { label: 'Coherence', score: result.feedback.coherenceScore },
                    { label: 'Task Achievement', score: result.feedback.taskAchievement },
                  ].map(item => (
                    <Grid item xs={6} sm={3} key={item.label}>
                      <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
                        <Typography variant="h5" fontWeight={900} color="#4f46e5">{item.score}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {result.feedback.corrections?.length > 0 && (
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Corrections</Typography>
                  <Stack spacing={1.25}>
                    {result.feedback.corrections.map((c, i) => (
                      <Box key={i} sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 3, border: '1px solid', borderColor: '#fde68a' }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{c.original}</span>
                          <span style={{ margin: '0 8px', color: '#94a3b8' }}>→</span>
                          <span style={{ color: '#059669', fontWeight: 600 }}>{c.corrected}</span>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{c.explanation}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {result.feedback.strengths?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: '#bbf7d0', overflow: 'hidden' }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', px: 3, py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight={800} color="#059669">Strengths</Typography>
                      </Stack>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      {result.feedback.strengths.map((s, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981', mt: 0.25, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{s}</Typography>
                        </Stack>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {result.feedback.improvements?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: '#fde68a', overflow: 'hidden' }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', px: 3, py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrendingUpIcon sx={{ color: '#d97706', fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight={800} color="#d97706">To Improve</Typography>
                      </Stack>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      {result.feedback.improvements.map((s, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b', mt: 1.25, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{s}</Typography>
                        </Stack>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {result.feedback.suggestions && (
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', px: 3, py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LightbulbIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={800} color="#4f46e5">AI Suggestion</Typography>
                  </Stack>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{result.feedback.suggestions}</Typography>
                </CardContent>
              </Card>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => { setView('home'); setWritingPrompt(null); setResult(null); }}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 4, py: 1.25 }}
              >
                Back to Writing
              </Button>
              <Button
                variant="contained"
                onClick={getPrompt}
                startIcon={loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
                disabled={loading}
                sx={{ ...gradientBtn, px: 4, py: 1.25 }}
              >
                New Prompt
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Writing Practice</Typography>
          <Typography variant="body2" color="text.secondary">Get AI feedback on your English writing</Typography>
        </Box>
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
              <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>Generate Writing Prompt</Typography>
              <Typography variant="body2" color="text.secondary">Choose your level and type — AI crafts a tailored prompt</Typography>
            </Box>
          </Stack>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Level</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {LEVELS.map(lvl => (
                  <Chip
                    key={lvl}
                    label={lvl}
                    color={level === lvl ? 'primary' : 'default'}
                    onClick={() => setLevel(lvl)}
                    clickable
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Writing Type</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {TYPES.map(t => (
                  <Chip
                    key={t}
                    label={t}
                    color={type === t ? 'primary' : 'default'}
                    onClick={() => setType(t)}
                    clickable
                    sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>
            </Box>
            <TopicInput
              value={topic}
              onChange={setTopic}
              onEnter={getPrompt}
              label="Topic (optional)"
              placeholder="Type any topic you want to write about, or pick a suggestion"
              suggestions={['technology', 'environment', 'education', 'travel', 'culture', 'sports', 'health', 'business', 'society', 'personal experience', 'movies', 'music']}
              size="medium"
            />
            {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
              onClick={getPrompt}
              disabled={loading}
              sx={{ ...gradientBtn, py: 1.5, fontSize: 16 }}
            >
              {loading ? 'Getting Prompt...' : 'Get Writing Prompt'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <HistoryIcon sx={{ color: '#6366f1', fontSize: 22 }} />
        <Typography variant="h6" fontWeight={800}>Recent Submissions</Typography>
      </Stack>

      {history.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', bgcolor: '#fafbff' }}>
          <CardContent sx={{ py: 8, px: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <EditNoteIcon sx={{ color: '#6366f1', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>No submissions yet</Typography>
            <Typography variant="body2" color="text.secondary">Generate a prompt above and submit your first writing</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {history.map(sub => (
            <Grid item xs={12} sm={6} md={4} key={sub._id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(99,102,241,0.08)',
                    borderColor: 'primary.light',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip size="small" label={sub.promptType} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22, textTransform: 'capitalize' }} />
                    <Typography variant="h6" fontWeight={800} color="#4f46e5">
                      {sub.feedback?.overallScore}%
                    </Typography>
                  </Stack>
                  <Typography variant="body2" noWrap sx={{ mb: 1.5, color: 'text.secondary' }}>{sub.prompt}</Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {sub.topic && <Chip size="small" label={sub.topic} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', height: 22 }} />}
                    <Chip size="small" label={`${sub.wordCount} words`} variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 600, height: 22 }} />
                    {sub.feedback?.bandScore && <Chip size="small" label={`Band ${sub.feedback.bandScore}`} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#faf5ff', color: '#7c3aed', height: 22 }} />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
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
