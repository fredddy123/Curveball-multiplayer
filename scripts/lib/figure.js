function Figure(planes, velocity) {
	this.planes = planes;
	this.velocity = velocity;
}

Figure.prototype.getPosition = function() {
	return this.planes[0].points[0];
}

// Figure.prototype.setPosition = function(newPosition) {
// 	this.planes.forEach(function(plane) {
// 		plane.points.forEach(function(point) {
// 			point.x += 
// 		})
// 	});
// 	return this.planes[0].points[0];
// }

try {
	module.exports = Figure;
} catch(err) {}