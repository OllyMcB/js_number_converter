import { ChangeEvent, useEffect } from 'react';
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
  // Debug prop updates
  useEffect(() => {
    console.log(`[${type}] Value prop updated:`, { value });
  }, [value, type]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(`[${type}] Input Change:`, {
      value: e.target.value,
      previousValue: value,
      keyCode: e.target.value.charCodeAt(e.target.value.length - 1)
    });
    onChange(e.target.value);
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
          type="text"
          value={input || ''}
          placeholder={placeholder}
          onChange={handleChange}
          className={styles.rawInput}
          onKeyDown={(e) => {
            console.log(`[${type}] Key Down:`, {
              key: e.key,
              keyCode: e.keyCode,
              value: e.currentTarget.value
            });
          }}
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