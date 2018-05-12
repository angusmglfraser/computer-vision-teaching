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
var bufferSize = 20;
var subtractor = new Vision.MovingAverageBackgroundSubtractor(bufferSize);
function computeFrame() {
    var videoElement = document.getElementById('webcam');
    var inputFrame = Vision.getImageFromVideo(videoElement, document.getElementById('camfeed'));
    subtractor.addFrame(inputFrame);
    bg = subtractor.getBackgroundModel();
    var foreground = Vision.getForeground(inputFrame, bg, threshold);
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
    var val = +this.value;
    if (val != NaN && (val | 0) === val && val > 1) {
        subtractor.setBufferSize(val);
    }
});
Vision.initCamera();
//# sourceMappingURL=bgsub2.js.map