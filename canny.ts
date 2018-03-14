import * as Vision from './vision';

enum EdgeStrength {
    NO_EDGE,
    WEAK_EDGE,
    STRONG_EDGE
}

let animating = false;

function computeEdgeAngles(image1: ImageData, image2: ImageData): Uint8ClampedArray {
    let output = new Uint8ClampedArray(image1.width * image1.height);
    for (let i = 0; i < image1.data.length; i += 4) {
        let angle = Math.atan2(image1.data[i], image2.data[i]) * 180 / Math.PI;
        output[i / 4] = angle;
    }
    return output;
}

function edgeThinning(image: ImageData, gradients: Uint8ClampedArray): ImageData {
    let result = new ImageData(image.width, image.height);
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let index = Vision.getIndex(x, y, image.width, image.height) * 4;

            let angle = gradients[index / 4];
            if (angle < 22.5) {
                if (image.data[index] == Math.max(image.data[Vision.getIndex(x + 1, y, image.width, image.height) * 4], image.data[Vision.getIndex(x - 1, y, image.width, image.height) * 4], image.data[index])) {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = image.data[index];
                } else {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = 0;
                }
            } else if (angle < 67.5) {
                if (image.data[index] == Math.max(image.data[index], image.data[Vision.getIndex(x + 1, y + 1, image.width, image.height) * 4], image.data[Vision.getIndex(x - 1, y - 1, image.width, image.height) * 4])
                    || image.data[index] == Math.max(image.data[index], image.data[Vision.getIndex(x + 1, y - 1, image.width, image.height) * 4], image.data[Vision.getIndex(x - 1, y + 1, image.width, image.height) * 4])) {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = image.data[index];
                } else {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = 0;
                }
            } else {
                if (image.data[index] == Math.max(image.data[Vision.getIndex(x, y + 1, image.width, image.height) * 4], image.data[Vision.getIndex(x, y - 1, image.width, image.height) * 4], image.data[index])) {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = image.data[index];
                } else {
                    result.data[index] = result.data[index + 1] = result.data[index + 2] = 0;
                }
            }
            result.data[index + 3] = 255;
        }
    }
    return result;
}

function thresholding(image: ImageData, upperThreshold: number, lowerThreshold: number): { data: Array<EdgeStrength>, width: number, height: number } {
    let strengths = {
        data: new Array<EdgeStrength>(image.width, image.height),
        width: image.width,
        height: image.height
    };
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {

            let index = Vision.getIndex(x, y, image.width, image.height) * 4;
            if (image.data[index] > upperThreshold) {
                strengths.data[index / 4] = EdgeStrength.STRONG_EDGE;
            } else if (image.data[index] > lowerThreshold) {
                strengths.data[index / 4] = EdgeStrength.WEAK_EDGE;
            } else {
                strengths[index / 4] = 0;
            }
        }
    }
    return strengths;
}

function edgeTracking(strengths: { data: Array<EdgeStrength>, width: number, height: number }) {
    let output = new ImageData(strengths.width, strengths.height);

    for (let x = 0; x < strengths.width; x++) {
        for (let y = 0; y < strengths.height; y++) {

            let index = Vision.getIndex(x, y, strengths.width, strengths.height);
            let imageIndex = index * 4

            if (strengths.data[index] === EdgeStrength.STRONG_EDGE) {
                output.data[imageIndex] = output.data[imageIndex + 1] = output.data[imageIndex + 2] = 255;
            } else if (strengths.data[index] === EdgeStrength.WEAK_EDGE) {
                // blob analysis
                let isEdge = false;
                for (let blobx = x - 1; blobx <= x + 1; blobx++) {
                    for (let bloby = y - 1; bloby <= y + 1; bloby++) {
                        if (strengths.data[Vision.getIndex(blobx, bloby, strengths.width, strengths.height)] === EdgeStrength.STRONG_EDGE) {
                            isEdge = true;
                            break;
                        }
                    }
                    if (isEdge) {
                        break;
                    }
                }
                output.data[imageIndex] = output.data[imageIndex + 1] = output.data[imageIndex + 2] = isEdge ? 255 : 0;
            } else {
                output.data[imageIndex] = output.data[imageIndex + 1] = output.data[imageIndex + 2] = 0;
            }
            output.data[imageIndex + 3] = 255;
        }
    }
    return output;
}

function computeFrame(): void {
    let videoElement = document.getElementById('webcam') as HTMLVideoElement;
    let camfeedctx = (document.getElementById('camfeed') as HTMLCanvasElement).getContext('2d');
    camfeedctx.drawImage(
        videoElement,
        0,
        0,
        videoElement.videoWidth * 0.75,
        videoElement.videoHeight * 0.75
    );

    let inputImage = camfeedctx.getImageData(0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
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


    (document.getElementById('cannyoutput') as HTMLCanvasElement).getContext('2d').putImageData(output, 0, 0);

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