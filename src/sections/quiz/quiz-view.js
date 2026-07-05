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
  const [config, setConfig] = useState({ type: 'practice', category: 'mixed', level: 'B1', questionCount: 10, topic: '' });
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

    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('home'); setActiveQuiz(null); setResults(null); }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{activeQuiz.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={activeQuiz.type} color="primary" />
              <Chip size="small" label={activeQuiz.category} />
              <Chip size="small" label={activeQuiz.level} />
            </Stack>
          </Box>
          {timeLeft !== null && timeLeft > 0 && !results && (
            <Chip
              icon={<TimerIcon />}
              label={formatTime(timeLeft)}
              color={timeLeft < 60 ? 'error' : 'default'}
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        {!results ? (
          <>
            <LinearProgress
              variant="determinate"
              value={(answeredCount / activeQuiz.questions.length) * 100}
              sx={{ mb: 2, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {answeredCount} / {activeQuiz.questions.length} answered
            </Typography>

            {activeQuiz.questions.map((q, qIdx) => (
              <Card key={qIdx} sx={{ mb: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip size="small" label={q.category} color="secondary" />
                    {q.difficulty > 1 && <Chip size="small" label={`Difficulty: ${q.difficulty}`} variant="outlined" />}
                  </Stack>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {qIdx + 1}. {q.question}
                  </Typography>
                  {q.type === 'fill-blank' ? (
                    <TextField
                      fullWidth
                      placeholder="Type your answer..."
                      value={answers[qIdx] || ''}
                      onChange={(e) => handleAnswer(qIdx, e.target.value)}
                    />
                  ) : (
                    <FormControl component="fieldset">
                      <RadioGroup value={answers[qIdx] ?? ''} onChange={(e) => handleAnswer(qIdx, parseInt(e.target.value))}>
                        {q.options.map((opt, oIdx) => (
                          <FormControlLabel key={oIdx} value={oIdx} control={<Radio />} label={opt} />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}
                </CardContent>
              </Card>
            ))}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : `Submit Quiz (${answeredCount}/${activeQuiz.questions.length})`}
            </Button>
          </>
        ) : (
          <Box>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5" fontWeight={800}>Quiz Results</Typography>
                  {results.determinedLevel && (
                    <Chip icon={<StarIcon />} label={`Level: ${results.determinedLevel}`} color="secondary" sx={{ fontWeight: 700, fontSize: 16, py: 2 }} />
                  )}
                </Stack>
                <Typography variant="h3" fontWeight={900} color="primary" sx={{ mb: 1 }}>
                  {results.score}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={results.score}
                  color={results.score >= 70 ? 'success' : results.score >= 40 ? 'warning' : 'error'}
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {results.correctCount} / {results.totalQuestions} correct {results.xpEarned > 0 && `• +${results.xpEarned} XP`}
                </Typography>
              </CardContent>
            </Card>

            {results.results.map((r, idx) => (
              <Card key={idx} sx={{ mb: 2, borderLeft: 4, borderColor: r.correct ? 'success.main' : 'error.main' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {r.correct ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>{idx + 1}. {r.question}</Typography>
                      {r.options?.map((opt, oIdx) => (
                        <Typography
                          key={oIdx}
                          variant="body2"
                          sx={{
                            color: oIdx === r.correctIndex ? 'success.main' : (oIdx === r.userAnswer ? 'error.main' : 'text.primary'),
                            fontWeight: oIdx === r.correctIndex || oIdx === r.userAnswer ? 700 : 400,
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                          {oIdx === r.correctIndex && ' ✓'}
                          {oIdx === r.userAnswer && !r.correct && ' ✗'}
                        </Typography>
                      ))}
                      {r.correctAnswer && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Your answer: <span style={{ color: r.correct ? 'success.main' : 'error.main' }}>{r.userAnswer || '(blank)'}</span>
                          {' • '}Correct: <span style={{ color: 'success.main', fontWeight: 600 }}>{r.correctAnswer}</span>
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {r.explanation}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Button variant="outlined" onClick={() => { setView('home'); setActiveQuiz(null); setResults(null); }} sx={{ mt: 2 }}>
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
          <IconButton onClick={() => { setView('home'); setActiveQuiz(null); }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{activeQuiz.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={activeQuiz.type} color="primary" />
              <Chip size="small" label={activeQuiz.level} />
              <Chip size="small" label={`${activeQuiz.correctCount || 0}/${activeQuiz.totalQuestions}`} />
              <Chip size="small" label={`${activeQuiz.score}%`} color="secondary" />
            </Stack>
          </Box>
        </Stack>
        {activeQuiz.questions.map((q, qIdx) => (
          <Card key={qIdx} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{qIdx + 1}. {q.question}</Typography>
              {q.options?.map((opt, oIdx) => (
                <Typography
                  key={oIdx}
                  variant="body2"
                  sx={{
                    color: oIdx === q.correctIndex ? 'success.main' : 'text.primary',
                    fontWeight: oIdx === q.correctIndex ? 700 : 400,
                  }}
                >
                  {String.fromCharCode(65 + oIdx)}. {opt}
                  {oIdx === q.correctIndex && ' ✓'}
                </Typography>
              ))}
              {q.correctAnswer && (
                <Typography variant="body2" sx={{ mt: 0.5, color: 'success.main', fontWeight: 600 }}>
                  Answer: {q.correctAnswer}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {q.explanation}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Quizzes & Tests</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Test your English with AI-generated quizzes</Typography>

      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Create New Quiz:</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Quiz Type:</Typography>
            <Stack spacing={1}>
              {QUIZ_TYPES.map(t => (
                <Card
                  key={t.value}
                  sx={{
                    cursor: 'pointer',
                    p: 1.5,
                    border: 2,
                    borderColor: config.type === t.value ? 'primary.main' : 'transparent',
                    bgcolor: config.type === t.value ? 'action.selected' : 'background.paper',
                  }}
                  onClick={() => setConfig({ ...config, type: t.value })}
                >
                  <Typography variant="subtitle2" fontWeight={700}>{t.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                </Card>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Category:</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {CATEGORIES.map(c => (
                    <Chip
                      key={c.value}
                      label={c.label}
                      color={config.category === c.value ? 'primary' : 'default'}
                      onClick={() => setConfig({ ...config, category: c.value })}
                      clickable
                    />
                  ))}
                </Stack>
              </Grid>
              {config.type !== 'placement' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Level:</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {LEVELS.map(lvl => (
                      <Chip
                        key={lvl}
                        label={lvl}
                        color={config.level === lvl ? 'secondary' : 'default'}
                        onClick={() => setConfig({ ...config, level: lvl })}
                        clickable
                      />
                    ))}
                  </Stack>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Number of Questions:</Typography>
                <Stack direction="row" spacing={1}>
                  {[5, 10, 15, 20].map(n => (
                    <Chip
                      key={n}
                      label={n}
                      color={config.questionCount === n ? 'primary' : 'default'}
                      onClick={() => setConfig({ ...config, questionCount: n })}
                      clickable
                    />
                  ))}
                </Stack>
              </Grid>
              {config.type !== 'placement' && (
                <Grid item xs={12}>
                  <TopicInput
                    value={config.topic || ''}
                    onChange={(v) => setConfig({ ...config, topic: v })}
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
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
          onClick={generateQuiz}
          disabled={generating}
          sx={{ mt: 2 }}
        >
          {generating ? 'Generating Quiz...' : 'Generate Quiz'}
        </Button>
      </Card>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recent Quizzes</Typography>
      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress /></Stack>
      ) : quizzes.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No quizzes yet. Create your first quiz!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {quizzes.map(q => (
            <Grid item xs={12} sm={6} md={4} key={q._id}>
              <Card
                sx={{ cursor: 'pointer', height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
                onClick={() => openQuiz(q._id)}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>{q.title}</Typography>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    <Chip size="small" label={q.type} color="primary" />
                    <Chip size="small" label={q.category} />
                    <Chip size="small" label={q.level} />
                  </Stack>
                  {q.completed ? (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="h6" fontWeight={700} color="primary">{q.score}%</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {q.correctCount} / {q.totalQuestions} correct
                      </Typography>
                    </Box>
                  ) : (
                    <Chip size="small" label="In Progress" color="warning" sx={{ mt: 1 }} />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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