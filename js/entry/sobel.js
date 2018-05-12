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
        inputImage = Vision.convolve(inputImage, Vision.gaussKernel, 5, 5);
    }
    inputImage = inputImage.greyScale();
    var x = Vision.greyscaleConvolve(inputImage, Vision.sobelX, 3, 3);
    var y = Vision.greyscaleConvolve(inputImage, Vision.sobelY, 3, 3);
    var both = Vision.combineConvolutions(x, y);
    x.draw(document.getElementById('sobelx'));
    y.draw(document.getElementById('sobely'));
    both.draw(document.getElementById('sobelboth'));
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