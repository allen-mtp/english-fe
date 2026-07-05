'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function GrammarView() {
  const [view, setView] = useState('list');
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [topics, setTopics] = useState([]);

  // Exercise state
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchLessons();
    fetchTopics();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterLevel) params.append('level', filterLevel);
      if (filterTopic) params.append('topic', filterTopic);
      const res = await axiosInstance.get(`/grammar?${params.toString()}`);
      setLessons(res.data.lessons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axiosInstance.get('/grammar/topics');
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateLesson = async () => {
    setGenerating(true);
    setError('');
    try {
      await axiosInstance.post('/grammar/generate', {
        level: filterLevel || 'B1',
        topic: filterTopic || undefined,
      });
      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate lesson');
    } finally {
      setGenerating(false);
    }
  };

  const openLesson = async (id) => {
    try {
      const res = await axiosInstance.get(`/grammar/${id}`);
      setSelectedLesson(res.data.lesson);
      setAnswers({});
      setResults(null);
      setView('lesson');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const submitExercises = async () => {
    if (!selectedLesson) return;
    setSubmitting(true);
    setError('');
    try {
      const answerArray = selectedLesson.exercises.map((_, idx) => answers[idx] ?? -1);
      const res = await axiosInstance.post(`/grammar/${selectedLesson._id}/submit`, {
        answers: answerArray,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const speak = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (view === 'lesson' && selectedLesson) {
    const allAnswered = selectedLesson.exercises.every((_, idx) => answers[idx] !== undefined);
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('list'); setSelectedLesson(null); setResults(null); }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{selectedLesson.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={selectedLesson.level} color="primary" />
              <Chip size="small" label={selectedLesson.topic} />
              <Chip size="small" label={selectedLesson.difficulty} variant="outlined" />
            </Stack>
          </Box>
        </Stack>

        {!results && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  <SpellcheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Explanation
                </Typography>
                <Typography variant="body2" paragraph>{selectedLesson.explanation}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Giải thích bằng tiếng Việt:</Typography>
                <Typography variant="body2" paragraph>{selectedLesson.explanationVi}</Typography>

                {selectedLesson.examples?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Examples:</Typography>
                    {selectedLesson.examples.map((ex, i) => (
                      <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" sx={{ flex: 1 }}>{ex.en}</Typography>
                          <IconButton size="small" onClick={() => speak(ex.en)}><VolumeUpIcon fontSize="small" /></IconButton>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{ex.vi}</Typography>
                      </Box>
                    ))}
                  </>
                )}

                {selectedLesson.rules?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Key Rules:</Typography>
                    {selectedLesson.rules.map((r, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {r}</Typography>
                    ))}
                  </>
                )}

                {selectedLesson.commonMistakes?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>Common Mistakes:</Typography>
                    {selectedLesson.commonMistakes.map((m, i) => (
                      <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: '#fef2f2', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{m.mistake}</span>
                          {' → '}
                          <span style={{ color: '#059669', fontWeight: 600 }}>{m.correct}</span>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{m.explanation}</Typography>
                      </Box>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Practice Exercises ({selectedLesson.exercises.length})
            </Typography>

            {selectedLesson.exercises.map((ex, qIdx) => (
              <Card key={qIdx} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {qIdx + 1}. {ex.question}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={answers[qIdx] ?? ''} onChange={(e) => handleAnswer(qIdx, parseInt(e.target.value))}>
                      {ex.options.map((opt, oIdx) => (
                        <FormControlLabel
                          key={oIdx}
                          value={oIdx}
                          control={<Radio />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={submitExercises}
              disabled={!allAnswered || submitting}
              sx={{ py: 1.5 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Answers'}
            </Button>
          </>
        )}

        {results && (
          <>
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={800}>Your Score</Typography>
                <Typography variant="h3" fontWeight={900} color="primary">
                  {results.score}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={results.score}
                color={results.score >= 70 ? 'success' : results.score >= 40 ? 'warning' : 'error'}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {results.correctCount} / {results.totalQuestions} correct • {results.completed ? 'Lesson completed!' : 'Keep practicing!'}
                {results.xpEarned > 0 && ` • +${results.xpEarned} XP`}
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
                    {r.options.map((opt, oIdx) => (
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
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {r.explanation}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Button variant="outlined" onClick={() => { setView('list'); setSelectedLesson(null); setResults(null); }} sx={{ mt: 2 }}>
            Back to Lessons
          </Button>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Grammar Lessons</Typography>
          <Typography variant="body2" color="text.secondary">Learn grammar with AI-generated lessons and exercises</Typography>
        </Box>
        <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={generateLesson} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Lesson'}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <Typography variant="subtitle2">Filter:</Typography>
          {LEVELS.map(lvl => (
            <Chip
              key={lvl}
              label={lvl}
              size="small"
              color={filterLevel === lvl ? 'primary' : 'default'}
              onClick={() => { setFilterLevel(filterLevel === lvl ? '' : lvl); }}
            />
          ))}
          <Divider orientation="vertical" flexItem />
          {topics.map(t => (
            <Chip
              key={t}
              label={t}
              size="small"
              color={filterTopic === t ? 'secondary' : 'default'}
              onClick={() => { setFilterTopic(filterTopic === t ? '' : t); }}
            />
          ))}
          <Button size="small" onClick={() => { setFilterLevel(''); setFilterTopic(''); }}>Clear</Button>
          <Button size="small" variant="contained" onClick={fetchLessons}>Apply</Button>
        </Stack>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress /></Stack>
      ) : lessons.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No lessons yet. Generate your first grammar lesson!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {lessons.map(lesson => (
            <Grid item xs={12} sm={6} md={4} key={lesson._id}>
              <Card
                sx={{ cursor: 'pointer', height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
                onClick={() => openLesson(lesson._id)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{lesson.title}</Typography>
                    {lesson.completed && <CheckCircleIcon color="success" />}
                  </Stack>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={lesson.level} color="primary" />
                    <Chip size="small" label={lesson.topic} />
                    <Chip size="small" label={lesson.difficulty} variant="outlined" />
                  </Stack>
                  {lesson.attempts > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Attempts: {lesson.attempts} • Best: {lesson.score}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}