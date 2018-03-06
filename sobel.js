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
var blurring = false;
var animating = false;
function computeFrame() {
    var videoElement = document.getElementById('webcam');
    var camfeedctx = document.getElementById('camfeed').getContext('2d');
    camfeedctx.drawImage(videoElement, 0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
    var inputImage = camfeedctx.getImageData(0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
    if (blurring) {
        inputImage = Vision.convolve(inputImage, Vision.gaussKernel, 5, 5);
    }
    inputImage = Vision.greyScale(inputImage);
    var x = Vision.convolve(inputImage, Vision.sobelKernel, 3, 3);
    var y = Vision.convolve(inputImage, Vision.sobelRotated, 3, 3);
    var both = Vision.combineConvolutions(x, y);
    document.getElementById('sobelx').getContext('2d').putImageData(x, 0, 0);
    document.getElementById('sobely').getContext('2d').putImageData(y, 0, 0);
    document.getElementById('sobelboth').getContext('2d').putImageData(both, 0, 0);
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
//# sourceMappingURL=sobel.js.map