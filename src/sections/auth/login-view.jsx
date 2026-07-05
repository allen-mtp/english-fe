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
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useAuth } from 'src/contexts/auth-context';
import { loginSchema, getFieldError } from './schema';
import { Logo } from 'src/components/logo/logo';

const FEATURES = [
  { icon: MenuBookIcon, title: 'Vocabulary & Grammar', desc: 'Spaced repetition + AI-generated lessons' },
  { icon: RecordVoiceOverIcon, title: 'Pronunciation Coach', desc: 'Record & get instant AI feedback' },
  { icon: SchoolIcon, title: 'Personalized Roadmap', desc: '7-day adaptive learning plan' },
];

export function LoginView() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const parsed = loginSchema.safeParse(form);
  const errors = parsed.success ? {} : parsed.error.format();

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setServerError('');
  };
  const blurField = (field) => () => setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!parsed.success) return;
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      router.replace('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Login failed. Check your credentials.');
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
              English AI
            </Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', letterSpacing: '-1.2px', lineHeight: 1.15, mb: 2 }}>
            Master English<br />with your personal AI coach
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 440, mb: 6, lineHeight: 1.7 }}>
            Vocabulary, grammar, pronunciation, writing, listening, role-play chat, and a personalized roadmap — all powered by AI, tailored to your level.
          </Typography>

          <Stack spacing={2.5}>
            {FEATURES.map((f) => (
              <Box key={f.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <f.icon sx={{ fontSize: 22, color: '#a5b4fc' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.3 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                    {f.desc}
                  </Typography>
                </Box>
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
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.8px', color: '#0f172a' }}>
              Welcome back
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
              Log in to continue your learning streak
            </Typography>
          </Box>

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
                helperText={touched.username && getFieldError(errors, 'username')}
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
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={setField('password')}
                onBlur={blurField('password')}
                autoComplete="current-password"
                error={touched.password && !!getFieldError(errors, 'password')}
                helperText={touched.password && getFieldError(errors, 'password')}
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
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                  textTransform: 'none',
                  fontWeight: 800,
                  color: 'white',
                  fontSize: 15,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3730a3, #5b21b6)',
                    boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Logging in…' : 'Log in'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, color: '#cbd5e1' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>or</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
                Create one
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
