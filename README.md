# Number Converter

A modern, interactive number conversion tool built with React that allows real-time conversion between different number representations.

## Features

### Core Functionality
- Real-time number conversion between:
  - Decimal (Base 10)
  - Hexadecimal (Base 16)
  - Binary (Base 2)
  - ASCII characters
- Support for mathematical operations:
  - Basic arithmetic (addition, subtraction, multiplication, division)
  - Bitwise operations (AND, OR, NOT, XOR, shifts)
  - Modulo operations
- Dynamic field expansion for mathematical operations
- Cross-format calculations (e.g., decimal + hexadecimal)
- Intelligent parsing of number formats without explicit separators

### User Interface
- Clean, modern interface with responsive design
- Interactive field highlighting and validation
- Customisable display settings per field
- Hover-based character highlighting across all representations
- Keyboard navigation support
- Clear all fields functionality
- Contextual help system

### Customisation Options
Each number field includes configurable settings:
- Number grouping (4, 8, 16 bits)
- Number representation (8-bit, 16-bit, 32-bit)
- Group spacing preferences
- Case formatting (upper/lowercase)
- Prefix display (0x, b, etc.)
- Endianness selection
- Hover highlighting toggles

## Technical Architecture

### Frontend Stack
- React 18+
- TypeScript
- CSS Modules for styling
- State Management: [TBD]

### Key Components
- NumberInput: Base input component with format-specific validation
- ConversionDisplay: Results display with formatting options
- SettingsPanel: Configuration interface for each number format
- MathProcessor: Handles mathematical operations
- HighlightManager: Manages cross-field highlighting

## Development Setup

[To be added after initial React setup]

## Project Structure

[To be added after initial React setup]

## Original Layout Design
             _______________________
        Dec |_______________________| *
             _______________________
        Hex |_______________________| *
             _______________________
        Bin |_______________________| *
             _______________________
      ASCII |_______________________| *
                   (?)     (X)

## Optimisation Goals
- Efficient parsing with change detection
- Intelligent grouping of characters into 8-bit words
- Responsive UI with minimal re-renders
- Optimal state management for real-time updates

## Future Improvements
- Advanced number format support (octal, custom bases)
- History of conversions
- Export/import functionality
- Keyboard shortcuts
- Mobile-optimised interface
- Unit tests and integration tests
- Performance monitoring
- Accessibility improvements
- Localisation support

## Contributing
Contributions are welcome! Please read our contributing guidelines (to be added).

### Contributors
- [Original Author]
- Zoe Thexton

## License
[To be added]
