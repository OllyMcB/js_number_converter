import { ChangeEvent } from 'react';
import { TextField, Paper, Typography } from '@mui/material';
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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Preserve leading zeros for binary
    if (type === 'binary' && value.startsWith('0') && newValue.length > value.length) {
      newValue = value + newValue.slice(value.length);
    }

    // Allow '0x' prefix for hex
    if (type === 'hex' && value === '0' && newValue === '0x') {
      newValue = '0x';
    }

    onChange(newValue);
  };

  return (
    <Paper elevation={0} className={styles.container}>
      <Typography
        variant="subtitle1"
        className={styles.label}
        component="div"
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className={styles.input}
        size="small"
        autoComplete="off"
        inputProps={{
          spellCheck: false,
          autoComplete: 'off',
          'data-form-type': 'other',
          'aria-autocomplete': 'none'
        }}
      />
    </Paper>
  );
}; 