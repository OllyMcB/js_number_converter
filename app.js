var auto_number_detection = true;


// on data entered into the 'Input' box
document.getElementById("input").addEventListener("input", function(e) {
    console.log("Input number: " + e.target.value);

    if (e.target.value != "") {             
        var number = new NumberRep();
        
        number.parse(e.target.value);
        
        label_val = "Auto-detected: " + number.getType();
        hex_val = number.toHex();
        dec_val = number.toDec();
        bin_val = number.toBin();
        ascii_val = number.toASCII();
        set_radio_btn(number.getType())
    }
    else {
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

// on auto/manual checkbox toggle
document.getElementById("auto_manual").addEventListener("input", function(e) {
    if (document.getElementById("auto_manual").checked) {
        console.log("checked");
        document.getElementById("manual_buttons").disabled = true;
        auto_number_detection = true;
    }
    else {
        document.getElementById("manual_buttons").disabled = false;
        console.log("un checked");
        auto_number_detection = false;
    }
})

// set one of the 'manual number representation' radio buttons to checked
function set_radio_btn(number_format) {

    switch(number_format) {
        case "Decimal":
            btn_id = "select_dec";
            break;
        case "Hex":
            btn_id = "select_hex";
            break;
        case "Binary":
            btn_id = "select_bin";
            break;
        case "ASCII":
            btn_id = "select_ascii";
            break;
        default:
            break;

    }

    if (btn_id != "")
    {
        document.getElementById(btn_id).checked = true;
    }
}