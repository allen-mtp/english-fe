import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { setFont } from './styles/utils';
import { overridesTheme } from './overrides-theme';
import { shadows, typography, components, colorSchemes, customShadows } from './core';

export function createTheme() {
  const initialTheme = {
    colorSchemes,
    shadows: shadows('light'),
    customShadows: customShadows('light'),
    shape: { borderRadius: 8 },
    components,
    typography: {
      ...typography,
      fontFamily: setFont('publicSans'),
    },
    cssVarPrefix: '',
    shouldSkipGeneratingVar,
  };

  const theme = extendTheme(initialTheme, overridesTheme);
  return theme;
}

function shouldSkipGeneratingVar(keys) {
  const skipGlobalKeys = [
    'mixins', 'overlays', 'direction', 'breakpoints',
    'cssVarPrefix', 'unstable_sxConfig', 'typography',
  ];
  return keys.some((key) => skipGlobalKeys?.includes(key));
}