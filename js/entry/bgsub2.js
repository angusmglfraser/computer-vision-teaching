"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var MovingAverageBackgroundSubtraction_1 = require("../MovingAverageBackgroundSubtraction");
var RGBImage_1 = require("../RGBImage");
var Vision = __importStar(require("../vision"));
var bg;
var animating = false;
var threshold = 80;
var bufferSize = 20;
var subtractor = new MovingAverageBackgroundSubtraction_1.MovingAverageBackgroundSubtractor(bufferSize);
function getForeground(image, backgroundModel, thresh) {
    backgroundModel = Vision.greyScale(backgroundModel);
    var imageGreyscale = Vision.greyScale(image);
    var foreground = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (var x = 0; x < image.getWidth(); x++) {
        for (var y = 0; y < image.getHeight(); y++) {
            var diff = Math.abs(imageGreyscale.r[x][y] - backgroundModel.r[x][y]);
            if (diff > thresh) {
                foreground.r[x][y] = image.r[x][y];
                foreground.g[x][y] = image.g[x][y];
                foreground.b[x][y] = image.b[x][y];
            }
        }
    }
    return foreground;
}
function computeFrame() {
    var videoElement = document.getElementById('webcam');
    var inputFrame = Vision.getImageFromVideo(videoElement, document.getElementById('camfeed'));
    subtractor.addFrame(inputFrame);
    bg = subtractor.getBackgroundModel();
    var foreground = getForeground(inputFrame, bg, threshold);
    foreground.draw(document.getElementById('foreground'));
    bg.draw(document.getElementById('backgroundModel'));
    if (animating) {
        requestAnimationFrame(computeFrame);
    }
}
document.getElementById('startBtn').addEventListener('click', function (event) {
    animating = true;
    requestAnimationFrame(computeFrame);
});
document.getElementById('stopBtn').addEventListener('click', function (event) {
    animating = false;
});
document.getElementById('threshold').addEventListener('change', function (event) {
    threshold = +this.value;
});
document.getElementById('bufferSize').addEventListener('change', function (event) {
    subtractor.setBufferSize(+this.value);
});
Vision.initCamera();
