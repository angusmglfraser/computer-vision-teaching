import * as Vision from '../vision';
import {RGBImage} from '../RGBImage';

let background:RGBImage;
let animating = false;

function getBackgroundFrame() {
    let img = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('background') as HTMLCanvasElement);
    background = img;
}

function imageDiff(background: RGBImage, image: RGBImage): RGBImage {
    let result = RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    
    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let rdiff = Math.abs(image.r[x][y] - background.r[x][y]);
            let gdiff = Math.abs(image.g[x][y] - background.g[x][y]);
            let bdiff = Math.abs(image.b[x][y] - background.b[x][y]);

            result.r[x][y] = rdiff;
            result.g[x][y] = gdiff;
            result.b[x][y] = bdiff;
        }
    }

    return result;
}

function computeFrame() {
    let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);

    let outputImage = imageDiff(background, inputImage);
    outputImage.draw(document.getElementById('diff') as HTMLCanvasElement);

    if (animating) {
        requestAnimationFrame(computeFrame);
    }
}

Vision.initCamera();

document.getElementById('startBtn').addEventListener('click', function(event) {
    animating = true;
    if (background == undefined) {
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