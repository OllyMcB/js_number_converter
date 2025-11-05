/**
 * @brief Shared type definitions for the number converter application
 */

/**
 * @brief Represents number values in all supported formats
 */
export interface NumberValues {
  decimal: string;
  hex: string;
  binary: string;
  ascii: string;
}

/**
 * @brief Information about a highlight event from a source field
 */
export interface HighlightInfo {
  sourceType: 'decimal' | 'hex' | 'binary' | 'ascii';
  position: number;
  length: number;
}

/**
 * @brief Represents a highlight range for a number input field
 */
export interface NumberInputHighlight {
  start: number;
  end: number;
  color: string;
}

/**
 * @brief Supported number input types
 */
export type NumberInputType = 'decimal' | 'hex' | 'binary' | 'ascii';

