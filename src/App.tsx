import { useState, useEffect, useCallback } from 'react'
import { NumberInput } from './components/NumberInput/NumberInput'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { trackEvent } from './analytics'
import { getHighlights as getHighlightsUtil } from './utils/highlighting'
import { 
  padHex, 
  padBinary, 
  convertNumber, 
  formatCalculationResult,
  convertHexExpressionToDecimal,
  convertHexExpressionToBinary
} from './utils/conversion'
import { evaluateExpression } from './utils/expression'
import { NumberValues, HighlightInfo, NumberInputHighlight } from './types'
import { HOVER_TEXT, OPERATORS_TEXT } from './constants'
import './App.scss'

/**
 * @brief Main application component for number conversion
 * @description Handles conversion between decimal, hexadecimal, binary, and ASCII formats
 * with support for mathematical expressions and cross-field highlighting
 */
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

  /**
   * @brief Calculates highlights for each input type based on hover position
   * @param type - The input type to calculate highlights for
   * @returns Array of highlight ranges
   */
  const getHighlights = useCallback((type: 'decimal' | 'hex' | 'binary' | 'ascii'): NumberInputHighlight[] => {
    if (!highlight) return [];

    // Use the utility function which handles all cases correctly
    return getHighlightsUtil(values, highlight, type);
  }, [values, highlight]);

  /**
   * @brief Handles mouse move events to set highlight position
   * @param type - The source input type
   * @param position - Character position in the input
   */
  const handleMouseMove = useCallback((type: 'decimal' | 'hex' | 'binary' | 'ascii', position: number) => {
    setHighlight({ sourceType: type, position, length: 1 });
  }, []);

  /**
   * @brief Handles mouse leave events to clear highlights
   */
  const handleMouseLeave = useCallback(() => {
    setHighlight(null);
  }, []);

  /**
   * @brief Handles decimal input changes and converts to other formats
   * @param value - The decimal input string
   */
  const handleDecimalChange = useCallback((value: string) => {
    // Track decimal input
    if (value) {
      trackEvent('Input', 'Decimal Change', value)
    }
    
    // Always update the decimal field immediately
    setValues(prev => ({ ...prev, decimal: value }));

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // First check if we have a complete math expression
    if (/[+\-*/%&|^~<>]/.test(value) && !/\s$/.test(value)) {
      const result = evaluateExpression(value.replace(/\s/g, ''), 10);
      if (result !== null) {
        const resultValues = convertNumber(result);
        const input = {
          decimal: value,
          hex: value.replace(/\d+/g, num => padHex(parseInt(num).toString(16))),
          binary: value.replace(/\d+/g, num => padBinary(parseInt(num).toString(2))),
          ascii: ''
        };
        setValues(formatCalculationResult(input, resultValues));
        return;
      }
    }

    // If we get here, either there's no math expression or it's incomplete
    // Split by spaces and handle each part
    const parts = value.split(' ');
    const conversions = parts.map(part => {
      // Check if this part has a math expression
      if (/[+\-*/%&|^~<>]/.test(part)) {
        const result = evaluateExpression(part, 10);
        if (result !== null) {
          const resultValues = convertNumber(result);
          return {
            input: {
              decimal: part,
              hex: part.replace(/\d+/g, num => padHex(parseInt(num).toString(16))),
              binary: part.replace(/\d+/g, num => padBinary(parseInt(num).toString(2))),
              ascii: ''
            },
            result: resultValues
          };
        }
        return {
          input: { decimal: part, hex: '', binary: '', ascii: '' },
          result: null
        };
      }

      // Regular number conversion
      const num = parseInt(part);
      if (!isNaN(num)) {
        const conversion = convertNumber(num);
        return {
          input: conversion,
          result: null
        };
      }
      
      // Empty part (space) or invalid number
      return {
        input: { decimal: part, hex: '', binary: '', ascii: '' },
        result: null
      };
    });

    // Combine all parts, preserving spaces exactly as they appear in the input
    const combinedValues = {
      decimal: value,
      hex: conversions.map(p => p.result ? `${p.input.hex}=${p.result.hex}` : p.input.hex).join(' '),
      binary: conversions.map(p => p.result ? `${p.input.binary}=${p.result.binary}` : p.input.binary).join(' '),
      ascii: conversions.filter(p => p.input.ascii).map(p => p.input.ascii).join('')
    };

    setValues(combinedValues);
  }, []);

  /**
   * @brief Handles hexadecimal input changes and converts to other formats
   * @param value - The hexadecimal input string
   */
  const handleHexChange = useCallback((value: string) => {
    // Track hex input
    if (value) {
      trackEvent('Input', 'Hex Change', value)
    }
    
    // Always update the hex field immediately
    setValues(prev => ({ ...prev, hex: value }));

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // First check if we have a complete math expression
    if (/[+\-*/%&|^~<>]/.test(value) && !/\s$/.test(value)) {
      const cleanedValue = value.replace(/0x/g, '').replace(/\s/g, '');
      const result = evaluateExpression(cleanedValue, 16);
      if (result !== null) {
        const resultValues = convertNumber(result);
        const input = {
          decimal: convertHexExpressionToDecimal(value),
          hex: value,
          binary: convertHexExpressionToBinary(value),
          ascii: ''
        };
        setValues(formatCalculationResult(input, resultValues));
        return;
      }
    }

    // If we get here, either there's no math expression or it's incomplete
    // Split by spaces and handle each part
    const parts = value.split(' ');
    const conversions = parts.map(part => {
      // Check if this part has a math expression
      if (/[+\-*/%&|^~<>]/.test(part)) {
        const cleanedValue = part.replace(/0x/g, '');
        const result = evaluateExpression(cleanedValue, 16);
        if (result !== null) {
          const resultValues = convertNumber(result);
          return {
            input: {
              decimal: convertHexExpressionToDecimal(part),
              hex: part,
              binary: convertHexExpressionToBinary(part),
              ascii: ''
            },
            result: resultValues
          };
        }
        return {
          input: { decimal: '', hex: part, binary: '', ascii: '' },
          result: null
        };
      }

      // Regular number conversion
      const cleanHex = part.toLowerCase().replace(/^0x/, '');
      const num = parseInt(cleanHex, 16);
      if (!isNaN(num)) {
        const conversion = convertNumber(num);
        return {
          input: {
            decimal: conversion.decimal,
            hex: part,
            binary: conversion.binary,
            ascii: conversion.ascii
          },
          result: null
        };
      }
      
      // Empty part (space) or invalid number
      return {
        input: { decimal: '', hex: part, binary: '', ascii: '' },
        result: null
      };
    });

    // Combine all parts, preserving spaces exactly as they appear in the input
    const combinedValues = {
      decimal: conversions.map(p => p.result ? `${p.input.decimal}=${p.result.decimal}` : p.input.decimal).join(' '),
      hex: value,
      binary: conversions.map(p => p.result ? `${p.input.binary}=${p.result.binary}` : p.input.binary).join(' '),
      ascii: conversions.filter(p => p.input.ascii).map(p => p.input.ascii).join('')
    };

    setValues(combinedValues);
  }, []);

  /**
   * @brief Handles binary input changes and converts to other formats
   * @param value - The binary input string
   */
  const handleBinaryChange = useCallback((value: string) => {
    // Track binary input
    if (value) {
      trackEvent('Input', 'Binary Change', value)
    }
    
    // Always update the binary field immediately
    setValues(prev => ({ ...prev, binary: value }));

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // First check if we have a complete math expression
    if (/[+\-*/%&|^~<>]/.test(value) && !/\s$/.test(value)) {
      const result = evaluateExpression(value.replace(/\s/g, ''), 2);
      if (result !== null) {
        const resultValues = convertNumber(result);
        const input = {
          decimal: value.replace(/[01]+/g, num => parseInt(num, 2).toString()),
          hex: value.replace(/[01]+/g, num => padHex(parseInt(num, 2).toString(16))),
          binary: value,
          ascii: ''
        };
        setValues(formatCalculationResult(input, resultValues));
        return;
      }
    }

    // If we get here, either there's no math expression or it's incomplete
    // Split by spaces and handle each part
    const parts = value.split(' ');
    const conversions = parts.map(part => {
      // Check if this part has a math expression
      if (/[+\-*/%&|^~<>]/.test(part)) {
        const result = evaluateExpression(part, 2);
        if (result !== null) {
          const resultValues = convertNumber(result);
          return {
            input: {
              decimal: part.replace(/[01]+/g, num => parseInt(num, 2).toString()),
              hex: part.replace(/[01]+/g, num => padHex(parseInt(num, 2).toString(16))),
              binary: part,
              ascii: ''
            },
            result: resultValues
          };
        }
        return {
          input: { decimal: '', hex: '', binary: part, ascii: '' },
          result: null
        };
      }

      // Regular number conversion
      const num = parseInt(part, 2);
      if (!isNaN(num)) {
        const conversion = convertNumber(num);
        return {
          input: {
            decimal: conversion.decimal,
            hex: conversion.hex,
            binary: part,
            ascii: conversion.ascii
          },
          result: null
        };
      }
      
      // Empty part (space) or invalid number
      return {
        input: { decimal: '', hex: '', binary: part, ascii: '' },
        result: null
      };
    });

    // Combine all parts, preserving spaces exactly as they appear in the input
    const combinedValues = {
      decimal: conversions.map(p => p.result ? `${p.input.decimal}=${p.result.decimal}` : p.input.decimal).join(' '),
      hex: conversions.map(p => p.result ? `${p.input.hex}=${p.result.hex}` : p.input.hex).join(' '),
      binary: value,
      ascii: conversions.filter(p => p.input.ascii).map(p => p.input.ascii).join('')
    };

    setValues(combinedValues);
  }, []);

  /**
   * @brief Handles ASCII input changes and converts to other formats
   * @param value - The ASCII input string
   */
  const handleAsciiChange = useCallback((value: string) => {
    // Track ASCII input
    if (value) {
      trackEvent('Input', 'ASCII Change', value)
    }
    
    if (value === '') {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' })
      return
    }

    const chars = value.split('')
    const conversions = chars.map(char => {
      const charCode = char.charCodeAt(0)
      return convertNumber(charCode)
    })

    setValues({
      decimal: conversions.map(n => n.decimal).join(' '),
      hex: conversions.map(n => n.hex).join(' '),
      binary: conversions.map(n => n.binary).join(' '),
      ascii: value
    })
  }, [])

  /**
   * @brief Clears all input values and resets the converter
   */
  const clearValues = useCallback(() => {
    // Track clear action
    trackEvent('Action', 'Clear Values')
    
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

  /**
   * @brief Handles theme toggle between dark and light mode
   */
  const handleThemeChange = useCallback(() => {
    trackEvent('Settings', 'Theme Change', darkMode ? 'Light' : 'Dark')
    setDarkMode(!darkMode)
  }, [darkMode])

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
            highlights={getHighlights('decimal')}
            onMouseMove={(pos) => handleMouseMove('decimal', pos)}
            onMouseLeave={handleMouseLeave}
          />
          <NumberInput
            label="Hexadecimal"
            value={values.hex}
            placeholder="Enter hexadecimal"
            onChange={handleHexChange}
            type="hex"
            highlights={getHighlights('hex')}
            onMouseMove={(pos) => handleMouseMove('hex', pos)}
            onMouseLeave={handleMouseLeave}
          />
          <NumberInput
            label="Binary"
            value={values.binary}
            placeholder="Enter binary"
            onChange={handleBinaryChange}
            type="binary"
            highlights={getHighlights('binary')}
            onMouseMove={(pos) => handleMouseMove('binary', pos)}
            onMouseLeave={handleMouseLeave}
          />
          <NumberInput
            label="ASCII"
            value={values.ascii}
            placeholder="Enter ascii"
            onChange={handleAsciiChange}
            type="ascii"
            highlights={getHighlights('ascii')}
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
