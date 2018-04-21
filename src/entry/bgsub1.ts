import * as Vision from '../vision';

let bg:Vision.RGBImage;
let animating = false;
let threshold = 80;

function getBackgroundFrame() {
    let img = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('backgroundModel') as HTMLCanvasElement);
    bg = img;
}


function computeFrame() {
    let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);

    let outputImage = Vision.getForeground(inputImage, bg, threshold);
    outputImage.draw(document.getElementById('foreground') as HTMLCanvasElement);

    if (animating) {
        requestAnimationFrame(computeFrame);
    }
}

document.getElementById('startBtn').addEventListener('click', function(event) {
    animating = true;
    if (bg == undefined) {
        getBackgroundFrame();
    }
    requestAnimationFrame(computeFrame);
});

document.getElementById('stopBtn').addEventListener('click', function(event) {
    animating = false;
});

document.getElementById('getBackground').addEventListener('click', function(event) {
    getBackgroundFrame();
});

(document.getElementById('threshold') as HTMLInputElement).addEventListener('change', function(event) {
    threshold = +this.value;
})

Vision.initCamera();