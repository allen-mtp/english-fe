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
import HearingIcon from '@mui/icons-material/Hearing';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TYPES = ['dialogue', 'monologue', 'story', 'news', 'announcement', 'interview'];

export function ListeningView() {
  const [view, setView] = useState('list');
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [genTopic, setGenTopic] = useState('');

  // Practice state
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useState(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = filterLevel ? `?level=${filterLevel}` : '';
      const res = await axiosInstance.get(`/listening${params}`);
      setExercises(res.data.exercises || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateExercise = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await axiosInstance.post('/listening/generate', {
        level: filterLevel || 'B1',
        topic: genTopic.trim() || undefined,
      });
      fetchExercises();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const openExercise = async (id) => {
    try {
      const res = await axiosInstance.get(`/listening/${id}`);
      setSelected(res.data.exercise);
      setAnswers({});
      setResults(null);
      setShowTranscript(false);
      setView('practice');
    } catch (err) {
      console.error(err);
    }
  };

  const playAudio = () => {
    if (!selected || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selected.transcript);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleAnswer = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const arr = selected.questions.map((_, idx) => answers[idx] ?? -1);
      const res = await axiosInstance.post(`/listening/${selected._id}/submit`, { answers: arr });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'practice' && selected) {
    const allAnswered = selected.questions.every((_, idx) => answers[idx] !== undefined);
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('list'); setSelected(null); setResults(null); pauseAudio(); }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{selected.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={selected.level} color="primary" />
              <Chip size="small" label={selected.type} />
              <Chip size="small" label={selected.topic} />
              <Chip size="small" label={`${selected.duration}s`} variant="outlined" />
            </Stack>
          </Box>
        </Stack>

        <Card sx={{ mb: 3, p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
          <HearingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Listen to the Audio</Typography>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Button
              variant="contained"
              size="large"
              startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={isPlaying ? pauseAudio : playAudio}
              sx={{ borderRadius: 5, px: 4 }}
            >
              {isPlaying ? 'Stop' : 'Play Audio'}
            </Button>
            <Button variant="outlined" onClick={() => setShowTranscript(!showTranscript)}>
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
          </Stack>
        </Card>

        {showTranscript && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Transcript:</Typography>
              <Typography variant="body2" paragraph>{selected.transcript}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Bản dịch:</Typography>
              <Typography variant="body2" color="text.secondary">{selected.translation}</Typography>
            </CardContent>
          </Card>
        )}

        {!results ? (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Questions ({selected.questions.length})</Typography>
            {selected.questions.map((q, qIdx) => (
              <Card key={qIdx} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {qIdx + 1}. {q.question}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={answers[qIdx] ?? ''} onChange={(e) => handleAnswer(qIdx, parseInt(e.target.value))}>
                      {q.options.map((opt, oIdx) => (
                        <FormControlLabel key={oIdx} value={oIdx} control={<Radio />} label={opt} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button variant="contained" fullWidth size="large" onClick={submit} disabled={!allAnswered || submitting}>
              {submitting ? <CircularProgress size={24} /> : 'Submit Answers'}
            </Button>
          </>
        ) : (
          <Box>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5" fontWeight={800}>Your Score</Typography>
                  <Typography variant="h3" fontWeight={900} color="primary">{results.score}%</Typography>
                </Stack>
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

            <Button variant="outlined" onClick={() => { setView('list'); setSelected(null); setResults(null); }} sx={{ mt: 2 }}>
              Back to Exercises
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Listening Practice</Typography>
          <Typography variant="body2" color="text.secondary">Listen to AI-generated audio and answer questions</Typography>
        </Box>
        <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={generateExercise} disabled={generating}>
          {generating ? 'Generating...' : 'New Exercise'}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, p: 2.5 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Level:</Typography>
          {LEVELS.map(lvl => (
            <Chip
              key={lvl}
              label={lvl}
              size="small"
              color={filterLevel === lvl ? 'primary' : 'default'}
              onClick={() => { setFilterLevel(filterLevel === lvl ? '' : lvl); }}
            />
          ))}
          <Button size="small" variant="contained" onClick={fetchExercises}>Apply</Button>
        </Stack>
        <TopicInput
          value={genTopic}
          onChange={setGenTopic}
          label="Topic for new exercise (optional)"
          placeholder="Type any topic, or pick a suggestion — used when generating a new exercise"
          suggestions={['travel', 'food', 'work', 'shopping', 'health', 'education', 'news', 'daily-life', 'technology', 'environment', 'sports', 'music']}
          size="small"
        />
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress /></Stack>
      ) : exercises.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <HearingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No exercises yet. Generate your first listening exercise!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {exercises.map(ex => (
            <Grid item xs={12} sm={6} md={4} key={ex._id}>
              <Card
                sx={{ cursor: 'pointer', height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
                onClick={() => openExercise(ex._id)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{ex.title}</Typography>
                    {ex.completed && <CheckCircleIcon color="success" />}
                  </Stack>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={ex.level} color="primary" />
                    <Chip size="small" label={ex.type} />
                    <Chip size="small" label={ex.topic} />
                    <Chip size="small" label={`${ex.duration}s`} variant="outlined" />
                  </Stack>
                  {ex.attempts > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Attempts: {ex.attempts} • Best: {ex.score}%
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