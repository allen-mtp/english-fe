'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import TimerIcon from '@mui/icons-material/Timer';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  StudyTimerWelcomeDialog,
  shouldShowWelcomeDialog,
  markWelcomeDialogSeen,
} from './study-timer-welcome-dialog';

const DURATION_SECONDS = 60 * 60; // 60 minutes
const WARNING_SECONDS = 15 * 60;  // 15 minutes remaining
const STORAGE_KEY = 'study-timer-state';
const POSITION_KEY = 'study-timer-pos';

function loadState() {
  if (typeof window === 'undefined') {
    return { remaining: DURATION_SECONDS, running: false, startedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { remaining: DURATION_SECONDS, running: false, startedAt: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.remaining !== 'number') {
      return { remaining: DURATION_SECONDS, running: false, startedAt: null };
    }
    if (parsed.running && parsed.startedAt) {
      const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000);
      const real = Math.max(0, parsed.remaining - elapsed);
      if (real <= 0) {
        return { remaining: 0, running: false, startedAt: null };
      }
      return { remaining: real, running: true, startedAt: parsed.startedAt };
    }
    return { remaining: parsed.remaining, running: false, startedAt: null };
  } catch {
    return { remaining: DURATION_SECONDS, running: false, startedAt: null };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadPosition() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function savePosition(x, y) {
  try {
    localStorage.setItem(POSITION_KEY, JSON.stringify({ x, y }));
  } catch {
    // ignore
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function playBeep(durationMs, frequency, times = 1) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const startAt = ctx.currentTime;

    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const t = startAt + (i * (durationMs + 150) / 1000);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + durationMs / 1000);
    }

    setTimeout(() => {
      try { ctx.close(); } catch { /* ignore */ }
    }, (times * (durationMs + 200)) + 500);
  } catch {
    // ignore
  }
}

export function StudyTimer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [state, setState] = useState(() => loadState());
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState(() => loadPosition()); // {x, y} or null = default corner
  const warnedRef = useRef(false);

  // Drag state
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });
  const widgetRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Daily welcome popup — once per day
  useEffect(() => {
    if (shouldShowWelcomeDialog()) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    markWelcomeDialogSeen();
    setShowWelcome(false);
  }, []);

  const closeWelcomeTemporarily = useCallback(() => {
    setShowWelcome(false);
  }, []);

  const handleWelcomeGotIt = useCallback(() => {
    dismissWelcome();
    setCollapsed(false);
  }, [dismissWelcome]);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Tick
  useEffect(() => {
    if (!state.running) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.running) return prev;
        const next = Math.max(0, prev.remaining - 1);
        if (next === 0) {
          return { remaining: 0, running: false, startedAt: null };
        }
        return { ...prev, remaining: next };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.running]);

  // Sound alerts
  useEffect(() => {
    if (!state.running) {
      warnedRef.current = false;
      return;
    }
    if (state.remaining === WARNING_SECONDS && !warnedRef.current) {
      warnedRef.current = true;
      playBeep(400, 880, 3);
    }
    if (state.remaining === 0) {
      playBeep(800, 440, 5);
    }
  }, [state.remaining, state.running]);

  const handleStart = useCallback(() => {
    setState(prev => {
      // Auto-reset to full duration if expired, then start
      const remaining = prev.remaining <= 0 ? DURATION_SECONDS : prev.remaining;
      warnedRef.current = false;
      return { remaining, running: true, startedAt: Date.now() };
    });
  }, []);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, running: false, startedAt: null }));
  }, []);

  // ---- Drag handlers (pointer events: works for mouse + touch) ----
  const onPointerDown = useCallback((e) => {
    // Ignore drags starting on buttons (so clicks still work)
    const target = e.target;
    if (target.closest('button')) return;
    if (collapsed && target.closest('[data-no-drag]')) return;

    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      moved: false,
    };
    setDragging(true);
    // Capture pointer so we keep getting move events even if finger leaves the widget
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    e.preventDefault();
  }, [collapsed]);

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return; // dead zone
    d.moved = true;

    let newX = d.origX + dx;
    let newY = d.origY + dy;

    // Constrain to viewport
    const w = widgetRef.current?.offsetWidth || 240;
    const h = widgetRef.current?.offsetHeight || 60;
    const margin = 8;
    newX = Math.max(margin, Math.min(window.innerWidth - w - margin, newX));
    newY = Math.max(margin, Math.min(window.innerHeight - h - margin, newY));

    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (d.moved && pos) {
      savePosition(pos.x, pos.y);
    }
  }, [pos]);

  const resetPosition = useCallback(() => {
    setPos(null);
    try { localStorage.removeItem(POSITION_KEY); } catch { /* ignore */ }
  }, []);

  const handleCollapse = useCallback(() => {
    if (isMobile) {
      resetPosition();
    }
    setCollapsed(true);
  }, [isMobile, resetPosition]);

  // Constrain position to viewport whenever widget size changes (expand/collapse)
  useLayoutEffect(() => {
    if (!pos || !widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const margin = 8;
    let newX = pos.x;
    let newY = pos.y;
    let changed = false;
    if (newX + w > window.innerWidth - margin) {
      newX = Math.max(margin, window.innerWidth - w - margin);
      changed = true;
    }
    if (newY + h > window.innerHeight - margin) {
      newY = Math.max(margin, window.innerHeight - h - margin);
      changed = true;
    }
    if (newX < margin) { newX = margin; changed = true; }
    if (newY < margin) { newY = margin; changed = true; }
    if (changed) {
      setPos({ x: newX, y: newY });
      savePosition(newX, newY);
    }
  }, [pos, collapsed]);

  // ---- Position style ----
  const positionStyle = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {
        bottom: { xs: 12, md: 24 },
        right: { xs: 12, md: 24 },
        left: 'auto',
        top: 'auto',
      };

  // Common wrapper style
  const wrapperSx = {
    position: 'fixed',
    zIndex: 1300,
    ...positionStyle,
    touchAction: 'none', // prevent scroll while dragging on mobile
    userSelect: 'none',
    cursor: dragging ? 'grabbing' : 'grab',
    transition: dragging ? 'none' : 'box-shadow 0.2s ease, border-color 0.3s ease',
  };

  const isWarning = state.running && state.remaining <= WARNING_SECONDS && state.remaining > 0;
  const isDone = state.remaining === 0;

  const welcomeDialog = (
    <StudyTimerWelcomeDialog
      open={showWelcome}
      onClose={closeWelcomeTemporarily}
      onGotIt={handleWelcomeGotIt}
    />
  );

  // ---- Collapsed view ----
  if (collapsed) {
    return (
      <>
        {welcomeDialog}
        <Box
        ref={widgetRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => {
          // Only open if it wasn't a drag
          if (!dragRef.current.moved) setCollapsed(false);
          dragRef.current.moved = false;
        }}
        sx={{
          ...wrapperSx,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 999,
          bgcolor: state.running ? '#4f46e5' : 'rgba(15,23,42,0.9)',
          color: 'white',
          boxShadow: state.running
            ? '0 8px 24px rgba(79,70,229,0.35)'
            : '0 6px 18px rgba(0,0,0,0.2)',
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16, opacity: 0.5 }} />
        <TimerIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(state.remaining)}
        </Typography>
        {state.running && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#34d399',
              boxShadow: '0 0 8px rgba(52,211,153,0.8)',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%,100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
        )}
        </Box>
      </>
    );
  }

  // ---- Expanded view ----
  return (
    <>
      {welcomeDialog}
      <Box
      ref={widgetRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      sx={{
        ...wrapperSx,
        bgcolor: 'white',
        borderRadius: 4,
        boxShadow: isWarning
          ? '0 12px 32px rgba(245,158,11,0.25)'
          : isDone
            ? '0 12px 32px rgba(239,68,68,0.25)'
            : '0 8px 28px rgba(0,0,0,0.14)',
        border: '1px solid',
        borderColor: isWarning ? '#fbbf24' : isDone ? '#f87171' : alpha('#0f172a', 0.08),
        p: 2,
        minWidth: { xs: 220, sm: 260 },
        maxWidth: { xs: 'calc(100vw - 24px)', sm: 300 },
      }}
    >
      {/* Header — draggable handle */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <DragIndicatorIcon sx={{ fontSize: 16, color: '#cbd5e1' }} />
          <TimerIcon
            sx={{
              fontSize: 18,
              color: isWarning ? '#f59e0b' : isDone ? '#ef4444' : '#6366f1',
            }}
          />
          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Study Timer
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {pos && (
            <Tooltip title="Reset position">
              <IconButton
                size="small"
                onClick={resetPosition}
                data-no-drag
                sx={{ p: 0.25 }}
              >
                <DragIndicatorIcon sx={{ fontSize: 14, color: '#cbd5e1', transform: 'rotate(45deg)' }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={handleCollapse} data-no-drag sx={{ p: 0.25 }}>
            <CloseIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Time display */}
      <Box sx={{ textAlign: 'center', my: 1 }}>
        <Typography
          sx={{
            fontSize: { xs: 36, sm: 42 },
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: isWarning ? '#f59e0b' : isDone ? '#ef4444' : '#0f172a',
          }}
        >
          {formatTime(state.remaining)}
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
          {isDone
            ? 'Time\u2019s up! Great job.'
            : state.running
              ? isWarning
                ? '15 min warning — wrap up soon'
                : 'Stay focused'
              : 'Press start to begin'}
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: '#e2e8f0',
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${(state.remaining / DURATION_SECONDS) * 100}%`,
            bgcolor: isWarning ? '#f59e0b' : isDone ? '#ef4444' : '#6366f1',
            transition: 'width 1s linear, background-color 0.3s ease',
          }}
        />
      </Box>

      {/* Controls */}
      <Stack direction="row" spacing={1} justifyContent="center">
        {!state.running ? (
          <Tooltip title={state.remaining === 0 ? 'Start again (60:00)' : 'Start'}>
            <span>
              <IconButton
                onClick={handleStart}
                data-no-drag
                size="small"
                sx={{
                  bgcolor: '#4f46e5',
                  color: 'white',
                  '&:hover': { bgcolor: '#3730a3' },
                  width: 44,
                  height: 44,
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Pause">
            <IconButton
              onClick={handlePause}
              data-no-drag
              size="small"
              sx={{
                bgcolor: '#0f172a',
                color: 'white',
                '&:hover': { bgcolor: '#1e293b' },
                width: 44,
                height: 44,
              }}
            >
              <PauseIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
    </>
  );
}
