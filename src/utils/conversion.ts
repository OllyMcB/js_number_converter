/**
 * @brief Number conversion utilities for converting between different number formats
 */

import { NumberValues } from '../types';

/**
 * @brief Pads a hexadecimal string to ensure it has an even number of digits and includes 0x prefix
 */
export const padHex = (hexStr: string): string => {
  // Remove '0x' prefix if it exists
  const hex = hexStr.replace(/^0x/, '').toUpperCase();
  // If the length is odd, pad with one zero
  const paddedHex = hex.length % 2 === 1 ? '0' + hex : hex;
  // Ensure at least 2 digits
  const finalHex = paddedHex.length === 0 ? '00' : paddedHex;
  // Add 0x prefix
  return '0x' + finalHex;
};

/**
 * @brief Pads a binary string to the nearest multiple of 8 bits
 */
export const padBinary = (binStr: string): string => {
  // Calculate how many bits we need (round up to nearest 8)
  const len = binStr.length;
  const targetLength = Math.ceil(len / 8) * 8;
  return binStr.padStart(targetLength, '0');
};

/**
 * @brief Converts a number to all supported formats (decimal, hex, binary, ascii)
 */
export const convertNumber = (num: number): NumberValues => ({
  decimal: num.toString(),
  hex: padHex(num.toString(16).toUpperCase()),
  binary: padBinary(num.toString(2)),
  ascii: String.fromCharCode(num)
});

/**
 * @brief Formats calculation results by appending the result with an equals sign
 */
export const formatCalculationResult = (input: NumberValues, result: NumberValues): NumberValues => {
  // Remove any trailing spaces before adding the equals sign
  return {
    decimal: `${input.decimal.trimEnd()}=${result.decimal}`,
    hex: `${input.hex.trimEnd()}=${result.hex}`,
    binary: `${input.binary.trimEnd()}=${result.binary}`,
    ascii: result.ascii
  };
};

/**
 * @brief Converts all hex numbers in an expression to decimal
 * @param expression - The hex expression string
 * @returns Expression with all hex numbers converted to decimal
 */
export const convertHexExpressionToDecimal = (expression: string): string => {
  // First, match all 0x prefixed hex numbers
  const withPrefix = /0x[0-9a-fA-F]+/gi;
  let match: RegExpExecArray | null;
  const matches: Array<{ start: number; end: number; value: string; decimal: string }> = [];
  
  while ((match = withPrefix.exec(expression)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      value: match[0],
      decimal: parseInt(match[0].toLowerCase().replace(/^0x/, ''), 16).toString()
    });
  }
  
  // Then, find standalone hex digit sequences that aren't part of a 0x number
  const standalone = /[0-9a-fA-F]+/gi;
  standalone.lastIndex = 0;
  
  while ((match = standalone.exec(expression)) !== null) {
    // Check if this match is already covered by a 0x match
    const isCovered = matches.some(m => {
      if (!match) return false;
      return match.index >= m.start && match.index < m.end;
    });
    
    if (!isCovered) {
      // Check if this is actually a valid hex number (not part of an operator)
      const before = expression[match.index - 1] || '';
      const after = expression[match.index + match[0].length] || '';
      // Only match if it's surrounded by spaces, operators, or start/end
      const validContext = /^[\s+\-*/%&|^~<>()]?$/.test(before) && 
                           /^[\s+\-*/%&|^~<>()]?$/.test(after);
      
      if (validContext) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          value: match[0],
          decimal: parseInt(match[0], 16).toString()
        });
      }
    }
  }
  
  // Sort matches by position and build result
  matches.sort((a, b) => a.start - b.start);
  
  let result = '';
  let currentIndex = 0;
  
  for (const m of matches) {
    result += expression.substring(currentIndex, m.start);
    result += m.decimal;
    currentIndex = m.end;
  }
  result += expression.substring(currentIndex);
  
  return result;
};

/**
 * @brief Converts all hex numbers in an expression to binary
 * @param expression - The hex expression string
 * @returns Expression with all hex numbers converted to binary
 */
export const convertHexExpressionToBinary = (expression: string): string => {
  const withPrefix = /0x[0-9a-fA-F]+/gi;
  let match: RegExpExecArray | null;
  const matches: Array<{ start: number; end: number; value: string; binary: string }> = [];
  
  while ((match = withPrefix.exec(expression)) !== null) {
    const hexStr = match[0].toLowerCase().replace(/^0x/, '');
    const decimal = parseInt(hexStr, 16);
    if (!isNaN(decimal)) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        value: match[0],
        binary: padBinary(decimal.toString(2))
      });
    }
  }
  
  const standalone = /[0-9a-fA-F]+/gi;
  standalone.lastIndex = 0;
  
  while ((match = standalone.exec(expression)) !== null) {
    const isCovered = matches.some(m => {
      if (!match) return false;
      return match.index >= m.start && match.index < m.end;
    });
    
    if (!isCovered) {
      const before = expression[match.index - 1] || '';
      const after = expression[match.index + match[0].length] || '';
      const validContext = /^[\s+\-*/%&|^~<>()]?$/.test(before) && 
                           /^[\s+\-*/%&|^~<>()]?$/.test(after);
      
      if (validContext) {
        const decimal = parseInt(match[0], 16);
        if (!isNaN(decimal)) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            value: match[0],
            binary: padBinary(decimal.toString(2))
          });
        }
      }
    }
  }
  
  matches.sort((a, b) => a.start - b.start);
  
  let result = '';
  let currentIndex = 0;
  
  for (const m of matches) {
    result += expression.substring(currentIndex, m.start);
    result += m.binary;
    currentIndex = m.end;
  }
  result += expression.substring(currentIndex);
  
  return result;
};

