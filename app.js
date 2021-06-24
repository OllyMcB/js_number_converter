var auto_number_detection = true;
var manual_entry = ""


// on data entered into the 'Input' box
document.getElementById("input").addEventListener("input", function(e) {
    parse_input(e.target.value);
})

function parse_input(num_str) {
    console.log("Input number: " + num_str + " (auto?: " + auto_number_detection + ")");

    if (num_str != "") {             
        var number = new NumberRep();
        
        if (auto_number_detection == true)
        {
            number.parse(num_str);
        }
        else
        {
            number.parse_manual(num_str, manual_entry);
        }
        
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
}

// on auto/manual checkbox toggle
document.getElementById("auto_manual").addEventListener("change", function(e) {
    if (document.getElementById("auto_manual").checked) {
        console.log("checked");
        document.getElementById("manual_buttons").disabled = true;
        auto_number_detection = true;
        parse_input(document.getElementById("input").value);
    }
    else {
        document.getElementById("manual_buttons").disabled = false;
        console.log("un checked");
        auto_number_detection = false;
    }
})

// document.getElementsByName("type_select").addEventListener("input", function(e){
//     console.log("Radio btn");
//     console.log(e);
// })

if (document.querySelector('input[name="type_select"]')) {
    document.querySelectorAll('input[name="type_select"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
        manual_entry = event.target.value;
        console.log(manual_entry);

        parse_input(document.getElementById("input").value);
      });
    });
  }

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