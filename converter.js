function convert(input_str) {
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
        // determine the number type of each match (e.g. hex, dec)
        if (isHex(word_str))
        {
            console.log(word_str + " is hex");
            
            // replace the hex number with the dec equivalent in the dec string
            dec_str = dec_str.replace(word_str, parseInt(word_str, 16).toString());   
        }
        else if (isDec(word_str))
        {
            console.log(word_str + " is dec");

            // replace the dec number with the hex equivalent in the hex string
            hex_str = hex_str.replace(word_str, decToHex(word_str)); 
        }
    }

    var answer = eval(input_str);
    console.log("Input Str: " + input_str + "\tAnswer: " + answer);

    console.log("Dec str: " + dec_str);
    console.log("Hex str: " + hex_str);
}

/* Return true if the input_word is a hex number */
function isHex(input_word) {
    return input_word.search(/^0x[0-9a-f]+$/i) != -1;
}

/* Return true if the input_word is a decimal number */
function isDec(input_word) {
    return input_word.search(/^[0-9]+$/) != -1;
}

/* Convert a decimal number to it's hex equivalent */
function decToHex(dec_str) {
    return "0x" + Number(dec_str).toString(16).toUpperCase();
}









// class NumberRep {
//     constructor() {
//         this.dec = 0;
//         // this.type = "None"
//     }

//     bin_converter = { 
//         type: "Binary", 
//         match_str: /^[01]+$/i, 
//         to_dec: function(s) { 
//                 return parseInt(s, 2); 
//             },
//         from_dec: function(d) {
//             // handle leading zeros
//             var leading_zeros = 8;
//             if (d > 4294967295)
//             {
//                 leading_zeros = 64;
//             }
//             else if (d > 65535)
//             {
//                 leading_zeros = 32;
//             }
//             else if (d > 255)
//             {
//                 leading_zeros = 16;
//             }
//             return Number(d).toString(2).padStart(leading_zeros, '0');
//         }};

//     dec_converter = { 
//         type: "Decimal", 
//         match_str: /^[0-9]+$/i, 
//         to_dec: function(s) { 
//                 return s; 
//             },
//         from_dec: function(d) {
//             return d;
//         }};

//     hex_converter = { 
//         type: "Hex", 
//         match_str: /^(0x|0X)*[0-9a-f]+$/i, 
//         to_dec: function(s) { 
//                 return parseInt(s, 16); 
//             },
//         from_dec: function(d) {
//             // handle leading zeros
//             var leading_zeros = 2;
//             if (d > 4294967295)
//             {
//                 leading_zeros = 16;
//             }
//             else if (d > 65535)
//             {
//                 leading_zeros = 8;
//             }
//             else if (d > 255)
//             {
//                 leading_zeros = 4;
//             }

//             return "0x" + Number(d).toString(16).padStart(leading_zeros, '0').toUpperCase();
//         }};

//     ascii_converter = {
//         type: "ASCII", 
//         match_str: /^\w+$/i, 
//         to_dec: 
//             function(s) {  
//                 if (s.length == 1)
//                 {
//                     return s.charCodeAt(0);
//                 }
//                 return NaN;
//             },
//         from_dec: function(d) {
//             return String.fromCharCode(d);
//         }};


    
//     /**< Parse a string to a dec & determine the original type
//      * @param num_str String containing the number to be converted
//      */ 
//     parse(num_str) {
//         const converters = [
//             this.bin_converter,
//             this.dec_converter,
//             this.hex_converter,
//             this.ascii_converter];

//         console.log("(Auto) Parsing value: " + num_str);

//         for(let conv of converters)
//         {
//             console.log(conv);

//             if (Boolean(num_str.match(conv.match_str)))
//             {
//                 this.type = conv;
//                 this.dec = conv.to_dec(num_str);
//                 break;
//             }
//         }
//     }

//     parse_manual(num_str, manual_num_type)
//     {
//         console.log("(Manual) Parsing value: " + num_str);

//         switch (manual_num_type)
//         {
//             case "Decimal":
//                 this.type = this.dec_converter;
//                 this.dec =  this.type.to_dec(num_str);
//                 break;
//             case "Hex":
//                 this.type = this.hex_converter;
//                 this.dec =  this.type.to_dec(num_str);
//                 break;
//             case "Binary":
//                 this.type = this.bin_converter;
//                 this.dec =  this.type.to_dec(num_str);
//                 break;
//             case "ASCII":
//                 this.type = this.ascii_converter;
//                 this.dec =  this.type.to_dec(num_str);
//                 break;
//         }
//     }

//     getType() {
//         return this.type["type"];
//     }

//     toDec() {
//         return this.dec_converter.from_dec(this.dec);
//     }
    
//     toHex() {
//         return this.hex_converter.from_dec(this.dec);
//     }
    
//     toBin() {
//         return this.bin_converter.from_dec(this.dec);
//     }
    
//     toASCII() {
//         return this.ascii_converter.from_dec(this.dec);
//     }
// }

