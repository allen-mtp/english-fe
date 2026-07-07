'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import { getApiError, normalizeTopic, GRAMMAR_TOPICS, openGeneratedLesson, clearTopicInput } from 'src/utils/api-helpers';
import { TopicInput } from 'src/components/topic-input/topic-input';
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
  const [filterLevel, setFilterLevel] = useState('A1');
  const [genTopic, setGenTopic] = useState('');
  const [topics, setTopics] = useState([]);

  // Exercise state
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [filterLevel]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterLevel) params.append('level', filterLevel);
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
    const topic = normalizeTopic(genTopic);
    try {
      const res = await axiosInstance.post('/grammar/generate', {
        level: filterLevel,
        topic: topic || undefined,
      });
      clearTopicInput(setGenTopic);
      const lesson = res.data?.lesson;
      openGeneratedLesson(lesson, { setSelectedLesson, setAnswers, setResults, setView });
      await fetchLessons();
    } catch (err) {
      setError(getApiError(err, 'Failed to generate lesson'));
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
          <IconButton
            onClick={() => { setView('list'); setSelectedLesson(null); setResults(null); }}
            sx={{
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{selectedLesson.title}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label={selectedLesson.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }} />
              <Chip size="small" label={selectedLesson.topic} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} />
            </Stack>
          </Box>
        </Stack>

        {!results && (
          <>
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', p: 3, pb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
                    <SpellcheckIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={800}>Lesson Explanation</Typography>
                </Stack>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>{selectedLesson.explanation}</Typography>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>Giải thích bằng tiếng Việt:</Typography>
                <Typography variant="body2" paragraph sx={{ lineHeight: 1.7 }}>{selectedLesson.explanationVi}</Typography>

                {selectedLesson.examples?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Examples</Typography>
                    <Stack spacing={1.25}>
                      {selectedLesson.examples.map((ex, i) => (
                        <Box key={i} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid', borderColor: '#e2e8f0' }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{ex.en}</Typography>
                            <IconButton size="small" onClick={() => speak(ex.en)} sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#eef2ff' } }}>
                              <VolumeUpIcon fontSize="small" sx={{ color: '#6366f1' }} />
                            </IconButton>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: 0.5 }}>{ex.vi}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}

                {selectedLesson.rules?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Key Rules</Typography>
                    <Stack spacing={1}>
                      {selectedLesson.rules.map((r, i) => (
                        <Stack direction="row" spacing={1.5} alignItems="flex-start" key={i}>
                          <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, mt: 0.25 }}>
                            {i + 1}
                          </Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{r}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}

                {selectedLesson.commonMistakes?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#dc2626' }}>⚠️ Common Mistakes</Typography>
                    <Stack spacing={1.25}>
                      {selectedLesson.commonMistakes.map((m, i) => (
                        <Box key={i} sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 3, border: '1px solid', borderColor: '#fecaca' }}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{m.mistake}</span>
                            <span style={{ margin: '0 8px', color: '#94a3b8' }}>→</span>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{m.correct}</span>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{m.explanation}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Practice Exercises ({selectedLesson.exercises.length})
            </Typography>

            {selectedLesson.exercises.map((ex, qIdx) => (
              <Card key={qIdx} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {qIdx + 1}. {ex.question}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={answers[qIdx] ?? ''} onChange={(e) => handleAnswer(qIdx, parseInt(e.target.value, 10))}>
                      {ex.options.map((opt, oIdx) => (
                        <FormControlLabel
                          key={oIdx}
                          value={oIdx}
                          control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#6366f1' } }} />}
                          label={opt}
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: 14.5 } }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}

            {error && <Alert severity="error" sx={{ mt: 2, mb: 2, borderRadius: 3 }}>{error}</Alert>}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={submitExercises}
              disabled={!allAnswered || submitting}
              sx={{
                mt: 3, py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 700, fontSize: 16,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
                transition: 'all 0.2s',
              }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit Answers'}
            </Button>
          </>
        )}

        {results && (
          <>
          <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', p: 4, color: 'white', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Your Score</Typography>
              <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1 }}>
                {results.score}%
              </Typography>
              <Box sx={{ mt: 2, mx: 'auto', maxWidth: 300 }}>
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
                {results.correctCount} / {results.totalQuestions} correct
                {results.xpEarned > 0 && ` • +${results.xpEarned} XP`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85, fontStyle: 'italic' }}>
                {results.completed ? '🎉 Lesson completed!' : 'Keep practicing!'}
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{idx + 1}. {r.question}</Typography>
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
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.light' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>
                          💡 {r.explanation}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Button
            variant="outlined"
            onClick={() => { setView('list'); setSelectedLesson(null); setResults(null); }}
            sx={{ mt: 3, borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 4, py: 1.25 }}
          >
            Back to Lessons
          </Button>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Grammar</Typography>
          <Typography variant="body2" color="text.secondary">Learn grammar with AI-generated lessons and exercises</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
          onClick={generateLesson}
          disabled={generating}
          sx={{
            borderRadius: 2.5, textTransform: 'none', fontWeight: 700, fontSize: 14,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
            transition: 'all 0.2s', px: 3, py: 1.25,
          }}
        >
          {generating ? 'Generating...' : 'Generate Lesson'}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Level:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {LEVELS.map(lvl => (
                <Chip
                  key={lvl}
                  label={lvl}
                  color={filterLevel === lvl ? 'primary' : 'default'}
                  onClick={() => setFilterLevel(lvl)}
                  clickable
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>
          <TopicInput
            value={genTopic}
            onChange={setGenTopic}
            onEnter={generateLesson}
            label="Topic (optional)"
            placeholder="Pick a topic below or type any custom topic to generate a lesson"
            suggestions={[...new Set([...topics, ...GRAMMAR_TOPICS])]}
            size="small"
            showRandom
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress size={36} /></Stack>
      ) : lessons.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', bgcolor: '#fafbff' }}>
          <CardContent sx={{ py: 8, px: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <MenuBookIcon sx={{ color: '#6366f1', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>No grammar lessons yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Pick a level, choose a topic, and let AI generate your first lesson
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={generateLesson}
              disabled={generating}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)' }, px: 3 }}
            >
              {generating ? 'Generating...' : 'Generate Your First Lesson'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {lessons.map(lesson => (
            <Grid item xs={12} sm={6} md={4} key={lesson._id}>
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
                  '&::before': lesson.completed ? {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                  } : {},
                }}
                onClick={() => openLesson(lesson._id)}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
                      {lesson.title}
                    </Typography>
                    {lesson.completed && <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18, flexShrink: 0, ml: 0.5 }} />}
                  </Stack>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={lesson.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22 }} />
                    <Chip size="small" label={lesson.topic} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', height: 22 }} />
                  </Stack>
                  {lesson.attempts > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Attempts: <Box component="span" fontWeight={700} color="text.primary">{lesson.attempts}</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Best: <Box component="span" fontWeight={700} color={lesson.score >= 70 ? '#10b981' : '#f59e0b'}>{lesson.score}%</Box>
                        </Typography>
                      </Stack>
                    </Box>
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