'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import BookIcon from '@mui/icons-material/MenuBook';
import MicIcon from '@mui/icons-material/Mic';
import HearingIcon from '@mui/icons-material/Hearing';
import BoltIcon from '@mui/icons-material/Bolt';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const statCards = [
  { key: 'totalXp', labelKey: 'progress.totalXp', Icon: StarIcon, color: '#f59e0b', gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
  { key: 'streak', labelKey: 'progress.currentStreak', Icon: WhatshotIcon, valueFn: (s) => `${s?.streak || 0} days`, color: '#ef4444', gradient: 'linear-gradient(135deg, #fef2f2, #fee2e2)' },
  { key: 'streakMax', labelKey: 'progress.bestStreak', Icon: BoltIcon, valueFn: (s) => `${s?.streakMax || 0} days`, color: '#10b981', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
  { key: 'totalMinutes', labelKey: 'progress.totalMinutes', Icon: TimerIcon, valueFn: (s) => Math.round(s?.totalMinutes || 0), color: '#6366f1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
  { key: 'totalVocab', labelKey: 'progress.wordsLearned', Icon: BookIcon, color: '#ec4899', gradient: 'linear-gradient(135deg, #fdf2f8, #fce7f3)' },
  { key: 'masteredVocab', labelKey: 'progress.mastered', Icon: CheckCircleIcon, color: '#10b981', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
  { key: 'pronunciationPractices', labelKey: 'progress.pronunciation', Icon: MicIcon, color: '#6366f1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
  { key: 'shadowingPractices', labelKey: 'progress.shadowing', Icon: HearingIcon, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' },
];

export function ProgressView() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c, w] = await Promise.all([
          axiosInstance.get('/progress/stats'),
          axiosInstance.get('/progress/calendar'),
          axiosInstance.get('/progress/weekly'),
        ]);
        setStats(s.data.stats);
        setCalendar(c.data.calendar || []);
        setWeekly(w.data.summary);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  const levelPercent = stats?.totalXp ? Math.min(100, ((stats.totalXp % 500) / 500) * 100) : 0;
  const level = stats?.totalXp ? Math.floor(stats.totalXp / 500) + 1 : 1;

  return (
    <Box>
    <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>{t('progress.title')}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
      {t('progress.subtitle')}
    </Typography>

      {/* Level card */}
      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={4} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                }}
              >
                <TrendingUpIcon sx={{ color: 'white', fontSize: 36 }} />
              </Box>
              <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 600 }}>{t('progress.level', { n: level })}</Typography>
            <Typography variant="h4" fontWeight={900}>{t('progress.xp', { xp: stats?.totalXp || 0 })}</Typography>
              </Box>
            </Stack>
            <Box sx={{ flex: 1, maxWidth: 300, width: '100%' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">{t('progress.nextLevel')}</Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main">{levelPercent.toFixed(0)}%</Typography>
              </Stack>
              <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                    width: `${levelPercent}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('progress.xpToLevel', { xp: (500 - (stats?.totalXp || 0) % 500).toFixed(0), level: level + 1 })}
            </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
    {statCards.map(({ key, labelKey, Icon, color, gradient, valueFn }) => (
      <Grid item xs={6} sm={4} md={3} key={key}>
            <Card
              sx={{
                borderRadius: 4,
                background: gradient,
                border: '1px solid',
                borderColor: color + '20',
                boxShadow: '0 2px 12px rgba(0,0,0,0.035)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(0,0,0,0.05)' },
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      bgcolor: color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ color, fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                      {valueFn ? valueFn(stats) : (stats?.[key] ?? 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{t(labelKey)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Calendar heatmap */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="h6" fontWeight={700}>{t('progress.activityCalendar')}</Typography>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mx: 'auto', maxWidth: '100%' }}>
            {calendar.map((day, i) => {
              let bgcolor;
              if (day.count === 0) bgcolor = '#f1f5f9';
              else if (day.count <= 2) bgcolor = '#c7d2fe';
              else if (day.count <= 5) bgcolor = '#a5b4fc';
              else if (day.count <= 10) bgcolor = '#818cf8';
              else bgcolor = '#6366f1';

              return (
                <Box
                  key={day.date}
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 0.5,
                    bgcolor,
                    cursor: 'default',
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.3)' },
                  }}
                  title={t('progress.activityTooltip', { date: day.date, sessions: day.count, xp: day.xp })}
                />
              );
            })}
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2.5 }} justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary" fontWeight={500}>{t('progress.less')}</Typography>
            {['#f1f5f9', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'].map(c => (
              <Box key={c} sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: c }} />
            ))}
            <Typography variant="caption" color="text.secondary" fontWeight={500}>{t('progress.more')}</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Weekly summary */}
      {weekly && (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>{t('progress.thisWeek')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#eef2ff', border: '1px solid #c7d2fe' }}>
                  <Typography variant="caption" color="#4f46e5" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>{t('progress.sessions')}</Typography>
                  <Typography variant="h4" fontWeight={900} color="#4f46e5">{weekly.totalSessions}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <Typography variant="caption" color="#d97706" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>{t('progress.xpEarned')}</Typography>
                  <Typography variant="h4" fontWeight={900} color="#d97706">{weekly.totalXP}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ecfdf5', border: '1px solid #bbf7d0' }}>
                  <Typography variant="caption" color="#059669" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>{t('progress.minutes')}</Typography>
                  <Typography variant="h4" fontWeight={900} color="#059669">{Math.round(weekly.totalMinutes)}</Typography>
                </Box>
              </Grid>
            </Grid>
            {weekly.byType && Object.keys(weekly.byType).length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>{t('progress.byType')}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.entries(weekly.byType).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type}: ${count}`}
                      size="small"
                      sx={{ borderRadius: 2, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}