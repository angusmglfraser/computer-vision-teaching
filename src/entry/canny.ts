import * as Vision from '../vision';


let animating = false;

function computeFrame(): void {
    let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);
    let output = Vision.getCannyEdges(inputImage, +(document.getElementById('lowerThreshold') as HTMLInputElement).value, +(document.getElementById('upperThreshold') as HTMLInputElement).value);

    output.draw(document.getElementById('cannyoutput') as HTMLCanvasElement);

    if (animating) {
        console.log(requestAnimationFrame(computeFrame));
    }
}

document.getElementById('stopBtn').addEventListener('click', function (event) {
    animating = false;
});

document.getElementById('startBtn').addEventListener('click', function (event) {
    animating = true;
    computeFrame();
})
Vision.initCamera();