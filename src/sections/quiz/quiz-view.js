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
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';

const QUIZ_TYPES = [
  { value: 'placement', label: 'Placement Test', desc: 'Determine your English level (A1-C2)' },
  { value: 'practice', label: 'Practice Quiz', desc: 'General practice across topics' },
  { value: 'achievement', label: 'Achievement Test', desc: 'Test your level mastery' },
];

const CATEGORIES = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'reading', label: 'Reading' },
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const gradientBtn = {
  borderRadius: 2.5,
  textTransform: 'none',
  fontWeight: 800,
  color: 'white',
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  '&:hover': {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  transition: 'all 0.2s',
};

export function QuizView() {
  const [view, setView] = useState('home');
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ type: 'practice', category: 'mixed', level: 'A1', questionCount: 10, topic: '' });
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || results) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, results]);

  const fetchQuizzes = async () => {
    try {
      const res = await axiosInstance.get('/quizzes?limit=20');
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setGenerating(true);
    setError('');
    try {
      const payload = { ...config };
      if (!payload.topic?.trim()) delete payload.topic;
      else payload.topic = payload.topic.trim();
      const res = await axiosInstance.post('/quizzes/generate', payload);
      setActiveQuiz(res.data.quiz);
      setAnswers({});
      setResults(null);
      setTimeLeft(res.data.quiz.timeLimit ? res.data.quiz.timeLimit * 60 : null);
      setView('take');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const openQuiz = async (id) => {
    try {
      const res = await axiosInstance.get(`/quizzes/${id}`);
      setActiveQuiz(res.data.quiz);
      setAnswers({});
      setResults(null);
      setView('review');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = (qIdx, value) => {
    setAnswers(prev => ({ ...prev, [qIdx]: value }));
  };

  const submit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    setError('');
    try {
      const arr = activeQuiz.questions.map((q, idx) => {
        const ans = answers[idx];
        if (ans === undefined) return -1;
        if (q.type === 'fill-blank') return ans;
        return parseInt(ans);
      });
      const res = await axiosInstance.post(`/quizzes/${activeQuiz._id}/submit`, { answers: arr });
      setResults(res.data);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (view === 'take' && activeQuiz) {
    const allAnswered = activeQuiz.questions.every((_, idx) => answers[idx] !== undefined);
    const answeredCount = activeQuiz.questions.filter((_, idx) => answers[idx] !== undefined).length;
    const progress = (answeredCount / activeQuiz.questions.length) * 100;

    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => { setView('home'); setActiveQuiz(null); setResults(null); }}
            sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800} noWrap>{activeQuiz.title}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label={activeQuiz.type} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', textTransform: 'capitalize' }} />
              <Chip size="small" label={activeQuiz.category} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', textTransform: 'capitalize' }} />
              {activeQuiz.level && <Chip size="small" label={activeQuiz.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }} />}
            </Stack>
          </Box>
          {timeLeft !== null && timeLeft > 0 && !results && (
            <Chip
              icon={<TimerIcon />}
              label={formatTime(timeLeft)}
              color={timeLeft < 60 ? 'error' : 'default'}
              sx={{ fontWeight: 700, borderRadius: 2, py: 2, bgcolor: timeLeft < 60 ? '#fef2f2' : '#f1f5f9', color: timeLeft < 60 ? '#dc2626' : '#475569' }}
            />
          )}
        </Stack>

        {!results ? (
          <>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {answeredCount} / {activeQuiz.questions.length} answered
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {Math.round(progress)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
                  }}
                />
              </CardContent>
            </Card>

            {activeQuiz.questions.map((q, qIdx) => (
              <Card key={qIdx} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={q.category} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#faf5ff', color: '#7c3aed', height: 22, textTransform: 'capitalize' }} />
                    {q.difficulty > 1 && <Chip size="small" label={`Difficulty: ${q.difficulty}`} variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 600, height: 22 }} />}
                    <Box sx={{ flex: 1 }} />
                    <Typography variant="caption" fontWeight={800} color="text.secondary">Q{qIdx + 1}</Typography>
                  </Stack>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, lineHeight: 1.5 }}>
                    {q.question}
                  </Typography>
                  {q.type === 'fill-blank' ? (
                    <TextField
                      fullWidth
                      placeholder="Type your answer..."
                      value={answers[qIdx] || ''}
                      onChange={(e) => handleAnswer(qIdx, e.target.value)}
                      slotProps={{ input: { sx: { borderRadius: 3 } } }}
                    />
                  ) : (
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup value={answers[qIdx] ?? ''} onChange={(e) => handleAnswer(qIdx, parseInt(e.target.value))}>
                        {q.options.map((opt, oIdx) => (
                          <FormControlLabel
                            key={oIdx}
                            value={oIdx}
                            control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#6366f1' } }} />}
                            label={opt}
                            sx={{
                              '& .MuiFormControlLabel-label': { fontSize: 14.5 },
                              m: 0,
                              p: 1.25,
                              borderRadius: 2,
                              transition: 'all 0.15s',
                              '&:hover': { bgcolor: '#f8fafc' },
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}
                </CardContent>
              </Card>
            ))}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={submit}
              disabled={submitting}
              sx={{ ...gradientBtn, py: 1.5, fontSize: 16 }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : `Submit Quiz (${answeredCount}/${activeQuiz.questions.length})`}
            </Button>
          </>
        ) : (
          <Box>
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', p: 4, color: 'white', textAlign: 'center' }}>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight={800}>Quiz Results</Typography>
                  {results.determinedLevel && (
                    <Chip icon={<StarIcon />} label={`Level: ${results.determinedLevel}`} sx={{ fontWeight: 700, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 2, '& .MuiChip-icon': { color: 'white' } }} />
                  )}
                </Stack>
                <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1, mb: 1.5 }}>
                  {results.score}%
                </Typography>
                <Box sx={{ mx: 'auto', maxWidth: 300 }}>
                  <LinearProgress
                    variant="determinate"
                    value={results.score}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: 'white' },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.9 }}>
                  {results.correctCount} / {results.totalQuestions} correct {results.xpEarned > 0 && `• +${results.xpEarned} XP`}
                </Typography>
              </Box>
            </Card>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Review Answers</Typography>
            <Stack spacing={2}>
              {results.results.map((r, idx) => (
                <Card key={idx} sx={{
                  borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  border: '1px solid',
                  borderColor: r.correct ? '#bbf7d0' : '#fecaca',
                  borderLeft: '4px solid',
                  borderLeftColor: r.correct ? '#10b981' : '#ef4444',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: r.correct ? '#dcfce7' : '#fee2e2',
                        color: r.correct ? '#059669' : '#dc2626',
                      }}>
                        {r.correct ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <CancelIcon sx={{ fontSize: 18 }} />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{idx + 1}. {r.question}</Typography>
                        {r.options?.length > 0 ? (
                          <Stack spacing={0.75}>
                            {r.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === r.correctIndex;
                              const isUser = oIdx === r.userAnswer;
                              return (
                                <Box
                                  key={oIdx}
                                  sx={{
                                    py: 1, px: 1.5, borderRadius: 2,
                                    bgcolor: isCorrect ? '#dcfce7' : (isUser ? '#fee2e2' : 'transparent'),
                                    display: 'flex', alignItems: 'center', gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      flex: 1,
                                      fontWeight: (isCorrect || isUser) ? 700 : 400,
                                      color: isCorrect ? '#059669' : (isUser ? '#dc2626' : 'text.primary'),
                                    }}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                  </Typography>
                                  {isCorrect && <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />}
                                  {isUser && !isCorrect && <CancelIcon sx={{ fontSize: 16, color: '#dc2626' }} />}
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Your answer: <span style={{ color: r.correct ? '#059669' : '#dc2626', fontWeight: 600 }}>{r.userAnswer || '(blank)'}</span>
                            {' • '}Correct: <span style={{ color: '#059669', fontWeight: 600 }}>{r.correctAnswer}</span>
                          </Typography>
                        )}
                        {r.explanation && (
                          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.light' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>
                              {r.explanation}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Button
              variant="outlined"
              onClick={() => { setView('home'); setActiveQuiz(null); setResults(null); }}
              sx={{ mt: 3, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 4, py: 1.25 }}
            >
              Back to Quizzes
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  if (view === 'review' && activeQuiz) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => { setView('home'); setActiveQuiz(null); }}
            sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800} noWrap>{activeQuiz.title}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label={activeQuiz.type} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', textTransform: 'capitalize' }} />
              {activeQuiz.level && <Chip size="small" label={activeQuiz.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }} />}
              <Chip size="small" label={`${activeQuiz.correctCount || 0}/${activeQuiz.totalQuestions}`} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} />
              <Chip size="small" label={`${activeQuiz.score}%`} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#faf5ff', color: '#7c3aed' }} />
            </Stack>
          </Box>
        </Stack>
        <Stack spacing={2}>
          {activeQuiz.questions.map((q, qIdx) => (
            <Card key={qIdx} sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', borderLeft: '4px solid', borderLeftColor: '#10b981' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">Q{qIdx + 1}</Typography>
                  {q.category && <Chip size="small" label={q.category} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#faf5ff', color: '#7c3aed', height: 22, textTransform: 'capitalize' }} />}
                </Stack>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{q.question}</Typography>
                {q.options?.length > 0 && (
                  <Stack spacing={0.75}>
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctIndex;
                      return (
                        <Box
                          key={oIdx}
                          sx={{
                            py: 1, px: 1.5, borderRadius: 2,
                            bgcolor: isCorrect ? '#dcfce7' : 'transparent',
                            display: 'flex', alignItems: 'center', gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              fontWeight: isCorrect ? 700 : 400,
                              color: isCorrect ? '#059669' : 'text.primary',
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </Typography>
                          {isCorrect && <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
                {q.correctAnswer && (
                  <Typography variant="body2" sx={{ mt: 1, color: '#059669', fontWeight: 600 }}>
                    Answer: {q.correctAnswer}
                  </Typography>
                )}
                {q.explanation && (
                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.light' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>
                      {q.explanation}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Quizzes & Tests</Typography>
          <Typography variant="body2" color="text.secondary">Test your English with AI-generated quizzes</Typography>
        </Box>
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
              <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>Create New Quiz</Typography>
              <Typography variant="body2" color="text.secondary">Pick a type, set options — AI generates fresh questions</Typography>
            </Box>
          </Stack>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Quiz Type</Typography>
              <Stack spacing={1.25}>
                {QUIZ_TYPES.map(t => (
                  <Card
                    key={t.value}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      p: 2,
                      border: '2px solid',
                      borderColor: config.type === t.value ? 'primary.main' : 'divider',
                      bgcolor: config.type === t.value ? 'rgba(99,102,241,0.04)' : 'background.paper',
                      boxShadow: config.type === t.value ? '0 4px 16px rgba(99,102,241,0.12)' : 'none',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: config.type === t.value ? 'primary.main' : '#cbd5e1' },
                    }}
                    onClick={() => setConfig({ ...config, type: t.value })}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color={config.type === t.value ? 'primary.main' : 'text.primary'}>{t.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                  </Card>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Category</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {CATEGORIES.map(c => (
                      <Chip
                        key={c.value}
                        label={c.label}
                        color={config.category === c.value ? 'primary' : 'default'}
                        onClick={() => setConfig({ ...config, category: c.value })}
                        clickable
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    ))}
                  </Stack>
                </Grid>
                {config.type !== 'placement' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Level</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {LEVELS.map(lvl => (
                        <Chip
                          key={lvl}
                          label={lvl}
                          color={config.level === lvl ? 'primary' : 'default'}
                          onClick={() => setConfig({ ...config, level: lvl })}
                          clickable
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Number of Questions</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {[5, 10, 15, 20].map(n => (
                      <Chip
                        key={n}
                        label={n}
                        color={config.questionCount === n ? 'primary' : 'default'}
                        onClick={() => setConfig({ ...config, questionCount: n })}
                        clickable
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      />
                    ))}
                  </Stack>
                </Grid>
                {config.type !== 'placement' && (
                  <Grid item xs={12}>
                    <TopicInput
                      value={config.topic || ''}
                      onChange={(v) => setConfig({ ...config, topic: v })}
                      onEnter={generateQuiz}
                      label="Topic / Theme (optional)"
                      placeholder="Type any topic, or pick a suggestion — all questions will revolve around it"
                      suggestions={['general', 'business', 'technology', 'travel', 'culture', 'science', 'sports', 'movies', 'music', 'history', 'nature', 'food']}
                      size="small"
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2.5, borderRadius: 3 }}>{error}</Alert>}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={generating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
            onClick={generateQuiz}
            disabled={generating}
            sx={{ ...gradientBtn, mt: 3, py: 1.5, fontSize: 16 }}
          >
            {generating ? 'Generating Quiz...' : 'Generate Quiz'}
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Recent Quizzes</Typography>
      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress size={36} /></Stack>
      ) : quizzes.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', bgcolor: '#fafbff' }}>
          <CardContent sx={{ py: 8, px: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <QuizIcon sx={{ color: '#6366f1', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>No quizzes yet</Typography>
            <Typography variant="body2" color="text.secondary">Create your first quiz above to get started</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {quizzes.map(q => (
            <Grid item xs={12} sm={6} md={4} key={q._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(99,102,241,0.08)',
                    borderColor: 'primary.light',
                  },
                  '&::before': q.completed ? {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                  } : {},
                }}
                onClick={() => openQuiz(q._id)}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ mb: 1.5 }}>{q.title}</Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                    <Chip size="small" label={q.type} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22, textTransform: 'capitalize' }} />
                    <Chip size="small" label={q.category} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', height: 22, textTransform: 'capitalize' }} />
                    {q.level && <Chip size="small" label={q.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22 }} />}
                  </Stack>
                  {q.completed ? (
                    <Box sx={{ pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={800} color={q.score >= 70 ? '#10b981' : q.score >= 40 ? '#f59e0b' : '#ef4444'}>
                          {q.score}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {q.correctCount} / {q.totalQuestions} correct
                        </Typography>
                      </Stack>
                    </Box>
                  ) : (
                    <Chip size="small" label="In Progress" sx={{ mt: 0.5, borderRadius: 1.5, fontWeight: 700, bgcolor: '#fffbeb', color: '#d97706', height: 22 }} />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    {new Date(q.createdAt).toLocaleString()}
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
