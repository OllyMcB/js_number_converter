
/* Convert an input string into their hex & dec equivalents, whilst also performing
any mathematical operations */
function convert(input_str) {
    let result = { dec: {}, hex: {}, bin: {}, ascii: {} };

    console.log("input_str: '" + input_str + "'");
    // if an operand exists, then we need to calculate the answer
    if (input_str.search(/[\+\-\*\/\|\&\^\=]/) != -1)
    {
        // calculate the answer
        try {
            var answer = eval(input_str);       // TODO, sanitise input
            // var answer = Function(input_str);// TODO, sanitise input
            if (answer != undefined)
            {
                result.dec.answer = answer;
                result.hex.answer = decToHex(answer);
                result.bin.answer = decToBin(answer);
                result.ascii.answer = decToASCII(answer);
            }
        }
        catch (err)
        {
            console.log("Calculation error. Possibly due to incomplete equation");
        }
    }

    result.dec.field_str = "";
    result.hex.field_str = "";
    result.bin.field_str = "";
    result.ascii.field_str = "";

    // split the input string at each word boundary
    var res = input_str.split(/\b/);
    console.log("res: '" + res.toString() + "'");

    // iterate though all matched words from input_str (number/operand)
    for (word_str of res)
    {
        let dec_word = "";
        let hex_word = "";
        let bin_word = "";
        let ascii_word = "";

        // determine the number type of each match (e.g. hex, dec)
        if (isHex(word_str))
        {
            console.log(" - " + word_str + " is hex");
            
            dec_word = hexToDec(word_str);   
            hex_word = word_str;
            bin_word = hexToBin(word_str);
            ascii_word = hexToASCII(word_str);
        }
        else if (isDec(word_str))
        {
            console.log(" - " + word_str + " is dec");
            
            dec_word = word_str;
            hex_word = decToHex(word_str); 
            bin_word = decToBin(word_str);
            ascii_word = decToASCII(word_str);
        }
        else if (isBin(word_str))
        {
            console.log(" - " + word_str + " is bin");
            
            dec_word = binToDec(word_str);
            hex_word = binToHex(word_str); 
            bin_word = word_str;
            ascii_word = binToASCII(word_str);
        }
        else if (isASCII(word_str))
        {
            console.log(" - " + word_str + " is ascii");
            
            dec_word = ASCIIToDec(word_str);
            hex_word = ASCIIToHex(word_str); 
            bin_word = ASCIIToBin(word_str);
            ascii_word = word_str;
        }
        else
        {
            console.log(" - " + word_str + " is not known");

            dec_word = word_str;
            hex_word = word_str;
            bin_word = word_str;
            ascii_word = word_str;
        }

        result.dec.field_str += dec_word;
        result.hex.field_str += hex_word;
        result.bin.field_str += bin_word;
        result.ascii.field_str += ascii_word;

        // console.log("dec_str: '" + result.dec.field_str + "'");
        // console.log("hex_str: '" + result.hex.field_str + "'");
        // console.log("bin_str: '" + result.bin.field_str + "'");
        // console.log("ascii_str: '" + result.ascii.field_str + "'");
    }
    

    console.log("Dec str: " + result.dec.field_str);
    console.log("Hex str: " + result.hex.field_str);
    console.log("Bin str: " + result.bin.field_str);
    console.log("ASCII str: " + result.ascii.field_str);

    return result;
}

/* Return true if the input_word is a hex number */
function isHex(input_word) {
    return input_word.search(/^0x[0-9a-f]+$/i) != -1;
}

/* Return true if the input_word is a decimal number */
function isDec(input_word) {
    return input_word.search(/^[0-9]+$/) != -1;
}

/* Return true if the input_word is a binary number */
function isBin(input_word) {
    return input_word.search(/^0x[01]+$/i) != -1;
}

/* Return true if the input_word is ASCII */
function isASCII(input_word) {
    return input_word.search(/^[\w]+$/i) != -1;
}
 

/* Convert a decimal number to it's hex equivalent */
function decToHex(dec_str) {
    const leading_zeros = nLeadingZeros(dec_str);
    return "0x" + Number(dec_str).toString(16).padStart(leading_zeros, '0').toUpperCase();
}

/* Convert a decimal number to it's binary equivalent */
function decToBin(dec_str) {
    const leading_zeros = nLeadingZeros(dec_str);
    return Number(dec_str).toString(2).padStart(leading_zeros, '0').toUpperCase();
}

/* Convert a decimal number to it's ASCII equivalent */
function decToASCII(dec_str) {
    return String.fromCharCode(dec_str);
}

/* Convert a hex number to it's dec equivalent */
function hexToDec(hex_str) {
    return parseInt(hex_str, 16).toString();
}

/* Convert a hex number to it's binary equivalent */
function hexToBin(hex_str) {
    return decToBin(hexToDec(hex_str));
}

/* Convert a hex number to it's ASCII equivalent */
function hexToASCII(hex_str) {
    return decToASCII(hexToDec(hex_str));
}

/* Convert a binary number to it's dec equivalent */
function binToDec(bin_str) {
    return parseInt(bin_str, 2);
}

/* Convert a binary number to it's hex equivalent */
function binToHex(bin_str) {
    return decToHex(binToDec(bin_str));
}

/* Convert a binary number to it's ASCII equivalent */
function binToASCII(bin_str) {
    return decToASCII(binToDec(bin_str));
}

/* Convert a ASCII char to it's dec equivalent */
function ASCIIToDec(ascii_str) {
    return ascii_str.charCodeAt(0);
}

/* Convert a ASCII char to it's hex equivalent */
function ASCIIToHex(ascii_str) {
    return decToHex(ASCIIToDec(ascii_str));
}

/* Convert a ASCII char to it's binary equivalent */
function ASCIIToBin(ascii_str) {
    return decToBin(ASCIIToDec(ascii_str));
}

/* Calculate the number of leading zeros required */
function nLeadingZeros(num_str) {
    var leading_zeros = 2;
    d = parseInt(num_str);
    if (d > 0xFFFFFFFF)
    {
        leading_zeros = 16;
    }
    else if (d > 0xFFFF)
    {
        leading_zeros = 8;
    }
    else if (d > 0xFF)
    {
        leading_zeros = 4;
    }
    return leading_zeros;
}