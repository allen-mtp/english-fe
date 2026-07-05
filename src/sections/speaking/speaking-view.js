'use client';

import { useState, useRef, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const sampleTexts = [
  'The weather is beautiful today. I would like to go for a walk in the park.',
  'She sells seashells by the seashore every Sunday morning.',
  'I have been learning English for three years and I love it.',
];

export function SpeakingView() {
  const [tab, setTab] = useState(0);
  const [text, setText] = useState(sampleTexts[0]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  // Daily scenario state
  const [scenario, setScenario] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState('');

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get('/pronunciation/history?limit=20');
      setHistory(res.data.logs || []);
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory && history.length === 0) fetchHistory();
  };

  const startRecording = async () => {
    try {
      setError('');
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setRecording(false);
    }
  };

  const submitForScoring = async () => {
    if (!audioBlob || !text.trim()) return;
    setScoring(true); setError('');
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('text', text);
    try {
      const res = await axiosInstance.post('/pronunciation/score', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.log);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Scoring failed');
    } finally { setScoring(false); }
  };

  const playAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  // Daily scenario functions
  const fetchScenario = async () => {
    setScenarioLoading(true);
    setScenarioError('');
    try {
      const res = await axiosInstance.get('/speaking-scenarios/scenario?level=B1');
      setScenario(res.data.scenario);
      setResult(null);
      setAudioBlob(null);
    } catch (err) {
      setScenarioError(err.response?.data?.error || 'Failed to load scenario');
    } finally {
      setScenarioLoading(false);
    }
  };

  const speak = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const scoreColor = result?.overallScore >= 70 ? '#10b981' : result?.overallScore >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>Speaking Practice</Typography>
        <Typography variant="body2" color="text.secondary">Practice pronunciation and real-life speaking scenarios</Typography>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 2, mb: 3 }}>
        <Tab icon={<MicIcon />} iconPosition="start" label="Pronunciation" />
        <Tab icon={<RecordVoiceOverIcon />} iconPosition="start" label="Daily Scenario" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
      {scenarioError && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{scenarioError}</Alert>}

      {tab === 0 && (
      <Stack spacing={3.5}>
        {/* Text input */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.035)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Text to read aloud</Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); setAudioBlob(null); }}
              InputProps={{ sx: { borderRadius: 3 } }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              {sampleTexts.map((t, i) => (
                <Chip
                  key={i}
                  label={`Sample ${i + 1}`}
                  onClick={() => { setText(t); setResult(null); setAudioBlob(null); }}
                  variant="outlined"
                  size="small"
                  sx={{ cursor: 'pointer', borderRadius: 2, fontWeight: 500 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Recording */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.035)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={4}>
              <Typography variant="h6" fontWeight={700} textAlign="center">Record Your Voice</Typography>

              <Box sx={{ position: 'relative' }}>
                {recording && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -12,
                      borderRadius: '50%',
                      border: '3px solid',
                      borderColor: 'error.main',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                        '50%': { opacity: 0.1, transform: 'scale(1.05)' },
                      },
                    }}
                  />
                )}
                <IconButton
                  onClick={recording ? stopRecording : startRecording}
                  sx={{
                    width: 88, height: 88,
                    borderRadius: '50%',
                    bgcolor: recording ? '#ef4444' : '#6366f1',
                    color: 'white',
                    transition: 'all 0.2s',
                    boxShadow: recording
                      ? '0 0 0 10px rgba(239,68,68,0.15)'
                      : '0 8px 32px rgba(99,102,241,0.3)',
                    '&:hover': {
                      bgcolor: recording ? '#dc2626' : '#4f46e5',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {recording ? <StopIcon sx={{ fontSize: 36 }} /> : <MicIcon sx={{ fontSize: 36 }} />}
                </IconButton>
              </Box>

              <Typography variant="body2" color={recording ? 'error.main' : 'text.secondary'} fontWeight={500}>
                {recording ? 'Recording... tap to stop' : 'Tap the microphone to start'}
              </Typography>

              {audioBlob && !recording && !scoring && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={playAudio}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3 }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={submitForScoring}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                    }}
                  >
                    Get AI Score
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Scoring loading */}
        {scoring && (
          <Box textAlign="center" sx={{ py: 4 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>AI is analyzing your pronunciation...</Typography>
          </Box>
        )}

        {/* Result */}
        {result && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Box textAlign="center">
                  <Typography variant="h2" fontWeight={900} sx={{ color: scoreColor, lineHeight: 1 }}>
                    {result.overallScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">/ 100</Typography>
                  <Box sx={{ mt: 2, mx: 'auto', maxWidth: 300 }}>
                    <Box sx={{ width: '100%', height: 10, bgcolor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 5,
                          bgcolor: scoreColor,
                          width: `${result.overallScore}%`,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                {result.feedback && (
                  <Box sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" fontStyle="italic">{result.feedback}</Typography>
                  </Box>
                )}
                {result.wordScores?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Per-Word Scores</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {result.wordScores.map((ws, i) => (
                        <Chip
                          key={i}
                          label={`${ws.word} (${ws.score})`}
                          size="small"
                          color={ws.score >= 70 ? 'success' : ws.score >= 40 ? 'warning' : 'error'}
                          variant="outlined"
                          sx={{ borderRadius: 1.5, fontWeight: 500 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Box>
          <Button
            startIcon={<HistoryIcon />}
            onClick={toggleHistory}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 3 }}
          >
            {showHistory ? 'Hide' : 'View'} Practice History
          </Button>
          {showHistory && (
            <Box sx={{ mt: 2 }}>
              {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
              ) : history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No practice history yet.</Typography>
              ) : (
                <TableContainer component={Card} sx={{ borderRadius: 3, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Text</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Score</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 600 }}>Feedback</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.text}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={log.overallScore}
                              size="small"
                              color={log.overallScore >= 70 ? 'success' : log.overallScore >= 40 ? 'warning' : 'error'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.feedback || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={3}>
          {!scenario ? (
            <Card sx={{ p: 5, textAlign: 'center' }}>
              <RecordVoiceOverIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Practice a Real-Life Scenario</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                Get a daily speaking situation (ordering food, doctor visit, job interview...) with useful phrases, sample dialogue, and a challenge to try.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={scenarioLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                onClick={fetchScenario}
                disabled={scenarioLoading}
                sx={{ borderRadius: 3, px: 4 }}
              >
                {scenarioLoading ? 'Loading...' : 'Get Daily Scenario'}
              </Button>
            </Card>
          ) : (
            <>
              <Card sx={{ p: 3, background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h5" fontWeight={800}>{scenario.title}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{scenario.situation}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip size="small" label={scenario.topic} color="primary" />
                      <Chip size="small" label={scenario.level} />
                    </Stack>
                  </Box>
                  <Button variant="outlined" size="small" onClick={fetchScenario} disabled={scenarioLoading}>
                    New Scenario
                  </Button>
                </Stack>
              </Card>

              {scenario.keyVocabulary?.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Key Vocabulary</Typography>
                  <Grid container spacing={1}>
                    {scenario.keyVocabulary.map((v, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <IconButton size="small" onClick={() => speak(v.word)}>
                            <VolumeUpIcon fontSize="small" />
                          </IconButton>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{v.word} <span style={{ color: '#6b7280', fontSize: 12 }}>{v.ipa}</span></Typography>
                            <Typography variant="caption" color="text.secondary">{v.meaning}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              )}

              {scenario.usefulPhrases?.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Useful Phrases</Typography>
                  {scenario.usefulPhrases.map((p, i) => (
                    <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton size="small" onClick={() => speak(p.phrase)}>
                          <VolumeUpIcon fontSize="small" />
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{p.phrase}</Typography>
                          <Typography variant="caption" color="text.secondary">{p.translation}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Card>
              )}

              {scenario.sampleDialogue?.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Sample Dialogue</Typography>
                  {scenario.sampleDialogue.map((d, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Chip
                          size="small"
                          label={d.speaker}
                          color={d.speaker === 'You' ? 'primary' : 'secondary'}
                          sx={{ mt: 0.3 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">{d.text}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => speak(d.text)}>
                          <VolumeUpIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Card>
              )}

              {scenario.tips?.length > 0 && (
                <Card sx={{ p: 3, bgcolor: '#fef3c7' }}>
                  <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>Speaking Tips:</Typography>
                  {scenario.tips.map((t, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {t}</Typography>
                  ))}
                </Card>
              )}

              {scenario.challenge && (
                <Card sx={{ p: 3, bgcolor: '#ede9fe', border: '1px dashed #8b5cf6' }}>
                  <Typography variant="subtitle2" sx={{ color: '#6d28d9' }}>Challenge:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{scenario.challenge}</Typography>
                </Card>
              )}

              <Divider sx={{ my: 1 }}>Practice Speaking</Divider>

              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Stack alignItems="center" spacing={3}>
                    <Typography variant="subtitle1" fontWeight={600}>Record yourself practicing this scenario</Typography>
                    <Box sx={{ position: 'relative' }}>
                      {recording && (
                        <Box sx={{
                          position: 'absolute', inset: -12, borderRadius: '50%',
                          border: '3px solid', borderColor: 'error.main',
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                            '50%': { opacity: 0.1, transform: 'scale(1.05)' },
                          },
                        }} />
                      )}
                      <IconButton
                        onClick={recording ? stopRecording : startRecording}
                        sx={{
                          width: 80, height: 80, borderRadius: '50%',
                          bgcolor: recording ? '#ef4444' : '#6366f1', color: 'white',
                          '&:hover': { bgcolor: recording ? '#dc2626' : '#4f46e5' },
                        }}
                      >
                        {recording ? <StopIcon sx={{ fontSize: 32 }} /> : <MicIcon sx={{ fontSize: 32 }} />}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color={recording ? 'error.main' : 'text.secondary'}>
                      {recording ? 'Recording... tap to stop' : 'Tap to start recording'}
                    </Typography>
                    {audioBlob && !recording && (
                      <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" startIcon={<PlayArrowIcon />} onClick={playAudio}>Preview</Button>
                        <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={submitForScoring} disabled={scoring}>
                          {scoring ? 'Scoring...' : 'Get AI Feedback'}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {scoring && (
                <Box textAlign="center" sx={{ py: 3 }}>
                  <CircularProgress size={36} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>AI is analyzing your speech...</Typography>
                </Box>
              )}

              {result && (
                <Card sx={{ p: 3 }}>
                  <Box textAlign="center" sx={{ mb: 2 }}>
                    <Typography variant="h3" fontWeight={900} sx={{ color: scoreColor }}>{result.overallScore}</Typography>
                    <Typography variant="body2" color="text.secondary">/ 100</Typography>
                  </Box>
                  {result.feedback && (
                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 2, textAlign: 'center', mb: 2 }}>
                      <Typography variant="body2" fontStyle="italic">{result.feedback}</Typography>
                    </Box>
                  )}
                  {result.wordScores?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {result.wordScores.map((ws, i) => (
                        <Chip
                          key={i}
                          label={`${ws.word} (${ws.score})`}
                          size="small"
                          color={ws.score >= 70 ? 'success' : ws.score >= 40 ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  )}
                </Card>
              )}
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}