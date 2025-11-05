/**
 * @brief Expression evaluation utilities for mathematical and bitwise operations
 */

/**
 * @brief Evaluates a mathematical expression in the given base
 * @param expression - The expression string to evaluate
 * @param base - The numeric base (10 for decimal, 16 for hex, 2 for binary)
 * @returns The result of the evaluation, or null if invalid
 */
export const evaluateExpression = (expression: string, base: number = 10): number | null => {
  try {
    // First check if we actually have an operator
    const hasOperator = /[+\-*/%&|^~<>]/.test(expression);
    if (!hasOperator) {
      return null;
    }

    // Handle unary NOT (~) operator first
    if (expression.startsWith('~')) {
      const num = parseInt(expression.slice(1), base);
      if (isNaN(num)) return null;
      
      // Convert to binary, perform NOT, and convert back
      const binaryStr = num.toString(2);
      const targetLength = Math.ceil(binaryStr.length / 8) * 8;
      const binary = binaryStr.padStart(targetLength, '0');
      const inverted = binary.split('').map(bit => bit === '0' ? '1' : '0').join('');
      return parseInt(inverted, 2);
    }

    // Handle shift operators
    const shiftMatch = expression.match(/^(\d+)\s*([<>]{2})\s*(\d+)$/);
    if (shiftMatch) {
      const [, leftNum, operator, rightNum] = shiftMatch;
      const left = parseInt(leftNum, base);
      const right = parseInt(rightNum, base);
      if (isNaN(left) || isNaN(right)) return null;
      
      if (operator === '<<') return left << right;
      if (operator === '>>') return left >> right;
    }

    // Now split by single operators while preserving them
    const tokens = expression
      .split(/([+\-*/%&|^])/)
      .map(token => token.trim())
      .filter(t => t !== '');
    
    // Now evaluate the expression
    let result = parseInt(tokens[0], base);
    if (isNaN(result)) return null;

    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const nextNum = parseInt(tokens[i + 1], base);
      
      if (isNaN(nextNum)) return null;

      // Handle bitwise operations in binary
      if (['&', '|', '^'].includes(operator)) {
        // Convert both numbers to binary and pad to the same length (max of both, rounded to nearest 8)
        const leftBinaryStr = result.toString(2);
        const rightBinaryStr = nextNum.toString(2);
        const maxLength = Math.max(leftBinaryStr.length, rightBinaryStr.length);
        const targetLength = Math.ceil(maxLength / 8) * 8;
        const leftBinary = leftBinaryStr.padStart(targetLength, '0');
        const rightBinary = rightBinaryStr.padStart(targetLength, '0');
        let resultBinary = '';

        switch (operator) {
          case '&':
            resultBinary = leftBinary.split('').map((bit, i) => 
              bit === '1' && rightBinary[i] === '1' ? '1' : '0'
            ).join('');
            break;
          case '|':
            resultBinary = leftBinary.split('').map((bit, i) => 
              bit === '1' || rightBinary[i] === '1' ? '1' : '0'
            ).join('');
            break;
          case '^':
            resultBinary = leftBinary.split('').map((bit, i) => 
              bit !== rightBinary[i] ? '1' : '0'
            ).join('');
            break;
        }
        result = parseInt(resultBinary, 2);
      } else {
        // Handle arithmetic operations normally
        switch (operator) {
          case '+': result += nextNum; break;
          case '-': result -= nextNum; break;
          case '*': result *= nextNum; break;
          case '/': 
            if (nextNum === 0) return null; // Division by zero
            result = Math.floor(result / nextNum); 
            break;
          case '%': 
            if (nextNum === 0) return null; // Modulo by zero
            result %= nextNum; 
            break;
          default: return null;
        }
      }
    }
    
    return result;
  } catch {
    return null;
  }
};

/**
 * @brief Checks if a math expression is complete and ready for evaluation
 * @param value - The expression string to check
 * @returns True if the expression is complete and can be evaluated
 */
export const isCompleteMathExpression = (value: string): boolean => {
  // Must have an operator
  if (!/[+\-*/%&|^~<>]/.test(value)) return false;
  
  // Must end with a number
  if (!/\d$/.test(value)) return false;

  // Special case for unary operator ~
  if (value.startsWith('~')) {
    return /^~\d+$/.test(value);
  }

  // Check for shift operators
  if (/<{2}|>{2}/.test(value)) {
    return /^\d+\s*([<>]{2})\s*\d+$/.test(value);
  }
  
  // For expressions with binary operators, must have numbers on both sides
  const parts = value.split(/([+\-*/%&|^])/).filter(Boolean);
  if (parts.length < 2) return false;
  
  // For binary operators, check both sides are numbers
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];
  return /^\d+$/.test(firstPart) && /^\d+$/.test(lastPart);
};

