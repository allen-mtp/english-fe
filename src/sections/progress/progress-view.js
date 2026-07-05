'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import BookIcon from '@mui/icons-material/MenuBook';
import MicIcon from '@mui/icons-material/Mic';
import HearingIcon from '@mui/icons-material/Hearing';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const statCards = [
  { key: 'totalXp', label: 'Total XP', Icon: StarIcon, color: '#f59e0b', gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
  { key: 'streak', label: 'Current Streak', Icon: WhatshotIcon, valueFn: (s) => `${s?.streak || 0} days`, color: '#ef4444', gradient: 'linear-gradient(135deg, #fef2f2, #fee2e2)' },
  { key: 'streakMax', label: 'Best Streak', Icon: BoltIcon, valueFn: (s) => `${s?.streakMax || 0} days`, color: '#10b981', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
  { key: 'totalMinutes', label: 'Total Minutes', Icon: TimerIcon, valueFn: (s) => Math.round(s?.totalMinutes || 0), color: '#6366f1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
  { key: 'totalVocab', label: 'Words Learned', Icon: BookIcon, color: '#ec4899', gradient: 'linear-gradient(135deg, #fdf2f8, #fce7f3)' },
  { key: 'masteredVocab', label: 'Mastered', Icon: CheckCircleIcon, color: '#10b981', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
  { key: 'pronunciationPractices', label: 'Pronunciation', Icon: MicIcon, color: '#6366f1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
  { key: 'shadowingPractices', label: 'Shadowing', Icon: HearingIcon, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' },
];

export function ProgressView() {
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
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={36} />
      </Container>
    );
  }

  const levelPercent = stats?.totalXp ? Math.min(100, ((stats.totalXp % 500) / 500) * 100) : 0;
  const level = stats?.totalXp ? Math.floor(stats.totalXp / 500) + 1 : 1;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Your Progress</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Track your learning journey across all practice areas
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
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                }}
              >
                <TrendingUpIcon sx={{ color: 'white', fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 600 }}>Level {level}</Typography>
                <Typography variant="h4" fontWeight={900}>{stats?.totalXp || 0} XP</Typography>
              </Box>
            </Stack>
            <Box sx={{ flex: 1, maxWidth: 300, width: '100%' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Next Level</Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main">{levelPercent.toFixed(0)}%</Typography>
              </Stack>
              <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    width: `${levelPercent}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {(500 - (stats?.totalXp || 0) % 500).toFixed(0)} XP to Level {level + 1}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map(({ key, label, Icon, color, gradient, valueFn }) => (
          <Grid item xs={6} sm={4} md={3} key={label}>
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
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
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
            <Typography variant="h6" fontWeight={700}>Activity Calendar</Typography>
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
                  title={`${day.date}: ${day.count} sessions, ${day.xp} XP`}
                />
              );
            })}
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2.5 }} justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary" fontWeight={500}>Less</Typography>
            {['#f1f5f9', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'].map(c => (
              <Box key={c} sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: c }} />
            ))}
            <Typography variant="caption" color="text.secondary" fontWeight={500}>More</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Weekly summary */}
      {weekly && (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>This Week</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
                  Sessions
                </Typography>
                <Typography variant="h4" fontWeight={800}>{weekly.totalSessions}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
                  XP Earned
                </Typography>
                <Typography variant="h4" fontWeight={800} color="primary.main">{weekly.totalXP}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
                  Minutes
                </Typography>
                <Typography variant="h4" fontWeight={800}>{Math.round(weekly.totalMinutes)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
                  By Type
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {Object.entries(weekly.byType || {}).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type}: ${count}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 500, fontSize: 12 }}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}