'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'src/utils/axios';
import { clearTopicInput } from 'src/utils/api-helpers';
import { TopicInput } from 'src/components/topic-input/topic-input';
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
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import AddIcon from '@mui/icons-material/Add';
import { m as motion, AnimatePresence } from 'framer-motion';

function FlashcardDialog({ word, open, onClose }) {
  const { t } = useTranslation();
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
                  <Typography variant="caption" sx={{ display: 'block', mt: 3, opacity: 0.35 }}>{t('vocabulary.tapToReveal')}</Typography>
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
  const { t } = useTranslation();
  const [genWord, setGenWord] = useState('');
  const [genBatch, setGenBatch] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');

  const handleGenerateSingle = async () => {
    const word = genWord.trim();
    if (!word) return;
    setGenLoading(true); setGenError(''); setGenSuccess('');
    try {
      await axiosInstance.post('/vocabularies/generate', { word, topic: genTopic.trim() || undefined });
      setGenSuccess(t('vocabulary.generated', { word }));
      setGenWord('');
      clearTopicInput(setGenTopic);
      onGenerated();
    } catch (err) { setGenError(err.response?.data?.error || t('vocabulary.genFailed')); }
    finally { setGenLoading(false); }
  };

  const handleGenerateBatch = async () => {
    const raw = genBatch.trim();
    if (!raw) return;
    const words = raw.split(/[,;\n]+/).map(w => w.trim()).filter(Boolean);
    if (words.length === 0) return;
    setGenLoading(true); setGenError(''); setGenSuccess('');
    try {
      await axiosInstance.post('/vocabularies/generate-batch', { words, topic: genTopic.trim() || undefined });
      setGenSuccess(t('vocabulary.batchGenerated', { count: words.length }));
      setGenBatch('');
      clearTopicInput(setGenTopic);
      onGenerated();
    } catch (err) { setGenError(err.response?.data?.error || t('vocabulary.genFailed')); }
    finally { setGenLoading(false); }
  };

  const gradientBtn = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 800,
    color: 'white',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
    transition: 'all 0.2s',
  };

  return (
    <Stack spacing={3}>
      {genError && <Alert severity="error" onClose={() => setGenError('')} sx={{ borderRadius: 3 }}>{genError}</Alert>}
      {genSuccess && <Alert severity="success" onClose={() => setGenSuccess('')} sx={{ borderRadius: 3 }}>{genSuccess}</Alert>}

      <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)', p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
              <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>{t('vocabulary.generateTitle')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('vocabulary.genDesc')}</Typography>
            </Box>
          </Stack>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Word to generate</Typography>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  fullWidth
                  placeholder={t('vocabulary.wordPlaceholder')}
                  value={genWord}
                  onChange={(e) => setGenWord(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateSingle(); }}
                  slotProps={{ input: { sx: { borderRadius: 3 } } }}
                  autoFocus
                />
                <Button variant="contained" disabled={genLoading || !genWord.trim()} onClick={handleGenerateSingle} sx={{ ...gradientBtn, minWidth: 130, px: 3, py: 1.5 }}>
                  {genLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('vocabulary.generate')}
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{t('vocabulary.topicLabel')}</Typography>
              <TopicInput
                value={genTopic}
                onChange={setGenTopic}
                onEnter={handleGenerateSingle}
                label=""
                placeholder={t('vocabulary.topicPlaceholder')}
                suggestions={['business', 'technology', 'travel', 'food', 'sports', 'science', 'music', 'movies', 'health', 'academic', 'daily-life', 'nature']}
                size="medium"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AutoAwesomeIcon sx={{ color: '#8b5cf6', fontSize: 16 }} /></Box>
            <Typography variant="subtitle1" fontWeight={700}>{t('vocabulary.batchTitle')}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('vocabulary.batchDesc')}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder={t('vocabulary.batchPlaceholder')}
            value={genBatch}
            onChange={(e) => setGenBatch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerateBatch(); }}
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
            {genLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('vocabulary.generateAll')}
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}

export function VocabularyView() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [vocabularies, setVocabularies] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ forgot: 0, hard: 0, good: 0, easy: 0 });
  const [reviewComplete, setReviewComplete] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

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

  useEffect(() => {
    if (!reviewMode || reviewComplete || tab !== 2) return;
    const handler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      } else if (revealed) {
        if (e.key === '1') handleReview(0);
        else if (e.key === '2') handleReview(2);
        else if (e.key === '3') handleReview(3);
        else if (e.key === '4') handleReview(5);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reviewMode, reviewComplete, revealed, reviewIndex]);

  const resetReviewSession = () => {
    setReviewIndex(0);
    setRevealed(false);
    setSessionStats({ forgot: 0, hard: 0, good: 0, easy: 0 });
    setReviewComplete(false);
  };

  const exitReview = () => {
    setReviewMode(false);
    resetReviewSession();
    setShowExitDialog(false);
    setTab(0);
  };

  const handleReview = async (quality) => {
    const item = reviewItems[reviewIndex];
    if (!item) return;
    const keyMap = { 0: 'forgot', 2: 'hard', 3: 'good', 5: 'easy' };
    const key = keyMap[quality] || 'good';
    setSessionStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    try {
      await axiosInstance.post('/vocabularies/review', { vocabularyId: item.vocabularyId._id, quality });
      if (reviewIndex + 1 < reviewItems.length) {
        setReviewIndex(reviewIndex + 1);
        setRevealed(false);
      } else {
        setReviewComplete(true);
      }
      fetchData();
    } catch (err) { console.error(err); }
  };

  const speakWord = (word) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    }
  };

  const filteredVocab = searchQuery
    ? vocabularies.filter(v => v.word?.toLowerCase().includes(searchQuery.toLowerCase()) || v.meaningVi?.toLowerCase().includes(searchQuery.toLowerCase()))
    : vocabularies;

  const gradientBtn = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 800,
    color: 'white',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
    transition: 'all 0.2s',
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{t('vocabulary.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('vocabulary.subtitle')}</Typography>
        </Box>
        {reviewItems.length > 0 && (
          <Button
            variant="contained"
            startIcon={<EmojiObjectsIcon />}
            onClick={() => { setTab(2); resetReviewSession(); setReviewMode(true); }}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg, #f59e0b, #f97316)', '&:hover': { background: 'linear-gradient(135deg, #d97706, #ea580c)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }, transition: 'all 0.2s', px: 3, py: 1.25 }}
          >
            Review {reviewItems.length} {t('vocabulary.review', { count: reviewItems.length })}
          </Button>
        )}
      </Stack>

      {stats && (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={4} sm={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', bgcolor: '#eef2ff' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={900} color="#4f46e5">{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.totalWords')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4} sm={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', bgcolor: '#ecfdf5' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={900} color="#059669">{stats.mastered}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.mastered')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4} sm={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', bgcolor: '#fffbeb' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={900} color="#d97706">{stats.dueToday}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.dueToday')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); if (v !== 2) { setReviewMode(false); setReviewComplete(false); } }}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': { height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14.5, minWidth: 100, borderRadius: 2.5 },
          '& .Mui-selected': { color: 'primary.main' },
        }}
      >
        <Tab label={t('vocabulary.myWords')} />
        <Tab label={t('vocabulary.addNew')} icon={<AddIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        {reviewItems.length > 0 && <Tab label={t('vocabulary.reviewTab', { count: reviewItems.length })} />}
      </Tabs>

      {/* Tab 0: My Words */}
      {tab === 0 && (
        <Stack spacing={3}>
          <TextField
            placeholder={t('vocabulary.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              sx: { borderRadius: 3, bgcolor: 'white' },
            }}
            size="small"
            sx={{ maxWidth: 400 }}
          />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={36} /></Box>
          ) : filteredVocab.length === 0 ? (
            <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', bgcolor: '#fafbff' }}>
              <CardContent sx={{ py: 8, px: 4, textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                  <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 30 }} />
                </Box>
                <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>{t('vocabulary.noWords')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('vocabulary.noWordsDesc')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setTab(1)}
                  sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)' }, px: 3 }}
                >
                  Add {t('vocabulary.addFirstWord')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {filteredVocab.map((v) => {
                const status = v.status || 'NEW';
                const statusColor = {
                  NEW: '#94a3b8',
                  LEARNING: '#f59e0b',
                  REVIEW: '#6366f1',
                  MASTERED: '#10b981',
                }[status] || '#94a3b8';
                return (
                  <Grid item xs={6} sm={4} md={3} key={v._id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        cursor: 'pointer',
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
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0, left: 0, right: 0, height: 3,
                          background: `linear-gradient(90deg, ${statusColor}, ${statusColor}99)`,
                        },
                      }}
                      onClick={() => setSelectedWord(v)}
                    >
                      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, minWidth: 0, overflow: 'hidden' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.25 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                            }}
                          >
                            {v.word}
                          </Typography>
                          {status === 'MASTERED' && (
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0, ml: 0.5 }} />
                          )}
                        </Stack>
                        {v.ipa && (
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.ipa}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.4,
                            minHeight: '2.8em',
                            wordBreak: 'break-word',
                          }}
                        >
                          {v.meaningVi}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
          <FlashcardDialog word={selectedWord} open={!!selectedWord} onClose={() => setSelectedWord(null)} />
        </Stack>
      )}

      {/* Tab 1: Add New */}
      {tab === 1 && (
        <AddNewTab onGenerated={fetchData} />
      )}

      {/* Tab 2: Review — completion screen (renders even after reviewItems becomes empty) */}
      {tab === 2 && reviewComplete && (() => {
        const totalReviewed = sessionStats.forgot + sessionStats.hard + sessionStats.good + sessionStats.easy;
        const correctCount = sessionStats.good + sessionStats.easy;
        const accuracy = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
        return (
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', p: 5, textAlign: 'center', color: 'white' }}>
              <Box sx={{ fontSize: 56, mb: 1 }}>🎉</Box>
              <Typography variant="h4" fontWeight={900}>{t('vocabulary.reviewComplete')}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 1 }}>
                {t('vocabulary.reviewed', { count: totalReviewed })}
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h2" fontWeight={900} sx={{ color: accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#ef4444' }}>
                  {accuracy}%
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('vocabulary.accuracy')}</Typography>
              </Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, bgcolor: '#fef2f2' }}>
                    <Typography variant="h4" fontWeight={900} color="#ef4444">{sessionStats.forgot}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.forgot')}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, bgcolor: '#fffbeb' }}>
                    <Typography variant="h4" fontWeight={900} color="#f59e0b">{sessionStats.hard}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.hard')}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, bgcolor: '#eef2ff' }}>
                    <Typography variant="h4" fontWeight={900} color="#6366f1">{sessionStats.good}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.good')}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, bgcolor: '#ecfdf5' }}>
                    <Typography variant="h4" fontWeight={900} color="#10b981">{sessionStats.easy}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('vocabulary.easy')}</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" onClick={exitReview} sx={{ ...gradientBtn, px: 4, py: 1.5 }}>
                  {t('vocabulary.backToWords')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );
      })()}

      {/* Tab 2: Review — active session */}
      {tab === 2 && !reviewComplete && reviewMode && reviewItems.length > 0 && (() => {
        const total = reviewItems.length;
        const current = reviewIndex + 1;
        const progress = (current / total) * 100;

        const item = reviewItems[reviewIndex];
        if (!item) return null;
        const r = item.vocabularyId;
        const status = item.status || 'NEW';
        const statusConfig = {
          NEW: { color: '#94a3b8', bg: '#f1f5f9' },
          LEARNING: { color: '#f59e0b', bg: '#fffbeb' },
          REVIEW: { color: '#6366f1', bg: '#eef2ff' },
          MASTERED: { color: '#10b981', bg: '#ecfdf5' },
        };
        const sc = statusConfig[status] || statusConfig.NEW;

        const qualityButtons = [
          { key: 0, label: t('vocabulary.forgot'), hint: t('vocabulary.hint.forgot'), color: '#ef4444', bg: '#fef2f2', variant: 'outlined' },
          { key: 2, label: t('vocabulary.hard'), hint: t('vocabulary.hint.hard'), color: '#f59e0b', bg: '#fffbeb', variant: 'outlined' },
          { key: 3, label: t('vocabulary.good'), hint: t('vocabulary.hint.good'), color: '#6366f1', bg: '#eef2ff', variant: 'contained' },
          { key: 5, label: t('vocabulary.easy'), hint: t('vocabulary.hint.easy'), color: '#10b981', bg: '#ecfdf5', variant: 'contained' },
        ];

        return (
          <Stack spacing={3}>
            {/* Progress + exit */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {current} / {total}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {Math.round(progress)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowExitDialog(true)}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, minWidth: 'auto', px: 2, py: 1, borderColor: '#e2e8f0', color: '#64748b' }}
              >
                {t('vocabulary.exit')}
              </Button>
            </Stack>

            {/* Review card */}
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)', p: { xs: 3, md: 5 }, textAlign: 'center', position: 'relative' }}>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                  <Chip label={status} size="small" sx={{ borderRadius: 2, fontWeight: 700, bgcolor: sc.bg, color: sc.color, textTransform: 'uppercase', fontSize: 11 }} />
                </Stack>

                <IconButton
                  onClick={() => speakWord(r.word)}
                  sx={{
                    position: 'absolute', top: 16, right: 16,
                    bgcolor: 'rgba(99,102,241,0.08)',
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.15)' },
                  }}
                >
                  <VolumeUpIcon sx={{ color: '#6366f1' }} />
                </IconButton>

                <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-1px' }}>{r.word}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>{r.ipa}</Typography>
                <Chip label={r.partOfSpeech || 'noun'} size="small" variant="outlined" sx={{ mt: 2, opacity: 0.6 }} />

                <AnimatePresence mode="wait">
                  {revealed ? (
                    <motion.div
                      key="answer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mt: 4, bgcolor: 'white', borderRadius: 3, p: 3, mx: 'auto', maxWidth: 500, border: '1px solid', borderColor: '#e2e8f0', textAlign: 'left' }}>
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">{r.meaningVi}</Typography>
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 0.5 }}>{r.meaningEn}</Typography>
                        {r.examples?.[0] && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                            <Stack direction="row" alignItems="flex-start" spacing={1}>
                              <IconButton size="small" onClick={() => speakWord(r.examples[0].en)} sx={{ mt: -0.5, p: 0.5 }}>
                                <VolumeUpIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                              </IconButton>
                              <Box>
                                <Typography variant="body2" fontStyle="italic" color="text.secondary">
                                  &ldquo;{r.examples[0].en}&rdquo;
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>{r.examples[0].vi}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                        )}
                        {r.synonyms?.length > 0 && (
                          <Stack direction="row" spacing={0.5} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }} useFlexGap>
                            {r.synonyms.slice(0, 4).map((s) => (
                              <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontSize: 11 }} />
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box sx={{ mt: 4, mx: 'auto', maxWidth: 400 }}>
                        <Box sx={{ bgcolor: 'rgba(99,102,241,0.06)', borderRadius: 3, p: 3, border: '1px dashed', borderColor: 'primary.light', cursor: 'pointer' }} onClick={() => setRevealed(true)}>
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            {t('vocabulary.clickToReveal')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {t('vocabulary.orPressKey')}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>

              {revealed && (
                <CardContent sx={{ p: 3, bgcolor: 'white' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textAlign="center" sx={{ display: 'block', mb: 2 }}>
                    {t('vocabulary.howWell')}
                  </Typography>
                  <Grid container spacing={1.5}>
                    {qualityButtons.map((btn) => (
                      <Grid item xs={6} sm={3} key={btn.key}>
                        <Button
                          fullWidth
                          variant={btn.variant}
                          onClick={() => handleReview(btn.key)}
                          sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.5,
                            flexDirection: 'column',
                            gap: 0.25,
                            ...(btn.variant === 'outlined'
                              ? { borderColor: btn.color, color: btn.color, '&:hover': { borderColor: btn.color, bgcolor: btn.bg } }
                              : btn.key === 3
                                ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)' } }
                                : { background: 'linear-gradient(135deg, #10b981, #34d399)', '&:hover': { background: 'linear-gradient(135deg, #059669, #10b981)' } }
                            ),
                          }}
                        >
                          <Box>{btn.label}</Box>
                          <Box component="span" sx={{ fontSize: 11, opacity: 0.7, fontWeight: 500 }}>{btn.hint}</Box>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              )}
            </Card>
          </Stack>
        );
      })()}

      {/* Exit confirmation dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ fontSize: 40, mb: 1 }}>⚠️</Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{t('vocabulary.exitDialog')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('vocabulary.exitDialogDesc', { current: reviewIndex + 1, total: reviewItems.length })}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={() => setShowExitDialog(false)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 4 }}>
              {t('vocabulary.continue')}
            </Button>
            <Button variant="contained" color="error" onClick={exitReview} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 4 }}>
              {t('vocabulary.exit')}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}