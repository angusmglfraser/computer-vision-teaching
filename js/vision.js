"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage_1 = require("./RGBImage");
exports.RGBImage = RGBImage_1.RGBImage;
var MovingAverageBackgroundSubtraction_1 = require("./MovingAverageBackgroundSubtraction");
exports.MovingAverageBackgroundSubtractor = MovingAverageBackgroundSubtraction_1.MovingAverageBackgroundSubtractor;
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
var EdgeStrength;
(function (EdgeStrength) {
    EdgeStrength[EdgeStrength["NO_EDGE"] = 0] = "NO_EDGE";
    EdgeStrength[EdgeStrength["WEAK_EDGE"] = 1] = "WEAK_EDGE";
    EdgeStrength[EdgeStrength["STRONG_EDGE"] = 2] = "STRONG_EDGE";
})(EdgeStrength || (EdgeStrength = {}));
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
    backgroundModel = backgroundModel.greyScale();
    var imageGreyscale = image.greyScale();
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
    backgroundModel = backgroundModel.greyScale();
    var imageGreyscale = image.greyScale();
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
/**
 * Calculates the angles of edges in degrees, based on edge gradients in the x and y directions
 * @param image1 The first image with gradients in the x direction
 * @param image2 The second image with gradients in the y direction
 */
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
/**
 * This function preserves local maxima and discards all other pixels to ensure edges are no thicker than one pixel
 * @param image The edge gradients
 * @param angles The edge angles
 */
function edgeThinning(image, angles) {
    var result = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var angle = angles[x][y];
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
/**
 * Performs dual thresholding for canny edge detection. All pixels above the upper threshold are preserved, all remaining pixels above the lower threshold are marked as weak edges, and all other pixels are discarded.
 * @param image
 * @param threshold1
 * @param threshold2
 */
function dualThresholding(image, threshold1, threshold2) {
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
/**
 * Performs hysteresis for canny edge detection. All pixels that are marked as strong edges are automatically included in the output, all weak edges are preserved in the output if and only if at least one of their 8 immediately neighbouring pixels is a strong edge
 * @param strengths
 */
function hysteresis(strengths) {
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
/**
 * Performs canny edge detection on an image.
 * @param image the image
 * @param threshold1 the first threshold
 * @param threshold2 the second threshold
 */
function getCannyEdges(image, threshold1, threshold2) {
    image = image.greyScale();
    var blurred = convolve1d(image, exports.gauss1d);
    var gx = greyscaleConvolve(blurred, exports.sobelKernel, 3, 3);
    var gy = greyscaleConvolve(blurred, exports.sobelRotated, 3, 3);
    var intensity = combineConvolutions(gx, gy);
    var directions = computeEdgeAngles(gx, gy);
    var thinnedEdges = edgeThinning(intensity, directions);
    var thresholded = dualThresholding(thinnedEdges, threshold1, threshold2);
    return hysteresis(thresholded);
}
exports.getCannyEdges = getCannyEdges;
