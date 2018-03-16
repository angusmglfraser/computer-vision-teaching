(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var EdgeStrength;
(function (EdgeStrength) {
    EdgeStrength[EdgeStrength["NO_EDGE"] = 0] = "NO_EDGE";
    EdgeStrength[EdgeStrength["WEAK_EDGE"] = 1] = "WEAK_EDGE";
    EdgeStrength[EdgeStrength["STRONG_EDGE"] = 2] = "STRONG_EDGE";
})(EdgeStrength || (EdgeStrength = {}));
var animating = false;
function computeEdgeAngles(image1, image2) {
    var output = new Uint8ClampedArray(image1.width * image1.height);
    for (var i = 0; i < image1.data.length; i += 4) {
        var angle = Math.atan2(image1.data[i], image2.data[i]) * 180 / Math.PI;
        output[i / 4] = angle;
    }
    return output;
}
function edgeThinning(image, gradients) {
    var result = new ImageData(image.width, image.height);
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var index = Vision.getIndex(x, y, image.width, image.height) * 4;
            var angle = gradients[index / 4];
            if (angle < 22.5) {
                if (image.data[index] == Math.max(image.data[Vision.getIndex(x + 1, y, image.width, image.height) * 4], image.data[Vision.getIndex(x - 1, y, image.width, image.height) * 4], image.data[index])) {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = image.data[index];
                }
                else {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = 0;
                }
            }
            else if (angle < 67.5) {
                if (image.data[index] == Math.max(image.data[index], image.data[Vision.getIndex(x + 1, y + 1, image.width, image.height) * 4], image.data[Vision.getIndex(x - 1, y - 1, image.width, image.height) * 4])
                    || image.data[index] == Math.max(image.data[index], image.data[Vision.getIndex(x + 1, y - 1, image.width, image.height) * 4], image.data[Vision.getIndex(x - 1, y + 1, image.width, image.height) * 4])) {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = image.data[index];
                }
                else {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = 0;
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
    var videoElement = document.getElementById('webcam');
    var camfeedctx = document.getElementById('camfeed').getContext('2d');
    camfeedctx.drawImage(videoElement, 0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
    var inputImage = camfeedctx.getImageData(0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
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

},{"../vision":2}],2:[function(require,module,exports){
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
    return (width * y) + x;
}
exports.getIndex = getIndex;
/*
 * Convolves a greyscale image with kernel
 */
function convolve(image, kernel, kernelWidth, kernelHeight) {
    var output = new ImageData(image.width, image.height);
    var offsetX = Math.floor(kernelWidth / 2);
    var offsetY = Math.floor(kernelHeight / 2);
    // Done 1 pixel inwards from image boundary. Edges/corners will be handled separately
    for (var x = 1; x < image.width - 1; x++) {
        for (var y = 1; y < image.height - 1; y++) {
            var raccumulator = 0;
            var gaccumulator = 0;
            var baccumulator = 0;
            for (var kx = 0; kx < kernelWidth; kx++) {
                for (var ky = 0; ky < kernelHeight; ky++) {
                    raccumulator += kernel[kx][ky] * image.data[getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4];
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
/*
 * I swear there is a more elegant way to do this, but I can't think of it. For now I'm stuck with this monstrosity
 */
function convolveCorners(image, kernel, kernelWidth, kernelHeight) {
    var result = new Array(12);
    // top left
    for (var i = 0; i < 3; i++) {
        var acc = 0;
        acc += kernel[0][0] * image.data[0 + i];
        acc += kernel[0][1] * image.data[0 + i];
        acc += kernel[0][2] * image.data[(getIndex(0, 1, image.width, image.height) * 4) + i];
        acc += kernel[1][0] * image.data[0 + i];
        acc += kernel[1][1] * image.data[0 + i];
        acc += kernel[1][2] * image.data[(getIndex(0, 1, image.width, image.height) * 4) + i];
        acc += kernel[2][0] * image.data[4 + i];
        acc += kernel[2][1] * image.data[4 + i];
        acc += kernel[2][2] * image.data[(getIndex(1, 1, image.width, image.height) * 4) + i];
        result[i] = acc;
    }
    // top right
    for (var i = 0; i < 3; i++) {
        var acc = 0;
        acc += kernel[0][0] * image.data[(getIndex(image.width - 2, 0, image.width, image.height) * 4) + i];
        acc += kernel[0][1] * image.data[(getIndex(image.width - 2, 0, image.width, image.height) * 4) + i];
        acc += kernel[0][2] * image.data[(getIndex(image.width - 2, 1, image.width, image.height) * 4) + i];
        acc += kernel[1][0] * image.data[(getIndex(image.width - 1, 0, image.width, image.height) * 4) + i];
        acc += kernel[1][1] * image.data[(getIndex(image.width - 1, 0, image.width, image.height) * 4) + i];
        acc += kernel[1][2] * image.data[(getIndex(image.width - 1, 1, image.width, image.height) * 4) + i];
        acc += kernel[2][0] * image.data[(getIndex(image.width - 1, 0, image.width, image.height) * 4) + i];
        acc += kernel[2][1] * image.data[(getIndex(image.width - 1, 0, image.width, image.height) * 4) + i];
        acc += kernel[2][2] * image.data[(getIndex(image.width - 1, 1, image.width, image.height) * 4) + i];
        result[3 + i] = acc;
    }
    // bottom left
    for (var i = 0; i < 3; i++) {
        var acc = 0;
        acc += kernel[0][0] * image.data[(getIndex(0, image.height - 2, image.width, image.height) * 4) + i];
        acc += kernel[0][1] * image.data[(getIndex(0, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[0][2] * image.data[(getIndex(0, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[1][0] * image.data[(getIndex(0, image.height - 2, image.width, image.height) * 4) + i];
        acc += kernel[1][1] * image.data[(getIndex(0, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[1][2] * image.data[(getIndex(0, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[2][0] * image.data[(getIndex(1, image.height - 2, image.width, image.height) * 4) + i];
        acc += kernel[2][1] * image.data[(getIndex(1, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[2][2] * image.data[(getIndex(1, image.height - 1, image.width, image.height) * 4) + i];
        result[6 + i] = acc;
    }
    // bottom right
    for (var i = 0; i < 3; i++) {
        var acc = 0;
        acc += kernel[0][0] * image.data[(getIndex(image.width - 2, image.height - 2, image.width, image.height) * 4) + i];
        acc += kernel[0][1] * image.data[(getIndex(image.width - 2, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[0][2] * image.data[(getIndex(image.width - 2, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[1][0] * image.data[(getIndex(image.width - 1, image.height - 2, image.width, image.height) * 4) + i];
        acc += kernel[1][1] * image.data[(getIndex(image.width - 1, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[1][2] * image.data[(getIndex(image.width - 1, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[2][0] * image.data[(getIndex(image.width - 1, image.height - 2, image.width, image.height) * 4) + i];
        acc += kernel[2][1] * image.data[(getIndex(image.width - 1, image.height - 1, image.width, image.height) * 4) + i];
        acc += kernel[2][2] * image.data[(getIndex(image.width - 1, image.height - 1, image.width, image.height) * 4) + i];
        result[9 + i] = acc;
    }
    return result;
}
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
                raccumulator += kernel[i] * image.data[getIndex(x + offset - i, y, image.width, image.height) * 4];
                gaccumulator += kernel[i] * image.data[(getIndex(x + offset - i, y, image.width, image.height) * 4) + 1];
                baccumulator += kernel[i] * image.data[(getIndex(x + offset - i, y, image.width, image.height) * 4) + 2];
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