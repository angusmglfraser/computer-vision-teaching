import * as Vision from '../vision';
import {getHarrisCorners} from '../HarrisCornerDetector';

let animating = false;
let threshold = 80;

function computeFrame() {
    let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);
    let corners = getHarrisCorners(inputImage, threshold);
    corners.draw(document.getElementById('features') as HTMLCanvasElement);
    // if (animating) {
    //     requestAnimationFrame(computeFrame);
    // }
}

document.getElementById('startBtn').addEventListener('click', function(event) {
    animating = true;
    computeFrame();
});

document.getElementById('stopBtn').addEventListener('click', function(event) {
    animating = false;
});

(document.getElementById('threshold') as HTMLInputElement).addEventListener('change', function(event) {
    threshold = +this.value;
});

Vision.initCamera();