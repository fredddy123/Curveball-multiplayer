var Point;
var utils;
var Rectangle;
var cloneObject;

try {
    Point = require('./point');
    utils = require('./utils');
    Rectangle = utils.Rectangle;
    cloneObject = utils.cloneObject;
} catch(err) {}

function Camera(focus, position) {
    this.focus = focus;
    this.position = position || new Point(0, 0, 0);
    this.viewPort = new Rectangle(-650, -325, 1300, 650);
    this.xAngle = 0;
    this.capturedXAngle = 0;
    this.rotation = {
        x: [],
        y: []
    }
}

Camera.prototype.capture = function(worldFigures) {
    // console.log('worldFigures[0].planes[0].points[0]', worldFigures[0].planes[0].points[0]);
    this.worldFigures = worldFigures;

    this.makeCameraFigures();
    // console.log('this.cameraFigures[0].planes[0].points[0]', this.cameraFigures[0].planes[0].points[0]);
    this.makePerspective();
}

Camera.prototype.makeCameraFigures = function() {
    this.cameraFigures = cloneObject(this.worldFigures);
    
    var self = this;
    
    this.cameraFigures.forEach(function(figure) {
        figure.planes.forEach(function(plane) {
            plane.points.forEach(function(point) {
                point.x -= self.position.x;
                point.y -= self.position.y;
                point.z -= self.position.z;
            });
        });
    });

    var self = this;

    this.rotation['x'].forEach(function(angle, index) {
        if (angle !== 0) {
            self.rotate('x', angle, index);
        }
    });

    this.rotation['y'].forEach(function(angle, index) {
        if (angle !== 0) {
            self.rotate('y', angle, index);
        }
    });

    // if (this.rotation['x'] !== 0) {
    //     this.rotate('x', this.rotation['x']);
    // }

    // if (this.rotation['y'] !== 0) {
    //     this.rotate('y', this.rotation['y']);
    // }
}

Camera.prototype.setAngle = function(axis, angles) {
    var self = this;

    angles.forEach(function(angle, index) {
        if (self.rotation[axis][index] === undefined) {
            self.rotation[axis][index] = 0;
        }
        self.rotation[axis][index] += angle;
    });
}

Camera.prototype.rotate = function(axis, angle, index) {
    // console.log('this.cameraFigures[0].planes[0].points[0]', this.cameraFigures[0].planes[0].points[0]);
    //console.log('rotate axis', axis);
    //console.log('rotate angle', angle);
    //console.log('this.xAngle', this.xAngle);
    var self = this;

    switch (axis) {
        case 'x': {
            this.capturedXAngle = this.xAngle || this.capturedXAngle;
            if (index === 1) {
                this.xAngle = 0;
            } else {
                this.xAngle = this.capturedXAngle;
                this.xAngle += angle;
            }
            
            // if (this.xAngle > Math.PI / 2) {
            //     this.xAngle -= angle;
            //     break;
            // }
            
            // if (this.xAngle < -Math.PI / 2) {
            //     this.xAngle -= angle;
            //     break;
            // }

            this.cameraFigures.forEach(function(figure) {
                figure.planes.forEach(function(plane) {
                    plane.points.forEach(function(point) {
                        var tempY = point.y * Math.cos(angle) - point.z * Math.sin(angle);
                        point.z = point.y * Math.sin(angle) + point.z * Math.cos(angle);
                        point.y = tempY;
                    });
                });
            });
            break;
        }
        case 'y': {
            this.capturedXAngle = this.xAngle || this.capturedXAngle;
            if (index === 1) {
                this.xAngle = 0;
            }
            this.cameraFigures.forEach(function(figure) {
                figure.planes.forEach(function(plane) {
                    plane.points.forEach(function(point) {
                        var tempY = point.y * Math.cos(-self.xAngle) - point.z * Math.sin(-self.xAngle);
                        point.z = point.y * Math.sin(-self.xAngle) + point.z * Math.cos(-self.xAngle);
                        point.y = tempY;
                    });
                });
            });
            
            self.cameraFigures.forEach(function(figure) {
                figure.planes.forEach(function(plane) {
                    plane.points.forEach(function(point) {
                        var tempX = point.x * Math.cos(angle) - point.z * Math.sin(angle);
                        point.z = point.x * Math.sin(angle) + point.z * Math.cos(angle);
                        point.x = tempX;
                    });
                });
            });
            
            this.cameraFigures.forEach(function(figure) {
                figure.planes.forEach(function(plane) {
                    plane.points.forEach(function(point) {
                        var tempY = point.y * Math.cos(self.xAngle) - point.z * Math.sin(self.xAngle);
                        point.z = point.y * Math.sin(self.xAngle) + point.z * Math.cos(self.xAngle);
                        point.y = tempY;
                    });
                });
            });

            if (index === 1) {
                this.xAngle = this.capturedXAngle;
            }
            break;
        }
    }

//    this.makePerspective();
}

Camera.prototype.move = function(direction) {    
    this.cameraFigures.forEach(function(figure) {
        figure.planes.forEach(function(plane) {
            plane.points.forEach(function(point) {
                point.x -= direction.x;
                point.y -= direction.y;
                point.z -= direction.z;
            });
        });
    });

    this.makePerspective();
}

Camera.prototype.makePerspective = function() {
    this.perspective2dFigures = cloneObject(this.cameraFigures);
    // console.log('this.perspective2dFigures[0].planes[0].points[0]', this.perspective2dFigures[0].planes[0].points[0]);

    var self = this;

    this.perspective2dFigures.forEach(function(figure) {
        figure.planes.forEach(function(plane) {
            plane.points.forEach(function(point) {
                var tempX = (point.x * self.focus) / (self.focus + point.z);
                point.y = (point.y * self.focus) / (self.focus + point.z);
                point.x = tempX;
            });
        });
    });
}

Camera.prototype.get2dFigures = function() {    
    return this.perspective2dFigures;
}

try {
    module.exports = Camera;
} catch(err) {
}