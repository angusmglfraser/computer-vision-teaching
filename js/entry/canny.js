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
                if (image.r[x][y] == Math.max(image.r[(x + 1) % image.getWidth()][y], image.r[Math.abs(x - 1)][y], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                }
                else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
            else if (angle < 67.5) {
                if (image.r[x][y] == Math.max(image.r[x][y], image.r[(x + 1) % image.getWidth()][(y + 1) % image.getHeight()], image.r[Math.abs(x - 1)][Math.abs(y - 1)])
                    || image.r[x][y] == Math.max(image.r[x][y], image.r[(x + 1) % image.getWidth()][Math.abs(y - 1)], image.r[Math.abs(x - 1)][(y + 1) % image.getHeight()])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                }
                else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
            else {
                if (image.r[x][y] == Math.max(image.r[x][(y + 1) % image.getHeight()], image.r[x][Math.abs(y - 1)], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                }
                else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
        }
    }
    return result;
}
function thresholding(image, threshold1, threshold2) {
    var strengths = new Array(image.getWidth());
    var upper = Math.max(threshold1, threshold2);
    var lower = Math.min(threshold1, threshold2);
    for (var x = 0; x < image.getWidth(); x++) {
        strengths[x] = new Array(image.getHeight());
        for (var y = 0; y < image.getHeight(); y++) {
            if (image.r[x][y] > upper) {
                strengths[x][y] = EdgeStrength.STRONG_EDGE;
            }
            else if (image.r[x][y] > lower) {
                strengths[x][y] = EdgeStrength.WEAK_EDGE;
            }
            else {
                strengths[x][y] = 0;
            }
        }
    }
    return strengths;
}
function edgeTracking(strengths) {
    var width = strengths.length;
    var height = strengths[0].length;
    var output = RGBImage_1.RGBImage.fromDimensions(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (strengths[x][y] === EdgeStrength.STRONG_EDGE) {
                output.r[x][y] = output.g[x][y] = output.b[x][y] = 255;
            }
            else if (strengths[x][y] === EdgeStrength.WEAK_EDGE) {
                // blob analysis
                var isEdge = false;
                var val = 0;
                for (var blobx = x - 1; blobx <= x + 1; blobx++) {
                    for (var bloby = y - 1; bloby <= y + 1; bloby++) {
                        if (strengths[Math.abs(blobx) % width][Math.abs(bloby) % height] === EdgeStrength.STRONG_EDGE) {
                            isEdge = true;
                            val = 255;
                            break;
                        }
                    }
                    if (isEdge) {
                        break;
                    }
                }
                output.r[x][y] = output.g[x][y] = output.b[x][y] = val;
            }
            else {
                output.r[x][y] = output.g[x][y] = output.b[x][y] = 0;
            }
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
    output.draw(document.getElementById('cannyoutput'));
    if (animating) {
        console.log(requestAnimationFrame(computeFrame));
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
