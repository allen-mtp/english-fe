'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'src/utils/axios';
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
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  const router = useRouter();
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axiosInstance.get('/roleplay?limit=20');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (topic) => {
    setCreating(true);
    setError('');
    try {
      const res = await axiosInstance.post('/roleplay', {
        topic: topic || undefined,
        level: 'intermediate',
      });
      const conv = res.data.conversation;
      setActiveConv(conv);
      setMessages(conv.messages || []);
      setView('chat');
      setAnalysis(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const openConversation = async (id) => {
    try {
      const res = await axiosInstance.get(`/roleplay/${id}`);
      setActiveConv(res.data.conversation);
      setMessages(res.data.conversation.messages || []);
      setView('chat');
      setAnalysis(null);
    } catch (err) {
      console.error(err);
    }
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
      const res = await axiosInstance.post(`/roleplay/${activeConv._id}/message`, {
        message: messageText,
      });
      setMessages(prev => [...prev, res.data.message]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      setMessages(prev => prev.filter(m => m !== userMsg));
    } finally {
      setSending(false);
    }
  };

  const endConversation = async () => {
    if (!activeConv) return;
    setSending(true);
    try {
      const res = await axiosInstance.post(`/roleplay/${activeConv._id}/end`);
      setAnalysis(res.data.analysis);
      fetchConversations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end conversation');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (view === 'chat' && activeConv) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => { setView('list'); setActiveConv(null); setAnalysis(null); }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800}>{activeConv.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={`You: ${activeConv.userRole}`} color="primary" variant="outlined" />
              <Chip size="small" label={`AI: ${activeConv.aiRole}`} color="secondary" variant="outlined" />
              <Chip size="small" label={activeConv.topic} />
            </Stack>
          </Box>
          {!analysis && (
            <Button variant="outlined" color="error" onClick={endConversation} disabled={sending || messages.length < 3}>
              End & Get Feedback
            </Button>
          )}
        </Stack>

        {analysis && (
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <StarIcon sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" fontWeight={700}>Conversation Feedback</Typography>
                <Chip label={`Score: ${analysis.score}/100`} color="primary" sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" sx={{ mb: 2 }}>{analysis.summary}</Typography>
              {analysis.strengths?.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: 'success.main', mb: 0.5 }}>Strengths:</Typography>
                  {analysis.strengths.map((s, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mt: 0.3 }} />
                      <Typography variant="body2">{s}</Typography>
                    </Stack>
                  ))}
                </Box>
              )}
              {analysis.improvements?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'warning.main', mb: 0.5 }}>To Improve:</Typography>
                  {analysis.improvements.map((s, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                      <LightbulbIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.3 }} />
                      <Typography variant="body2">{s}</Typography>
                    </Stack>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        <Card sx={{ mb: 2, minHeight: 400, maxHeight: '60vh', overflow: 'auto', p: 2 }}>
          <Stack spacing={2}>
            {messages.map((msg, idx) => (
              <Box key={idx}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
                >
                  <Avatar sx={{
                    bgcolor: msg.role === 'user' ? '#6366f1' : '#10b981',
                    width: 32, height: 32,
                  }}>
                    {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 18 }} /> : <SmartToyIcon sx={{ fontSize: 18 }} />}
                  </Avatar>
                  <Box sx={{ maxWidth: '70%' }}>
                    <Paper sx={{
                      p: 1.5,
                      bgcolor: msg.role === 'user' ? '#eef2ff' : '#f0fdf4',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                    </Paper>
                    {msg.grammarIssues && msg.grammarIssues.length > 0 && (
                      <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fde68a' }}>
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#92400e' }}>Corrections:</Typography>
                        {msg.grammarIssues.map((g, i) => (
                          <Box key={i} sx={{ mt: 0.5 }}>
                            <Typography variant="caption" component="span" sx={{ color: '#dc2626', textDecoration: 'line-through' }}>
                              {g.error}
                            </Typography>
                            <Typography variant="caption" component="span" sx={{ mx: 0.5 }}>→</Typography>
                            <Typography variant="caption" component="span" sx={{ color: '#059669', fontWeight: 600 }}>
                              {g.correct}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>{g.explanation}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}
            {sending && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#10b981', width: 32, height: 32 }}>
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <CircularProgress size={20} />
              </Stack>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              sx={{ px: 3, minWidth: 'auto' }}
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Role-play Conversation</Typography>
          <Typography variant="body2" color="text.secondary">
            Practice real-life English conversations with AI
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => startNewConversation()}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Random Scenario'}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)' }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Or pick a topic:</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {SUGGESTED_TOPICS.map(topic => (
            <Chip
              key={topic}
              label={topic}
              onClick={() => startNewConversation(topic)}
              disabled={creating}
              clickable
              sx={{ mb: 0.5 }}
            />
          ))}
        </Stack>
      </Card>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Recent Conversations
      </Typography>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress /></Stack>
      ) : conversations.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <ChatIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No conversations yet. Start your first role-play!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {conversations.map(conv => (
            <Grid item xs={12} sm={6} md={4} key={conv._id}>
              <Card
                sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
                onClick={() => openConversation(conv._id)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{conv.title}</Typography>
                    {conv.overallScore && (
                      <Chip size="small" icon={<StarIcon />} label={conv.overallScore} color="primary" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap>{conv.scenario}</Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={conv.userRole} variant="outlined" />
                    <Chip size="small" label={conv.aiRole} variant="outlined" color="secondary" />
                    <Chip size="small" label={conv.topic} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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