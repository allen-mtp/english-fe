'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MapIcon from '@mui/icons-material/Map';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export function RoadmapView() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [genLevel, setGenLevel] = useState('beginner');
  const [genError, setGenError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [completeLoading, setCompleteLoading] = useState(null);
  const [completeError, setCompleteError] = useState('');
  const [completeSuccess, setCompleteSuccess] = useState('');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/roadmap/my');
      setRoadmap(res.data.roadmap);
      setSelectedDay(res.data.roadmap.currentDay);
    } catch (err) { setRoadmap(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoadmap(); }, []);

  const generate = async () => {
    setGenLoading(true); setGenError('');
    try {
      const res = await axiosInstance.post('/roadmap/generate', { level: genLevel, goal: 'communication', dailyMinutes: 30 }, { timeout: 120000 });
      setRoadmap(res.data.roadmap);
      setSelectedDay(res.data.roadmap.currentDay);
    } catch (err) { setGenError(err.response?.data?.error || 'Generation failed'); }
    finally { setGenLoading(false); }
  };

  const completeDay = async (day) => {
    setCompleteLoading(day);
    setCompleteError('');
    setCompleteSuccess('');
    try {
      const res = await axiosInstance.post(`/roadmap/day/${day}/complete`);
      setRoadmap(res.data.roadmap);
      setSelectedDay(res.data.roadmap.currentDay);
      setCompleteSuccess(`Day ${day} completed! +${res.data.xpEarned || 50} XP`);
      setTimeout(() => setCompleteSuccess(''), 3000);
    } catch (err) {
      setCompleteError(err.response?.data?.error || 'Failed to complete day');
    }
    finally { setCompleteLoading(null); }
  };

  const reset = async () => {
    await axiosInstance.patch('/roadmap/reset');
    setRoadmap(null);
    setSelectedDay(0);
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

  /* No roadmap — generation screen */
  if (!roadmap) {
    return (
      <Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h4" fontWeight={800}>Learning Roadmap</Typography>
          <Typography variant="body2" color="text.secondary">AI creates a personalized 7-day learning plan</Typography>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 28px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', mt: 2 }}>
          <CardContent sx={{ p: { xs: 4, md: 5.5 }, textAlign: 'center' }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <MapIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Start Your Journey</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 420, mx: 'auto' }}>
              Create a personalized roadmap with daily vocabulary, pronunciation, and conversation practices
            </Typography>
            {genError && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, maxWidth: 400, mx: 'auto' }}>{genError}</Alert>}
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              <Select value={genLevel} onChange={e => setGenLevel(e.target.value)} size="small" sx={{ borderRadius: 2.5, '& .MuiSelect-select': { fontWeight: 600 } }}>
                {['beginner', 'intermediate', 'advanced'].map(l => <MenuItem key={l} value={l}><Box component="span" sx={{ textTransform: 'capitalize' }}>{l}</Box></MenuItem>)}
              </Select>
              <Button
                variant="contained"
                size="large"
                startIcon={genLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
                onClick={generate}
                disabled={genLoading}
                sx={{ ...gradientBtn, px: 4, py: 1.75, fontSize: '0.95rem' }}
              >
                {genLoading ? 'Generating...' : 'Generate Roadmap'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const progressPercent = Math.round((roadmap.currentDay / roadmap.totalDays) * 100);
  const currentLessons = roadmap.lessons?.filter(l => l.day === roadmap.currentDay || l.day === roadmap.currentDay + 1 || l.day < roadmap.currentDay) || [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Learning Roadmap</Typography>
          <Typography variant="body2" color="text.secondary">7-day personalized plan — {roadmap.level}</Typography>
        </Box>
        <Button variant="outlined" color="error" size="small" onClick={reset} sx={{ borderRadius: 2.5, textTransform: 'none', borderColor: '#fca5a5', color: '#dc2626', '&:hover': { borderColor: '#f87171', bgcolor: 'rgba(239,68,68,0.04)' } }}>
          Reset
        </Button>
      </Stack>

      {completeError && <Alert severity="error" sx={{ mt: 2, mb: 2, borderRadius: 3 }} onClose={() => setCompleteError('')}>{completeError}</Alert>}
      {completeSuccess && <Alert severity="success" sx={{ mt: 2, mb: 2, borderRadius: 3 }} onClose={() => setCompleteSuccess('')}>{completeSuccess}</Alert>}

      {/* Progress Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', mb: 3, mt: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">Your Progress</Typography>
            <Typography variant="body2" fontWeight={700} color="primary.main">{progressPercent}%</Typography>
          </Stack>
          <Box sx={{ height: 10, borderRadius: 5, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', width: `${progressPercent}%`, transition: 'width 0.6s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Chip label={`Day ${roadmap.currentDay} of ${roadmap.totalDays}`} size="small" sx={{ height: 22, fontWeight: 600, bgcolor: '#eef2ff', color: '#6366f1', borderRadius: 1.5, fontSize: 11.5 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500} textTransform="capitalize">{roadmap.level} · {roadmap.goal || 'communication'}</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Highlight cards: current, next, completed */}
      {currentLessons.map((lesson) => {
        const isCurrent = lesson.day === roadmap.currentDay;
        const isCompleted = lesson.day < roadmap.currentDay;
        const isNext = lesson.day === roadmap.currentDay + 1;

        return (
          <Card
            key={lesson.day}
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 24px rgba(0,0,0,0.045)',
              border: '1px solid',
              borderColor: 'divider',
              mb: 2.5,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top accent bar */}
            <Box sx={{ height: 4, background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 4 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Chip
                    size="small"
                    label={`Day ${lesson.day}`}
                    sx={{
                      fontWeight: 700, borderRadius: 2, height: 24,
                      bgcolor: isCompleted ? '#ecfdf5' : '#eef2ff',
                      color: isCompleted ? '#059669' : '#6366f1',
                    }}
                  />
                  {isCompleted && <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />}
                  {isCurrent && <Chip label="Current" size="small" sx={{ height: 24, fontWeight: 700, borderRadius: 2, bgcolor: '#fef3c7', color: '#d97706' }} />}
                </Stack>

                <Typography variant="h5" fontWeight={800} sx={{ mt: 1.5, mb: 0.5 }}>{lesson.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {lesson.vocabularies?.length || 0} vocab words · Pronunciation practice · Shadowing
                </Typography>
                {lesson.pronunciationFocus && (
                  <Chip label={`Focus: ${lesson.pronunciationFocus}`} size="small" variant="outlined" sx={{ mt: 1.5, borderRadius: 1.5, fontWeight: 500, height: 24 }} />
                )}

                {/* Action button */}
                {isCurrent && (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={completeLoading === lesson.day ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <PlayCircleIcon />}
                    onClick={() => completeDay(lesson.day)}
                    disabled={completeLoading === lesson.day}
                    sx={{ ...gradientBtn, mt: 3, py: 1.75 }}
                  >
                    Complete Day {lesson.day}
                  </Button>
                )}

                {isNext && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => completeDay(lesson.day)}
                    disabled={completeLoading === lesson.day}
                    sx={{ mt: 3, borderRadius: 3, textTransform: 'none', fontWeight: 700, py: 1.75, color: '#6366f1', borderColor: '#6366f1', '&:hover': { borderColor: '#4f46e5' } }}
                  >
                    Complete Day {lesson.day}
                  </Button>
                )}

                {isCompleted && lesson.tips && (
                  <Box sx={{ mt: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <EmojiEventsIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={700} color="text.secondary">Tips</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{lesson.tips}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* All lessons list */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>All Lessons</Typography>
      <Stack spacing={1.5}>
        {roadmap.lessons?.map((lesson) => {
          const isCompleted = lesson.day < roadmap.currentDay;
          const isCurrent = lesson.day === roadmap.currentDay;

          return (
            <Card
              key={lesson.day}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                opacity: isCompleted ? 0.65 : 1,
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Day number badge */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCompleted ? '#ecfdf5' : isCurrent ? '#eef2ff' : '#f8fafc',
                    border: '2px solid',
                    borderColor: isCompleted ? '#10b981' : isCurrent ? '#6366f1' : '#e2e8f0',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  ) : (
                    <Typography variant="subtitle1" fontWeight={800} color={isCurrent ? '#6366f1' : '#94a3b8'}>
                      {lesson.day}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} fontSize={15}>{lesson.title}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {lesson.vocabularies?.length || 0} vocab words · Pronunciation · Shadowing
                  </Typography>
                </Box>
                {isCompleted && <Chip label="Done" size="small" variant="outlined" color="success" sx={{ borderRadius: 1.5, height: 24, fontWeight: 600 }} />}
                {isCurrent && <Chip label="Now" size="small" sx={{ borderRadius: 1.5, height: 24, fontWeight: 700, bgcolor: '#eef2ff', color: '#6366f1' }} />}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}