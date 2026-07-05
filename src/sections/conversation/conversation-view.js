'use client';

import { useState, useEffect } from 'react';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Pagination from '@mui/material/Pagination';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TranslateIcon from '@mui/icons-material/Translate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ForumIcon from '@mui/icons-material/Forum';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const topics = ['daily-life', 'travel', 'food', 'work', 'health', 'shopping', 'technology', 'education', 'entertainment', 'hobbies'];

const speakerConfig = [
  { bg: 'rgba(99,102,241,0.06)', dot: '#6366f1', name: '#6366f1', border: 'rgba(99,102,241,0.08)' },
  { bg: 'rgba(245,158,11,0.06)', dot: '#f59e0b', name: '#f59e0b', border: 'rgba(245,158,11,0.08)' },
];

export function ConversationView() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genTopic, setGenTopic] = useState('daily-life');
  const [genLevel, setGenLevel] = useState('A2');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [translations, setTranslations] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 5;

  useEffect(() => {
    axiosInstance.get(`/conversations?page=${page}&limit=${perPage}`).then(res => {
      setConversations(res.data.conversations);
      setTotalPages(res.data.pagination?.totalPages || 1);
    }).catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const generate = async () => {
    setGenLoading(true); setGenError('');
    try {
      const res = await axiosInstance.post('/conversations/generate', { topic: genTopic, level: genLevel });
      setConversations(prev => [res.data.conversation, ...prev]);
    } catch (err) {
      setGenError(err.response?.data?.error || 'Generation failed.');
    } finally { setGenLoading(false); }
  };

  const speakText = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  };

  const toggleTranslation = (id) => {
    setTranslations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const gradientBtn = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' },
    transition: 'all 0.2s',
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>Conversations</Typography>
        <Typography variant="body2" color="text.secondary">Practice with AI-generated realistic dialogues</Typography>
      </Box>

      <Stack spacing={3.5} sx={{ mt: 2 }}>
        {/* Generate Card */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.035)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 16 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>Generate New Dialogue</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              AI creates natural, level-appropriate conversations
            </Typography>
            {genError && <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 3 }}>{genError}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-end' }}>
              <Box sx={{ flex: { xs: 'unset', sm: 1 } }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Topic</Typography>
                <Select value={genTopic} onChange={e => setGenTopic(e.target.value)} fullWidth size="small" MenuProps={{ PaperProps: { sx: { borderRadius: 3 } } }} sx={{ borderRadius: 2.5, '& .MuiSelect-select': { fontWeight: 600 } }}>
                  {topics.map(t => <MenuItem key={t} value={t}><Box component="span" sx={{ textTransform: 'capitalize' }}>{t}</Box></MenuItem>)}
                </Select>
              </Box>
              <Box sx={{ flex: { xs: 'unset', sm: 1 } }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Level</Typography>
                <Select value={genLevel} onChange={e => setGenLevel(e.target.value)} fullWidth size="small" sx={{ borderRadius: 2.5, '& .MuiSelect-select': { fontWeight: 600 } }}>
                  {['A1', 'A2', 'B1', 'B2', 'C1'].map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </Box>
              <Box sx={{ pt: { xs: 1, sm: 0 } }}>
                <Button variant="contained" onClick={generate} disabled={genLoading} sx={{ ...gradientBtn, minWidth: 140, height: 42, px: 3 }}>
                  {genLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Generate'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Empty state */}
        {conversations.length === 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '2px dashed', borderColor: 'divider' }}>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <ForumIcon sx={{ fontSize: 26, color: 'text.disabled' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">No conversations yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Generate your first dialogue above</Typography>
            </CardContent>
          </Card>
        )}

        {/* Conversation list */}
        {conversations.map(conv => (
          <Card key={conv._id} sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.035)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} fontSize={17}>{conv.title}</Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                    <Chip label={conv.topic} size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 500, height: 24 }} />
                    <Chip label={conv.level?.toUpperCase()} size="small" sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#eef2ff', color: '#6366f1', height: 24 }} />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton onClick={() => toggleTranslation(conv._id)} size="small" sx={{ color: translations[conv._id] ? '#6366f1' : 'text.secondary', width: 34, height: 34 }}>
                    <TranslateIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => setExpanded(expanded === conv._id ? null : conv._id)} size="small" sx={{ width: 34, height: 34 }}>
                    <ExpandMoreIcon sx={{ fontSize: 22, color: 'text.secondary', transform: expanded === conv._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Dialogue */}
              <Collapse in={expanded === conv._id}>
                <Box sx={{ px: 3, pb: 3, bgcolor: '#fafbfd', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ pt: 2 }}>
                    {conv.dialogue?.map((line, idx) => {
                      const cfg = speakerConfig[idx % 2];
                      return (
                        <Box
                          key={idx}
                          sx={{
                            mb: 1.5,
                            p: 2,
                            borderRadius: 3,
                            bgcolor: cfg.bg,
                            border: '1px solid',
                            borderColor: cfg.border,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0 }} />
                            <Typography variant="body2" fontWeight={700} sx={{ color: cfg.name }}>{line.speaker}</Typography>
                            <IconButton size="small" onClick={() => speakText(line.text)} sx={{ ml: 0.5 }}><VolumeUpIcon fontSize="small" /></IconButton>
                          </Stack>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{line.text}</Typography>
                          {translations[conv._id] && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontStyle: 'italic', opacity: 0.8 }}>
                              {line.translation}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Vocabulary highlights */}
                  {conv.vocabularyHighlights?.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Vocabulary Highlights</Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {conv.vocabularyHighlights.map((h, i) => (
                          <Chip key={i} label={`${h.word} — ${h.meaning}`} size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: 12.5, fontWeight: 500 }} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Grammar notes */}
                  {conv.grammarNotes && (
                    <Box sx={{ mt: 2.5, borderRadius: 3, border: '1px solid #c7d2fe', bgcolor: '#eef2ff', p: 2.5 }}>
                      <Typography variant="body2" fontWeight={700} color="#4338ca" sx={{ mb: 0.5 }}>Grammar Notes</Typography>
                      <Typography variant="body2" color="text.secondary">{conv.grammarNotes}</Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" size="large" sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }} />
          </Box>
        )}
      </Stack>
    </Box>
  );
}