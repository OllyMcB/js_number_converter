// console.log("First flappy JS program");

// function draw()
// {
//     var canvas = document.getElementById('circle');
//     if (canvas.getContext)
//     {
//         var ctx = canvas.getContext('2d'); 
//         var X = canvas.width / 2;
//         var Y = canvas.height / 2;
//         var R = 45;
//         ctx.beginPath();
//         ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
//         ctx.lineWidth = 3;
//         ctx.strokeStyle = '#FFFF00';
//         ctx.stroke();
//     }
// }



var prev = {avail:false, x:0, y:0, r:0};


function draw(colour, x, y, radius, save_history = false)
{
    var canvas = document.getElementById('circle');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d'); 
        var X = x / 2;
        var Y = y / 2;
        var R = radius;

        prev.x = X;
        prev.y = Y;
        prev.r = R;
        prev.avail = save_history;

        ctx.beginPath();
        ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
        ctx.lineWidth = 7;
        ctx.strokeStyle = colour;
        ctx.stroke();
        return ctx
    }
}

function clear_last()
{
    if (prev.avail)
    {
        var canvas = document.getElementById('circle');
        if (canvas.getContext)
        {
            var ctx = canvas.getContext('2d'); 
            ctx.beginPath();
            ctx.arc(prev.x, prev.y, prev.r, 0, 2 * Math.PI, false);
            ctx.lineWidth = 10;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
            return ctx
        }
    }
}