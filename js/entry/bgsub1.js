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
var bg;
var animating = false;
var threshold = 80;
function getBackgroundFrame() {
    var img = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('backgroundModel'));
    bg = img;
}
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    var outputImage = Vision.imageDiff(inputImage, bg);
    outputImage.draw(document.getElementById('diff'));
    outputImage = Vision.getForeground(inputImage, bg, threshold);
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
