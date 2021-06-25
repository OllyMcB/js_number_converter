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

## Goal
- Numbers can be entered in any field
- The number label turns bold upon valid input, or red upon invalid
- Entered number is auto-converted into other fields
- Support math operations
  - Addition/subtraction
  - Multiplication/division
  - Bitwise and/or/not/xor/shift
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

## Input Parsing
Iterate over the input string, splitting up each 'word' as a separate array item.

1. Parse the string to extract each 'word' (number or operand) (space separator?) 
2. Detect the 'word' type (e.g. hex num, plus operand etc.)
3. Store the 'word' & type in an 'input' array
4. Iterate though 'input' array, convert & copy all entries into a 'dec' array
5. If operand detected, perform maths and calculate answer
6. Using the 'dec' array, create the output strings for each number type (i.e. convert dec ot hex)

### Optimisation/Improvement Ideas
- When parsing, store a copy of the full string. Upon next request to parse (e.g. upon next 'input' event), compare the new string with the previously stored string. If they are similar, then we may only have to parse the bit that changed, rather than the full string again.
- If a space separator is not used between 'number words' & operands, the parser should still work (i.e. it should detect a number word followed by an operand)

## Name Ideas
- Num Tool
- Number Converter

## Plan
1. Get input parsing & maths working with just dec & hex