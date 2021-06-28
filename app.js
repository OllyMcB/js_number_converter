
function convertAndShow(input_str) {
    if (input_str != "")
    {
        var res = convert(input_str);
    }
    else
    {
        var res = [ "", "" ];
    }
    console.log("res: " + res);
    console.log("res[0]: " + res[0]);
    console.log("res[1]: " + res[1]);

    document.getElementById("dec_field").value = res[0];
    document.getElementById("hex_field").value = res[1];
}



document.getElementById("dec_field").addEventListener("input", function(e) {
    convertAndShow(e.target.value);
})

document.getElementById("hex_field").addEventListener("input", function(e) {
    convertAndShow(e.target.value);
})

// document.getElementById("bin_field").addEventListener("input", function(e) {
//     let dec = parseInt(e.target.value, 2);
//     document.getElementById("dec_field").value = dec;
//     document.getElementById("hex_field").value = Number(dec).toString(16).toUpperCase();
//     document.getElementById("ascii_field").value = String.fromCharCode(dec);
// })

// document.getElementById("ascii_field").addEventListener("input", function(e) {
//     let dec = e.target.value.charCodeAt(0);
//     document.getElementById("dec_field").value = dec;
//     document.getElementById("hex_field").value = Number(dec).toString(16).toUpperCase();
//     document.getElementById("bin_field").value = Number(dec).toString(2).toUpperCase();
// })