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
var blurring = false;
var animating = false;
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    if (blurring) {
        inputImage = Vision.RGBConvolve(inputImage, Vision.gaussKernel, 5, 5);
    }
    inputImage = Vision.RGBGreyScale(inputImage);
    var x = Vision.RGBConvolve(inputImage, Vision.sobelKernel, 3, 3);
    var y = Vision.RGBConvolve(inputImage, Vision.sobelRotated, 3, 3);
    var both = Vision.RGBcombineConvolutions(x, y);
    document.getElementById('sobelx').getContext('2d').putImageData(x.asImageData(), 0, 0);
    document.getElementById('sobely').getContext('2d').putImageData(y.asImageData(), 0, 0);
    document.getElementById('sobelboth').getContext('2d').putImageData(both.asImageData(), 0, 0);
    if (animating) {
        requestAnimationFrame(computeFrame);
    }
}
document.getElementById('startBtn').addEventListener('click', function (event) {
    animating = true;
    computeFrame();
});
document.getElementById('stopBtn').addEventListener('click', function (event) {
    animating = false;
});
document.getElementById('gaussianToggle').addEventListener('change', function (event) {
    if (this.checked) {
        blurring = true;
    }
    else {
        blurring = false;
    }
});
Vision.initCamera();

},{"../vision":3}],3:[function(require,module,exports){
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
/*
 * Convolves a greyscale image with kernel
 */
function convolve(image, kernel, kernelWidth, kernelHeight) {
    var output = new ImageData(image.width, image.height);
    var offsetX = Math.floor(kernelWidth / 2);
    var offsetY = Math.floor(kernelHeight / 2);
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var kx = 0; kx < kernelWidth; kx++) {
                for (var ky = 0; ky < kernelHeight; ky++) {
                    raccumulator += kernel[kx][ky] * image.data[getIndex(Math.abs(x + offsetX - kx) % image.width, Math.abs(y + offsetY - ky) % image.height, image.width, image.height) * 4];
                    gaccumulator += kernel[kx][ky] * image.data[(getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4) + 1];
                    baccumulator += kernel[kx][ky] * image.data[(getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4) + 2];
                }
            }
            var index = getIndex(x, y, image.width, image.height) * 4;
            output.data[index] = Math.abs(raccumulator);
            output.data[index + 1] = Math.abs(gaccumulator);
            output.data[index + 2] = Math.abs(baccumulator);
            output.data[index + 3] = 255;
        }
    }
    return output;
}
exports.convolve = convolve;
function RGBConvolve(image, kernel, kernelWidth, kernelHeight) {
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
exports.RGBConvolve = RGBConvolve;
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
/*
 * Returns a greyscaled version of an image
 */
function greyScale(image) {
    var data = new Uint8ClampedArray(image.data.length);
    for (var i = 0; i < image.data.length; i += 4) {
        var avg = image.data[i] + image.data[i + 1] + image.data[i + 2];
        avg = avg / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
        // Set opacity to max. Remember, this is RGBA, not RGB
        data[i + 3] = 255;
    }
    return new ImageData(data, image.width, image.height);
}
exports.greyScale = greyScale;
function RGBGreyScale(image) {
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
exports.RGBGreyScale = RGBGreyScale;
function combineConvolutions(image1, image2) {
    var output = new ImageData(image1.width, image1.height);
    for (var i = 0; i < image1.data.length; i += 4) {
        var val1 = image1.data[i];
        var val2 = image2.data[i];
        output.data[i] = output.data[i + 1] = output.data[i + 2] = Math.sqrt((val1 * val1) + (val2 * val2));
        output.data[i + 3] = 255;
    }
    return output;
}
exports.combineConvolutions = combineConvolutions;
function RGBcombineConvolutions(image1, image2) {
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
exports.RGBcombineConvolutions = RGBcombineConvolutions;
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
