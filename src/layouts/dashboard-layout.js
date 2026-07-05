'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { Logo } from 'src/components/logo/logo';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MicIcon from '@mui/icons-material/Mic';
import HearingIcon from '@mui/icons-material/Hearing';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import MenuIcon from '@mui/icons-material/Menu';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import EditNoteIcon from '@mui/icons-material/EditNote';
import QuizIcon from '@mui/icons-material/Quiz';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from 'src/contexts/auth-context';

const DRAWER_WIDTH = 280;

const navItems = [
  { label: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
  { label: 'Vocabulary', icon: MenuBookIcon, href: '/dashboard/vocabulary' },
  { label: 'Grammar', icon: SpellcheckIcon, href: '/dashboard/grammar' },
  { label: 'Speaking', icon: MicIcon, href: '/dashboard/speaking' },
  { label: 'Shadowing', icon: HearingIcon, href: '/dashboard/shadowing' },
  { label: 'Listening', icon: HearingIcon, href: '/dashboard/listening' },
  { label: 'Role-play Chat', icon: RecordVoiceOverIcon, href: '/dashboard/roleplay' },
  { label: 'Conversations', icon: ChatIcon, href: '/dashboard/conversations' },
  { label: 'Writing', icon: EditNoteIcon, href: '/dashboard/writing' },
  { label: 'Quizzes', icon: QuizIcon, href: '/dashboard/quizzes' },
  { label: 'Roadmap', icon: MapIcon, href: '/dashboard/roadmap' },
  { label: 'Progress', icon: BarChartIcon, href: '/dashboard/progress' },
];

export function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress />
      </Box>
    );
  }

  const displayName = user.name || user.username;
  const initials = displayName.charAt(0).toUpperCase();

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        color: 'white',
      }}
    >
      <Box sx={{ px: 3, pt: 3.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Logo size={42} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              English AI
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#94a3b8', 0.8), fontWeight: 500 }}>
              AI-powered learning
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <ListItemButton
              key={item.href}
              onClick={() => { router.push(item.href); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: 2.5,
                mb: 0.25,
                py: 1.3,
                mx: 0.25,
                color: active ? 'white' : alpha('#94a3b8', 0.75),
                bgcolor: active ? alpha('#6366f1', 0.18) : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: active ? alpha('#6366f1', 0.25) : alpha('#ffffff', 0.05),
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>
                <item.icon sx={{ fontSize: 21 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '-0.1px',
                }}
              />
              {active && (
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    bgcolor: '#818cf8',
                    boxShadow: '0 0 12px rgba(129,140,248,0.6)',
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.12)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#e2e8f0', fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#94a3b8', 0.8), textTransform: 'capitalize' }}>
                {user.level} · {user.xp || 0} XP
              </Typography>
            </Box>
          </Stack>
          <Button
            fullWidth
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: alpha('#cbd5e1', 0.9),
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.15),
                color: '#fca5a5',
              },
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: alpha('#0f172a', 0.06),
          }}
        >
          <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, md: 4 } }}>
          {isMobile && (
            <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              English AI
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Page content with proper padding */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}