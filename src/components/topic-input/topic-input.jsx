'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import TopicIcon from '@mui/icons-material/Topic';
import ShuffleIcon from '@mui/icons-material/Shuffle';

export function TopicInput({
  value,
  onChange,
  onEnter,
  suggestions = [],
  label = 'Topic (optional)',
  placeholder = 'Type any topic you want to learn, or pick a suggestion below',
  size = 'small',
  fullWidth = true,
  showRandom = true,
  StartIcon = TopicIcon,
  randomTitle = 'Pick random suggestion',
  sx,
}) {
  const [focused, setFocused] = useState(false);

  const handlePick = (s) => onChange?.(s);

  const handleRandom = () => {
    if (suggestions.length === 0) return;
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    onChange?.(random);
  };

  return (
    <Box sx={sx}>
      <TextField
        fullWidth={fullWidth}
        size={size}
        label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <StartIcon sx={{ color: focused ? '#6366f1' : '#94a3b8', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: showRandom && suggestions.length > 0 ? (
            <InputAdornment position="end">
              <Box
                component="span"
                onClick={handleRandom}
                sx={{
                  display: 'inline-flex',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  transition: 'color 0.15s',
                  '&:hover': { color: '#6366f1' },
                }}
                title={randomTitle}
              >
                <ShuffleIcon sx={{ fontSize: 20 }} />
              </Box>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.15s',
            ...(focused && {
              '& fieldset': { borderColor: '#6366f1', borderWidth: 1.5 },
            }),
          },
        }}
      />
      {suggestions.length > 0 && (
        <Box
          sx={{
            mt: 1.25,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {suggestions.map((s) => {
            const active = value?.toLowerCase() === s.toLowerCase();
            return (
              <Chip
                key={s}
                label={s}
                size="small"
                onClick={() => handlePick(active ? '' : s)}
                sx={{
                  height: 28,
                  borderRadius: 1.5,
                  px: 0.5,
                  fontSize: 12.5,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  bgcolor: active ? 'rgba(99,102,241,0.12)' : '#f8fafc',
                  color: active ? '#4f46e5' : '#475569',
                  border: '1px solid',
                  borderColor: active ? '#6366f1' : '#e2e8f0',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: active ? 'rgba(99,102,241,0.18)' : '#f1f5f9',
                    borderColor: active ? '#6366f1' : '#cbd5e1',
                    color: active ? '#4338ca' : '#334155',
                  },
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default TopicInput;
