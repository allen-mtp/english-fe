'use client';

import { useState, useEffect, useRef } from 'react';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export function ShadowingView() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    axiosInstance.get('/conversations').then(res => setConversations(res.data.conversations)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get('/shadowing/history?limit=20');
      setHistory(res.data.logs || []);
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory && history.length === 0) fetchHistory();
  };

  const speakText = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  const startRecording = async () => {
    try {
      setError(''); setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => setAudioBlob(new Blob(chunks, { type: 'audio/webm' }));
      mr.start();
      setRecording(true);
    } catch {
      setError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const submitScore = async () => {
    if (!audioBlob || !selected) return;
    setScoring(true); setError('');
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('conversationId', selected._id);
    formData.append('sentenceIndex', sentenceIndex.toString());
    try {
      const res = await axiosInstance.post('/shadowing/score', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.log);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Scoring failed');
    } finally { setScoring(false); }
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  const dialogue = selected?.dialogue || [];
  const currentSentence = dialogue[sentenceIndex];
  const progressPercent = dialogue.length ? Math.round(((sentenceIndex + 1) / dialogue.length) * 100) : 0;

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>Shadowing Practice</Typography>
        <Typography variant="body2" color="text.secondary">
          Listen to native speech, then record yourself and get AI feedback
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, mb: 2, borderRadius: 3 }}>{error}</Alert>}

      {!selected ? (
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Choose a conversation</Typography>
          {conversations.length === 0 ? (
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 14px rgba(0,0,0,0.035)' }}>
              <CardContent sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No conversations yet. Generate one in the Chat section first.</Typography>
              </CardContent>
            </Card>
          ) : (
            conversations.slice(0, 8).map(c => (
              <Card
                key={c._id}
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', borderColor: 'primary.light' },
                }}
                onClick={() => setSelected(c)}
              >
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography fontWeight={700} fontSize={16}>{c.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.topic} · {c.level?.toUpperCase()}</Typography>
                  </Box>
                  <Chip
                    label={`${c.dialogue?.length || 0} sentences`}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2, fontWeight: 500 }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        <Stack spacing={4}>
          {/* Back button + title */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => { setSelected(null); setResult(null); setSentenceIndex(0); setAudioBlob(null); }}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 3 }}
            >
              Back to list
            </Button>
          </Stack>

          {/* Main practice card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.035)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Listen to each sentence, then record yourself reading it
              </Typography>

              {/* Progress bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      width: `${progressPercent}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Typography variant="caption" fontWeight={600} color="primary.main">{progressPercent}%</Typography>
              </Box>

              {/* Current sentence */}
              {currentSentence && (
                <Box
                  sx={{
                    bgcolor: '#f8fafc',
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Chip
                    label={currentSentence.speaker}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      bgcolor: currentSentence.speaker === 'A' ? '#eef2ff' : '#fdf2f8',
                      color: currentSentence.speaker === 'A' ? '#4338ca' : '#be185d',
                      mb: 1.5,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>{currentSentence.text}</Typography>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    {currentSentence.translation}
                  </Typography>
                  <Button
                    startIcon={<VolumeUpIcon />}
                    onClick={() => speakText(currentSentence.text)}
                    sx={{ mt: 2, textTransform: 'none', borderRadius: 3, fontWeight: 600 }}
                    size="small"
                    variant="outlined"
                  >
                    Listen
                  </Button>
                </Box>
              )}

              {/* Navigation */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Button
                  disabled={sentenceIndex === 0}
                  onClick={() => { setSentenceIndex(sentenceIndex - 1); setResult(null); setAudioBlob(null); }}
                  startIcon={<NavigateBeforeIcon />}
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 3 }}
                >
                  Previous
                </Button>
                <Chip
                  label={`${sentenceIndex + 1} / ${dialogue.length}`}
                  variant="outlined"
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                />
                <Button
                  disabled={sentenceIndex >= dialogue.length - 1}
                  onClick={() => { setSentenceIndex(sentenceIndex + 1); setResult(null); setAudioBlob(null); }}
                  endIcon={<NavigateNextIcon />}
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 3 }}
                >
                  Next
                </Button>
              </Stack>

              {/* Recording */}
              <Stack alignItems="center" spacing={2.5}>
                <Box sx={{ position: 'relative' }}>
                  {recording && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: -8,
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
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      bgcolor: recording ? '#ef4444' : '#6366f1',
                      color: 'white',
                      transition: 'all 0.2s',
                      boxShadow: recording
                        ? '0 0 0 8px rgba(239,68,68,0.15)'
                        : '0 6px 24px rgba(99,102,241,0.3)',
                      '&:hover': {
                        bgcolor: recording ? '#dc2626' : '#4f46e5',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {recording ? <StopIcon sx={{ fontSize: 30 }} /> : <MicIcon sx={{ fontSize: 30 }} />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color={recording ? 'error.main' : 'text.secondary'} fontWeight={500}>
                  {recording ? 'Recording...' : 'Record your voice'}
                </Typography>
                {audioBlob && !recording && !scoring && (
                  <Button
                    variant="contained"
                    onClick={submitScore}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 4,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                    }}
                  >
                    Get AI Score
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Scoring loading */}
          {scoring && (
            <Box textAlign="center" sx={{ py: 2 }}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Analyzing pronunciation...</Typography>
            </Box>
          )}

          {/* Result */}
          {result && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={4}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight={900} color={result.overallScore >= 70 ? '#10b981' : '#f59e0b'}>
                      {result.overallScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">/ 100</Typography>
                    <Box sx={{ mt: 2, mx: 'auto', maxWidth: 280 }}>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            width: `${result.overallScore}%`,
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={4} justifyContent="center">
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={800} color="primary.main">{result.accuracyScore}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>Accuracy</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={800} color="#8b5cf6">{result.fluencyScore}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>Fluency</Typography>
                    </Box>
                  </Stack>

                  {result.feedback?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>AI Feedback</Typography>
                      <Stack spacing={1}>
                        {result.feedback.map((f, i) => (
                          <Alert key={i} severity="info" sx={{ borderRadius: 3 }}>{f.suggestion || f.issue}</Alert>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* History */}
      <Box sx={{ mt: 4 }}>
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
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 600 }}>Conversation</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align="center">Sentence</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Score</TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 600 }}>Accuracy</TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 600 }}>Fluency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.conversationId?.title || '-'}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align="center">
                          {log.sentenceIndex + 1}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                          label={log.overallScore}
                            size="small"
                            color={log.overallScore >= 70 ? 'success' : log.overallScore >= 40 ? 'warning' : 'error'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          {log.accuracyScore}
                        </TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          {log.fluencyScore}
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
    </Box>
  );
}