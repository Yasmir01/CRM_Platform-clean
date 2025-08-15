import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface NumberInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  prefix?: string;
  suffix?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  allowDecimals = true,
  prefix = '',
  suffix = '',
  ...textFieldProps
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num === 0 && !isFocused) return '';
    
    let formatted = allowDecimals ? num.toString() : Math.floor(num).toString();
    
    // Add commas for thousands separator when not focused
    if (!isFocused && num >= 1000) {
      formatted = num.toLocaleString();
    }
    
    return `${prefix}${formatted}${suffix}`;
  };

  // Parse display value to number
  const parseNumber = (str: string): number => {
    // Remove prefix, suffix, and commas
    let cleaned = str.replace(prefix, '').replace(suffix, '').replace(/,/g, '');
    
    const parsed = allowDecimals ? parseFloat(cleaned) : parseInt(cleaned, 10);
    
    if (isNaN(parsed)) return 0;
    
    // Apply min/max constraints
    let result = parsed;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    
    return result;
  };

  // Update display value when value prop changes
  React.useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value, isFocused, prefix, suffix, allowDecimals]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Show raw number when focused
    setDisplayValue(value === 0 ? '' : value.toString());
    textFieldProps.onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const newValue = parseNumber(displayValue);
    onChange(newValue);
    setDisplayValue(formatNumber(newValue));
    textFieldProps.onBlur?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = event.target.value;
    setDisplayValue(newDisplayValue);

    // If focused, parse and update immediately for validation
    if (isFocused) {
      const newValue = parseNumber(newDisplayValue);
      // Only call onChange if the parsed value actually changed
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    if ([8, 9, 27, 13, 37, 38, 39, 40].includes(event.keyCode)) {
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && [65, 67, 86, 88].includes(event.keyCode)) {
      return;
    }
    
    // Allow decimal point if decimals are allowed and not already present
    if (allowDecimals && event.key === '.' && !displayValue.includes('.')) {
      return;
    }
    
    // Ensure that it's a number and stop the keypress if it's not
    if ((event.shiftKey || event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }

    textFieldProps.onKeyDown?.(event);
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      inputProps={{
        ...textFieldProps.inputProps,
        inputMode: 'numeric',
        pattern: allowDecimals ? '[0-9]*\\.?[0-9]*' : '[0-9]*',
      }}
    />
  );
}
