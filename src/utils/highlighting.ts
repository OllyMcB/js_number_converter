/**
 * @brief Highlighting utilities for cross-field highlighting in number conversions
 */

import { NumberValues } from './conversion';

export interface HighlightInfo {
  sourceType: 'decimal' | 'hex' | 'binary' | 'ascii';
  position: number;
  length: number;
}

export interface NumberInputHighlight {
  start: number;
  end: number;
  color: string;
}

interface NumberGroup {
  number: string;
  start: number;
  end: number;
  groupIndex: number;
}

/**
 * @brief Finds which space-separated number group contains a given position
 * @param value - The full string value
 * @param position - Character position in the string
 * @param prefix - Optional prefix to account for (e.g., "0x" for hex)
 * @returns NumberGroup information or null if not found
 */
const findNumberGroupAtPosition = (
  value: string,
  position: number,
  prefix: string = ''
): NumberGroup | null => {
  if (!value || position < 0 || position >= value.length) return null;

  // Split by spaces to get number groups
  const parts = value.split(' ');
  let currentPos = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partStart = currentPos;
    const partEnd = currentPos + part.length;

    // Check if position is within this part (including spaces)
    if (position >= partStart && position < partEnd) {
      // Remove prefix if present (e.g., "0x" in hex)
      const numberWithoutPrefix = part.startsWith(prefix) ? part.slice(prefix.length) : part;
      
      return {
        number: part,
        start: partStart,
        end: partEnd,
        groupIndex: i
      };
    }

    // Move to next part (add 1 for space)
    currentPos = partEnd + 1;
  }

  return null;
};

/**
 * @brief Gets all space-separated number groups from a value
 * @param value - The full string value
 * @returns Array of NumberGroup objects
 */
const getAllGroups = (value: string): NumberGroup[] => {
  if (!value) return [];

  const parts = value.split(' ');
  const groups: NumberGroup[] = [];
  let currentPos = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part) { // Skip empty parts
      groups.push({
        number: part,
        start: currentPos,
        end: currentPos + part.length,
        groupIndex: i
      });
      currentPos += part.length + 1; // +1 for space
    }
  }

  return groups;
};

/**
 * @brief Calculates highlights for a specific input type based on hover position
 * @param values - Current values for all input types
 * @param highlight - The highlight information from the source field
 * @param type - The target type to calculate highlights for
 * @returns Array of highlight ranges for the target type
 */
export const getHighlights = (
  values: NumberValues,
  highlight: HighlightInfo | null,
  type: 'decimal' | 'hex' | 'binary' | 'ascii'
): NumberInputHighlight[] => {
  if (!highlight) return [];

  const highlights: NumberInputHighlight[] = [];

  // ASCII source: Highlight entire strings in all fields
  if (highlight.sourceType === 'ascii') {
    if (type === 'ascii') {
      // Highlight entire ASCII string
      if (values.ascii) {
        highlights.push({
          start: 0,
          end: values.ascii.length,
          color: '#ff3399'
        });
      }
    } else if (type === 'decimal' && values.decimal) {
      // Highlight entire decimal string
      highlights.push({
        start: 0,
        end: values.decimal.length,
        color: '#ff3399'
      });
    } else if (type === 'hex' && values.hex) {
      // Highlight entire hex string
      highlights.push({
        start: 0,
        end: values.hex.length,
        color: '#ff3399'
      });
    } else if (type === 'binary' && values.binary) {
      // Highlight entire binary string
      highlights.push({
        start: 0,
        end: values.binary.length,
        color: '#ff3399'
      });
    }
    return highlights;
  }

  // Decimal source: Highlight entire strings in all formats
  if (highlight.sourceType === 'decimal') {
    if (type === 'decimal' && values.decimal) {
      // Highlight entire decimal string
      highlights.push({
        start: 0,
        end: values.decimal.length,
        color: '#ff3399'
      });
    } else if (type === 'hex' && values.hex) {
      // Highlight entire hex string
      highlights.push({
        start: 0,
        end: values.hex.length,
        color: '#ff3399'
      });
    } else if (type === 'binary' && values.binary) {
      // Highlight entire binary string
      highlights.push({
        start: 0,
        end: values.binary.length,
        color: '#ff3399'
      });
    } else if (type === 'ascii' && values.ascii) {
      // Highlight entire ASCII string
      highlights.push({
        start: 0,
        end: values.ascii.length,
        color: '#ff3399'
      });
    }
    return highlights;
  }

  // Hex source: Find the specific number group and hex digit
  if (highlight.sourceType === 'hex') {
    const hexGroup = findNumberGroupAtPosition(values.hex, highlight.position, '0x');
    if (!hexGroup) return [];

    // Extract hex digits (remove 0x prefix)
    const hexDigits = hexGroup.number.startsWith('0x') 
      ? hexGroup.number.slice(2) 
      : hexGroup.number;
    
    // Calculate relative position within the hex number (accounting for 0x prefix)
    const prefixLength = hexGroup.number.startsWith('0x') ? 2 : 0;
    const relativePos = highlight.position - hexGroup.start;
    
    // Only proceed if hovering over actual hex digits (not 0x prefix)
    if (relativePos >= prefixLength && relativePos < hexGroup.number.length) {
      const hexDigitIndex = relativePos - prefixLength;
      const hexDigit = hexDigits[hexDigitIndex];
      
      if (!hexDigit) return [];

      // For hex field: highlight the specific hex digit
      if (type === 'hex') {
        highlights.push({
          start: hexGroup.start + relativePos,
          end: hexGroup.start + relativePos + 1,
          color: '#ff3399'
        });
      }
      // For decimal field: highlight the entire decimal group at the same index
      else if (type === 'decimal' && values.decimal) {
        const decimalGroups = getAllGroups(values.decimal);
        if (decimalGroups[hexGroup.groupIndex]) {
          const decimalGroup = decimalGroups[hexGroup.groupIndex];
          highlights.push({
            start: decimalGroup.start,
            end: decimalGroup.end,
            color: '#ff3399'
          });
        }
      }
      // For binary field: highlight the 4 binary digits corresponding to this hex digit
      else if (type === 'binary' && values.binary) {
        const binaryGroups = getAllGroups(values.binary);
        if (binaryGroups[hexGroup.groupIndex]) {
          const binaryGroup = binaryGroups[hexGroup.groupIndex];
          const binaryDigits = binaryGroup.number;
          
          // Calculate which 4 bits correspond to this hex digit
          // Hex digits are numbered from left (MSB) to right (LSB)
          // Binary is also left (MSB) to right (LSB)
          // So hexDigitIndex 0 maps to bits 0-3, index 1 maps to bits 4-7, etc.
          const startBit = hexDigitIndex * 4;
          const endBit = startBit + 4;
          
          if (startBit < binaryDigits.length) {
            const actualEndBit = Math.min(endBit, binaryDigits.length);
            highlights.push({
              start: binaryGroup.start + startBit,
              end: binaryGroup.start + actualEndBit,
              color: '#ff3399'
            });
          }
        }
      }
      // For ASCII field: highlight the entire ASCII string
      else if (type === 'ascii' && values.ascii) {
        highlights.push({
          start: 0,
          end: values.ascii.length,
          color: '#ff3399'
        });
      }
    }
    return highlights;
  }

  // Binary source: Find the specific number group and 4-bit group
  if (highlight.sourceType === 'binary') {
    const binaryGroup = findNumberGroupAtPosition(values.binary, highlight.position);
    if (!binaryGroup) return [];

    const binaryDigits = binaryGroup.number;
    const relativePos = highlight.position - binaryGroup.start;
    
    if (relativePos < 0 || relativePos >= binaryDigits.length) return [];

    // Calculate which 4-bit group contains this position
    const groupIndex = Math.floor(relativePos / 4);
    const groupStart = groupIndex * 4;
    const groupEnd = Math.min(groupStart + 4, binaryDigits.length);

    // For binary field: highlight the 4-bit group
    if (type === 'binary') {
      highlights.push({
        start: binaryGroup.start + groupStart,
        end: binaryGroup.start + groupEnd,
        color: '#ff3399'
      });
    }
    // For hex field: highlight the corresponding hex digit
    else if (type === 'hex' && values.hex) {
      const hexGroups = getAllGroups(values.hex);
      if (hexGroups[binaryGroup.groupIndex]) {
        const hexGroup = hexGroups[binaryGroup.groupIndex];
        const hexDigits = hexGroup.number.startsWith('0x') 
          ? hexGroup.number.slice(2) 
          : hexGroup.number;
        
        // The groupIndex corresponds to which hex digit
        if (groupIndex < hexDigits.length) {
          const prefixLength = hexGroup.number.startsWith('0x') ? 2 : 0;
          highlights.push({
            start: hexGroup.start + prefixLength + groupIndex,
            end: hexGroup.start + prefixLength + groupIndex + 1,
            color: '#ff3399'
          });
        }
      }
    }
    // For decimal field: highlight the entire decimal group at the same index
    else if (type === 'decimal' && values.decimal) {
      const decimalGroups = getAllGroups(values.decimal);
      if (decimalGroups[binaryGroup.groupIndex]) {
        const decimalGroup = decimalGroups[binaryGroup.groupIndex];
        highlights.push({
          start: decimalGroup.start,
          end: decimalGroup.end,
          color: '#ff3399'
        });
      }
    }
    // For ASCII field: highlight the entire ASCII string
    else if (type === 'ascii' && values.ascii) {
      highlights.push({
        start: 0,
        end: values.ascii.length,
        color: '#ff3399'
      });
    }
    return highlights;
  }

  return highlights;
};
