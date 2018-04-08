import * as Vision from '../vision';
import {RGBImage} from '../RGBImage';

let bg:RGBImage;
let animating = false;
let threshold = 80;

function getBackgroundFrame() {
    let img = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('backgroundModel') as HTMLCanvasElement);
    bg = img;
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

function getBackground(image: RGBImage, backgroundModel: RGBImage, threshold: number) {
    backgroundModel = Vision.greyScale(backgroundModel);
    let imageGreyscale = Vision.greyScale(image);
    let background = RGBImage.fromDimensions(image.getWidth(), image.getHeight());

    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let diff = Math.abs(imageGreyscale.r[x][y] - backgroundModel.r[x][y]);
            if (diff < threshold) {
                background.r[x][y] = image.r[x][y];
                background.g[x][y] = image.g[x][y];
                background.b[x][y] = image.b[x][y];
            }
        }
    }
    return background;
}

function getForeground(image: RGBImage, backgroundModel: RGBImage, threshold: number) {
    backgroundModel = Vision.greyScale(backgroundModel);
    let imageGreyscale = Vision.greyScale(image);
    let foreground = RGBImage.fromDimensions(image.getWidth(), image.getHeight());

    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let diff = Math.abs(imageGreyscale.r[x][y] - backgroundModel.r[x][y]);
            if (diff > threshold) {
                foreground.r[x][y] = image.r[x][y];
                foreground.g[x][y] = image.g[x][y];
                foreground.b[x][y] = image.b[x][y];
            }
        }
    }

    return foreground;
}

function computeFrame() {
    let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);

    let outputImage = imageDiff(inputImage, bg);
    outputImage.draw(document.getElementById('diff') as HTMLCanvasElement);
    outputImage = getBackground(inputImage, bg, threshold);
    outputImage.draw(document.getElementById('background') as HTMLCanvasElement);
    outputImage = getForeground(inputImage, bg, threshold);
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