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
var HarrisCornerDetector_1 = require("../HarrisCornerDetector");
var animating = false;
var threshold = 80;
function computeFrame() {
    var inputImage = Vision.getImageFromVideo(document.getElementById('webcam'), document.getElementById('camfeed'));
    var corners = HarrisCornerDetector_1.getHarrisCorners(inputImage, threshold);
    corners.draw(document.getElementById('features'));
    // if (animating) {
    //     requestAnimationFrame(computeFrame);
    // }
}
document.getElementById('startBtn').addEventListener('click', function (event) {
    animating = true;
    computeFrame();
});
document.getElementById('stopBtn').addEventListener('click', function (event) {
    animating = false;
});
document.getElementById('threshold').addEventListener('change', function (event) {
    threshold = +this.value;
});
Vision.initCamera();
