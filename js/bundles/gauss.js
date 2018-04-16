(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage = /** @class */ (function () {
    function RGBImage() {
        // Intentionally blank and private. Use the static constructors. This is done because
        // typescript doesn't allow constructor overloading. To instantiate and RGBImage,
        // instead of using 
        //     new RGBImage(...);
        // use
        //     RGBImage.fromDimensions();
        // or
        //     RGBImage.fromImageData();
        this.greyscale = false;
    }
    RGBImage.getIndex = function (x, y, width, height) {
        return (width * y) + x;
    };
    /**
     * Constructor to initialise a blank image from given dimensions
     * @param width width of the image
     * @param height height of the image
     */
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
    /**
     * Constructor to initialise an image from Javascript's ImageData class
     * @param image
     */
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
    /**
     * Returns a copy of this image
     * @param image
     */
    RGBImage.clone = function (image) {
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
                result.r[x][y] = image.r[x][y];
                result.g[x][y] = image.g[x][y];
                result.b[x][y] = image.b[x][y];
            }
        }
        return result;
    };
    /**
     * Returns the image's width
     */
    RGBImage.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Returns the image's height
     */
    RGBImage.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Returns the image in Javascript's ImageData format.
     */
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
    /**
     * Draws this image on a canvas
     * @param canvas the canvas on which the image is to be drawn
     */
    RGBImage.prototype.draw = function (canvas) {
        var data = this.asImageData();
        canvas.getContext('2d').putImageData(data, 0, 0);
    };
    RGBImage.prototype.toGreyscale = function () {
        var result = RGBImage.fromDimensions(this.width, this.height);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var avg = (this.r[x][y] + this.g[x][y] + this.b[x][y]) / 3;
                result.r[x][y] = result.g[x][y] = result.b[x][y] = avg;
            }
        }
        result.greyscale = true;
        return result;
    };
    RGBImage.prototype.setGreyscale = function (val) {
        this.greyscale = val;
    };
    RGBImage.prototype.isGreyscale = function () {
        return this.greyscale;
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
var animating = false;
var stdDev = +document.getElementById('stdDev').value;
var kernelSize = +document.getElementById('kernelSize').value;
// This kernel will actually be used for the calculations
var convolutionKernel;
// This kernel will just be displayed, and will not be used in calculations, for efficiency
var displayKernel;
function computeKernel(size, weight) {
    var result = new Array(size);
    var sumTotal = 0;
    var offset = Math.floor(size / 2);
    for (var i = 0 - offset; i <= offset; i++) {
        sumTotal += result[i + offset] = (1 / Math.sqrt(2 * Math.PI * weight * weight)) * Math.pow(Math.E, 0 - ((i * i) / (2 * weight * weight)));
    }
    for (var i = 0; i < size; i++) {
        result[i] = result[i] / sumTotal;
    }
    return result;
}
function expandKernel(kernel) {
    var result = new Array(kernel.length);
    for (var x = 0; x < kernel.length; x++) {
        result[x] = new Array(kernel.length);
        for (var y = 0; y < kernel.length; y++) {
            result[x][y] = kernel[x] * kernel[y];
        }
    }
    return result;
}
function writeMatrix(matrix) {
    var matrixElement = document.getElementById('matrix');
    var resultString = "";
    for (var y = 0; y < matrix.length; y++) {
        resultString += "<tr>";
        for (var x = 0; x < matrix[y].length; x++) {
            resultString += "<td>" + matrix[x][y] + "</td>";
        }
        resultString += "</tr>";
    }
    matrixElement.innerHTML = resultString;
}
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    var outputImage = Vision.convolve1d(inputImage, convolutionKernel);
    outputImage.draw(document.getElementById('convolutionout'));
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
document.getElementById('kernelSize').addEventListener('change', function (event) {
    var tmp = this;
    var val = tmp.value;
    if (+val != NaN) {
        kernelSize = +val;
    }
    convolutionKernel = computeKernel(kernelSize, stdDev);
    displayKernel = expandKernel(convolutionKernel);
    writeMatrix(displayKernel);
});
document.getElementById('stdDev').addEventListener('change', function (event) {
    var tmp = this;
    var val = tmp.value;
    if (+val != NaN) {
        stdDev = +val;
    }
    convolutionKernel = computeKernel(kernelSize, stdDev);
    displayKernel = expandKernel(convolutionKernel);
    writeMatrix(displayKernel);
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
exports.gauss1d = [0.06136, 0.24477, 0.38774, 0.24477, 0.06136];
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
/**
 * Returns the current frame on a canvas
 * @param canvas
 */
function getImageFromCanvas(canvas) {
    return RGBImage_1.RGBImage.fromImageData(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
}
exports.getImageFromCanvas = getImageFromCanvas;
/**
 * Returns the current frame from a video element
 * @param videoElement the video element the frame is to be grabbed from
 * @param canvas the canvas on which the frame is to be drawn
 * @param scale the scaling factor. Default is 1
 */
function getImageFromVideo(videoElement, canvas, scale) {
    if (scale === void 0) { scale = 1; }
    var width = videoElement.videoWidth * scale;
    var height = videoElement.videoHeight * scale;
    canvas.getContext('2d').drawImage(videoElement, 0, 0, width, height);
    return RGBImage_1.RGBImage.fromImageData(canvas.getContext('2d').getImageData(0, 0, width, height));
}
exports.getImageFromVideo = getImageFromVideo;
/**
 * Convolves an image with a kernel.
 * @param image The image to be convolved
 * @param kernel The convolution kernel
 * @param kernelWidth The width of the kernel
 * @param kernelHeight The height of the kernel
 */
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
/**
 * The same as a normal convolution except it only convolves one channel. Use this
 * with greyscale images, as it cuts out 2/3 of the unnecessary calculations
 * @param image the image to be convolved
 * @param kernel the kernel
 * @param kernelWidth the kernel's width
 * @param kernelHeight the kernel's height
 */
function greyscaleConvolve(image, kernel, kernelWidth, kernelHeight) {
    var width = image.getWidth();
    var height = image.getHeight();
    var output = RGBImage_1.RGBImage.fromDimensions(width, height);
    var offsetX = Math.floor(kernelWidth / 2);
    var offsetY = Math.floor(kernelHeight / 2);
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var acc = 0;
            for (var kx = 0; kx < kernelWidth; kx++) {
                for (var ky = 0; ky < kernelHeight; ky++) {
                    acc += kernel[kx][ky] * image.r[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                }
            }
            output.r[x][y] = output.g[x][y] = output.b[x][y] = acc;
        }
    }
    return output;
}
exports.greyscaleConvolve = greyscaleConvolve;
/**
 * This function is to be used when convolving an image with a symmetrical kernel. The kernel passed
 * to this function has to be 1-dimensional. The image will then be convolved with the kernel in the
 * x-direction, and the result of that will be convolved with the same kernel in the y-direction.
 * Doing convolutions this way with symmetric kernels greatly reduces the number of calculations to be
 * done, so use this wherever possible.
 * @param image the image to be convolved
 * @param kernel the 1-dimensional kernel
 */
function convolve1d(image, kernel) {
    var output = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    var intermediate = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    var offset = Math.floor(kernel.length / 2);
    //first convolution
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var i = 0; i < kernel.length; i++) {
                raccumulator += kernel[i] * image.r[Math.abs(x + offset - i) % image.getWidth()][y];
                gaccumulator += kernel[i] * image.g[Math.abs(x + offset - i) % image.getWidth()][y];
                baccumulator += kernel[i] * image.b[Math.abs(x + offset - i) % image.getWidth()][y];
            }
            intermediate.r[x][y] = Math.abs(raccumulator);
            intermediate.g[x][y] = Math.abs(gaccumulator);
            intermediate.b[x][y] = Math.abs(baccumulator);
        }
    }
    //second convolution
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var i = 0; i < kernel.length; i++) {
                raccumulator += kernel[i] * intermediate.r[x][Math.abs(y + offset - i) % image.getHeight()];
                gaccumulator += kernel[i] * intermediate.g[x][Math.abs(y + offset - i) % image.getHeight()];
                baccumulator += kernel[i] * intermediate.b[x][Math.abs(y + offset - i) % image.getHeight()];
            }
            output.r[x][y] = Math.abs(raccumulator);
            output.g[x][y] = Math.abs(gaccumulator);
            output.b[x][y] = Math.abs(baccumulator);
        }
    }
    return output;
}
exports.convolve1d = convolve1d;
/**
 * Returns a greyscaled version of an image
 * @param image
 */
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
/**
 * Performs a pythagorean combination of two images. Each pixel in the output image
 * is equivalent to the sum of the squares of the corresponding pixel in the two
 * input images.
 * @param image1
 * @param image2
 */
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
/**
 * Initialises the webcam and scales all canvases on the page to the dimensions of the camera's image
 */
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
/**
 * Performs a simple background subtraction with two images and returns the foreground
 * @param image the image being analyzed
 * @param backgroundModel the background frame
 * @param threshold the difference threshold
 */
function getForeground(image, backgroundModel, threshold) {
    backgroundModel = greyScale(backgroundModel);
    var imageGreyscale = greyScale(image);
    var foreground = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var diff = Math.abs(imageGreyscale.r[x][y] - backgroundModel.r[x][y]);
            if (diff > threshold) {
                foreground.r[x][y] = image.r[x][y];
                foreground.g[x][y] = image.g[x][y];
                foreground.b[x][y] = image.b[x][y];
            }
        }
    }
    return foreground;
}
exports.getForeground = getForeground;
/**
 * Returns the background pixels from a background subtraction
 * @param image
 * @param backgroundModel
 * @param threshold
 */
function getBackground(image, backgroundModel, threshold) {
    backgroundModel = greyScale(backgroundModel);
    var imageGreyscale = greyScale(image);
    var background = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var diff = Math.abs(imageGreyscale.r[x][y] - backgroundModel.r[x][y]);
            if (diff < threshold) {
                background.r[x][y] = image.r[x][y];
                background.g[x][y] = image.g[x][y];
                background.b[x][y] = image.b[x][y];
            }
        }
    }
    return background;
}
exports.getBackground = getBackground;
/**
 * Returns the difference mask of two images
 * @param background the background model
 * @param image the current image
 */
function imageDiff(background, image) {
    var result = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var rdiff = Math.abs(image.r[x][y] - background.r[x][y]);
            var gdiff = Math.abs(image.g[x][y] - background.g[x][y]);
            var bdiff = Math.abs(image.b[x][y] - background.b[x][y]);
            result.r[x][y] = rdiff;
            result.g[x][y] = gdiff;
            result.b[x][y] = bdiff;
        }
    }
    return result;
}
exports.imageDiff = imageDiff;

},{"./RGBImage":1}]},{},[2]);
