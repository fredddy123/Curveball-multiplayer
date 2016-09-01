function Rectangle(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
}

function cloneObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function translateCoords(coords, canvas) {
	var canvasCoords = canvas.getBoundingClientRect();

	return new Point(
		coords.x - canvasCoords.left,
		coords.y - canvasCoords.top
	);
}

function drawCameraFigures(ctx, cameraFigures) {
    cameraFigures.forEach(function (figure) {
        figure.planes.forEach(function (plane) {
            fillPlane(plane, ctx);
        })
    })
}

function fillPlane(plane, ctx) {
    ctx.beginPath();
    ctx.moveTo(10, 20);

    ctx.moveTo(plane.points[0].x + canvas.width / 2, plane.points[0].y + canvas.height / 2);

    for (var i = 1; i < plane.points.length; i++) {
        ctx.lineTo(plane.points[i].x + canvas.width / 2, plane.points[i].y + canvas.height / 2);
    }
    ctx.closePath();

    ctx.fillStyle = plane.color.fillColor;
    ctx.fill();

    ctx.strokeStyle = plane.color.strokeColor;
    ctx.strokeWidth = 5;
    ctx.stroke();
}

function isArray(value) {
	return !!value.splice;
}

function isIntersects(plane1, plane2) {
	return (plane1.x + plane1.width > plane2.x && plane1.x + plane1.width< plane2.x + plane2.width
		|| plane1.x < plane2.x + plane2.width&& plane1.x > plane2.x)
		&& (plane1.y + plane1.height> plane2.y && plane1.y + plane1.height< plane2.y + plane2.height
		|| plane1.y < plane2.y + plane2.height&& plane1.y > plane2.y);
}

try {
	module.exports = {
		Rectangle: Rectangle,
		cloneObject: cloneObject,
		translateCoords: translateCoords,
		drawCameraFigures: drawCameraFigures,
		fillPlane: fillPlane,
		isArray: isArray,
		isIntersects: isIntersects
	}
} catch(err) {}
