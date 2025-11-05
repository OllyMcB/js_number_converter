/**
 * @brief Number conversion utilities for converting between different number formats
 */

export interface NumberValues {
  decimal: string
  hex: string
  binary: string
  ascii: string
}

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

