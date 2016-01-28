var canvas = document.getElementById('drawing-board');
var context = canvas.getContext("2d");

var users = {};
var paint;
var userColor = "#" + Math.random().toString(16).substr(-6);

context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas


function addClick(x, y, color, dragging) {
  if (!users[color]) {
    users[color] = {
      clickX: [],
      clickY: [],
      clickDrag: []
    };
  }

  users[color].clickX.push(x);
  users[color].clickY.push(y);
  users[color].clickDrag.push(dragging);
}

function redraw(color) {
  if (users[color]) {


    var colorCoordsX = users[color].clickX;
    var colorCoordsY = users[color].clickY;
    var colorClickDrag = users[color].clickDrag;

    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineWidth = 5;

    for (var i = 0; i < colorCoordsX.length; i++) {
      context.beginPath();
      if (colorClickDrag[i] && i) {
        context.moveTo(colorCoordsX[i - 1], colorCoordsY[i - 1]);
      } else {
        context.moveTo(colorCoordsX[i] - 1, colorCoordsY[i]);
      }
      context.lineTo(colorCoordsX[i], colorCoordsY[i]);
      context.closePath();
      context.stroke();


    }
    if (color === userColor) {
      socket.emit('message', {
        color: color,
        colorDetails: users[color]
      });
    }
  }
}
canvas.addEventListener("mousedown", function(e) {
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;
  paint = true;
  addClick(mouseX, mouseY, userColor);
  redraw(userColor);
}, false);

canvas.addEventListener("mousemove", function(e) {
  if (paint) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
    addClick(mouseX, mouseY, userColor, true);
    redraw(userColor);
  }
}, false);

canvas.addEventListener("mouseup", function(e) {
  paint = false;
}, false);

canvas.addEventListener("mouseleave", function(e) {
  paint = false;
}, false);

var base = 'http://clicktime.herokuapp.com:80/rooms/';
var roomName = 'krishnas-room';

var socket = io.connect(base + roomName);

socket.on('welcome', function() {
  console.log("welcome to " + roomName);
});

socket.on('message', function(data) {
  // The 'message' event is emitted whenever another client sends a message
  // Messages are automatically broadcasted to everyone in the room
  if (userColor !== data.color) {
    //set in users
    users[data.color] = {
      clickX: data.colorDetails.clickX,
      clickY: data.colorDetails.clickY,
      clickDrag: data.colorDetails.clickDrag
    };

    //redraw
    redraw(data.color)

  }
});

socket.on('heartbeat', function() {
  // You can listen on this event to make sure your connection is receiving events correctly
  // The server will emit a heartbeat every 30 seconds to all connected clients
  console.log("<3");
});

socket.on('error', function(err) {
  // Sometimes things go wrong!
  var type = err.type; // This is the type of error that occurred
  var message = err.message; // This is a friendly message that should describe the error
  console.log("error");
});
