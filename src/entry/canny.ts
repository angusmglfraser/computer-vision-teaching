import * as Vision from '../vision';
import { RGBImage } from '../RGBImage';

enum EdgeStrength {
    NO_EDGE,
    WEAK_EDGE,
    STRONG_EDGE
}

let animating = false;

function computeEdgeAngles(image1: RGBImage, image2: RGBImage): Array<Array<number>> {
    let output = new Array<Array<number>>(image1.getWidth());
    for (let x = 0; x < image1.getWidth(); x++) {
        output[x] = new Array<number>(image1.getHeight());
        for (let y = 0; y < image1.getHeight(); y++) {
            let angle = Math.atan2(image1.r[x][y], image2.r[x][y]) * 180 / Math.PI;
            output[x][y] = angle;
        }
    }
    return output;
}

function edgeThinning(image: RGBImage, gradients: Array<Array<number>>): RGBImage {
    let result = RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let angle = gradients[x][y];
            if (angle < 22.5) {
                if (image.r[x][y] == Math.max(image.r[x+1][y], image.r[x-1][y], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                } else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            } else if (angle < 67.5) {
                if (image.r[x][y] == Math.max(image.r[x][y], image.r[x+1][y+1], image.r[x-1][y-1])
                    || image.r[x][y] == Math.max(image.r[x][y], image.r[x+1][y-1], image.r[x-1][y+1])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                } else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            } else {
                if (image.r[x][y] == Math.max(image.r[x][y+1], image.r[x][y-1], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                } else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
        }
    }
    return result;
}

function thresholding(image: RGBImage, threshold1: number, threshold2: number): Array<Array<EdgeStrength>> {
    let strengths = new Array<Array<EdgeStrength>>(image.getWidth());
    let upper = Math.max(threshold1, threshold2);
    let lower = Math.min(threshold1, threshold2);
    for (let x = 0; x < image.getWidth(); x++) {
        strengths[x] = new Array<EdgeStrength>(image.getHeight());
        for (let y = 0; y < image.getHeight(); y++) {
            if (image.r[x][y] > upper) {
                strengths[x][y] = EdgeStrength.STRONG_EDGE;
            } else if (image.r[x][y] > lower) {
                strengths[x][y] = EdgeStrength.WEAK_EDGE;
            } else {
                strengths[x][y] = 0;
            }
        }
    }
    return strengths;
}

function edgeTracking(strengths: Array<Array<EdgeStrength>>): RGBImage{
    let width = strengths.length;
    let height = strengths[0].length;
    let output = RGBImage.fromDimensions(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {

            if (strengths[x][y] === EdgeStrength.STRONG_EDGE) {
                output.r[x][y] = output.g[x][y] = output.b[x][y] = 255;
            } else if (strengths[x][y] === EdgeStrength.WEAK_EDGE) {
                // blob analysis
                let isEdge = false;
                for (let blobx = x - 1; blobx <= x + 1; blobx++) {
                    for (let bloby = y - 1; bloby <= y + 1; bloby++) {
                        if (strengths[blobx][bloby] === EdgeStrength.STRONG_EDGE) {
                            isEdge = true;
                            break;
                        }
                    }
                    if (isEdge) {
                        break;
                    }
                }
                output.r[x][y] = output.g[x][y] = output.b[x][y] = isEdge ? 255 : 0;
            } else {
                output.r[x][y] = output.g[x][y] = output.b[x][y] = 0;
            }
        }
    }
    return output;
}

function computeFrame(): void {
    let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);
    let greyScaled = Vision.greyScale(inputImage);
    let blurred = Vision.convolve(greyScaled, Vision.gaussKernel, 5, 5);
    let gx = Vision.convolve(blurred, Vision.sobelKernel, 3, 3);
    let gy = Vision.convolve(blurred, Vision.sobelRotated, 3, 3);

    let intensity = Vision.combineConvolutions(gx, gy);
    let directions = computeEdgeAngles(gx, gy);

    let thinnedEdges = edgeThinning(intensity, directions);
    let lowerThreshold: number = +(document.getElementById('lowerThreshold') as HTMLInputElement).value;
    let upperThreshold: number = +(document.getElementById('upperThreshold') as HTMLInputElement).value;
    let thresholded = thresholding(thinnedEdges, upperThreshold, lowerThreshold);

    let output = edgeTracking(thresholded);

    output.draw(document.getElementById('cannyoutput') as HTMLCanvasElement);

    if (animating) {
        requestAnimationFrame(computeFrame);
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