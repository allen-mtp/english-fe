'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'src/utils/axios';
import { getApiError, normalizeTopic, openGeneratedExercise, clearTopicInput } from 'src/utils/api-helpers';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const levelChipSx = {
  borderRadius: 1.5,
  fontWeight: 700,
  bgcolor: '#eef2ff',
  color: '#4f46e5',
  height: 22,
  pointerEvents: 'none',
  '&:hover': { bgcolor: '#eef2ff', color: '#4f46e5' },
};

const metaChipSx = {
  borderRadius: 1.5,
  fontWeight: 600,
  bgcolor: '#f1f5f9',
  color: '#475569',
  height: 22,
  pointerEvents: 'none',
  '&:hover': { bgcolor: '#f1f5f9', color: '#475569' },
};

const durationChipSx = {
  borderRadius: 1.5,
  fontWeight: 600,
  height: 22,
  pointerEvents: 'none',
  '&:hover': { bgcolor: 'transparent', color: 'inherit' },
};

export function ListeningView() {
  const { t } = useTranslation();
  const [view, setView] = useState('list');
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('A1');
  const [genTopic, setGenTopic] = useState('');

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useState(null);

  useEffect(() => { fetchExercises(); }, [filterLevel]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = filterLevel ? `?level=${filterLevel}` : '';
      const res = await axiosInstance.get(`/listening${params}`);
      setExercises(res.data.exercises || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const generateExercise = async () => {
    setGenerating(true); setError('');
    const topic = normalizeTopic(genTopic);
    try {
      const res = await axiosInstance.post('/listening/generate', {
        level: filterLevel,
        topic: topic || undefined,
      });
      clearTopicInput(setGenTopic);
      openGeneratedExercise(res.data?.exercise, {
        setSelected, setAnswers, setResults, setShowTranscript, setView,
      });
      await fetchExercises();
    } catch (err) { setError(getApiError(err, t('listening.genFailed'))); }
    finally { setGenerating(false); }
  };

  const openExercise = async (id) => {
    try {
      const res = await axiosInstance.get(`/listening/${id}`);
      setSelected(res.data.exercise);
      setAnswers({}); setResults(null); setShowTranscript(false);
      setView('practice');
    } catch (err) { console.error(err); }
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

  const handleAnswer = (qIdx, optIdx) => setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true); setError('');
    try {
      const arr = selected.questions.map((_, idx) => answers[idx] ?? -1);
      const res = await axiosInstance.post(`/listening/${selected._id}/submit`, { answers: arr });
      setResults(res.data);
    } catch (err) { setError(err.response?.data?.error || t('listening.submitFailed')); }
    finally { setSubmitting(false); }
  };

  const gradientBtn = {
    borderRadius: 2.5, textTransform: 'none', fontWeight: 800, color: 'white',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
    transition: 'all 0.2s',
  };

  if (view === 'practice' && selected) {
    const allAnswered = selected.questions.every((_, idx) => answers[idx] !== undefined);
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('list'); setSelected(null); setResults(null); pauseAudio(); }} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{selected.title}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label={selected.level} sx={levelChipSx} />
              <Chip size="small" label={selected.type} sx={metaChipSx} />
              <Chip size="small" label={selected.topic} sx={metaChipSx} />
              <Chip size="small" label={`${selected.duration}s`} variant="outlined" sx={durationChipSx} />
            </Stack>
          </Box>
        </Stack>

        <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #eef2ff 100%)', p: 4, textAlign: 'center' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}>
              <HearingIcon sx={{ color: '#6366f1', fontSize: 28 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2.5 }}>{t('listening.listenToAudio')}</Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              <Button
                variant="contained"
                size="large"
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={isPlaying ? pauseAudio : playAudio}
                sx={{ ...gradientBtn, borderRadius: 5, px: 4, py: 1.25 }}
              >
                {isPlaying ? t('listening.stop') : t('listening.playAudio')}
              </Button>
              <Button variant="outlined" onClick={() => setShowTranscript(!showTranscript)} sx={{ borderRadius: 5, textTransform: 'none', fontWeight: 600, px: 3, py: 1.25, borderColor: '#cbd5e1', color: '#475569' }}>
                {showTranscript ? t('listening.hideTranscript') : t('listening.showTranscript')} {t('listening.transcript')}
              </Button>
            </Stack>
          </Box>
        </Card>

        {showTranscript && (
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{t('listening.transcript')}</Typography>
              <Typography variant="body2" paragraph sx={{ lineHeight: 1.7 }}>{selected.transcript}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>{t('listening.translation')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{selected.translation}</Typography>
            </CardContent>
          </Card>
        )}

        {!results ? (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('listening.questions', { count: selected.questions.length })}</Typography>
            {selected.questions.map((q, qIdx) => (
              <Card key={qIdx} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>{qIdx + 1}. {q.question}</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={answers[qIdx] ?? ''} onChange={(e) => handleAnswer(qIdx, parseInt(e.target.value))}>
                      {q.options.map((opt, oIdx) => (
                        <FormControlLabel key={oIdx} value={oIdx} control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#6366f1' } }} />} label={opt} sx={{ '& .MuiFormControlLabel-label': { fontSize: 14.5 } }} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
            <Button variant="contained" fullWidth size="large" onClick={submit} disabled={!allAnswered || submitting} sx={{ ...gradientBtn, py: 1.5, fontSize: 16 }}>
              {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : t('listening.submitAnswers')}
            </Button>
          </>
        ) : (
          <Box>
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', p: 4, color: 'white', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>{t('listening.yourScore')}</Typography>
                <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1 }}>{results.score}%</Typography>
                <Box sx={{ mt: 2, mx: 'auto', maxWidth: 300 }}>
                  <LinearProgress variant="determinate" value={results.score} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: 'white' } }} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.9 }}>
                  {t('listening.correct', { correct: results.correctCount, total: results.totalQuestions })} {results.xpEarned > 0 && `${t('listening.xpEarned', { xp: results.xpEarned })}`}
                </Typography>
              </Box>
            </Card>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{t('listening.reviewAnswers')}</Typography>
            {results.results.map((r, idx) => (
              <Card key={idx} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid', borderColor: r.correct ? '#bbf7d0' : '#fecaca', borderLeft: '4px solid', borderLeftColor: r.correct ? '#10b981' : '#ef4444' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: r.correct ? '#dcfce7' : '#fee2e2', color: r.correct ? '#059669' : '#dc2626' }}>
                      {r.correct ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <CancelIcon sx={{ fontSize: 18 }} />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{idx + 1}. {r.question}</Typography>
                      <Stack spacing={0.75}>
                        {r.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === r.correctIndex;
                          const isUser = oIdx === r.userAnswer;
                          return (
                            <Box key={oIdx} sx={{ py: 1, px: 1.5, borderRadius: 2, bgcolor: isCorrect ? '#dcfce7' : (isUser ? '#fee2e2' : 'transparent'), display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ flex: 1, fontWeight: (isCorrect || isUser) ? 700 : 400, color: isCorrect ? '#059669' : (isUser ? '#dc2626' : 'text.primary') }}>
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </Typography>
                              {isCorrect && <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />}
                              {isUser && !isCorrect && <CancelIcon sx={{ fontSize: 16, color: '#dc2626' }} />}
                            </Box>
                          );
                        })}
                      </Stack>
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.light' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>💡 {r.explanation}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            <Button variant="outlined" onClick={() => { setView('list'); setSelected(null); setResults(null); }} sx={{ mt: 2, borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 4, py: 1.25 }}>
              {t('listening.backToExercises')}
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{t('listening.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('listening.subtitle')}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
          onClick={generateExercise}
          disabled={generating}
          sx={{ ...gradientBtn, fontSize: 14, px: 3, py: 1.25 }}
        >
          {generating ? t('listening.generating') : t('listening.newExercise')}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{t('listening.level')}:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {LEVELS.map(lvl => (
                <Chip key={lvl} label={lvl} color={filterLevel === lvl ? 'primary' : 'default'} onClick={() => setFilterLevel(lvl)} clickable sx={{ borderRadius: 2, fontWeight: 600 }} />
              ))}
              <Button size="small" variant="contained" onClick={fetchExercises} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 }}>{t('listening.apply')}</Button>
            </Stack>
          </Box>
          <TopicInput
            value={genTopic}
            onChange={setGenTopic}
            onEnter={generateExercise}
            label={t('listening.topicLabel')}
            placeholder={t('listening.topicPlaceholder')}
            suggestions={['travel', 'food', 'work', 'shopping', 'health', 'education', 'news', 'daily-life', 'technology', 'environment', 'sports', 'music']}
            size="small"
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress size={36} /></Stack>
      ) : exercises.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', bgcolor: '#fafbff' }}>
          <CardContent sx={{ py: 8, px: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <HearingIcon sx={{ color: '#6366f1', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>{t('listening.noExercises')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('listening.noExercisesDesc')}
            </Typography>
            <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={generateExercise} disabled={generating} sx={{ ...gradientBtn, px: 3 }}>
              {generating ? t('listening.generating') : t('listening.generateFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {exercises.map(ex => (
            <Grid item xs={12} sm={6} md={4} key={ex._id}>
              <Card
                sx={{
                  cursor: 'pointer', height: '100%', borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'all 0.2s',
                  border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(99,102,241,0.08)', borderColor: 'primary.light' },
                  '&::before': ex.completed ? { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #34d399)' } : {},
                }}
                onClick={() => openExercise(ex._id)}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>{ex.title}</Typography>
                    {ex.completed && <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18, flexShrink: 0, ml: 0.5 }} />}
                  </Stack>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={ex.level} sx={levelChipSx} />
                    <Chip size="small" label={ex.type} sx={metaChipSx} />
                    <Chip size="small" label={ex.topic} sx={metaChipSx} />
                    <Chip size="small" label={`${ex.duration}s`} variant="outlined" sx={durationChipSx} />
                  </Stack>
                  {ex.attempts > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {t('listening.attempts')}: <Box component="span" fontWeight={700} color="text.primary">{ex.attempts}</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {t('listening.best')}: <Box component="span" fontWeight={700} color={ex.score >= 70 ? '#10b981' : '#f59e0b'}>{ex.score}%</Box>
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
