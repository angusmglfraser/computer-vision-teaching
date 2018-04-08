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
var bg;
var animating = false;
var threshold = 80;
function getBackgroundFrame() {
    var img = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('backgroundModel'));
    bg = img;
}
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
function getBackground(image, backgroundModel, threshold) {
    backgroundModel = Vision.greyScale(backgroundModel);
    var imageGreyscale = Vision.greyScale(image);
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
function getForeground(image, backgroundModel, threshold) {
    backgroundModel = Vision.greyScale(backgroundModel);
    var imageGreyscale = Vision.greyScale(image);
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
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    var outputImage = imageDiff(inputImage, bg);
    outputImage.draw(document.getElementById('diff'));
    outputImage = getBackground(inputImage, bg, threshold);
    outputImage.draw(document.getElementById('background'));
    outputImage = getForeground(inputImage, bg, threshold);
    outputImage.draw(document.getElementById('foreground'));
    if (animating) {
        requestAnimationFrame(computeFrame);
    }
}
document.getElementById('startBtn').addEventListener('click', function (event) {
    animating = true;
    if (bg == undefined) {
        getBackgroundFrame();
    }
    requestAnimationFrame(computeFrame);
});
document.getElementById('stopBtn').addEventListener('click', function (event) {
    animating = false;
});
document.getElementById('getBackground').addEventListener('click', function (event) {
    getBackgroundFrame();
});
document.getElementById('threshold').addEventListener('change', function (event) {
    threshold = +this.value;
});
Vision.initCamera();
