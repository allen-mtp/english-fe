'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'src/utils/axios';
import { clearTopicInput } from 'src/utils/api-helpers';
import { TopicInput } from 'src/components/topic-input/topic-input';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MapIcon from '@mui/icons-material/Map';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import CelebrateIcon from '@mui/icons-material/Celebration';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_NEXT = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'C2' };
// Temporary UI copy while backend roadmap generation is set to 7 days.
const ROADMAP_DAYS = 7;

export function RoadmapView() {
  const { t } = useTranslation();
  const [roadmap, setRoadmap] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [genLevel, setGenLevel] = useState('A1');
  const [genTopic, setGenTopic] = useState('');
  const [genError, setGenError] = useState('');
  const [completeLoading, setCompleteLoading] = useState(null);
  const [completeError, setCompleteError] = useState('');
  const [completeSuccess, setCompleteSuccess] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  const gradientBtn = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 800,
    color: 'white',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' },
    transition: 'all 0.2s',
  };

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/roadmap/my');
      setRoadmap(res.data.roadmap);
      setStats(res.data.stats || null);
      setGenLevel(res.data.roadmap?.isCompleted ? LEVEL_NEXT[res.data.roadmap.level] || res.data.roadmap.level : res.data.roadmap?.level || 'A1');
    } catch (err) {
      setRoadmap(null);
      setStats(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoadmap(); }, []);

  const generate = async () => {
    setGenLoading(true); setGenError('');
    const topic = genTopic.trim() || undefined;
    try {
      const res = await axiosInstance.post('/roadmap/generate',
        { level: genLevel, goal: 'communication', dailyMinutes: 30, topic },
        { timeout: 240000 }
      );
      clearTopicInput(setGenTopic);
      setRoadmap(res.data.roadmap);
      setJustCompleted(false);
      await fetchRoadmap();
    } catch (err) {
      const msg = err.response?.data?.error || t('roadmap.genFailed');
      if (err.response?.data?.roadmap) {
        setRoadmap(err.response.data.roadmap);
      }
      setGenError(msg);
    } finally { setGenLoading(false); }
  };

  const completeDay = async (day) => {
    setCompleteLoading(day);
    setCompleteError('');
    setCompleteSuccess('');
    try {
      const res = await axiosInstance.post(`/roadmap/day/${day}/complete`);
      setRoadmap(res.data.roadmap);
      if (res.data.isJustCompleted) {
        setJustCompleted(true);
        setCompleteSuccess(t('roadmap.completed', { days: ROADMAP_DAYS, message: `You unlocked level ${res.data.nextLevel}!` }));
      } else {
        setCompleteSuccess(t('roadmap.dayComplete', { day, xp: res.data.xpEarned || 50 }));
        setTimeout(() => setCompleteSuccess(''), 3000);
      }
    } catch (err) {
      setCompleteError(err.response?.data?.error || t('roadmap.completeFailed'));
    } finally { setCompleteLoading(null); }
  };

  const reset = async () => {
    await axiosInstance.patch('/roadmap/reset');
    setRoadmap(null);
    setStats(null);
    setJustCompleted(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const isCompletedRoadmap = roadmap?.isCompleted === true;

  /* ---------- Completion celebration screen ---------- */
  if (justCompleted && roadmap) {
    const nextLvl = LEVEL_NEXT[roadmap.level] || roadmap.level;
    const isMaxLevel = roadmap.level === 'C2';
    return (
      <Box>
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid', borderColor: 'divider', overflow: 'hidden', mt: 2 }}>
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #f59e0b, #10b981, #6366f1)' }} />
          <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Box sx={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <CelebrateIcon sx={{ fontSize: 48, color: '#d97706' }} />
            </Box>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{t('roadmap.completionTitle')}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 520, mx: 'auto' }}>
              {t('roadmap.completionDesc', { days: roadmap.totalDays, level: roadmap.level, nextLevel: nextLvl })}
        </Typography>

            {!isMaxLevel && (
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
                <Chip label={roadmap.level} size="large" sx={{ fontWeight: 700, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 18, px: 2, py: 2.5, borderRadius: 3 }} />
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                <Chip label={nextLvl} size="large" icon={<LockIcon />} sx={{ fontWeight: 700, bgcolor: '#fef3c7', color: '#b45309', fontSize: 18, px: 2, py: 2.5, borderRadius: 3 }} />
              </Stack>
            )}

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
              {!isMaxLevel && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => { setJustCompleted(false); setGenLevel(nextLvl); }}
                  sx={{ ...gradientBtn, px: 4, py: 1.75 }}
                >
                  {t('roadmap.startNext', { level: nextLvl })}
                </Button>
              )}
              <Button
                variant="outlined"
                size="large"
                onClick={() => setJustCompleted(false)}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, py: 1.75, px: 4, color: '#64748b', borderColor: '#cbd5e1' }}
              >
                {t('roadmap.viewProgress')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  /* ---------- No roadmap — generation screen ---------- */
  if (!roadmap) {
    return (
      <Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h4" fontWeight={800}>{t('roadmap.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('roadmap.subtitle', { days: ROADMAP_DAYS })}</Typography>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 28px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider', mt: 2 }}>
          <CardContent sx={{ p: { xs: 4, md: 5.5 }, textAlign: 'center' }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <MapIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>{t('roadmap.startJourney')}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 460, mx: 'auto' }}>
              {t('roadmap.startDesc')}
            </Typography>
            {genError && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>{genError}</Alert>}
            <Box sx={{ maxWidth: 520, mx: 'auto', mb: 2.5, textAlign: 'left' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textAlign: 'center' }}>{t('roadmap.level')}</Typography>
              <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
                {LEVELS.map(lvl => (
                  <Chip key={lvl} label={lvl} color={genLevel === lvl ? 'primary' : 'default'} onClick={() => setGenLevel(lvl)} clickable sx={{ borderRadius: 2, fontWeight: 700 }} />
                ))}
              </Stack>
              <TopicInput
                value={genTopic}
                onChange={setGenTopic}
                onEnter={generate}
                label={t('roadmap.focusArea')}
                placeholder={t('roadmap.focusPlaceholder')}
                suggestions={['business English', 'travel English', 'academic English', 'daily conversation', 'IELTS prep', 'TOEFL prep', 'job interview', 'medical English', 'IT & technology', 'presentation skills']}
                size="small"
              />
            </Box>
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              <Button
                variant="contained"
                size="large"
                startIcon={genLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
                onClick={generate}
                disabled={genLoading}
                sx={{ ...gradientBtn, px: 4, py: 1.75, fontSize: '0.95rem' }}
              >
                {genLoading ? t('roadmap.generating') : t('roadmap.generate')}
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {t('roadmap.genNote')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  /* ---------- Active roadmap view ---------- */
  const progressPercent = Math.round((roadmap.currentDay / roadmap.totalDays) * 100);
  const daysRemaining = roadmap.totalDays - roadmap.currentDay;
  const isMaxLevel = roadmap.level === 'C2';
  const completedDays = roadmap.currentDay;
  const currentLearningDay = Math.min(completedDays + 1, roadmap.totalDays);

  // Visible lessons: completed (last 2), current, next; or show range when expanded
  const visibleLessons = showAllDays
    ? roadmap.lessons
    : roadmap.lessons?.filter(l => {
        const d = l.day;
        const cur = currentLearningDay;
        if (isCompletedRoadmap) return d > roadmap.totalDays - 4 || d === roadmap.totalDays;
        return d === cur || d === cur + 1 || (d >= cur - 1 && d < cur);
      }) || [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{t('roadmap.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
          {t('roadmap.activePlan', { level: roadmap.level })}
          {roadmap.version > 1 && ` · ${t('roadmap.roadmapNum', { n: roadmap.version })}`}
          </Typography>
        </Box>
        <Button variant="outlined" color="error" size="small" onClick={reset} sx={{ borderRadius: 2.5, textTransform: 'none', borderColor: '#fca5a5', color: '#dc2626', '&:hover': { borderColor: '#f87171', bgcolor: 'rgba(239,68,68,0.04)' } }}>
          {t('roadmap.reset')}
        </Button>
      </Stack>

      {completeError && <Alert severity="error" sx={{ mt: 2, mb: 2, borderRadius: 3 }} onClose={() => setCompleteError('')}>{completeError}</Alert>}
      {completeSuccess && !justCompleted && <Alert severity="success" sx={{ mt: 2, mb: 2, borderRadius: 3 }} onClose={() => setCompleteSuccess('')}>{completeSuccess}</Alert>}

      {/* Reminder banner: completed roadmap */}
      {isCompletedRoadmap && !justCompleted && (
        <Alert
          severity="success"
          icon={<EmojiEventsIcon />}
          sx={{ mt: 2, mb: 2, borderRadius: 3, bgcolor: '#ecfdf5', border: '1px solid #a7f3d0' }}
          action={
            !isMaxLevel && (
              <Button color="success" size="small" variant="contained" startIcon={<AutoAwesomeIcon />} onClick={() => { setGenLevel(LEVEL_NEXT[roadmap.level] || roadmap.level); reset().then(() => {}); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                {t('roadmap.startNext', { level: LEVEL_NEXT[roadmap.level] })}
              </Button>
            )
          }
        >
          <Typography variant="body2" fontWeight={700}>{t('roadmap.completed', { days: roadmap.totalDays, message: isMaxLevel ? 'You reached the max level (C2)!' : `Unlock the next level: ${LEVEL_NEXT[roadmap.level]}` })}</Typography>
        </Alert>
      )}

      {/* Reminder banner: in-progress */}
      {!isCompletedRoadmap && roadmap.currentDay >= 0 && (
        <Alert severity="info" sx={{ mt: 2, mb: 2, borderRadius: 3, bgcolor: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <Typography variant="body2" fontWeight={600}>
            {t('roadmap.dayReady', { day: currentLearningDay, remaining: daysRemaining })}
          </Typography>
        </Alert>
      )}

      {/* Progress Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', mb: 3, mt: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">{t('roadmap.yourProgress')}</Typography>
            <Typography variant="body2" fontWeight={700} color="primary.main">{progressPercent}%</Typography>
          </Stack>
          <Box sx={{ height: 10, borderRadius: 5, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', width: `${progressPercent}%`, transition: 'width 0.6s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Chip label={t('roadmap.dayOf', { current: currentLearningDay, total: roadmap.totalDays })} size="small" sx={{ height: 22, fontWeight: 600, bgcolor: '#eef2ff', color: '#6366f1', borderRadius: 1.5, fontSize: 11.5 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {roadmap.level} · {roadmap.goal || 'communication'}
              {stats?.completedRoadmaps > 0 && ` · ${stats.completedRoadmaps} roadmap${stats.completedRoadmaps > 1 ? 's' : ''} completed`}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Highlight cards: current, next, completed */}
      {visibleLessons.length > 0 && (
        <>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: 'text.secondary' }}>
              {isCompletedRoadmap ? t('roadmap.showRecent') : 'Continue Learning'}
          </Typography>
          {visibleLessons.map((lesson) => {
            const isCurrent = !isCompletedRoadmap && lesson.day === currentLearningDay;
            const isCompleted = lesson.day <= completedDays;
            const isNext = !isCompletedRoadmap && lesson.day === currentLearningDay + 1;
            const isLocked = !isCompletedRoadmap && lesson.day > currentLearningDay + 1;

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
                  opacity: isLocked ? 0.6 : 1,
                }}
              >
                <Box sx={{ height: 4, background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : isCompletedRoadmap ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />

                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <Chip
                        size="small"
                        label={t('roadmap.lessonDay', { n: lesson.day })}
                        sx={{
                          fontWeight: 700, borderRadius: 2, height: 24,
                          bgcolor: isCompleted ? '#ecfdf5' : '#eef2ff',
                          color: isCompleted ? '#059669' : '#6366f1',
                        }}
                      />
                      {isCompleted && !isCurrent && <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />}
                      {isCurrent && <Chip label={t('roadmap.current')} size="small" sx={{ height: 24, fontWeight: 700, borderRadius: 2, bgcolor: '#fef3c7', color: '#d97706' }} />}
                      {isLocked && <LockIcon sx={{ color: '#94a3b8', fontSize: 16 }} />}
                    </Stack>

                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1.5, mb: 0.5 }}>{lesson.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('roadmap.lessonItems', { count: lesson.vocabularies?.length || 0 })}
                </Typography>
                    {lesson.pronunciationFocus && (
                      <Chip label={t('roadmap.focus', { topic: lesson.pronunciationFocus })} size="small" variant="outlined" sx={{ mt: 1.5, borderRadius: 1.5, fontWeight: 500, height: 24 }} />
                    )}

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
                        {t('roadmap.completeDay', { n: lesson.day })}
                      </Button>
                    )}

                    {isNext && (
                      <Tooltip title={t('roadmap.lockedTooltip')}>
                        <span>
                          <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            disabled
                            startIcon={<LockIcon />}
                            sx={{ mt: 3, borderRadius: 3, textTransform: 'none', fontWeight: 700, py: 1.75 }}
                          >
                            {t('roadmap.locked', { n: currentLearningDay })}
                          </Button>
                        </span>
                      </Tooltip>
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
        </>
      )}

      {/* All lessons list */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>{t('roadmap.allLessons', { count: roadmap.totalDays })}</Typography>
        <Button size="small" onClick={() => setShowAllDays(s => !s)} sx={{ textTransform: 'none', fontWeight: 600, color: '#6366f1' }}>
          {showAllDays ? t('roadmap.showRecent') : t('roadmap.showAll', { count: roadmap.totalDays })}
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5 }}>
        {(showAllDays ? roadmap.lessons : roadmap.lessons?.slice(0, 12)).map((lesson) => {
          const isCompleted = lesson.day <= completedDays;
          const isCurrent = !isCompletedRoadmap && lesson.day === currentLearningDay;
          const isLocked = !isCompletedRoadmap && lesson.day > currentLearningDay;

          return (
            <Card
              key={lesson.day}
              sx={{
                borderRadius: 2.5,
                boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                opacity: isLocked ? 0.55 : 1,
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: isCompleted ? '#ecfdf5' : isCurrent ? '#eef2ff' : '#f8fafc',
                    border: '2px solid',
                    borderColor: isCompleted ? '#10b981' : isCurrent ? '#6366f1' : '#e2e8f0',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                  ) : isLocked ? (
                    <LockIcon sx={{ color: '#94a3b8', fontSize: 14 }} />
                  ) : (
                    <Typography variant="body2" fontWeight={800} color={isCurrent ? '#6366f1' : '#94a3b8'}>{lesson.day}</Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>{lesson.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('roadmap.lessonDay', { n: lesson.day })}</Typography>
                </Box>
                {isCurrent && <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {!showAllDays && roadmap.lessons?.length > 12 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button size="small" onClick={() => setShowAllDays(true)} sx={{ textTransform: 'none', fontWeight: 600, color: '#6366f1' }}>
          {t('roadmap.showAll', { count: roadmap.lessons.length })} →
          </Button>
        </Box>
      )}
    </Box>
  );
}
