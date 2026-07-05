'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LinearProgress from '@mui/material/LinearProgress';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from 'src/contexts/auth-context';
import { registerSchema, getFieldError } from './schema';
import { Logo } from 'src/components/logo/logo';

const STEPS = ['Account', 'Profile', 'Security'];

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score += 25;
  if (pw.length >= 10) score += 15;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[a-z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;
  return Math.min(100, score);
}

function strengthLabel(score) {
  if (score < 40) return { label: 'Weak', color: '#ef4444' };
  if (score < 70) return { label: 'Fair', color: '#f59e0b' };
  if (score < 90) return { label: 'Good', color: '#10b981' };
  return { label: 'Strong', color: '#059669' };
}

export function RegisterView() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', name: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const parsed = registerSchema.safeParse(form);
  const errors = parsed.success ? {} : parsed.error.format();

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setServerError('');
  };
  const blurField = (field) => () => setTouched((p) => ({ ...p, [field]: true }));

  const pwScore = passwordStrength(form.password);
  const strength = strengthLabel(pwScore);
  const activeStep = form.confirmPassword ? 2 : form.password ? 1 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, name: true, password: true, confirmPassword: true });
    if (!parsed.success) return;
    setLoading(true);
    try {
      await register(form.username.trim(), form.password, form.name.trim() || undefined);
      router.replace('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left: branding panel */}
      <Box
        sx={{
          flex: 1.1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          py: 6,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4c1d95 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -160,
            left: -100,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Logo size={52} />
            <Typography variant="h5" fontWeight={800} sx={{ color: 'white', letterSpacing: '-0.5px' }}>
              English Pro
            </Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', letterSpacing: '-1.2px', lineHeight: 1.15, mb: 2 }}>
            Start your fluency journey today
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 440, mb: 6, lineHeight: 1.7 }}>
            Join thousands of learners improving their English every day with personalized AI coaching.
          </Typography>

          <Stack spacing={2}>
            {[
              'Free forever — no credit card required',
              'Adaptive learning tailored to your level',
              'Track progress with streaks, XP, and milestones',
            ].map((t) => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: '#a5b4fc', fontSize: 22 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>{t}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Right: form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 6 },
          py: 6,
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.8px', color: '#0f172a' }}>
              Create your account
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
              It takes less than a minute
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 3, '& .MuiStepLabel-label': { fontSize: 12 } }}>
            {STEPS.map((s) => (
              <Step key={s}>
                <StepLabel>{s}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <Collapse in={!!serverError}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>{serverError}</Alert>
              </Collapse>

              <TextField
                fullWidth
                label="Username"
                value={form.username}
                onChange={setField('username')}
                onBlur={blurField('username')}
                autoComplete="username"
                autoFocus
                error={touched.username && !!getFieldError(errors, 'username')}
                helperText={touched.username ? getFieldError(errors, 'username') : '3–30 chars: letters, numbers, underscores'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Display name (optional)"
                value={form.name}
                onChange={setField('name')}
                onBlur={blurField('name')}
                autoComplete="name"
                error={touched.name && !!getFieldError(errors, 'name')}
                helperText={touched.name && getFieldError(errors, 'name')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  onBlur={blurField('password')}
                  autoComplete="new-password"
                  error={touched.password && !!getFieldError(errors, 'password')}
                  helperText={touched.password ? getFieldError(errors, 'password') : 'At least 6 characters'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {form.password && (
                  <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pwScore}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 3 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 700, minWidth: 48, textAlign: 'right' }}>
                      {strength.label}
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                label="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                onBlur={blurField('confirmPassword')}
                autoComplete="new-password"
                error={touched.confirmPassword && !!getFieldError(errors, 'confirmPassword')}
                helperText={touched.confirmPassword && getFieldError(errors, 'confirmPassword')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                        {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.6,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, color: '#cbd5e1' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>or</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
