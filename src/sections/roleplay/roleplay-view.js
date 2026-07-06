'use client';

import { useState, useEffect, useRef } from 'react';
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
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const SUGGESTED_TOPICS = [
  'Ordering food at a restaurant',
  'Job interview',
  'Hotel check-in',
  'Asking for directions',
  'Making a complaint',
  'Doctor visit',
  'Shopping for clothes',
  'Airport check-in',
];

export function RolePlayView() {
  const [view, setView] = useState('list');
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const [level, setLevel] = useState('A1');
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axiosInstance.get('/roleplay?limit=20');
      setConversations(res.data.conversations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startNewConversation = async (topic) => {
    setCreating(true); setError('');
    try {
      const res = await axiosInstance.post('/roleplay', {
        topic: topic || undefined,
        level,
      });
      const conv = res.data.conversation;
      setActiveConv(conv);
      setMessages(conv.messages || []);
      setView('chat');
      setAnalysis(null);
    } catch (err) { setError(err.response?.data?.error || 'Failed to start conversation'); }
    finally { setCreating(false); }
  };

  const openConversation = async (id) => {
    try {
      const res = await axiosInstance.get(`/roleplay/${id}`);
      setActiveConv(res.data.conversation);
      setMessages(res.data.conversation.messages || []);
      setView('chat');
      setAnalysis(null);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    const messageText = input.trim();
    setInput('');
    setSending(true);
    setError('');
    try {
      const res = await axiosInstance.post(`/roleplay/${activeConv._id}/message`, { message: messageText });
      setMessages(prev => [...prev, res.data.message]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      setMessages(prev => prev.filter(m => m !== userMsg));
    } finally { setSending(false); }
  };

  const endConversation = async () => {
    if (!activeConv) return;
    setSending(true);
    try {
      const res = await axiosInstance.post(`/roleplay/${activeConv._id}/end`);
      setAnalysis(res.data.analysis);
      fetchConversations();
    } catch (err) { setError(err.response?.data?.error || 'Failed to end conversation'); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const gradientBtn = {
    borderRadius: 2.5, textTransform: 'none', fontWeight: 800, color: 'white',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
    transition: 'all 0.2s',
  };

  if (view === 'chat' && activeConv) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('list'); setActiveConv(null); setAnalysis(null); }} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{activeConv.title}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} useFlexGap flexWrap="wrap">
              {activeConv.level && <Chip size="small" label={activeConv.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22 }} />}
              <Chip size="small" label={`You: ${activeConv.userRole}`} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22 }} />
              <Chip size="small" label={`AI: ${activeConv.aiRole}`} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669', height: 22 }} />
              <Chip size="small" label={activeConv.topic} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', height: 22 }} />
            </Stack>
          </Box>
          {!analysis && (
            <Button variant="outlined" color="error" onClick={endConversation} disabled={sending || messages.length < 3} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}>
              End & Get Feedback
            </Button>
          )}
        </Stack>

        {analysis && (
          <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', p: 3, color: 'white' }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <StarIcon sx={{ fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" sx={{ opacity: 0.85, lineHeight: 1 }}>Conversation Feedback</Typography>
                  <Typography variant="h5" fontWeight={800}>{analysis.summary?.slice(0, 60)}{analysis.summary?.length > 60 ? '...' : ''}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', px: 2.5, py: 1, borderRadius: 3 }}>
                  <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1 }}>{analysis.score}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>/100</Typography>
                </Box>
              </Stack>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" paragraph sx={{ lineHeight: 1.7 }}>{analysis.summary}</Typography>
              <Grid container spacing={3}>
                {analysis.strengths?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, color: '#059669' }}>
                      <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                      Strengths
                    </Typography>
                    <Stack spacing={1}>
                      {analysis.strengths.map((s, i) => (
                        <Box key={i} sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                          <Typography variant="body2">{s}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
                {analysis.improvements?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, color: '#d97706' }}>
                      <LightbulbIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                      To Improve
                    </Typography>
                    <Stack spacing={1}>
                      {analysis.improvements.map((s, i) => (
                        <Box key={i} sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                          <Typography variant="body2">{s}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        <Card sx={{ mb: 2, minHeight: 400, maxHeight: '60vh', overflow: 'auto', p: 2.5, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {messages.map((msg, idx) => (
              <Stack
                key={idx}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                <Avatar sx={{
                  bgcolor: msg.role === 'user' ? '#6366f1' : '#10b981',
                  width: 36, height: 36, flexShrink: 0,
                }}>
                  {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 20 }} /> : <SmartToyIcon sx={{ fontSize: 20 }} />}
                </Avatar>
                <Box sx={{ maxWidth: '70%' }}>
                  <Paper sx={{
                    p: 1.75,
                    bgcolor: msg.role === 'user' ? '#eef2ff' : '#f0fdf4',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: '1px solid',
                    borderColor: msg.role === 'user' ? '#c7d2fe' : '#bbf7d0',
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.text}</Typography>
                  </Paper>
                  {msg.grammarIssues && msg.grammarIssues.length > 0 && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                      <Typography variant="caption" fontWeight={800} sx={{ color: '#92400e', display: 'block', mb: 0.5 }}>
                        💡 Grammar Tips
                      </Typography>
                      {msg.grammarIssues.map((g, i) => (
                        <Box key={i} sx={{ mt: 0.5 }}>
                          <Box component="span" sx={{ fontSize: 13, color: '#dc2626', textDecoration: 'line-through' }}>{g.error}</Box>
                          <Box component="span" sx={{ mx: 0.5, color: '#6b7280', fontSize: 13 }}>→</Box>
                          <Box component="span" sx={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>{g.correct}</Box>
                          <Typography variant="caption" display="block" sx={{ color: '#6b7280', mt: 0.25 }}>{g.explanation}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Stack>
            ))}
            {sending && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36 }}>
                  <SmartToyIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '16px 16px 16px 4px', border: '1px solid #bbf7d0' }}>
                  <CircularProgress size={18} />
                </Box>
              </Stack>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        {!analysis && (
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type your message in English..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              sx={{ ...gradientBtn, px: 3, minWidth: 'auto', borderRadius: 3 }}
            >
              <SendIcon />
            </Button>
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Role-play Conversation</Typography>
          <Typography variant="body2" color="text.secondary">Practice real-life English conversations with AI</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={creating ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
          onClick={() => startNewConversation()}
          disabled={creating}
          sx={{ ...gradientBtn, fontSize: 14, px: 3, py: 1.25 }}
        >
          {creating ? 'Creating...' : 'Random Scenario'}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', p: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Level:</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {LEVELS.map(lvl => (
                <Chip key={lvl} label={lvl} color={level === lvl ? 'primary' : 'default'} onClick={() => setLevel(lvl)} clickable sx={{ borderRadius: 2, fontWeight: 600 }} />
              ))}
            </Stack>
          </Box>
          <TopicInput
            value={customTopic}
            onChange={setCustomTopic}
            onEnter={() => { if (customTopic.trim()) { startNewConversation(customTopic.trim()); setCustomTopic(''); } }}
            label="Custom scenario (optional)"
            placeholder="Type any scenario you want to practice, or pick a suggestion below"
            suggestions={SUGGESTED_TOPICS}
            size="small"
          />
          {customTopic.trim() && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => { startNewConversation(customTopic.trim()); setCustomTopic(''); }}
              disabled={creating}
              sx={{ ...gradientBtn, mt: 1.5, fontSize: 13 }}
            >
              Start &ldquo;{customTopic.trim()}&rdquo;
            </Button>
          )}
        </Box>
      </Card>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Recent Conversations</Typography>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress size={36} /></Stack>
      ) : conversations.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', bgcolor: '#fafbff' }}>
          <CardContent sx={{ py: 8, px: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <ChatIcon sx={{ color: '#6366f1', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>No conversations yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Pick a scenario above and start practicing your English
            </Typography>
            <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={() => startNewConversation()} disabled={creating} sx={{ ...gradientBtn, px: 3 }}>
              {creating ? 'Creating...' : 'Start Your First Conversation'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {conversations.map(conv => (
            <Grid item xs={12} sm={6} md={4} key={conv._id}>
              <Card
                sx={{
                  cursor: 'pointer', height: '100%', borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'all 0.2s',
                  border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(99,102,241,0.08)', borderColor: 'primary.light' },
                  '&::before': conv.overallScore ? { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' } : {},
                }}
                onClick={() => openConversation(conv._id)}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>{conv.title}</Typography>
                    {conv.overallScore && (
                      <Chip size="small" icon={<StarIcon sx={{ fontSize: 14 }} />} label={conv.overallScore} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#fef3c7', color: '#92400e', height: 22 }} />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>{conv.scenario}</Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {conv.level && <Chip size="small" label={conv.level} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5', height: 22 }} />}
                    <Chip size="small" label={conv.userRole} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#eef2ff', color: '#4f46e5', height: 22 }} />
                    <Chip size="small" label={conv.aiRole} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#ecfdf5', color: '#059669', height: 22 }} />
                    <Chip size="small" label={conv.topic} sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', height: 22 }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    {new Date(conv.createdAt).toLocaleString()}
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
