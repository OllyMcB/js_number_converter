# Number Converter

## Layout
             _______________________
        Dec |_______________________| *
             _______________________
        Hex |_______________________| *
             _______________________
        Bin |_______________________| *
             _______________________
      ASCII |_______________________| *
                       ?

## Plan
- Numbers can be entered in any field
- The number label turns bold upon valid input, or red upon invalid
- Entered number is auto-converted into other fields
- Support math operations
  - Addition/subtraction
  - Multiplication/division
  - Bitwise and/or/not
  - Modulo
- If math is detected
  - Expand fields to wide format
  - Auto convert & display each number into other fields
  - Allow math between different number types (e.g. 123 & 0x0F)
  - Right-justify answer
- Gear 'settings' icon next to each field
  - Group numbers (e.g. 4, 8, 16)
  - Spacing between groups
  - Upper/lowercase
  - Add/remove prefix (e.g. '0x', 'b')
- If a word is entered into ASCII, decode each char
- Hovering over the question mark explains how to use

# Input Parsing
Iterate over the input string, splitting up each 'word' as a separate array item.