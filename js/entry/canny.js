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
