import { ChangeEvent, useEffect, useRef, KeyboardEvent, MouseEvent } from 'react';
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

/**
 * @brief Component for number input fields with consistent styling and behaviour
 */
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

  const handleMouseMove = (e: MouseEvent<HTMLInputElement>) => {
    if (!onMouseMove) return;
    
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - 16; // Adjust for padding
    
    // Calculate character position based on x coordinate
    const charWidth = 9.6; // Adjusted monospace character width
    const position = Math.floor((x + (charWidth / 2)) / charWidth); // Add half char width for better centering
    
    if (position >= 0) { // Only trigger if we're actually over text
      onMouseMove(position);
    }
  };

  // Split value into input and result, but don't trim spaces
  const parts = value.split('=');
  const input = parts[0];
  const result = parts[1]?.trim(); // Only trim the result part
  const hasCalculation = value.includes('=') && /[+\-*/%&|^~<>]/.test(input); // Only show result if there's a calculation

  console.log(`[${type}] Rendering with:`, { input, value });

  // Create highlighted text spans
  const renderHighlightedText = (text: string) => {
    if (!highlights.length) return text;

    const spans: JSX.Element[] = [];
    let lastEnd = 0;

    highlights.sort((a, b) => a.start - b.start).forEach((highlight, index) => {
      // Add non-highlighted text before this highlight
      if (highlight.start > lastEnd) {
        spans.push(
          <span key={`text-${index}`}>
            {text.substring(lastEnd, highlight.start)}
          </span>
        );
      }

      // Add highlighted text
      spans.push(
        <span 
          key={`highlight-${index}`}
          style={{ 
            backgroundColor: highlight.color,
            borderRadius: '2px',
            padding: '0 2px',
            margin: '0 -2px'
          }}
        >
          {text.substring(highlight.start, highlight.end)}
        </span>
      );

      lastEnd = highlight.end;
    });

    // Add remaining non-highlighted text
    if (lastEnd < text.length) {
      spans.push(
        <span key="text-end">
          {text.substring(lastEnd)}
        </span>
      );
    }

    return <>{spans}</>;
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
        <div 
          className={styles.highlightContainer}
          onMouseMove={handleMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <input
            ref={inputRef}
            type="text"
            value={input || ''}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={styles.rawInput}
          />
          <div className={styles.highlights}>
            {renderHighlightedText(input || '')}
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