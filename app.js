document.getElementById("dec_field").addEventListener("input", function(e) {
    let dec = e.target.value;
    document.getElementById("hex_field").value = "0x" + Number(dec).toString(16).toUpperCase();
    document.getElementById("bin_field").value = Number(dec).toString(2).toUpperCase();
    document.getElementById("ascii_field").value = String.fromCharCode(dec);
})

document.getElementById("hex_field").addEventListener("input", function(e) {
    let dec = parseInt(e.target.value, 16);
    document.getElementById("dec_field").value = dec;
    document.getElementById("bin_field").value = Number(dec).toString(2).toUpperCase();
    document.getElementById("ascii_field").value = String.fromCharCode(dec);
})

document.getElementById("bin_field").addEventListener("input", function(e) {
    let dec = parseInt(e.target.value, 2);
    document.getElementById("dec_field").value = dec;
    document.getElementById("hex_field").value = Number(dec).toString(16).toUpperCase();
    document.getElementById("ascii_field").value = String.fromCharCode(dec);
})

document.getElementById("ascii_field").addEventListener("input", function(e) {
    let dec = e.target.value.charCodeAt(0);
    document.getElementById("dec_field").value = dec;
    document.getElementById("hex_field").value = Number(dec).toString(16).toUpperCase();
    document.getElementById("bin_field").value = Number(dec).toString(2).toUpperCase();
})