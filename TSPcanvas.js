var canvas;
var canvasRect;
var circles = [];

function draw(){
    canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.moveTo(0,0);
    ctx.lineTo(200,100);
    ctx.stroke();
};

function loaded() {
    canvas = document.getElementById("myCanvas");
    canvasRect = canvas.getBoundingClientRect();
    canvas.addEventListener("click",clickEventListener);
};

function clickEventListener(event)
{
    var x = event.pageX - canvasRect.left;
    var y = event.pageY - canvasRect.top;
    var c = new circle(x,y);
    c.draw();
    c.drawAllPaths();
    circles.push(c);
    document.getElementById("canvasInfo").innerHTML = "number of nodes:" + circles.length + " number of edges:" + nPaths(circles.length) + "number of possible solutions:" + factorialize(circles.length);

    prepareOptProblem();
};

function circle(x,y)
{
    this.x = x;
    this.y = y;
    console.log("circle created at",x,y);

    this.draw = function(){
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#7777ff";
        ctx.beginPath();
        ctx.arc(x,y,10,0,2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    this.drawAllPaths = function(){
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#ff0000"
        circles.forEach(function(c){
            var dx = c.x - x;
            var dy = c.y - y;
            var angle = Math.atan(dy/dx);
            var sign = 1;
            if (dx>=0){
                sign = -1;
            }
            ctx.moveTo(x-Math.cos(angle)*15*sign,y-Math.sin(angle)*15*sign);
            ctx.lineTo(c.x+Math.cos(angle)*15*sign,c.y+Math.sin(angle)*15*sign);
            //console.log("drawing paths",x,y,"   ",c.x,c.y);
            //console.log("angle",angle,"   cos",Math.cos(angle),"  sin:",Math.sin(angle));
        });
        ctx.closePath();
        ctx.stroke(); 
    }
}

function factorialize(num) {
    if (num < 0) 
          return -1;
    else if (num == 0) 
        return 1;
    else {
        return (num * factorialize(num - 1));
    }
}
function nPaths(num) {
    if (num <= 1) 
          return 0;
    else if (num == 2) 
        return 1;
    else {
        return (num + nPaths(num - 1) -1);
    }
}