(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage = /** @class */ (function () {
    function RGBImage() {
    }
    RGBImage.getIndex = function (x, y, width, height) {
        return (width * y) + x;
    };
    RGBImage.fromDimensions = function (width, height) {
        var result = new RGBImage();
        result.width = width;
        result.height = height;
        result.r = new Array(width);
        result.g = new Array(width);
        result.b = new Array(height);
        for (var x = 0; x < width; x++) {
            result.r[x] = new Array(height);
            result.g[x] = new Array(height);
            result.b[x] = new Array(height);
        }
        return result;
    };
    RGBImage.fromImageData = function (image) {
        var result = new RGBImage();
        result.width = image.width;
        result.height = image.height;
        result.r = new Array(result.width);
        result.g = new Array(result.width);
        result.b = new Array(result.width);
        for (var x = 0; x < result.width; x++) {
            result.r[x] = new Array(result.height);
            result.g[x] = new Array(result.height);
            result.b[x] = new Array(result.height);
            for (var y = 0; y < result.height; y++) {
                var index = RGBImage.getIndex(x, y, result.width, result.height) * 4;
                result.r[x][y] = image.data[index++];
                result.g[x][y] = image.data[index++];
                result.b[x][y] = image.data[index];
            }
        }
        return result;
    };
    RGBImage.prototype.getWidth = function () {
        return this.width;
    };
    RGBImage.prototype.getHeight = function () {
        return this.height;
    };
    RGBImage.prototype.asImageData = function () {
        var result = new ImageData(this.width, this.height);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var index = RGBImage.getIndex(x, y, this.width, this.height) * 4;
                result.data[index++] = this.r[x][y];
                result.data[index++] = this.g[x][y];
                result.data[index++] = this.b[x][y];
                result.data[index] = 255;
            }
        }
        return result;
    };
    RGBImage.prototype.draw = function (canvas) {
        var data = this.asImageData();
        canvas.getContext('2d').putImageData(data, 0, 0);
    };
    return RGBImage;
}());
exports.RGBImage = RGBImage;

},{}],2:[function(require,module,exports){
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Vision = __importStar(require("../vision"));
var RGBImage_1 = require("../RGBImage");
var EdgeStrength;
(function (EdgeStrength) {
    EdgeStrength[EdgeStrength["NO_EDGE"] = 0] = "NO_EDGE";
    EdgeStrength[EdgeStrength["WEAK_EDGE"] = 1] = "WEAK_EDGE";
    EdgeStrength[EdgeStrength["STRONG_EDGE"] = 2] = "STRONG_EDGE";
})(EdgeStrength || (EdgeStrength = {}));
var animating = false;
function computeEdgeAngles(image1, image2) {
    var output = new Array(image1.getWidth());
    for (var x = 0; x < image1.getWidth(); x++) {
        output[x] = new Array(image1.getHeight());
        for (var y = 0; y < image1.getHeight(); y++) {
            var angle = Math.atan2(image1.r[x][y], image2.r[x][y]) * 180 / Math.PI;
            output[x][y] = angle;
        }
    }
    return output;
}
function edgeThinning(image, gradients) {
    var result = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var angle = gradients[x][y];
            if (angle < 22.5) {
                if (image.r[x][y] == Math.max(image.r[x + 1][y], image.r[x - 1][y], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                }
                else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
            else if (angle < 67.5) {
                if (image.r[x][y] == Math.max(image.r[x][y], image.r[x + 1][y + 1], image.r[x - 1][y - 1])
                    || image.r[x][y] == Math.max(image.r[x][y], image.r[x + 1][y - 1], image.r[x - 1][y + 1])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                }
                else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
            else {
                if (image.data[index] == Math.max(image.data[Vision.getIndex(x, y + 1, image.width, image.height) * 4], image.data[Vision.getIndex(x, y - 1, image.width, image.height) * 4], image.data[index])) {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = image.data[index];
                }
                else {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = 0;
                }
            }
            result.data[index + 3] = 255;
        }
    }
    return result;
}
function thresholding(image, upperThreshold, lowerThreshold) {
    var strengths = {
        data: new Array(image.width, image.height),
        width: image.width,
        height: image.height
    };
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var index = Vision.getIndex(x, y, image.width, image.height) * 4;
            if (image.data[index] > upperThreshold) {
                strengths.data[index / 4] = EdgeStrength.STRONG_EDGE;
            }
            else if (image.data[index] > lowerThreshold) {
                strengths.data[index / 4] = EdgeStrength.WEAK_EDGE;
            }
            else {
                strengths[index / 4] = 0;
            }
        }
    }
    return strengths;
}
function edgeTracking(strengths) {
    var output = new ImageData(strengths.width, strengths.height);
    for (var x = 0; x < strengths.width; x++) {
        for (var y = 0; y < strengths.height; y++) {
            var index = Vision.getIndex(x, y, strengths.width, strengths.height);
            var imageIndex = index * 4;
            if (strengths.data[index] === EdgeStrength.STRONG_EDGE) {
                output.data[imageIndex] = output.data[imageIndex + 1] = output.data[imageIndex + 2] = 255;
            }
            else if (strengths.data[index] === EdgeStrength.WEAK_EDGE) {
                // blob analysis
                var isEdge = false;
                for (var blobx = x - 1; blobx <= x + 1; blobx++) {
                    for (var bloby = y - 1; bloby <= y + 1; bloby++) {
                        if (strengths.data[Vision.getIndex(blobx, bloby, strengths.width, strengths.height)] === EdgeStrength.STRONG_EDGE) {
                            isEdge = true;
                            break;
                        }
                    }
                    if (isEdge) {
                        break;
                    }
                }
                output.data[imageIndex] = output.data[imageIndex + 1] = output.data[imageIndex + 2] = isEdge ? 255 : 0;
            }
            else {
                output.data[imageIndex] = output.data[imageIndex + 1] = output.data[imageIndex + 2] = 0;
            }
            output.data[imageIndex + 3] = 255;
        }
    }
    return output;
}
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    var greyScaled = Vision.greyScale(inputImage);
    var blurred = Vision.convolve(greyScaled, Vision.gaussKernel, 5, 5);
    var gx = Vision.convolve(blurred, Vision.sobelKernel, 3, 3);
    var gy = Vision.convolve(blurred, Vision.sobelRotated, 3, 3);
    var intensity = Vision.combineConvolutions(gx, gy);
    var directions = computeEdgeAngles(gx, gy);
    var thinnedEdges = edgeThinning(intensity, directions);
    var lowerThreshold = +document.getElementById('lowerThreshold').value;
    var upperThreshold = +document.getElementById('upperThreshold').value;
    var thresholded = thresholding(thinnedEdges, upperThreshold, lowerThreshold);
    var output = edgeTracking(thresholded);
    document.getElementById('cannyoutput').getContext('2d').putImageData(output, 0, 0);
    if (animating) {
        requestAnimationFrame(computeFrame);
    }
}
document.getElementById('stopBtn').addEventListener('click', function (event) {
    animating = false;
});
document.getElementById('startBtn').addEventListener('click', function (event) {
    animating = true;
    computeFrame();
});
Vision.initCamera();

},{"../RGBImage":1,"../vision":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage_1 = require("./RGBImage");
exports.gaussKernel = [
    [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273],
    [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
    [7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273],
    [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
    [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273]
];
exports.sobelKernel = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1]
];
exports.sobelRotated = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1]
];
/*
 * This function is necessary since javascript stores 2-dimensional image data
 * in 1-dimensional arrays
 *
 * Since this function can't return invalid indexes, it isn't very safe. Use wisely
 */
function getIndex(x, y, width, height) {
    return (width * y) + x;
}
exports.getIndex = getIndex;
function getImageFromCanvas(canvas) {
    return RGBImage_1.RGBImage.fromImageData(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
}
exports.getImageFromCanvas = getImageFromCanvas;
function getImageFromVideo(videoElement, canvas, scale) {
    if (scale === void 0) { scale = 1; }
    var width = videoElement.videoWidth * scale;
    var height = videoElement.videoHeight * scale;
    canvas.getContext('2d').drawImage(videoElement, 0, 0, width, height);
    return RGBImage_1.RGBImage.fromImageData(canvas.getContext('2d').getImageData(0, 0, width, height));
}
exports.getImageFromVideo = getImageFromVideo;
function convolve(image, kernel, kernelWidth, kernelHeight) {
    var width = image.getWidth();
    var height = image.getHeight();
    var output = RGBImage_1.RGBImage.fromDimensions(width, height);
    var offsetX = Math.floor(kernelWidth / 2);
    var offsetY = Math.floor(kernelHeight / 2);
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var kx = 0; kx < kernelWidth; kx++) {
                for (var ky = 0; ky < kernelHeight; ky++) {
                    raccumulator += kernel[kx][ky] * image.r[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                    gaccumulator += kernel[kx][ky] * image.g[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                    baccumulator += kernel[kx][ky] * image.b[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                }
            }
            output.r[x][y] = raccumulator;
            output.g[x][y] = gaccumulator;
            output.b[x][y] = baccumulator;
        }
    }
    return output;
}
exports.convolve = convolve;
/*
 * Use this for convolving with symmetrical kernels. It has to do far fewer operations. O(n) rather than O(n^2)
 */
function convolve1d(image, kernel, preserveSign) {
    if (preserveSign === void 0) { preserveSign = false; }
    var output = new ImageData(image.width, image.height);
    var intermediate = new ImageData(image.width, image.height);
    var offset = Math.floor(kernel.length / 2);
    //first convolution
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var index = getIndex(x, y, image.width, image.height) * 4;
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var i = 0; i < kernel.length; i++) {
                raccumulator += kernel[i] * image.data[getIndex(Math.abs(x + offset - i) % image.width, y, image.width, image.height) * 4];
                gaccumulator += kernel[i] * image.data[(getIndex(Math.abs(x + offset - i) % image.width, y, image.width, image.height) * 4) + 1];
                baccumulator += kernel[i] * image.data[(getIndex(Math.abs(x + offset - i) % image.width, y, image.width, image.height) * 4) + 2];
            }
            intermediate.data[index] = preserveSign ? raccumulator : Math.abs(raccumulator);
            intermediate.data[index + 1] = preserveSign ? gaccumulator : Math.abs(gaccumulator);
            intermediate.data[index + 2] = preserveSign ? baccumulator : Math.abs(baccumulator);
            intermediate.data[index + 3] = 255;
        }
    }
    //second convolution
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var index = getIndex(x, y, image.width, image.height) * 4;
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var i = 0; i < kernel.length; i++) {
                raccumulator += kernel[i] * intermediate.data[getIndex(x + offset - i, y, intermediate.width, intermediate.height) * 4];
                gaccumulator += kernel[i] * intermediate.data[(getIndex(x + offset - i, y, intermediate.width, intermediate.height) * 4) + 1];
                baccumulator += kernel[i] * intermediate.data[(getIndex(x + offset - i, y, intermediate.width, intermediate.height) * 4) + 2];
            }
            output.data[index] = preserveSign ? raccumulator : Math.abs(raccumulator);
            output.data[index + 1] = preserveSign ? gaccumulator : Math.abs(gaccumulator);
            output.data[index + 2] = preserveSign ? baccumulator : Math.abs(baccumulator);
            output.data[index + 3] = 255;
        }
    }
    return output;
}
exports.convolve1d = convolve1d;
function greyScale(image) {
    var width = image.getWidth();
    var height = image.getHeight();
    var result = RGBImage_1.RGBImage.fromDimensions(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var avg = Math.floor((image.r[x][y] + image.g[x][y] + image.b[x][y]) / 3);
            result.r[x][y] = result.g[x][y] = result.b[x][y] = avg;
        }
    }
    return result;
}
exports.greyScale = greyScale;
function combineConvolutions(image1, image2) {
    var width = image1.getWidth();
    var height = image1.getHeight();
    var output = RGBImage_1.RGBImage.fromDimensions(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            var r1 = image1.r[x][y];
            var r2 = image2.r[x][y];
            var g1 = image1.g[x][y];
            var g2 = image2.g[x][y];
            var b1 = image1.b[x][y];
            var b2 = image2.b[x][y];
            output.r[x][y] = Math.floor(Math.sqrt((r1 * r1) + (r2 * r2)));
            output.g[x][y] = Math.floor(Math.sqrt((g1 * g1) + (g2 * g2)));
            output.b[x][y] = Math.floor(Math.sqrt((b1 * b1) + (b2 * b2)));
        }
    }
    return output;
}
exports.combineConvolutions = combineConvolutions;
function initCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
        var webcamElement = document.getElementById('webcam');
        webcamElement.srcObject = stream;
        webcamElement.addEventListener('playing', function (event) {
            var canvases = document.getElementsByTagName('canvas');
            for (var i = 0; i < canvases.length; i++) {
                canvases[i].width = webcamElement.videoWidth;
                canvases[i].height = webcamElement.videoHeight;
            }
        });
    }).catch(function (err) {
        alert(err);
    });
}
exports.initCamera = initCamera;

},{"./RGBImage":1}]},{},[2]);
