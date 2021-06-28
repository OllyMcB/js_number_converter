var input_str = "0x01 + 0x1A * 0xFF - 96";
var input_str = "0x1A";


// calculate the answer and add to the string
var input_str_w_answer = input_str + " = " + eval(input_str);

// make copies of the input + answer string for each of the number types
var dec_str = input_str_w_answer;
var hex_str = input_str_w_answer;

// get matches of numbers from input string
var res = input_str_w_answer.match(/(\w)+/g);

// iterate though all matched words from input_str (number/operand)
for (word_str of res)
{
    /* Determine if the word is an operand, or detect the number 
    type (e.g. hex, dec). Then convert the number to it's decimal 
    equivalent */
    if (isOperand(word_str))
    {
        console.log(word_str + " is operand");
    }
    else if (isHex(word_str))
    {
        console.log(word_str + " is hex");
        
        // replace the hex number with the dec equivalent in the dec string
        dec_str = dec_str.replace(word_str, parseInt(word_str, 16).toString());   
    }
    else if (isDec(word_str))
    {
        console.log(word_str + " is dec");

        // replace the dec number with the hex equivalent in the hex string
        hex_str = hex_str.replace(word_str, "0x" + Number(word_str).toString(16).toUpperCase()); 
    }
}

var answer = eval(input_str);
console.log("Input Str: " + input_str + "\tAnswer: " + answer);

console.log("Dec str: " + dec_str);
console.log("Hex str: " + hex_str);




/* Return true if the input_word is an operand */
function isOperand(input_word) {
    return input_word.search(/^\+|\-|\||\&|\/|\*$/) != -1;
}

/* Return true if the input_word is a hex number */
function isHex(input_word) {
    return input_word.search(/^0x[0-9a-f]+$/i) != -1;
}

/* Return true if the input_word is a decimal number */
function isDec(input_word) {
    return input_word.search(/^[0-9]+$/) != -1;
}