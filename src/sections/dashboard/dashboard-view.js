'use client';

import { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import BookIcon from '@mui/icons-material/MenuBook';
import MicIcon from '@mui/icons-material/Mic';
import HearingIcon from '@mui/icons-material/Hearing';
import ChatIcon from '@mui/icons-material/Chat';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const quickActions = [
  { label: 'Vocabulary', desc: 'Build your word bank', icon: BookIcon, href: '/dashboard/vocabulary', color: '#6366f1', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
  { label: 'Speaking', desc: 'Pronunciation practice', icon: MicIcon, href: '/dashboard/speaking', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  { label: 'Shadowing', desc: 'Mimic native speech', icon: HearingIcon, href: '/dashboard/shadowing', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  { label: 'Chat', desc: 'AI conversations', icon: ChatIcon, href: '/dashboard/conversations', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
];

export function DashboardView() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, roadmapRes, weeklyRes] = await Promise.all([
          axiosInstance.get('/progress/stats'),
          axiosInstance.get('/roadmap/my').catch(() => ({ data: null })),
          axiosInstance.get('/progress/weekly').catch(() => ({ data: null })),
        ]);
        setStats(statsRes.data.stats);
        if (roadmapRes.data) setRoadmap(roadmapRes.data.roadmap);
        if (weeklyRes.data) setWeekly(weeklyRes.data.summary);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const todayLesson = roadmap?.lessons?.[roadmap.currentDay];
  const progressPercent = roadmap ? Math.round((roadmap.currentDay / roadmap.totalDays) * 100) : 0;
  const level = stats?.totalXp ? Math.floor(stats.totalXp / 500) + 1 : 1;
  const levelPercent = stats?.totalXp ? Math.min(100, ((stats.totalXp % 500) / 500) * 100) : 0;

  const statCards = [
    { label: 'Day Streak', value: stats?.streak || 0, icon: BoltIcon, color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', iconBg: '#fef3c7' },
    { label: 'Total XP', value: stats?.totalXp || 0, icon: StarIcon, color: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', iconBg: '#e0e7ff' },
    { label: 'Words', value: stats?.totalVocab || 0, icon: BookIcon, color: '#ec4899', bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', iconBg: '#fce7f3' },
    { label: 'Minutes', value: Math.round(stats?.totalMinutes || 0), icon: TimerIcon, color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', iconBg: '#d1fae5' },
  ];

  return (
    <Box>
      {/* Welcome Banner */}
      <Card
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
          mb: 3,
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: 60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', top: 40, right: '30%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.3) 0%, transparent 70%)' }} />

        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 2, fontWeight: 600, fontSize: 11 }}>
                  Welcome back — Level {level}
                </Typography>
              </Stack>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                Let&apos;s learn English today
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 500 }}>
                Track your progress, practice speaking, and master new words with Gemini AI.
              </Typography>
            </Box>
            {roadmap && (
              <Button
                variant="contained"
                size="large"
                endIcon={<RocketLaunchIcon />}
                onClick={() => router.push('/dashboard/roadmap')}
                sx={{
                  bgcolor: 'white',
                  color: '#4338ca',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.75,
                  fontSize: '1rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Continue Learning
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Card
              sx={{
                borderRadius: 3,
                background: stat.bg,
                border: '1px solid',
                borderColor: stat.color + '18',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.25s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 28px rgba(0,0,0,0.05)' },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} fontSize={13}>{stat.label}</Typography>
                    <Typography variant="h4" fontWeight={800} color={stat.color} fontSize="2rem">{stat.value}</Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      bgcolor: stat.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <stat.icon sx={{ color: stat.color, fontSize: 22 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions + Roadmap side by side */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>Practice Skills</Typography>
              <Stack spacing={1.5}>
                {quickActions.map((action) => (
                  <Box
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: action.color + '08',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        background: action.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 14px ${action.color}35`,
                        flexShrink: 0,
                      }}
                    >
                      <action.icon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{action.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Roadmap / Level Card */}
        <Grid item xs={12} md={6}>
          {roadmap ? (
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                overflow: 'hidden',
                position: 'relative',
                height: '100%',
              }}
            >
              <Box sx={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.15)' }} />
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative', zIndex: 1 }}>
                <Stack justifyContent="space-between" sx={{ height: '100%' }} spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                      <Chip label={`Day ${roadmap.currentDay} of ${roadmap.totalDays}`} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontWeight: 600, borderRadius: 2, fontSize: 12 }} />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>{todayLesson?.title || 'Start learning'}</Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      {todayLesson?.vocabularies?.length || 0} words · Pronunciation · Shadowing
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Progress</Typography>
                      <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 700 }}>{progressPercent}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)', overflow: 'hidden', mb: 2 }}>
                      <Box sx={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', width: `${progressPercent}%`, transition: 'width 0.5s ease' }} />
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => router.push('/dashboard/roadmap')}
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 800,
                        color: 'white',
                        py: 1.5,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)', transform: 'translateY(-1px)' },
                        transition: 'all 0.2s',
                      }}
                    >
                      Start Lesson
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card
              sx={{
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 4, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 30, color: '#6366f1', opacity: 0.5 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>No roadmap yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Generate a personalized 7-day learning plan
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => router.push('/dashboard/roadmap')}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 800,
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    '&:hover': { background: 'linear-gradient(135deg, #3730a3, #5b21b6)' },
                  }}
                >
                  Generate Roadmap
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Weekly Summary */}
      {weekly && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>This Week</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/dashboard/progress')} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>Full Report</Button>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Sessions</Typography>
                <Typography variant="h5" fontWeight={700}>{weekly.totalSessions}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>XP Earned</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">{weekly.totalXP}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Minutes</Typography>
                <Typography variant="h5" fontWeight={700}>{Math.round(weekly.totalMinutes)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Activities</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {Object.entries(weekly.byType || {}).map(([type, count]) => (
                    <Chip key={type} label={`${type}: ${count}`} size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 500, fontSize: 11 }} />
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