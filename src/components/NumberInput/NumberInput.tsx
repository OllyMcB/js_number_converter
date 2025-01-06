import { ChangeEvent, useEffect, useRef, KeyboardEvent } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import styles from './NumberInput.module.scss';

interface NumberInputHighlight {
  start: number;
  end: number;
  color: string;
}

interface NumberInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: 'hex' | 'binary' | 'decimal' | 'ascii';
  highlights?: NumberInputHighlight[];
  onMouseMove?: (position: number) => void;
  onMouseLeave?: () => void;
}

interface CharacterProps {
  char: string;
  index: number;
  isHighlighted?: boolean;
  highlightColor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Character = ({ char, index, isHighlighted, highlightColor, onMouseEnter, onMouseLeave }: CharacterProps) => (
  <span
    className={styles.character}
    style={isHighlighted ? { backgroundColor: highlightColor } : undefined}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {char}
  </span>
);

export const NumberInput = ({ 
  label, 
  value, 
  placeholder, 
  onChange,
  type = 'decimal',
  highlights = [],
  onMouseMove,
  onMouseLeave
}: NumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  useEffect(() => {
    if (inputRef.current && cursorPositionRef.current !== null) {
      inputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
      cursorPositionRef.current = null;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    cursorPositionRef.current = e.target.selectionStart;
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const target = e.currentTarget;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      
      if (start === end) {
        const newValue = value.substring(0, start - 1) + value.substring(start);
        cursorPositionRef.current = start - 1;
        onChange(newValue);
        e.preventDefault();
      } else {
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
  const result = parts[1]?.trim();
  const hasCalculation = value.includes('=') && /[+\-*/%&|^~<>]/.test(input);

  const renderCharacters = () => {
    if (!input && !result) return null;

    const allChars: JSX.Element[] = [];
    
    // Add input characters
    input.split('').forEach((char, index) => {
      const isHighlighted = highlights.some(h => {
        // For hex, we need to match the actual number part (after 0x)
        if (type === 'hex' && h.start === 0) {
          return index >= 2 && index <= 3;  // Match the '01' in '0x01'
        }
        // For binary, we need to match the corresponding 8-bit section
        if (type === 'binary' && h.start === 0) {
          return index >= 0 && index <= 7;  // Match the first byte
        }
        return index >= h.start && index < h.end;
      });
      const highlight = highlights.find(h => {
        if (type === 'hex' && h.start === 0) {
          return index >= 2 && index <= 3;
        }
        if (type === 'binary' && h.start === 0) {
          return index >= 0 && index <= 7;
        }
        return index >= h.start && index < h.end;
      });

      allChars.push(
        <Character
          key={`input-${index}`}
          char={char}
          index={index}
          isHighlighted={isHighlighted}
          highlightColor={highlight?.color}
          onMouseEnter={() => onMouseMove?.(index)}
          onMouseLeave={onMouseLeave}
        />
      );
    });

    return allChars;
  };

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
        <div className={styles.displayContainer}>
          <input
            ref={inputRef}
            type="text"
            value={input || ''}
            placeholder=""
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={styles.hiddenInput}
          />
          <div className={styles.characters}>
            {renderCharacters() || <span className={styles.placeholder}>{placeholder}</span>}
          </div>
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
        </div>
      </Box>
    </Paper>
  );
}; 