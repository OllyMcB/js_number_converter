class NumberRep {
    constructor() {
        this.dec = 0;
        // this.type = "None"
    }

    bin_converter = { 
        type: "Binary", 
        match_str: /^[01]+$/i, 
        to_dec: function(s) { 
                return parseInt(s, 2); 
            },
        from_dec: function(d) {
            // handle leading zeros
            var leading_zeros = 8;
            if (d > 4294967295)
            {
                leading_zeros = 64;
            }
            else if (d > 65535)
            {
                leading_zeros = 32;
            }
            else if (d > 255)
            {
                leading_zeros = 16;
            }
            return Number(d).toString(2).padStart(leading_zeros, '0');
        }};

    dec_converter = { 
        type: "Decimal", 
        match_str: /^[0-9]+$/i, 
        to_dec: function(s) { 
                return s; 
            },
        from_dec: function(d) {
            return d;
        }};

    hex_converter = { 
        type: "Hex", 
        match_str: /^(0x|0X)*[0-9a-f]+$/i, 
        to_dec: function(s) { 
                return parseInt(s, 16); 
            },
        from_dec: function(d) {
            // handle leading zeros
            var leading_zeros = 2;
            if (d > 4294967295)
            {
                leading_zeros = 16;
            }
            else if (d > 65535)
            {
                leading_zeros = 8;
            }
            else if (d > 255)
            {
                leading_zeros = 4;
            }

            return "0x" + Number(d).toString(16).padStart(leading_zeros, '0').toUpperCase();
        }};

    ascii_converter = {
        type: "ASCII", 
        match_str: /^\w+$/i, 
        to_dec: 
            function(s) {  
                if (s.length == 1)
                {
                    return s.charCodeAt(0);
                }
                return NaN;
            },
        from_dec: function(d) {
            return String.fromCharCode(d);
        }};


    
    /**< Parse a string to a dec & determine the original type
     * @param num_str String containing the number to be converted
     */ 
    parse(num_str) {
        const converters = [
            this.bin_converter,
            this.dec_converter,
            this.hex_converter,
            this.ascii_converter];

        console.log("Parsing value: " + num_str);

        for(let conv of converters)
        {
            console.log(conv);

            if (Boolean(num_str.match(conv.match_str)))
            {
                this.type = conv;
                this.dec = conv.to_dec(num_str);
                break;
            }
        }
    }

    getType() {
        return this.type["type"];
    }

    toDec() {
        return this.dec_converter.from_dec(this.dec);
    }
    
    toHex() {
        return this.hex_converter.from_dec(this.dec);
    }
    
    toBin() {
        return this.bin_converter.from_dec(this.dec);
    }
    
    toASCII() {
        return this.ascii_converter.from_dec(this.dec);
    }
}

document.getElementById("input").addEventListener("input", function(e)
{
    console.log("Input number: " + e.target.value);

    if (e.target.value != "")
    {             
        var number = new NumberRep();
        
        number.parse(e.target.value);
        
        label_val = "Auto-detected: " + number.getType();
        hex_val = number.toHex();
        dec_val = number.toDec();
        bin_val = number.toBin();
        ascii_val = number.toASCII();
    }
    else
    {
        label_val = "Enter number";
        hex_val = "Hex";
        dec_val = "Dec";
        bin_val = "Bin";
        ascii_val = "";
    }

    document.getElementById("input_label").innerHTML = label_val;
    document.getElementById("hex_box").placeholder = hex_val;
    document.getElementById("dec_box").placeholder = dec_val;
    document.getElementById("bin_box").placeholder = bin_val;
    document.getElementById("ascii_box").placeholder = ascii_val;

})