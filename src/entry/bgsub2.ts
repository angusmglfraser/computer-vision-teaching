import { MovingAverageBackgroundSubtractor } from '../MovingAverageBackgroundSubtraction';
import { RGBImage } from '../RGBImage';
import * as Vision from '../vision';

let bg: RGBImage;
let animating = false;
let threshold = 80;
let bufferSize = 20;
let subtractor: MovingAverageBackgroundSubtractor = new MovingAverageBackgroundSubtractor(bufferSize);

function getForeground(image: RGBImage, backgroundModel: RGBImage, thresh: number) {
    backgroundModel = Vision.greyScale(backgroundModel);
    let imageGreyscale = Vision.greyScale(image);
    let foreground = RGBImage.fromDimensions(image.getWidth(), image.getHeight());

    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let diff = Math.abs(imageGreyscale.r[x][y] - backgroundModel.r[x][y]);
            if (diff > thresh) {
                foreground.r[x][y] = image.r[x][y];
                foreground.g[x][y] = image.g[x][y];
                foreground.b[x][y] = image.b[x][y];
            }
        }
    }

    return foreground;
}


function computeFrame() {
    let videoElement = document.getElementById('webcam') as HTMLVideoElement;
    let inputFrame = Vision.getImageFromVideo(videoElement, document.getElementById('camfeed') as HTMLCanvasElement);

    subtractor.addFrame(inputFrame);
    bg = subtractor.getBackgroundModel();
    let foreground = getForeground(inputFrame, bg, threshold);
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

Vision.initCamera();

