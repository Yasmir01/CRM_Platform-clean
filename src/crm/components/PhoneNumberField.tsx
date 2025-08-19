import * as React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface PhoneNumberFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Phone number field with automatic formatting as user types
 * Formats input to (XXX) XXX-XXXX pattern
 */
export default function PhoneNumberField({ 
  value, 
  onChange, 
  ...props 
}: PhoneNumberFieldProps) {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Allow backspace/delete to work naturally
    if (inputValue.length < displayValue.length) {
      const digits = inputValue.replace(/\D/g, '');
      const formatted = formatPhoneNumber(digits);
      setDisplayValue(formatted);
      onChange(formatted);
      return;
    }

    // Only allow numeric input (plus existing formatting characters)
    const digits = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digits.length <= 10) {
      const formatted = formatPhoneNumber(digits);
      setDisplayValue(formatted);
      onChange(formatted);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys, backspace, delete, etc.
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }
    
    // Allow numeric keys (0-9)
    if (event.key >= '0' && event.key <= '9') {
      return;
    }
    
    // Allow allowed keys
    if (allowedKeys.includes(event.key)) {
      return;
    }
    
    // Block everything else
    event.preventDefault();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '');
    
    if (digits.length <= 10) {
      const formatted = formatPhoneNumber(digits);
      setDisplayValue(formatted);
      onChange(formatted);
    }
  };

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder="(555) 123-4567"
      inputProps={{
        maxLength: 14, // (XXX) XXX-XXXX = 14 characters
        ...props.inputProps,
      }}
    />
  );
}

/**
 * Utility function to validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

/**
 * Utility function to get clean phone number (digits only)
 */
export const getCleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Utility function to format phone number for display
 */
export const formatPhoneDisplay = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
};
