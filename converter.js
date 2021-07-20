
/*
* The fromDec converter converts numbers from a decimal number to each of
* the other number representations.
*
* The fromLazy class inherits from the fromDec class and allows all child 
* classes to simply implement a toDec() method. Where the fromLazy class then
* converts from dec to the other number representations using the fromDec class.
*
*/

class fromDec // extends converter
{
    constructor()
    {
    }

    name() {
        return "Decimal";
    }

    /* Return true if the input_word is a decimal number */
    isThisType(num) {
        return num.search(/^[0-9]+$/) != -1;
    }

    toDec(num) {
        return num;
    }

    toHex(num) {
        return "0x" + Number(num).toString(16).toUpperCase();
    }

    toBin(num) {
        return Number(num).toString(2).toUpperCase();
    }

    toASCII(num) {
        return String.fromCharCode(num);
    }
}

class fromLazy extends fromDec
{
    toHex(num) {
        return super.toHex(this.toDec(num));
    }
    
    toBin(num) {
        return super.toBin(this.toDec(num));
    }
    
    toASCII(num) {
        return super.toASCII(this.toDec(num));
    }
}

class fromHex extends fromLazy
{
    name() {
        return "Hex";
    }

    /* Return true if the input_word is a hex number */
    isThisType(num) {
        return num.search(/^0x[0-9a-f]+$/i) != -1;
    }
    
    toDec(num) {
        return parseInt(num, 16).toString();
    }
}

class fromBin extends fromLazy
{
    name() {
        return "Binary";
    }

    /* Return true if the input_word is a binary number */
    isThisType(num) {
        return num.search(/^[01]+$/i) != -1;
    }
    
    toDec(num) {
        return parseInt(num, 2).toString();
    }
}


class fromASCII extends fromLazy
{
    name() {
        return "ASCII";
    }

    /* Return true if the input_word is a binary number */
    isThisType(num) {
        return num.search(/^[\w]+$/i) != -1;
        // return num.search(/^\b(?!0x\b)\w+\b$/i) != -1;        // ignore '0x'
    }
    
    toDec(num) {
        return num.charCodeAt(0);
    }
}




converters = {
    dec: new fromDec(),
    hex: new fromHex(),
    bin: new fromBin(),
    ascii: new fromASCII()
}


// convert("19  - 12", "dec");
// convert("11 - ", "bin");



/* Convert an input string into their hex & dec equivalents, whilst also performing
any mathematical operations */
function convert(input_str, origin_number_type) {
    let result = { dec: {}, hex: {}, bin: {}, ascii: {} };

    console.log("input_str: '" + input_str + "'");

    result.dec.field_str = "";
    result.hex.field_str = "";
    result.bin.field_str = "";
    result.ascii.field_str = "";

    // split the input string at each word boundary
    var res = input_str.split(/\b/);
    console.log("res: '" + res.toString() + "'");

    // iterate though all matched words from input_str (number/operand)
    for (let word_str of res)
    {
        let dec_word = "";
        let hex_word = "";
        let bin_word = "";
        let ascii_word = "";

        var detected = false;

        
        let conv = converters[origin_number_type];
        console.log("origin_number_type: " + origin_number_type);
        if (conv.isThisType(word_str))
        {
            console.log(" - " + word_str + " is manually set to " + conv.name());

            dec_word = conv.toDec(word_str);   
            hex_word = conv.toHex(word_str);
            bin_word = conv.toBin(word_str);
            ascii_word = conv.toASCII(word_str);

            detected = true;
        }

        // if (!detected)
        // {
        //     for (conv_types in converters)
        //     {
        //         let conv = converters[conv_types];
        //         if (conv.isThisType(word_str))
        //         {
        //             console.log(" - " + word_str + " is " + conv.name());
                    
        //             dec_word = conv.toDec(word_str);   
        //             hex_word = conv.toHex(word_str);
        //             bin_word = conv.toBin(word_str);
        //             ascii_word = conv.toASCII(word_str);
                    
        //             detected = true;
        //             break;      // TODO, ensure this breaks out of the for loop
        //         }
        //     }
        // }

        if (!detected)
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
    }
    

    console.log("Dec str: " + result.dec.field_str);
    console.log("Hex str: " + result.hex.field_str);
    console.log("Bin str: " + result.bin.field_str);
    console.log("ASCII str: " + result.ascii.field_str);

    // if an operand exists, then we need to calculate the answer
    if (result.dec.field_str.search(/[\+\-\*\/\|\&\^\=]/) != -1)
    {
        // calculate the answer
        try {
            var answer = eval(result.dec.field_str);       // TODO, sanitise input
            // var answer = Function(result.dec.field_str);// TODO, sanitise input
            if (answer != undefined)
            {
                result.dec.answer = answer.toString();
                result.hex.answer = converters["dec"].toHex(answer);
                result.bin.answer = converters["dec"].toBin(answer);
                result.ascii.answer = converters["dec"].toASCII(answer);
            }
        }
        catch (err)
        {
            console.log("Calculation error. Possibly due to incomplete equation");
            result.dec.answer = "";
            result.hex.answer = "";
            result.bin.answer = "";
            result.ascii.answer = "";
        }
    }
    else
    {
        result.dec.answer = "";
        result.hex.answer = "";
        result.bin.answer = "";
        result.ascii.answer = "";
    }

    return result;
}
