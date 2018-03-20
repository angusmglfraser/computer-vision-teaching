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
var blurring = false;
var animating = false;
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    if (blurring) {
        inputImage = Vision.RGBConvolve(inputImage, Vision.gaussKernel, 5, 5);
    }
    inputImage = Vision.RGBGreyScale(inputImage);
    var x = Vision.RGBConvolve(inputImage, Vision.sobelKernel, 3, 3);
    var y = Vision.RGBConvolve(inputImage, Vision.sobelRotated, 3, 3);
    var both = Vision.RGBcombineConvolutions(x, y);
    document.getElementById('sobelx').getContext('2d').putImageData(x.asImageData(), 0, 0);
    document.getElementById('sobely').getContext('2d').putImageData(y.asImageData(), 0, 0);
    document.getElementById('sobelboth').getContext('2d').putImageData(both.asImageData(), 0, 0);
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
