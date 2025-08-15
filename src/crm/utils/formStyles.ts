import { SxProps, Theme } from '@mui/material/styles';

/**
 * Utility styles to fix common form label overlapping issues in the CRM
 */

export const fixedFormControlStyles: SxProps<Theme> = {
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, 6px) scale(0.75)',
    transformOrigin: 'top left',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
  '& .MuiSelect-select': {
    py: 1,
    fontSize: '0.875rem',
  },
  '& .MuiInputBase-input': {
    py: 1,
    fontSize: '0.875rem',
  },
};

export const fixedInputLabelStyles: SxProps<Theme> = {
  fontSize: '0.875rem',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const responsiveStackStyles: SxProps<Theme> = {
  direction: { xs: 'column', sm: 'row' },
  spacing: 2,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 1,
};

export const uniformTooltipStyles: SxProps<Theme> = {
  fontSize: '0.75rem',
  bgcolor: 'grey.800',
  color: 'white',
  '& .MuiTooltip-arrow': {
    color: 'grey.800',
  },
};

// Common minimum widths for form elements to prevent overlapping
export const formElementWidths = {
  small: 120,
  medium: 140,
  large: 180,
  search: 200,
  extraLarge: 250,
};

// Standard spacing values for consistent layouts
export const layoutSpacing = {
  compact: 1,
  normal: 2,
  comfortable: 3,
  spacious: 4,
};
