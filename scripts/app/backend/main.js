var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Point = require('../../lib/point');
var Plane = require('../../lib/plane');
var utils = require('../../lib/utils');
Object.assign(module, utils);
var Figure = require('../../lib/figure');
var Camera = require('../../lib/camera');

var sockets = [];

var state = {
	gameState: 'play', // menu, play, changeLevel,
	location: new Point(0, 0),
	size: new Point(120, 80),
	color: 'rgba(0, 255, 100, 0.5)',
	login: 'player1',
	ball: {
		velocity: new Point(0, 0, 0),
		strokeVelocity: new Point(0, 0, 0),
		width: 84,
		height: 84,
		coords: [
            new Point(-30, -30, 0),
            new Point(0, -42, 0),
            new Point(30, -30, 0),
            new Point(42, 0, 0),
            new Point(30, 30, 0),
            new Point(0, 42, 0),
            new Point(-30, 30, 0),
            new Point(-42, 0, 0)
        ],
        strokeCoords: [
        	new Point(-500, -300, 0),
            new Point(500, -300, 0),
            new Point(500, 300, 0),
            new Point(-500, 300, 0)
        ]
	},
	rival: {
		gameState: 'play', // menu, play, changeLevel,
		location: new Point(0, 0, 2000),
		size: new Point(120, 80),
		color: 'rgba(0, 100, 255, 0.5)',
		login: 'player1',
		coords: [
			new Point(0, 0, 2800),
			new Point(120, 0, 2800),
			new Point(120, 80, 2800),
			new Point(0, 80, 2800)
		]
	},
	tonel: {
		left: -500,
		right: 500,
		top: -300,
		bottom: 300
	},
	paddle: {
		coords: [
			new Point(0, 0, 0),
			new Point(120, 0, 0),
			new Point(120, 80, 0),
			new Point(0, 80, 0)
		]
	}
};


var camera = new Camera(900, new Point(0, 0, -20));

camera.setAngle('x', [1 * Math.PI / 180]);
camera.setAngle('y', [10 * Math.PI / 180]);

var camera2 = new Camera(900, new Point(0, 0, 2820));

camera2.setAngle('x', [-1 * Math.PI / 180]);
camera2.setAngle('y', [-10 * Math.PI / 180, 180 * Math.PI / 180]);

var camera2dFigures;
var camera22dFigures;

var model1 = new Figure([
    new Plane([
        new Point(-498, -298, 0),
        new Point(-200, -298, 0),
        new Point(0, 0, 0)
    ], 
    'navy'
    ),
], new Point(0, 0, 10));

var ball = new Figure([
    new Plane(state.ball.coords, 
    {
    	fillColor: 'rgb(255, 0, 100)'
    }
    )
], state.ball.velocity);

var ballStroke = new Figure([
    new Plane(state.ball.strokeCoords,
    {
    	fillColor: 'rgba(0, 0, 0, 0)',
    	strokeColor: 'white'
    })
], state.ball.strokeVelocity);

var paddle = new Figure([
	new Plane(state.paddle.coords,
	{
		fillColor: state.color
	}
	)
], new Point(0, 0, 0));

var rivalPaddle = new Figure([
	new Plane(state.rival.coords,
	{
		fillColor: state.rival.color
	}
	)
], new Point(0, 0, 0));

var tonelFillColor = 'black';
var tonelStrokeColor = 'green';

var tonel = [];

var tonelBandWidth = 400;
var tonelPartsAmount = 7;

state.tonel.length = tonelBandWidth * tonelPartsAmount;

for (var i = 0; i < tonelPartsAmount; i++) {
	tonel.push(
		new Figure([
			new Plane([
				new Point(state.tonel.left, state.tonel.top, i * tonelBandWidth),
				new Point(state.tonel.left, state.tonel.top, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.right, state.tonel.top, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.right, state.tonel.top, i * tonelBandWidth)
			],
			{
				fillColor: tonelFillColor,
				strokeColor: tonelStrokeColor
			}
			),
			new Plane([
				new Point(state.tonel.right, state.tonel.top, i * tonelBandWidth),
				new Point(state.tonel.right, state.tonel.top, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.right, state.tonel.bottom, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.right, state.tonel.bottom, i * tonelBandWidth)
			],
			{
				fillColor: tonelFillColor,
				strokeColor: tonelStrokeColor
			}
			),
			new Plane([
				new Point(state.tonel.right, state.tonel.bottom, i * tonelBandWidth),
				new Point(state.tonel.right, state.tonel.bottom, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.left, state.tonel.bottom, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.left, state.tonel.bottom, i * tonelBandWidth)
			],
			{
				fillColor: tonelFillColor,
				strokeColor: tonelStrokeColor
			}
			),
			new Plane([
				new Point(state.tonel.left, state.tonel.bottom, i * tonelBandWidth),
				new Point(state.tonel.left, state.tonel.bottom, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.left, state.tonel.top, i * tonelBandWidth + tonelBandWidth),
				new Point(state.tonel.left, state.tonel.top, i * tonelBandWidth)
			],
			{
				fillColor: tonelFillColor,
				strokeColor: tonelStrokeColor
			}
			)
		])
	);
}

var figures = [
	
].concat(tonel).concat([
	rivalPaddle,
	ball,
	ballStroke,
	paddle
]);

var rivalFigures = [
	
].concat(tonel).concat([
	paddle,
	ball,
	ballStroke,
	rivalPaddle
]);

var movingObjects = {
	paddle: paddle,
	rivalPaddle: rivalPaddle,
	ball: ball
}

var GAME = {
    start: function() {
        setInterval(function() {
            update(camera, camera2, figures, rivalFigures, movingObjects);
        }, 17);
    }
}

GAME.start();

function update(camera, camera2, figures, rivalFigures, movingObjects) {
	movingObjects.paddle.planes[0].points = [
		new Point(state.location.x, state.location.y + 0, 0),
		new Point(state.location.x + 120, state.location.y + 0, 0),
		new Point(state.location.x + 120, state.location.y + 80, 0),
		new Point(state.location.x + 0, state.location.y + 80, 0)
	]

	movingObjects.rivalPaddle.planes[0].points = [
		new Point(state.rival.location.x, state.rival.location.y + 0, 2800),
		new Point(state.rival.location.x + 120, state.rival.location.y + 0, 2800),
		new Point(state.rival.location.x + 120, state.rival.location.y + 80, 2800),
		new Point(state.rival.location.x + 0, state.rival.location.y + 80, 2800)
	]

	if (movingObjects.ball.getPosition().x + state.ball.width > state.tonel.right
		|| movingObjects.ball.getPosition().x < state.tonel.left) {
		state.ball.velocity.x *= -1;
	} else if (movingObjects.ball.getPosition().y + state.ball.height > state.tonel.bottom
		|| movingObjects.ball.getPosition().y < state.tonel.top) {
		state.ball.velocity.y *= -1;
	}

	if (movingObjects.ball.getPosition().z > state.tonel.length) {
		state.ball.velocity.z *= -1;

		if (utils.isIntersects(
			{
				x: ball.getPosition().x,
				y: ball.getPosition().y,
				width: state.ball.width,
				height: state.ball.height
			},
			{
				x: state.rival.location.x,
				y: state.rival.location.y,
				width: state.rival.size.x,
				height: state.rival.size.y
			}
		)) {
			if (sockets[0]) {
				sockets[0].emit('addPoint', {
					to: 'rival'
				});
			}

			if (sockets[1]) {
				sockets[1].emit('addPoint', {
					to: 'i'
				});
			}

			rivalPaddle.planes[0].color.fillColor = 'rgb(220, 220, 150)';

			setTimeout(function() {
				rivalPaddle.planes[0].color.fillColor = state.rival.color;
			}, 100);
		}
	}

	if (movingObjects.ball.getPosition().z < 0) {
		state.ball.velocity.z *= -1;

		if (utils.isIntersects(
			{
				x: ball.getPosition().x,
				y: ball.getPosition().y,
				width: state.ball.width,
				height: state.ball.height
			},
			{
				x: state.location.x,
				y: state.location.y,
				width: state.size.x,
				height: state.size.y
			}
		)) {
			if (sockets[0]) {
				sockets[0].emit('addPoint', {
					to: 'i'
				});

				paddle.planes[0].color.fillColor = 'rgb(220, 220, 150)';

				setTimeout(function() {
					paddle.planes[0].color.fillColor = state.color;
				}, 100);
			}

			if (sockets[1]) {
				sockets[1].emit('addPoint', {
					to: 'rival'
				});
			}
		}
	}

	state.ball.strokeCoords.forEach(function(point) {
		point.z = movingObjects.ball.getPosition().z;
	});

	figures.forEach(function(figure) {
        if (figure.velocity) {
            figure.planes.forEach(function(plane) {
                plane.points.forEach(function(point) {
                    point.x += figure.velocity.x;
                    point.y += figure.velocity.y;
                    point.z += figure.velocity.z;
                });
            });
        }
    });

	camera.capture(figures);
	camera2.capture(rivalFigures);

	if (sockets[0]) {
		sockets[0].emit('data', {
			cameraFigures: camera.get2dFigures()
		});
	}

	if (sockets[1]) {
		sockets[1].emit('data', {
			cameraFigures: camera2.get2dFigures()
		});
	}
}




io.on('connection', function(socket) {
	if (sockets.length === 2) {
		return;
	}

	sockets.push(socket);
	console.log('connected');

	socket.on('disconnect', function() {
		sockets.splice(sockets.indexOf(socket), 1);
		console.log('disconnected');
	});

	socket.on('mousemove', function(data) {
		data = JSON.parse(data);

		if (socket === sockets[0]) {
			state.location.x = data.x  - state.size.x / 2;
			state.location.y = data.y  - state.size.y / 2;
		} else {
			state.rival.location.x = -(data.x  + state.size.x / 2);
			state.rival.location.y = data.y  - state.size.y / 2;
		}
		
	});

	socket.on('click', function(data) {
		data = JSON.parse(data);
		state.ball.velocity.z = data.z;
		state.ball.velocity.x = data.x;
		state.ball.velocity.y = data.y;
	});
});

app.use(express.static(getDescentedPath(__dirname, '../../')));

app.get('/', function(req, res){
    res.sendFile(getDescentedPath(__dirname, '../../index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getDescentedPath(absolutePath, relative) {
	var tree = absolutePath.split('\\');

	var numberOfDescents = relative.split('../').length;
	var relativePath = relative.split('../').join('');

	return tree.slice(0, tree.length - numberOfDescents).join('\\') + '\\' + relativePath;
}