import { useState, useEffect } from 'react'
import { 
  Container, 
  Paper, 
  IconButton, 
  Typography, 
  Box,
  ThemeProvider,
  CssBaseline,
  useTheme,
  Tooltip
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { NumberInput } from './components/NumberInput/NumberInput'
import { lightTheme, darkTheme } from './theme'
import './App.scss'

interface NumberValues {
  decimal: string
  hex: string
  binary: string
  ascii: string
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
`;

function App() {
  const [values, setValues] = useState<NumberValues>({
    decimal: '',
    hex: '',
    binary: '',
    ascii: ''
  })
  const [darkMode, setDarkMode] = useState(false)
  const theme = useTheme()

  const padHex = (hexStr: string): string => {
    // Remove '0x' prefix if it exists
    const hex = hexStr.replace(/^0x/, '');
    // If the length is odd, pad with one zero
    return '0x' + (hex.length % 2 === 1 ? '0' + hex : hex);
  };

  const convertNumber = (num: number): NumberValues => ({
    decimal: num.toString(),
    hex: padHex(num.toString(16).toUpperCase()),
    binary: num.toString(2).padStart(8, '0'),
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
    console.log('Decimal Change Start:', { value });
    
    // Always update the decimal field immediately
    setValues({ ...values, decimal: value });

    // Only check for calculation if we have an operator
    if (/[+\-*/%&|^~<>]/.test(value)) {
      console.log('Detected operator, evaluating:', { value });
      const result = evaluateExpression(value, 10);
      if (result !== null) {
        const resultValues = convertNumber(result);
        setValues(formatCalculationResult({ 
          decimal: value,
          hex: value.replace(/\d+/g, num => '0x' + parseInt(num).toString(16).toUpperCase()),
          binary: value.replace(/\d+/g, num => parseInt(num).toString(2)),
          ascii: ''
        }, resultValues));
        return;
      }
    }

    // Handle normal conversion
    if (value.trim() === '') {
      console.log('Empty value, clearing fields');
      setValues({ decimal: value, hex: '', binary: '', ascii: '' });
      return;
    }

    // Only convert valid numbers, preserve original input
    const numbers = value.split(' ');
    console.log('Split numbers:', { numbers });
    
    const conversions = numbers.map(n => {
      const trimmed = n.trim();
      console.log('Processing number:', { original: n, trimmed });
      if (!trimmed) return null; // Preserve empty spaces
      const num = parseInt(trimmed);
      return !isNaN(num) ? convertNumber(num) : null;
    });

    // Only update other fields if we have valid conversions
    if (conversions.some(c => c !== null)) {
      console.log('Setting converted values:', {
        decimal: value,
        hex: conversions.map(n => n?.hex || '').join(' '),
        binary: conversions.map(n => n?.binary || '').join(' ')
      });
      
      setValues({
        decimal: value, // Preserve original input
        hex: conversions.map(n => n?.hex || '').join(' '),
        binary: conversions.map(n => n?.binary || '').join(' '),
        ascii: conversions.filter(n => n !== null).map(n => n?.ascii).join('')
      });
    }
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
        hex: value,
        binary: value.replace(/0x[\da-f]+/gi, num => parseInt(num, 16).toString(2)),
        ascii: ''
      }, resultValues));
      return;
    }

    // Handle normal conversion
    if (value.trim() === '') {
      setValues({ decimal: '', hex: value, binary: '', ascii: '' });
      return;
    }

    // Only convert valid numbers, preserve original input
    const numbers = value.split(' ');
    const conversions = numbers.map(n => {
      const trimmed = n.trim();
      if (!trimmed) return null; // Preserve empty spaces
      const cleanHex = trimmed.toLowerCase().replace(/^0x/, '');
      const num = parseInt(cleanHex, 16);
      return !isNaN(num) ? convertNumber(num) : null;
    });

    // Only update other fields if we have valid conversions
    if (conversions.some(c => c !== null)) {
      setValues({
        decimal: conversions.map(n => n?.decimal || '').join(' '),
        hex: value, // Preserve original input
        binary: conversions.map(n => n?.binary || '').join(' '),
        ascii: conversions.filter(n => n !== null).map(n => n?.ascii).join('')
      });
    }
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
        binary: value,
        ascii: ''
      }, resultValues));
      return;
    }

    // Handle normal conversion
    if (value.trim() === '') {
      setValues({ decimal: '', hex: '', binary: value, ascii: '' });
      return;
    }

    // Only convert valid numbers, preserve original input
    const numbers = value.split(' ');
    const conversions = numbers.map(n => {
      const trimmed = n.trim();
      if (!trimmed) return null; // Preserve empty spaces
      const num = parseInt(trimmed, 2);
      return !isNaN(num) ? convertNumber(num) : null;
    });

    // Only update other fields if we have valid conversions
    if (conversions.some(c => c !== null)) {
      setValues({
        decimal: conversions.map(n => n?.decimal || '').join(' '),
        hex: conversions.map(n => n?.hex || '').join(' '),
        binary: value, // Preserve original input
        ascii: conversions.filter(n => n !== null).map(n => n?.ascii).join('')
      });
    }
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

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'all 0.3s ease',
        padding: '2rem 0'
      }}>
        <Container maxWidth="md" className="app">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ color: 'text.primary', mb: 4 }}
          >
            Number Converter
          </Typography>
          <Paper 
            elevation={0} 
            className="converter"
            sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ p: 3, pb: 1 }}>
              <NumberInput
                label="Decimal"
                value={values.decimal}
                placeholder="Enter decimal number(s)"
                onChange={handleDecimalChange}
                type="decimal"
              />
              <NumberInput
                label="Hex"
                value={values.hex}
                placeholder="Enter hex number(s)"
                onChange={handleHexChange}
                type="hex"
              />
              <NumberInput
                label="Binary"
                value={values.binary}
                placeholder="Enter binary number(s)"
                onChange={handleBinaryChange}
                type="binary"
              />
              <NumberInput
                label="ASCII"
                value={values.ascii}
                placeholder="Enter ASCII character(s)"
                onChange={handleAsciiChange}
                type="ascii"
              />
            </Box>
            <Box className="controls">
              <Tooltip 
                title={HELP_TEXT} 
                arrow 
                placement="top"
                enterDelay={200}
                leaveDelay={200}
              >
                <IconButton className="help" size="large">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <IconButton size="large">
                <SettingsIcon />
              </IconButton>
              <IconButton 
                onClick={() => setDarkMode(!darkMode)} 
                size="large"
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
