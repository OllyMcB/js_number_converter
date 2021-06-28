var input_str = "0x01 + 0x1A / 0xFF & 96";

var word_match_patt = /(\w|\+|\-|\||\&|\/|\*)+/g;

var res = input_str.match(word_match_patt);


console.log(res);

var input_arr = [];

for (word_str of res)
{
    if (isOperand(word_str))
    {
        word_type = "operand";
        dec_val = -1;//NaN;
    }
    else if (isHex(word_str))
    {
        word_type = "hex";
        dec_val = parseInt(word_str, 16);
    }
    else if (isDec(word_str))
    {
        word_type = "decimal";
        dec_val = parseInt(word_str);
    }
    else
    {
        word_type = "unknown";
        dec_val = -1;//NaN;
    }
    // console.log("raw: '" + word_str + "'\ttype: " + word_type);

    input_arr.push( { word: i, type: word_type, as_dec: toString(dec_val) });
}

console.log("input_array length: " + input_arr.length)
for (i in input_arr)
{
    console.log(JSON.stringify(input_arr[i]))
}

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