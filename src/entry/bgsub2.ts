import * as Vision from '../vision';

let bg: Vision.RGBImage;
let animating = false;
let threshold = 80;
let bufferSize = 20;
let subtractor: Vision.MovingAverageBackgroundSubtractor = new Vision.MovingAverageBackgroundSubtractor(bufferSize);

function computeFrame() {
    let videoElement = document.getElementById('webcam') as HTMLVideoElement;
    let inputFrame = Vision.getImageFromVideo(videoElement, document.getElementById('camfeed') as HTMLCanvasElement);

    subtractor.addFrame(inputFrame);
    bg = subtractor.getBackgroundModel();
    let foreground = Vision.getForeground(inputFrame, bg, threshold);
    foreground.draw(document.getElementById('foreground') as HTMLCanvasElement)
    bg.draw(document.getElementById('backgroundModel') as HTMLCanvasElement);

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

(document.getElementById('threshold') as HTMLInputElement).addEventListener('change', function (event) {
    threshold = +this.value;
});
(document.getElementById('bufferSize') as HTMLInputElement).addEventListener('change', function (event) {
    let val = +this.value;
    if (val != NaN && (val | 0) === val && val > 1) {
        subtractor.setBufferSize(val);
    }
});

Vision.initCamera();

