var state = {
	location: {
		x: 0,
		y: 0
	},

	points: {
		i: 0,
		rival: 0
	}
};

var socket;

main();

function main() {
	socket = io();

	var canvas = document.getElementById('canvas');
	var drawingContext = canvas.getContext('2d');
	drawingContext.translate(0.5, 0.5);

	drawingContext.lineWidth = 1;
	drawingContext.strokeRect(0, 0, canvas.width - 1, canvas.height - 1);

	canvas.addEventListener('mousemove', function(event) {
		var cursorCoords = translateCoords(
			new Point(event.clientX, event.clientY),
			canvas
		);

		state.location.x = cursorCoords.x - canvas.width / 2;
		state.location.y = cursorCoords.y - canvas.height / 2;
	});

	canvas.addEventListener('click', function(event) {
		socket.emit('click', JSON.stringify({
			x: 25,
			y: 20,
			z: 110
		}));
	});

	socket.on('data', function(data) {
		var cameraFigures = data.cameraFigures;

		draw(canvas, drawingContext, cameraFigures, 1);
	});

	socket.on('addPoint', function(data) {
		state.points[data.to]++;
		console.log(data.to + ' points: ' + state.points[data.to]);
		document.getElementById(data.to).textContent = state.points[data.to];
	});

	var GAME = {
	    start: function() {
	        setInterval(function() {
	            update(socket);
	        }, 17);
	    }
	}

	GAME.start();
}

function update(socket) {
	socket.emit('mousemove', JSON.stringify(state.location));
}

function draw(canvas, drawingContext, cameraFigures, camera2, figures, movingObjects) {
	drawingContext.fillStyle = 'black';
	drawingContext.fillRect(0, 0, canvas.width - 2, canvas.height - 2);
	drawingContext.strokeRect(0, 0, canvas.width - 1, canvas.height - 1);

	drawCameraFigures(drawingContext, cameraFigures);
}