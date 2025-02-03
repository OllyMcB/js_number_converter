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
  const [darkMode, setDarkMode] = useState(false);

  // Calculate highlights for each input type based on hover
  const getHighlights = (type: 'decimal' | 'hex' | 'binary' | 'ascii'): NumberInputHighlight[] => {
    if (!highlight) return [];

    // Split into individual numbers and track their positions
    const sourceNumbers = values[highlight.sourceType].split(' ');
    const targetNumbers = values[type].split(' ');
    
    // Find which number we're hovering over in the source
    let currentPos = 0;
    let sourceNumberIndex = -1;
    let relativePosition = -1;

    for (let i = 0; i < sourceNumbers.length; i++) {
      const start = currentPos;
      const end = start + sourceNumbers[i].length;
      
      if (highlight.position >= start && highlight.position < end) {
        sourceNumberIndex = i;
        relativePosition = highlight.position - start;
        break;
      }
      
      currentPos = end + 1; // +1 for the space
    }

    if (sourceNumberIndex === -1 || sourceNumberIndex >= targetNumbers.length) return [];

    // Calculate target number's starting position
    let targetStartPos = 0;
    for (let i = 0; i < sourceNumberIndex; i++) {
      targetStartPos += targetNumbers[i].length + 1; // +1 for the space
    }

    const highlights: NumberInputHighlight[] = [];
    
    if (highlight.sourceType === 'hex') {
      const hexValue = sourceNumbers[sourceNumberIndex];
      
      // Only highlight if hovering over actual hex digits (not 0x prefix)
      if (relativePosition >= 2 && relativePosition < hexValue.length) {
        const hexDigit = relativePosition - 2; // Adjust for 0x prefix
        const startBit = hexDigit * 4;
        
        if (type === 'binary') {
          // Highlight corresponding 4 bits in binary
          highlights.push({
            start: targetStartPos + startBit,
            end: targetStartPos + startBit + 4,
            color: '#ff69b4' // pink
          });
        } else if (type === 'hex') {
          // Highlight the hex digit itself
          highlights.push({
            start: targetStartPos + relativePosition,
            end: targetStartPos + relativePosition + 1,
            color: '#ff69b4' // pink
          });
        } else if (type === 'decimal') {
          // Highlight the decimal value
          highlights.push({
            start: targetStartPos,
            end: targetStartPos + targetNumbers[sourceNumberIndex].length,
            color: '#ff69b4' // pink
          });
        }
      }
    } else if (highlight.sourceType === 'binary') {
      const binValue = sourceNumbers[sourceNumberIndex];
      const hexDigit = Math.floor(relativePosition / 4);
      
      if (type === 'binary') {
        // Highlight the binary digit group
        const groupStart = Math.floor(relativePosition / 4) * 4;
        highlights.push({
          start: targetStartPos + groupStart,
          end: targetStartPos + groupStart + 4,
          color: '#ff69b4' // pink
        });
      } else if (type === 'hex') {
        // Highlight corresponding hex digit
        highlights.push({
          start: targetStartPos + hexDigit + 2, // +2 for 0x
          end: targetStartPos + hexDigit + 3,
          color: '#ff69b4' // pink
        });
      } else if (type === 'decimal') {
        // Highlight the decimal value
        highlights.push({
          start: targetStartPos,
          end: targetStartPos + targetNumbers[sourceNumberIndex].length,
          color: '#ff69b4' // pink
        });
      }
    } else if (highlight.sourceType === 'decimal') {
      if (relativePosition < sourceNumbers[sourceNumberIndex].length) {
        if (type === 'decimal') {
          // Highlight the decimal digit
          highlights.push({
            start: targetStartPos + relativePosition,
            end: targetStartPos + relativePosition + 1,
            color: '#ff69b4' // pink
          });
        } else if (type === 'hex' || type === 'binary') {
          // Highlight the full corresponding value
          highlights.push({
            start: targetStartPos,
            end: targetStartPos + targetNumbers[sourceNumberIndex].length,
            color: '#ff69b4' // pink
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

      // Replace bitwise operators with spaces around them for proper parsing
      const formattedExpr = expression
        .replace(/([&|^~])/g, ' $1 ')
        .replace(/(<<|>>)/g, ' $1 ')
        .replace(/([+\-*/%])/g, ' $1 ')
        .trim();

      const tokens = formattedExpr.split(' ').filter(t => t.length > 0);
      
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

  const formatCalculationResult = (input: NumberValues, result: NumberValues): NumberValues => ({
    decimal: `${input.decimal} = ${result.decimal}`,
    hex: `${input.hex} = ${result.hex}`,
    binary: `${input.binary} = ${result.binary}`,
    ascii: result.ascii // Don't show calculation for ASCII
  });

  const handleDecimalChange = (value: string) => {
    // Always update the decimal field immediately
    setValues({ ...values, decimal: value });

    // Only check for calculation if we have an operator
    if (/[+\-*/%&|^~<>]/.test(value)) {
      const result = evaluateExpression(value, 10);
      if (result !== null) {
        const resultValues = convertNumber(result);
        setValues(formatCalculationResult({ 
          decimal: value,
          hex: value.replace(/\d+/g, num => padHex(parseInt(num).toString(16))),
          binary: value.replace(/\d+/g, num => padBinary(parseInt(num).toString(2))),
          ascii: ''
        }, resultValues));
        return;
      }
    }

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // Convert numbers and preserve spaces exactly as they appear
    const numbers = value.split(' ');
    const conversions = numbers.map(n => {
      if (n === '') return { hex: '', binary: '', ascii: '' }; // Preserve empty strings for consecutive spaces
      const num = parseInt(n);
      return !isNaN(num) ? convertNumber(num) : { hex: '', binary: '', ascii: '' };
    });

    setValues({
      decimal: value,
      hex: conversions.map(n => n.hex).join(' '),
      binary: conversions.map(n => n.binary).join(' '),
      ascii: conversions.filter(n => n.ascii).map(n => n.ascii).join('')
    });
  };

  const handleHexChange = (value: string) => {
    // Always update the hex field immediately
    setValues({ ...values, hex: value });

    // Check for calculation first
    const cleanedValue = value.replace(/0x/g, ''); // Remove all 0x prefixes for calculation
    const result = evaluateExpression(cleanedValue, 16);
    if (result !== null && /[+\-*/%&|^~<>]/.test(value)) {
      const resultValues = convertNumber(result);
      setValues(formatCalculationResult({ 
        decimal: value.replace(/0x[\da-f]+/gi, num => parseInt(num, 16).toString()),
        hex: value.replace(/0x[\da-f]+/gi, num => padHex(parseInt(num, 16).toString(16))),
        binary: value.replace(/0x[\da-f]+/gi, num => padBinary(parseInt(num, 16).toString(2))),
        ascii: ''
      }, resultValues));
      return;
    }

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // Convert numbers and preserve spaces exactly as they appear
    const numbers = value.split(' ');
    const conversions = numbers.map(n => {
      if (n === '') return { decimal: '', binary: '', ascii: '' }; // Preserve empty strings for consecutive spaces
      const cleanHex = n.toLowerCase().replace(/^0x/, '');
      const num = parseInt(cleanHex, 16);
      return !isNaN(num) ? convertNumber(num) : { decimal: '', binary: '', ascii: '' };
    });

    setValues({
      decimal: conversions.map(n => n.decimal).join(' '),
      hex: value,
      binary: conversions.map(n => n.binary).join(' '),
      ascii: conversions.filter(n => n.ascii).map(n => n.ascii).join('')
    });
  };

  const handleBinaryChange = (value: string) => {
    // Always update the binary field immediately
    setValues({ ...values, binary: value });

    // Check for calculation first
    const result = evaluateExpression(value, 2);
    if (result !== null && /[+\-*/%&|^~<>]/.test(value)) {
      const resultValues = convertNumber(result);
      setValues(formatCalculationResult({ 
        decimal: value.replace(/[01]+/g, num => parseInt(num, 2).toString()),
        hex: value.replace(/[01]+/g, num => '0x' + parseInt(num, 2).toString(16).toUpperCase()),
        binary: value.replace(/[01]+/g, num => padBinary(parseInt(num, 2).toString(2))),
        ascii: ''
      }, resultValues));
      return;
    }

    // Handle empty input
    if (!value) {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' });
      return;
    }

    // Convert numbers and preserve spaces exactly as they appear
    const numbers = value.split(' ');
    const conversions = numbers.map(n => {
      if (n === '') return { decimal: '', hex: '', ascii: '' }; // Preserve empty strings for consecutive spaces
      const num = parseInt(n, 2);
      return !isNaN(num) ? convertNumber(num) : { decimal: '', hex: '', ascii: '' };
    });

    setValues({
      decimal: conversions.map(n => n.decimal).join(' '),
      hex: conversions.map(n => n.hex).join(' '),
      binary: value,
      ascii: conversions.filter(n => n.ascii).map(n => n.ascii).join('')
    });
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
