import { ChangeEvent, useEffect, useRef, KeyboardEvent } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import styles from './NumberInput.module.scss';

interface NumberInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: 'hex' | 'binary' | 'decimal' | 'ascii';
}

/**
 * @brief Component for number input fields with consistent styling and behaviour
 */
export const NumberInput = ({ 
  label, 
  value, 
  placeholder, 
  onChange,
  type = 'decimal' 
}: NumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  useEffect(() => {
    // Restore cursor position after value update
    if (inputRef.current && cursorPositionRef.current !== null) {
      inputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
      cursorPositionRef.current = null;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Store cursor position before update
    cursorPositionRef.current = e.target.selectionStart;
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const target = e.currentTarget;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      
      if (start === end) {
        // Single character deletion
        const newValue = value.substring(0, start - 1) + value.substring(start);
        cursorPositionRef.current = start - 1;
        onChange(newValue);
        e.preventDefault();
      } else {
        // Range deletion
        const newValue = value.substring(0, start) + value.substring(end);
        cursorPositionRef.current = start;
        onChange(newValue);
        e.preventDefault();
      }
    }
  };

  // Split value into input and result, but don't trim spaces
  const parts = value.split('=');
  const input = parts[0];
  const result = parts[1]?.trim(); // Only trim the result part
  const hasCalculation = value.includes('=');

  console.log(`[${type}] Rendering with:`, { input, value });

  return (
    <Paper 
      elevation={0} 
      className={styles.container}
      sx={{
        bgcolor: 'background.default',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Typography
        variant="subtitle1"
        className={styles.label}
        component="div"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        {label}
      </Typography>
      <Box className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={input || ''}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.rawInput}
        />
        {hasCalculation && result && (
          <Typography 
            className={styles.result}
            sx={{
              color: 'text.secondary',
              fontFamily: 'Roboto Mono, monospace'
            }}
          >
            = {result}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}; 