(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Vision = __importStar(require("./vision"));
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
    var videoElement = document.getElementById('webcam');
    var camfeedctx = document.getElementById('camfeed').getContext('2d');
    camfeedctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
    var inputImage = camfeedctx.getImageData(0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
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

},{"./vision":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    // The following 4 if statements are used to "extend" the image beyond it's boundaries so that edge and corner
    // pixels can be calculated as well.
    if (x < 0) {
        x++;
    }
    if (y < 0) {
        y++;
    }
    if (x >= width) {
        x = width - 1;
    }
    if (y >= height) {
        y = height - 1;
    }
    return (width * y) + x;
}
exports.getIndex = getIndex;
/*
 * Convolves image with kernel
 */
function convolve(image, kernel, kernelWidth, kernelHeight, preserveSign) {
    if (preserveSign === void 0) { preserveSign = false; }
    var output = new ImageData(image.width, image.height);
    var offsetX = Math.floor(kernelWidth / 2);
    var offsetY = Math.floor(kernelHeight / 2);
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var accumulator = 0;
            for (var kx = 0; kx < kernelWidth; kx++) {
                for (var ky = 0; ky < kernelHeight; ky++) {
                    accumulator += kernel[kx][ky] * image.data[getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4];
                }
            }
            var index = getIndex(x, y, image.width, image.height) * 4;
            output.data[index] = output.data[index + 1] = output.data[index + 2] = preserveSign ? accumulator : Math.abs(accumulator);
            output.data[index + 3] = 255;
        }
    }
    return output;
}
exports.convolve = convolve;
/*
 * Use this for convolving with symmetrical kernels. It has to do far fewer operations. O(n) rather than O(n^2)
 */
function convolve1d(image, kernel, kernelLength, preserveSign) {
    if (preserveSign === void 0) { preserveSign = false; }
    var output = new ImageData(image.width, image.height);
    var intermediate = new ImageData(image.width, image.height);
    var offset = Math.floor(kernelLength / 2);
    //first convolution
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var index = getIndex(x, y, image.width, image.height) * 4;
            var accumulator = 0;
            for (var i = 0; i < kernelLength; i++) {
                accumulator += kernel[i] * image.data[getIndex(x + offset - i, y, image.width, image.height) * 4];
            }
            intermediate.data[index] = intermediate.data[index + 1] = intermediate.data[index + 2] = accumulator;
            intermediate.data[index + 3] = 255;
        }
    }
    //second convolution
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var index = getIndex(x, y, image.width, image.height);
            var accumulator = 0;
            for (var i = 0; i < kernelLength; i++) {
                accumulator += kernel[i] * intermediate.data[getIndex(x, y + offset - i, image.width, image.height) * 4];
            }
            output.data[index] = output.data[index + 1] = output.data[index + 2] = accumulator;
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
function initCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
        var webcamElement = document.getElementById('webcam');
        webcamElement.srcObject = stream;
        webcamElement.addEventListener('playing', function (event) {
            var canvases = document.getElementsByTagName('canvas');
            for (var i = 0; i < canvases.length; i++) {
                canvases[i].width = webcamElement.videoWidth * 0.75;
                canvases[i].height = webcamElement.videoHeight * 0.75;
            }
        });
    }).catch(function (err) {
        alert(err);
    });
}
exports.initCamera = initCamera;

},{}]},{},[1]);
