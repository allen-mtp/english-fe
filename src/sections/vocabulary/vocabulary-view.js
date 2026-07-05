'use client';

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { m as motion, AnimatePresence } from 'framer-motion';

function FlashcardDialog({ word, open, onClose }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setFlipped(false); }, [open]);

  if (!word) return null;

  const vocab = word.vocabularyId || word;
  const pronounce = () => {
    const utter = new SpeechSynthesisUtterance(vocab.word);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
      <DialogContent sx={{ p: 0 }}>
        <Box
          onClick={() => setFlipped(!flipped)}
          sx={{
            cursor: 'pointer',
            minHeight: 380,
            background: flipped
              ? 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)'
              : 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)',
            color: flipped ? 'white' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 5,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={(e) => { e.stopPropagation(); pronounce(); }}
            sx={{
              position: 'absolute', top: 16, right: 16,
              color: flipped ? 'rgba(255,255,255,0.9)' : 'text.secondary',
              bgcolor: flipped ? 'rgba(255,255,255,0.1)' : 'action.hover',
              '&:hover': { bgcolor: flipped ? 'rgba(255,255,255,0.2)' : 'action.selected' },
            }}
          >
            <VolumeUpIcon />
          </IconButton>
          <AnimatePresence mode="wait">
            <motion.div
              key={flipped ? 'back' : 'front'}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.25 }}
            >
              {!flipped ? (
                <Box>
                  <Typography variant="h2" fontWeight={900} sx={{ mb: 1, letterSpacing: '-1px' }}>{vocab.word}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.5, fontStyle: 'italic' }}>{vocab.ipa || ''}</Typography>
                  <Box sx={{ mt: 4 }}>
                    <Chip label={vocab.partOfSpeech || 'noun'} size="small" variant="outlined" sx={{ opacity: 0.5 }} />
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', mt: 3, opacity: 0.35 }}>Tap to reveal meaning</Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>{vocab.meaningVi}</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.85 }}>{vocab.meaningEn}</Typography>
                  {vocab.examples?.[0] && (
                    <Box sx={{ mt: 3, py: 2, px: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                      <Typography variant="body2" fontStyle="italic">{vocab.examples[0].en}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>{vocab.examples[0].vi}</Typography>
                    </Box>
                  )}
                  {vocab.synonyms?.length > 0 && (
                    <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 3, flexWrap: 'wrap' }}>
                      {vocab.synonyms.map((s) => <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }} />)}
                    </Stack>
                  )}
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function AddNewTab({ onGenerated }) {
  const [genWord, setGenWord] = useState('');
  const [genBatch, setGenBatch] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');

  const handleGenerateSingle = async () => {
    const word = genWord.trim();
    if (!word) return;
    setGenLoading(true); setGenError(''); setGenSuccess('');
    try {
      await axiosInstance.post('/vocabularies/generate', { word });
      setGenSuccess(`"${word}" generated!`);
      setGenWord('');
      onGenerated();
    } catch (err) { setGenError(err.response?.data?.error || 'Generation failed'); }
    finally { setGenLoading(false); }
  };

  const handleGenerateBatch = async () => {
    const raw = genBatch.trim();
    if (!raw) return;
    const words = raw.split(/[,;\n]+/).map(w => w.trim()).filter(Boolean);
    if (words.length === 0) return;
    setGenLoading(true); setGenError(''); setGenSuccess('');
    try {
      await axiosInstance.post('/vocabularies/generate-batch', { words });
      setGenSuccess(`${words.length} words generated!`);
      setGenBatch('');
      onGenerated();
    } catch (err) { setGenError(err.response?.data?.error || 'Generation failed'); }
    finally { setGenLoading(false); }
  };

  const gradientBtn = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' },
    transition: 'all 0.2s',
  };

  return (
    <Stack spacing={4}>
      {genError && <Alert severity="error" onClose={() => setGenError('')} sx={{ borderRadius: 3 }}>{genError}</Alert>}
      {genSuccess && <Alert severity="success" onClose={() => setGenSuccess('')} sx={{ borderRadius: 3 }}>{genSuccess}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 16 }} /></Box>
            <Typography variant="h6" fontWeight={700}>Generate Single Word</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Type any English word and AI will generate full details
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <TextField
              fullWidth
              placeholder="e.g. ubiquitous"
              value={genWord}
              onChange={(e) => setGenWord(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateSingle(); }}
              slotProps={{ input: { sx: { borderRadius: 3 } } }}
            />
            <Button variant="contained" disabled={genLoading || !genWord.trim()} onClick={handleGenerateSingle} sx={{ ...gradientBtn, minWidth: 130, px: 3, py: 1.5 }}>
              {genLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Generate'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AutoAwesomeIcon sx={{ color: '#8b5cf6', fontSize: 16 }} /></Box>
            <Typography variant="h6" fontWeight={700}>Batch Generate</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Paste multiple words separated by commas or newlines
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="hello, world, computer, technology, internet"
            value={genBatch}
            onChange={(e) => setGenBatch(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: 3 } } }}
          />
          <Button
            variant="contained"
            disabled={genLoading || !genBatch.trim()}
            onClick={handleGenerateBatch}
            sx={{
              ...gradientBtn, mt: 2.5, px: 3, py: 1.5,
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #9333ea)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' },
            }}
          >
            {genLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Generate All'}
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}

export function VocabularyView() {
  const [tab, setTab] = useState(0);
  const [vocabularies, setVocabularies] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [vocabRes, reviewRes, statsRes] = await Promise.all([
        axiosInstance.get('/vocabularies/my?limit=100'),
        axiosInstance.get('/vocabularies/review/today'),
        axiosInstance.get('/vocabularies/stats'),
      ]);
      setVocabularies(vocabRes.data.vocabularies);
      setReviewItems(reviewRes.data.items || []);
      setStats(statsRes.data.stats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReview = async (quality) => {
    const item = reviewItems[reviewIndex];
    if (!item) return;
    try {
      await axiosInstance.post('/vocabularies/review', { vocabularyId: item.vocabularyId._id, quality });
      if (reviewIndex + 1 < reviewItems.length) {
        setReviewIndex(reviewIndex + 1);
      } else {
        setReviewMode(false);
        setReviewIndex(0);
      }
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredVocab = searchQuery
    ? vocabularies.filter(v => v.word?.toLowerCase().includes(searchQuery.toLowerCase()) || v.meaningVi?.toLowerCase().includes(searchQuery.toLowerCase()))
    : vocabularies;

  const gradientBtn = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' },
    transition: 'all 0.2s',
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Vocabulary</Typography>
          <Typography variant="body2" color="text.secondary">Build your word bank with AI assistance</Typography>
        </Box>
        {reviewItems.length > 0 && (
          <Button
            variant="contained"
            startIcon={<EmojiObjectsIcon />}
            onClick={() => { setTab(2); setReviewMode(true); }}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg, #f59e0b, #f97316)', '&:hover': { background: 'linear-gradient(135deg, #d97706, #ea580c)' }, px: 3, py: 1.25 }}
          >
            Review {reviewItems.length} <Box component="span" sx={{ ml: 0.5 }}>Words</Box>
          </Button>
        )}
      </Stack>

      {stats && (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <Chip label={`${stats.total} words`} color="primary" size="small" sx={{ borderRadius: 2, fontWeight: 600 }} />
          <Chip label={`${stats.mastered} mastered`} color="success" size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, borderColor: '#34d399' }} />
          <Chip label={`${stats.dueToday} due today`} size="small" variant="outlined" color="warning" sx={{ borderRadius: 2, fontWeight: 600 }} />
        </Stack>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': { height: 3, borderRadius: 2 },
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14.5, minWidth: 100 },
        }}
      >
        <Tab label="My Words" />
        <Tab label="Add New" icon={<AddIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        {reviewItems.length > 0 && <Tab label={`Review (${reviewItems.length})`} />}
      </Tabs>

      {/* Tab 0: My Words */}
      {tab === 0 && (
        <Stack spacing={3}>
          <TextField
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              sx: { borderRadius: 3 },
            }}
            size="small"
            sx={{ maxWidth: 400 }}
          />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={36} /></Box>
          ) : filteredVocab.length === 0 ? (
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" fontWeight={600}>No vocabulary yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Switch to <Box component="span" fontWeight={700}>Add New</Box> tab to generate words with AI
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={1.5}>
              {filteredVocab.map((v) => (
                <Grid item xs={6} sm={4} md={3} key={v._id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
                        borderColor: 'primary.light',
                      },
                    }}
                    onClick={() => setSelectedWord(v)}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{v.word}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{v.meaningVi}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <FlashcardDialog word={selectedWord} open={!!selectedWord} onClose={() => setSelectedWord(null)} />
        </Stack>
      )}

      {/* Tab 1: Add New */}
      {tab === 1 && (
        <AddNewTab onGenerated={fetchData} />
      )}

      {/* Tab 2: Review */}
      {tab === 2 && reviewItems.length > 0 && reviewItems[reviewIndex] && (() => {
        const r = reviewItems[reviewIndex].vocabularyId;
        return (
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: { xs: 3, md: 5.5 } }}>
                <Box textAlign="center">
                  <Chip label={`${reviewIndex + 1} / ${reviewItems.length}`} size="small" variant="outlined" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }} />
                  <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-1px' }}>{r.word}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>{r.ipa}</Typography>
                  <Box sx={{ mt: 4, bgcolor: '#f8fafc', borderRadius: 3, p: 3, mx: 'auto', maxWidth: 500, border: '1px solid', borderColor: '#e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">{r.meaningVi}</Typography>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 0.5 }}>{r.meaningEn}</Typography>
                    {r.examples?.[0] && (
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                        &ldquo;{r.examples[0].en}&rdquo;
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 5, mb: 2.5, fontWeight: 500 }}>
                    How well did you remember?
                  </Typography>
                  <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" color="error" onClick={() => handleReview(0)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3 }}>Forgot</Button>
                    <Button
                      variant="outlined" color="warning"
                      onClick={() => handleReview(2)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                      Hard
                    </Button>
                    <Button variant="contained" onClick={() => handleReview(3)} sx={{ ...gradientBtn, px: 4, py: 1.5 }}>Good</Button>
                    <Button
                      variant="contained"
                      onClick={() => handleReview(5)}
                      sx={{
                        borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 4, py: 1.5,
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        '&:hover': { background: 'linear-gradient(135deg, #059669, #10b981)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' },
                        transition: 'all 0.2s',
                      }}
                    >
                      Easy
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        );
      })()}
    </Box>
  );
}