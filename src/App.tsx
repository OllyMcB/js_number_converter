import { useState, useEffect } from 'react'
import { NumberInput } from './components/NumberInput/NumberInput'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { TrashIcon } from './components/Icons/TrashIcon'
import './App.scss'

interface NumberValues {
  decimal: string
  hex: string
  binary: string
  ascii: string
}

interface HighlightInfo {
  sourceType: 'decimal' | 'hex' | 'binary' | 'ascii';
  position: number;
  length: number;
}

interface NumberInputHighlight {
  start: number;
  end: number;
  color: string;
}

interface CalculationResult {
  input: NumberValues
  result: NumberValues
}

const HELP_TEXT = `
Number Converter allows you to:
• Convert between decimal, hexadecimal, binary, and ASCII
• Enter multiple numbers separated by spaces
• Use '0x' prefix for hex numbers
• Perform calculations with these operators:
  + - * / % & | ^ << >> ~
• See ASCII characters for each number
• Toggle between light and dark mode
• Hover over numbers to see corresponding bits
`;

function App() {
  const [values, setValues] = useState<NumberValues>({
    decimal: '',
    hex: '',
    binary: '',
    ascii: ''
  });
  const [highlight, setHighlight] = useState<HighlightInfo | null>(null);
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate highlights for each input type based on hover
  const getHighlights = (type: 'decimal' | 'hex' | 'binary' | 'ascii'): NumberInputHighlight[] => {
    if (!highlight) return [];

    const highlights: NumberInputHighlight[] = [];

    // Special handling for ASCII source
    if (highlight.sourceType === 'ascii') {
      const charIndex = highlight.position;
      const char = values.ascii[charIndex];
      if (!char) return [];

      const charCode = char.charCodeAt(0);
      const binaryStr = charCode.toString(2).padStart(8, '0');
      const hexStr = '0x' + charCode.toString(16).toUpperCase().padStart(2, '0');
      const decimalStr = charCode.toString();

      // Calculate positions in other representations
      const decimalPos = values.decimal.split(' ').findIndex(n => n === decimalStr);
      const hexPos = values.hex.split(' ').findIndex(n => n === hexStr);
      const binaryPos = values.binary.split(' ').findIndex(n => n === binaryStr);

      if (type === 'ascii') {
        highlights.push({
          start: charIndex,
          end: charIndex + 1,
          color: '#ff3399'
        });
      } else if (type === 'decimal' && decimalPos !== -1) {
        const pos = values.decimal.split(' ').slice(0, decimalPos).join(' ').length + (decimalPos > 0 ? 1 : 0);
        highlights.push({
          start: pos,
          end: pos + decimalStr.length,
          color: '#ff3399'
        });
      } else if (type === 'hex' && hexPos !== -1) {
        const pos = values.hex.split(' ').slice(0, hexPos).join(' ').length + (hexPos > 0 ? 1 : 0);
        highlights.push({
          start: pos,
          end: pos + hexStr.length,
          color: '#ff3399'
        });
      } else if (type === 'binary' && binaryPos !== -1) {
        const pos = values.binary.split(' ').slice(0, binaryPos).join(' ').length + (binaryPos > 0 ? 1 : 0);
        highlights.push({
          start: pos,
          end: pos + binaryStr.length,
          color: '#ff3399'
        });
      }
      return highlights;
    }

    // Original highlighting logic for non-ASCII sources
    const sourceNumbers = values[highlight.sourceType].split(/([+\-*/%&|^~<> ])/);
    const targetNumbers = values[type].split(/([+\-*/%&|^~<> ])/);
    
    // Find which number we're hovering over in the source
    let currentPos = 0;
    let sourceNumberIndex = -1;
    let relativePosition = -1;

    for (let i = 0; i < sourceNumbers.length; i++) {
      const start = currentPos;
      const end = start + sourceNumbers[i].length;
      
      if (highlight.position >= start && highlight.position < end) {
        // Only highlight actual numbers, not operators or spaces
        if (!/^[+\-*/%&|^~<> ]$/.test(sourceNumbers[i])) {
          sourceNumberIndex = i;
          relativePosition = highlight.position - start;
        }
        break;
      }
      
      currentPos = end;
    }

    if (sourceNumberIndex === -1) return [];

    // Calculate target number's starting position
    let targetStartPos = 0;
    let targetNumberIndex = 0;
    
    for (let i = 0; i < targetNumbers.length; i++) {
      if (!/^[+\-*/%&|^~<> ]$/.test(targetNumbers[i])) {
        if (targetNumberIndex === Math.floor(sourceNumberIndex / 2)) {
          break;
        }
        targetNumberIndex++;
      }
      targetStartPos += targetNumbers[i].length;
    }

    const sourceNumber = sourceNumbers[sourceNumberIndex];
    const targetNumber = targetNumbers.find((_, i) => i === sourceNumberIndex);

    if (!targetNumber) return [];
    
    if (highlight.sourceType === 'hex') {
      // Only highlight if hovering over actual hex digits (not 0x prefix)
      if (relativePosition >= 2 && relativePosition < sourceNumber.length) {
        const hexDigit = relativePosition - 2; // Adjust for 0x prefix
        const startBit = hexDigit * 4;
        
        if (type === 'binary') {
          highlights.push({
            start: targetStartPos + startBit,
            end: targetStartPos + startBit + 4,
            color: '#ff3399'
          });
        } else if (type === 'hex') {
          highlights.push({
            start: targetStartPos + relativePosition,
            end: targetStartPos + relativePosition + 1,
            color: '#ff3399'
          });
        } else if (type === 'decimal') {
          highlights.push({
            start: targetStartPos,
            end: targetStartPos + targetNumber.length,
            color: '#ff3399'
          });
        }
      }
    } else if (highlight.sourceType === 'binary') {
      const groupStart = Math.floor(relativePosition / 4) * 4;
      
      if (type === 'binary') {
        highlights.push({
          start: targetStartPos + groupStart,
          end: targetStartPos + groupStart + 4,
          color: '#ff3399'
        });
      } else if (type === 'hex') {
        const hexDigit = Math.floor(relativePosition / 4);
        highlights.push({
          start: targetStartPos + hexDigit + 2,
          end: targetStartPos + hexDigit + 3,
          color: '#ff3399'
        });
      } else if (type === 'decimal') {
        highlights.push({
          start: targetStartPos,
          end: targetStartPos + targetNumber.length,
          color: '#ff3399'
        });
      }
    } else if (highlight.sourceType === 'decimal') {
      if (relativePosition < sourceNumber.length) {
        if (type === 'decimal') {
          highlights.push({
            start: targetStartPos + relativePosition,
            end: targetStartPos + relativePosition + 1,
            color: '#ff3399'
          });
        } else if (type === 'hex' || type === 'binary') {
          highlights.push({
            start: targetStartPos,
            end: targetStartPos + targetNumber.length,
            color: '#ff3399'
          });
        }
      }
    }

    return highlights;
  };

  const handleMouseMove = (type: 'decimal' | 'hex' | 'binary' | 'ascii', position: number) => {
    setHighlight({ sourceType: type, position, length: 1 });
  };

  const handleMouseLeave = () => {
    setHighlight(null);
  };

  const padHex = (hexStr: string): string => {
    // Remove '0x' prefix if it exists
    const hex = hexStr.replace(/^0x/, '').toUpperCase();
    // If the length is odd, pad with one zero
    const paddedHex = hex.length % 2 === 1 ? '0' + hex : hex;
    // Ensure at least 2 digits
    const finalHex = paddedHex.length === 0 ? '00' : paddedHex;
    // Add 0x prefix
    return '0x' + finalHex;
  };

  const padBinary = (binStr: string): string => {
    // Calculate how many bits we need
    const len = binStr.length;
    const targetLength = Math.ceil(len / 8) * 8;
    return binStr.padStart(targetLength, '0');
  };

  const convertNumber = (num: number): NumberValues => ({
    decimal: num.toString(),
    hex: padHex(num.toString(16).toUpperCase()),
    binary: padBinary(num.toString(2)),
    ascii: String.fromCharCode(num)
  });

  const evaluateExpression = (expression: string, base: number = 10): number | null => {
    try {
      // First check if we actually have an operator
      const hasOperator = /[+\-*/%&|^~<>]/.test(expression);
      if (!hasOperator) {
        return null;
      }

      // First handle shift operators as they're two characters
      const shiftReplaced = expression
        .replace(/>>/g, '\u0001') // Use special characters as temporary replacements
        .replace(/<</g, '\u0002');

      // Now split by single operators while preserving them
      const tokens = shiftReplaced
        .split(/([+\-*/%&|^~])/)
        .map(token => 
          token
            .replace('\u0001', '>>')
            .replace('\u0002', '<<')
            .trim()
        )
        .filter(t => t !== '');
      
      // Handle unary operators first
      const processedTokens = tokens.map((token, i) => {
        if (token === '~') {
          const nextNum = parseInt(tokens[i + 1], base);
          if (isNaN(nextNum)) return '';
          tokens[i + 1] = ''; // Clear the next token as it's been used
          return (~nextNum).toString();
        }
        return token;
      }).filter(t => t !== '');

      // Now evaluate the expression
      let result = parseInt(processedTokens[0], base);
      if (isNaN(result)) return null;

      for (let i = 1; i < processedTokens.length; i += 2) {
        const operator = processedTokens[i];
        const nextNum = parseInt(processedTokens[i + 1], base);
        
        if (isNaN(nextNum)) return null;

        switch (operator) {
          case '+': result += nextNum; break;
          case '-': result -= nextNum; break;
          case '*': result *= nextNum; break;
          case '/': result = Math.floor(result / nextNum); break;
          case '%': result %= nextNum; break;
          case '&': result &= nextNum; break;
          case '|': result |= nextNum; break;
          case '^': result ^= nextNum; break;
          case '<<': result <<= nextNum; break;
          case '>>': result >>= nextNum; break;
          default: return null;
        }
      }
      
      return result;
    } catch {
      return null;
    }
  };

  const formatCalculationResult = (input: NumberValues, result: NumberValues): NumberValues => {
    // Remove any trailing spaces before adding the equals sign
    return {
      decimal: `${input.decimal.trimEnd()}=${result.decimal}`,
      hex: `${input.hex.trimEnd()}=${result.hex}`,
      binary: `${input.binary.trimEnd()}=${result.binary}`,
      ascii: result.ascii
    };
  };

  /**
   * @brief Checks if a math expression is complete and ready for evaluation
   */
  const isCompleteMathExpression = (value: string): boolean => {
    // Must have an operator
    if (!/[+\-*/%&|^~<>]/.test(value)) return false;
    
    // Must end with a number
    if (!/\d$/.test(value)) return false;
    
    // For expressions with binary operators, must have numbers on both sides
    const parts = value.split(/([+\-*/%&|^<>])/).filter(Boolean);
    if (parts.length < 2) return false;
    
    // Special case for unary operator ~
    if (parts[0] === '~') return /^\d+$/.test(parts[1]);
    
    // For binary operators, check both sides are numbers
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];
    return /^\d+$/.test(firstPart) && /^\d+$/.test(lastPart);
  };

  const handleDecimalChange = (value: string) => {
    // Always update the decimal field immediately
    setValues({ ...values, decimal: value });

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
  };

  const handleHexChange = (value: string) => {
    // Always update the hex field immediately
    setValues({ ...values, hex: value });

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
          decimal: value.replace(/0x[\da-f]+/gi, num => parseInt(num, 16).toString()),
          hex: value,
          binary: value.replace(/0x[\da-f]+/gi, num => padBinary(parseInt(num, 16).toString(2))),
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
              decimal: part.replace(/0x[\da-f]+/gi, num => parseInt(num, 16).toString()),
              hex: part,
              binary: part.replace(/0x[\da-f]+/gi, num => padBinary(parseInt(num, 16).toString(2))),
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
  };

  const handleBinaryChange = (value: string) => {
    // Always update the binary field immediately
    setValues({ ...values, binary: value });

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
  };

  const handleAsciiChange = (value: string) => {
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
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const clearValues = () => 
  {
    setValues({
      decimal: '',
      hex: '',
      binary: '',
      ascii: ''
    });
  };

  return (
    <div className="app">
      <div className="converter">
        <h1 className="title">Number Converter</h1>
        
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
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </button>
          <button 
            className="trash-button"
            onClick={clearValues}
            aria-label="Clear all values"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
