'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import TimerIcon from '@mui/icons-material/Timer';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BoltIcon from '@mui/icons-material/Bolt';
import Fade from '@mui/material/Fade';
import { useTranslation } from 'react-i18next';

const WELCOME_KEY = 'study-timer-welcome-seen';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function shouldShowWelcomeDialog() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(WELCOME_KEY) !== getTodayKey();
  } catch {
    return true;
  }
}

export function markWelcomeDialogSeen() {
  try {
    localStorage.setItem(WELCOME_KEY, getTodayKey());
  } catch {
    // ignore
  }
}

export function StudyTimerWelcomeDialog({ open, onClose, onGotIt }) {
  const { t } = useTranslation();

  const STEPS = [
    { icon: TimerIcon, color: '#6366f1', bg: alpha('#6366f1', 0.1), title: t('timer.welcome.step1'), desc: t('timer.welcome.step1desc') },
    { icon: PlayCircleOutlineIcon, color: '#8b5cf6', bg: alpha('#8b5cf6', 0.1), title: t('timer.welcome.step2'), desc: t('timer.welcome.step2desc') },
    { icon: AutoStoriesIcon, color: '#0ea5e9', bg: alpha('#0ea5e9', 0.1), title: t('timer.welcome.step3'), desc: t('timer.welcome.step3desc') },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={400}
      BackdropProps={{
        sx: {
          bgcolor: alpha('#0f172a', 0.55),
          backdropFilter: 'blur(4px)',
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100dvh - 32px)',
          m: { xs: 1.5, sm: 2 },
          width: { xs: 'calc(100% - 24px)', sm: '100%' },
          boxShadow: '0 28px 80px rgba(79, 70, 229, 0.28), 0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #a855f7 100%)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha('#fff', 0.2),
              border: '2px solid',
              borderColor: alpha('#fff', 0.35),
            }}
          >
            <TimerIcon sx={{ fontSize: { xs: 26, sm: 30 }, color: 'white' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
              <BoltIcon sx={{ fontSize: 14, color: '#fde68a' }} />
              <Typography
                variant="caption"
                sx={{
                  color: alpha('#fff', 0.9),
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                }}
              >
                {t('timer.welcome.subtitle')}
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: 'white', lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
            >
              {t('timer.welcome.title')}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Scrollable body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
        }}
      >
        {/* 60 min highlight */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 2, sm: 2.5 },
            px: 2,
            mb: 2,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${alpha('#6366f1', 0.06)} 0%, ${alpha('#a855f7', 0.08)} 100%)`,
            border: '1px solid',
            borderColor: alpha('#6366f1', 0.12),
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: { xs: 44, sm: 56 },
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #4f46e5, #a855f7)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('timer.welcome.highlight')}
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ color: '#334155', mt: 0.5, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
          >
            {t('timer.welcome.unit')}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#64748b', fontWeight: 500, display: 'block', mt: 0.5 }}
          >
            {t('timer.welcome.desc')}
          </Typography>
        </Box>

        {/* Steps */}
        <Stack spacing={1}>
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Stack
                key={step.title}
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid',
                  borderColor: alpha('#0f172a', 0.06),
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: step.bg,
                  }}
                >
                  <Icon sx={{ fontSize: 20, color: step.color }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: '#0f172a', lineHeight: 1.3 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.4 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      {/* Fixed footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderTop: '1px solid',
          borderColor: alpha('#0f172a', 0.08),
          bgcolor: 'white',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onGotIt}
          startIcon={<PlayCircleOutlineIcon />}
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
            },
          }}
        >
          {t('timer.welcome.gotIt')}
        </Button>

        <Button
          fullWidth
          size="small"
          onClick={onClose}
          sx={{
            mt: 0.75,
            py: 0.5,
            textTransform: 'none',
            fontWeight: 600,
            color: '#94a3b8',
            '&:hover': { bgcolor: 'transparent', color: '#64748b' },
          }}
        >
          {t('timer.welcome.dismiss')}
        </Button>
      </Box>
    </Dialog>
  );
}
