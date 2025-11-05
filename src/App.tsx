import { useState, useEffect, useCallback, useMemo } from 'react'
import { NumberInput } from './components/NumberInput/NumberInput'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { trackEvent } from './analytics'
import { NumberValues, convertNumber, padHex, padBinary, formatCalculationResult } from './utils/conversion'
import { evaluateExpression } from './utils/expression'
import { getHighlights, HighlightInfo } from './utils/highlighting'
import './App.scss'

const HOVER_TEXT = 'Hover over numbers to see corresponding bit patterns'
const OPERATORS_TEXT = 'Operators: + - * / % (arithmetic) & | ^ ~ (bitwise) << >> (shift)'

function App() {
  const [values, setValues] = useState<NumberValues>({
    decimal: '',
    hex: '',
    binary: '',
    ascii: ''
  });
  const [highlight, setHighlight] = useState<HighlightInfo | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Listen for system theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Memoized highlight calculator for each input type
  const decimalHighlights = useMemo(() => getHighlights(values, highlight, 'decimal'), [values, highlight]);
  const hexHighlights = useMemo(() => getHighlights(values, highlight, 'hex'), [values, highlight]);
  const binaryHighlights = useMemo(() => getHighlights(values, highlight, 'binary'), [values, highlight]);
  const asciiHighlights = useMemo(() => getHighlights(values, highlight, 'ascii'), [values, highlight]);

  const handleMouseMove = useCallback((type: 'decimal' | 'hex' | 'binary' | 'ascii', position: number) => {
    setHighlight({ sourceType: type, position, length: 1 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHighlight(null);
  }, []);

  // Common handler for number-based inputs (decimal, hex, binary)
  const handleNumberChange = useCallback((
    value: string,
    base: number,
    fieldName: 'decimal' | 'hex' | 'binary',
    trackEventName: string,
    parseValue: (part: string) => number | null,
    formatPart: (part: string, num: number) => NumberValues,
    preserveOriginal: (part: string, conversion: NumberValues) => NumberValues
  ) => {
    // Track input
    if (value) {
      trackEvent('Input', trackEventName, value);
    }
    
    // Always update the current field immediately
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // First check if we have a complete math expression
    if (/[+\-*/%&|^~<>]/.test(value) && !/\s$/.test(value)) {
      const cleanedValue = fieldName === 'hex' 
        ? value.replace(/0x/g, '').replace(/\s/g, '')
        : value.replace(/\s/g, '');
      const result = evaluateExpression(cleanedValue, base);
      if (result !== null) {
        const resultValues = convertNumber(result);
        const input = formatPart(value, result);
        setValues(formatCalculationResult(input, resultValues));
        return;
      }
    }

    // Split by spaces and handle each part
    const parts = value.split(' ');
    const conversions = parts.map(part => {
      // Check if this part has a math expression
      if (/[+\-*/%&|^~<>]/.test(part)) {
        const cleanedPart = fieldName === 'hex' ? part.replace(/0x/g, '') : part;
        const result = evaluateExpression(cleanedPart, base);
        if (result !== null) {
          const resultValues = convertNumber(result);
          return {
            input: formatPart(part, result),
            result: resultValues
          };
        }
        return {
          input: { decimal: '', hex: '', binary: '', ascii: '' },
          result: null
        };
      }

      // Regular number conversion
      const num = parseValue(part);
      if (num !== null) {
        const conversion = convertNumber(num);
        return {
          input: preserveOriginal(part, conversion),
          result: null
        };
      }
      
      // Empty part (space) or invalid number
      return {
        input: { decimal: '', hex: '', binary: '', ascii: '' },
        result: null
      };
    });

    // Combine all parts, preserving spaces exactly as they appear in the input
    const combinedValues: NumberValues = {
      decimal: conversions.map(p => p.result ? `${p.input.decimal}=${p.result.decimal}` : p.input.decimal).join(' '),
      hex: conversions.map(p => p.result ? `${p.input.hex}=${p.result.hex}` : p.input.hex).join(' '),
      binary: conversions.map(p => p.result ? `${p.input.binary}=${p.result.binary}` : p.input.binary).join(' '),
      ascii: conversions.filter(p => p.input.ascii).map(p => p.input.ascii).join('')
    };

    // Update the current field to preserve exact input
    combinedValues[fieldName] = value;

    setValues(combinedValues);
  }, []);

  const handleDecimalChange = useCallback((value: string) => {
    handleNumberChange(
      value,
      10,
      'decimal',
      'Decimal Change',
      (part) => {
        const num = parseInt(part);
        return isNaN(num) ? null : num;
      },
      (_part, _result) => ({
        decimal: _part,
        hex: _part.replace(/\d+/g, num => padHex(parseInt(num).toString(16))),
        binary: _part.replace(/\d+/g, num => padBinary(parseInt(num).toString(2))),
          ascii: ''
      }),
      (part, conversion) => conversion // Decimal preserves converted values
    );
  }, [handleNumberChange]);

  const handleHexChange = useCallback((value: string) => {
    handleNumberChange(
      value,
      16,
      'hex',
      'Hex Change',
      (part) => {
        const cleanHex = part.toLowerCase().replace(/^0x/, '');
        const num = parseInt(cleanHex, 16);
        return isNaN(num) ? null : num;
      },
      (_part, _result) => ({
              decimal: _part.replace(/0x[\da-f]+/gi, num => parseInt(num, 16).toString()),
              hex: _part,
              binary: _part.replace(/0x[\da-f]+/gi, num => padBinary(parseInt(num, 16).toString(2))),
              ascii: ''
      }),
      (part, conversion) => ({
            decimal: conversion.decimal,
        hex: part, // Preserve original hex string
            binary: conversion.binary,
            ascii: conversion.ascii
      })
    );
  }, [handleNumberChange]);

  const handleBinaryChange = useCallback((value: string) => {
    handleNumberChange(
      value,
      2,
      'binary',
      'Binary Change',
      (part) => {
        const num = parseInt(part, 2);
        return isNaN(num) ? null : num;
      },
      (_part, _result) => ({
              decimal: _part.replace(/[01]+/g, num => parseInt(num, 2).toString()),
              hex: _part.replace(/[01]+/g, num => padHex(parseInt(num, 2).toString(16))),
              binary: _part,
              ascii: ''
      }),
      (part, conversion) => ({
            decimal: conversion.decimal,
            hex: conversion.hex,
        binary: part, // Preserve original binary string
            ascii: conversion.ascii
      })
    );
  }, [handleNumberChange]);

  const handleAsciiChange = useCallback((value: string) => {
    // Track ASCII input
    if (value) {
      trackEvent('Input', 'ASCII Change', value);
    }
    
    if (value === '') {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    const chars = value.split('');
    const conversions = chars.map(char => {
      const charCode = char.charCodeAt(0);
      return convertNumber(charCode);
    });

    setValues({
      decimal: conversions.map(n => n.decimal).join(' '),
      hex: conversions.map(n => n.hex).join(' '),
      binary: conversions.map(n => n.binary).join(' '),
      ascii: value
    });
  }, []);

  const clearValues = useCallback(() => {
    // Track clear action
    trackEvent('Action', 'Clear Values');
    
    setValues({
      decimal: '',
      hex: '',
      binary: '',
      ascii: ''
    });
  }, []);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearValues();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [clearValues]);

  // Track theme changes
  const handleThemeChange = useCallback(() => {
    trackEvent('Settings', 'Theme Change', darkMode ? 'Light' : 'Dark');
    setDarkMode(prev => !prev);
  }, [darkMode]);

  return (
    <div className="app">
      <div className="converter">
        <h1 className="title">numberconverter.dev</h1>
        
        <div className="input-group">
          <NumberInput
            label="Decimal"
            value={values.decimal}
            placeholder="Enter decimal"
            onChange={handleDecimalChange}
            type="decimal"
            highlights={decimalHighlights}
            onMouseMove={(pos) => handleMouseMove('decimal', pos)}
            onMouseLeave={handleMouseLeave}
          />
          <NumberInput
            label="Hexadecimal"
            value={values.hex}
            placeholder="Enter hexadecimal"
            onChange={handleHexChange}
            type="hex"
            highlights={hexHighlights}
            onMouseMove={(pos) => handleMouseMove('hex', pos)}
            onMouseLeave={handleMouseLeave}
          />
          <NumberInput
            label="Binary"
            value={values.binary}
            placeholder="Enter binary"
            onChange={handleBinaryChange}
            type="binary"
            highlights={binaryHighlights}
            onMouseMove={(pos) => handleMouseMove('binary', pos)}
            onMouseLeave={handleMouseLeave}
          />
          <NumberInput
            label="ASCII"
            value={values.ascii}
            placeholder="Enter ascii"
            onChange={handleAsciiChange}
            type="ascii"
            highlights={asciiHighlights}
            onMouseMove={(pos) => handleMouseMove('ascii', pos)}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        <div className="controls">
          <button 
            className="control-button"
            onClick={handleThemeChange}
            aria-label="Toggle theme"
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </button>
          <button 
            className="control-button trash-button"
            onClick={clearValues}
            aria-label="Clear all values"
          >
            <DeleteOutlineIcon />
          </button>
        </div>
      </div>

      <div className="help-text">
        <span>{HOVER_TEXT}</span>
        <span>{OPERATORS_TEXT}</span>
      </div>

      {/* @brief Footer with Ko-fi link */}
      <footer className="footer">
        <a
          href="https://ko-fi.com/olsdev"
          target="_blank"
          rel="noopener noreferrer"
          className="kofi-link"
        >
          Buy me a Coffee on Ko-fi
        </a>
      </footer>
    </div>
  )
}

export default App
