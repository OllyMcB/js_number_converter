
function convertAndShow(input_str, origin_number_type) {
    let dec_str = "";
    let dec_answer = "";
    let hex_str = "";
    let hex_answer = "";

    if (input_str != "")
    {
        var res = convert(input_str, origin_number_type);

        console.log(res);
        console.log(" * res: " + res.toString());
        
        if (res.dec.field_str)
        {
            document.getElementById("dec_field").value = res.dec.field_str;
        }
        if (res.dec.answer)
        {
            document.getElementById("dec_answer").value = res.dec.answer;
        }
        if (res.hex.field_str)
        {
            document.getElementById("hex_field").value = res.hex.field_str;
        }
        if (res.hex.answer)
        {
            document.getElementById("hex_answer").value = res.hex.answer;
        }
        if (res.bin.field_str)
        {
            document.getElementById("bin_field").value = res.bin.field_str;
        }
        if (res.bin.answer)
        {
            document.getElementById("bin_answer").value = res.bin.answer;
        }
        if (res.ascii.field_str)
        {
            document.getElementById("ascii_field").value = res.ascii.field_str;
        }
        if (res.ascii.answer)
        {
            document.getElementById("ascii_answer").value = res.ascii.answer;
        }    
    }
    else
    {
        clearAllFields();
    }
}

/* Clear all the fields to an empty string */
function clearAllFields() {
    document.getElementById("dec_field").value = "";
    document.getElementById("dec_answer").value = "";
    
    document.getElementById("hex_field").value = "";
    document.getElementById("hex_answer").value = "";

    document.getElementById("bin_field").value = "";
    document.getElementById("bin_answer").value = "";

    document.getElementById("ascii_field").value = "";
    document.getElementById("ascii_answer").value = "";
}

document.getElementById("dec_field").addEventListener("input", function(e) {
    convertAndShow(e.target.value, "dec");
})

document.getElementById("hex_field").addEventListener("input", function(e) {
    convertAndShow(e.target.value, "hex");
})

document.getElementById("bin_field").addEventListener("input", function(e) {
    convertAndShow(e.target.value, "bin");
})

document.getElementById("ascii_field").addEventListener("input", function(e) {
    convertAndShow(e.target.value, "ascii");
})