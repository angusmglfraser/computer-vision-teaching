import { RGBImage } from './RGBImage';
import { MovingAverageBackgroundSubtractor } from './MovingAverageBackgroundSubtraction';
export { RGBImage };
export { MovingAverageBackgroundSubtractor };

export const gaussKernel: Array<Array<number>> = [
    [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273],
    [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
    [7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273],
    [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
    [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273]
];

export const gauss1d = [0.06136, 0.24477, 0.38774, 0.24477, 0.06136];

export const sobelX = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1]
];
export const sobelY = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1]
];

enum EdgeStrength {
    NO_EDGE,
    WEAK_EDGE,
    STRONG_EDGE
}

/**
 * Returns the current frame on a canvas
 * @param canvas 
 */
export function getImageFromCanvas(canvas: HTMLCanvasElement): RGBImage {
    return RGBImage.fromImageData(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
}

/**
 * Returns the current frame from a video element
 * @param videoElement the video element the frame is to be grabbed from
 * @param canvas the canvas on which the frame is to be drawn
 * @param scale the scaling factor. Default is 1
 */
export function getImageFromVideo(videoElement: HTMLVideoElement, canvas: HTMLCanvasElement, scale = 1): RGBImage {
    let width = videoElement.videoWidth * scale;
    let height = videoElement.videoHeight * scale;
    canvas.getContext('2d').drawImage(videoElement, 0, 0, width, height);
    return RGBImage.fromImageData(canvas.getContext('2d').getImageData(0, 0, width, height));
}

/**
 * Convolves an image with a kernel. 
 * @param image The image to be convolved
 * @param kernel The convolution kernel
 * @param kernelWidth The width of the kernel
 * @param kernelHeight The height of the kernel
 */
export function convolve(image: RGBImage, kernel: Array<Array<number>>, kernelWidth: number, kernelHeight: number): RGBImage {
    let width = image.getWidth();
    let height = image.getHeight();

    let output = RGBImage.fromDimensions(width, height);

    let offsetX = Math.floor(kernelWidth / 2);
    let offsetY = Math.floor(kernelHeight / 2);

    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let raccumulator = 0;
            let gaccumulator = 0;
            let baccumulator = 0;

            for (let kx = 0; kx < kernelWidth; kx++) {
                for (let ky = 0; ky < kernelHeight; ky++) {
                    raccumulator += kernel[kx][ky] * image.r[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                    gaccumulator += kernel[kx][ky] * image.g[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                    baccumulator += kernel[kx][ky] * image.b[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                }
            }

            output.r[x][y] = raccumulator;
            output.g[x][y] = gaccumulator;
            output.b[x][y] = baccumulator;
        }
    }

    return output;
}

/**
 * The same as a normal convolution except it only convolves one channel. Use this 
 * with greyscale images, as it cuts out 2/3 of the unnecessary calculations
 * @param image the image to be convolved
 * @param kernel the kernel
 * @param kernelWidth the kernel's width
 * @param kernelHeight the kernel's height
 */
export function greyscaleConvolve(image: RGBImage, kernel: Array<Array<number>>, kernelWidth: number, kernelHeight: number): RGBImage {
    let width = image.getWidth();
    let height = image.getHeight();

    let output = RGBImage.fromDimensions(width, height);

    let offsetX = Math.floor(kernelWidth / 2);
    let offsetY = Math.floor(kernelHeight / 2);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let acc = 0;

            for (let kx = 0; kx < kernelWidth; kx++) {
                for (let ky = 0; ky < kernelHeight; ky++) {
                    acc += kernel[kx][ky] * image.r[Math.abs(x + offsetX - kx) % width][Math.abs(y + offsetY - ky) % height];
                }
            }

            output.r[x][y] = output.g[x][y] = output.b[x][y] = acc;
        }
    }

    return output;
}

/**
 * This function is to be used when convolving an image with a symmetrical kernel. The kernel passed
 * to this function has to be 1-dimensional. The image will then be convolved with the kernel in the 
 * x-direction, and the result of that will be convolved with the same kernel in the y-direction. 
 * Doing convolutions this way with symmetric kernels greatly reduces the number of calculations to be 
 * done, so use this wherever possible. 
 * @param image the image to be convolved
 * @param kernel the 1-dimensional kernel
 */
export function convolve1d(image: RGBImage, kernel: Array<number>): RGBImage {
    let output: RGBImage = RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    let intermediate: RGBImage = RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    let offset = Math.floor(kernel.length / 2);

    //first convolution
    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let raccumulator = 0;
            let gaccumulator = 0;
            let baccumulator = 0;
            for (let i = 0; i < kernel.length; i++) {
                raccumulator += kernel[i] * image.r[Math.abs(x + offset - i) % image.getWidth()][y];
                gaccumulator += kernel[i] * image.g[Math.abs(x + offset - i) % image.getWidth()][y];
                baccumulator += kernel[i] * image.b[Math.abs(x + offset - i) % image.getWidth()][y];
            }
            intermediate.r[x][y] = Math.abs(raccumulator);
            intermediate.g[x][y] = Math.abs(gaccumulator);
            intermediate.b[x][y] = Math.abs(baccumulator);
        }
    }

    //second convolution
    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let raccumulator = 0;
            let gaccumulator = 0;
            let baccumulator = 0;
            for (let i = 0; i < kernel.length; i++) {
                raccumulator += kernel[i] * intermediate.r[x][Math.abs(y + offset - i) % image.getHeight()];
                gaccumulator += kernel[i] * intermediate.g[x][Math.abs(y + offset - i) % image.getHeight()];
                baccumulator += kernel[i] * intermediate.b[x][Math.abs(y + offset - i) % image.getHeight()];
            }
            output.r[x][y] = Math.abs(raccumulator);
            output.g[x][y] = Math.abs(gaccumulator);
            output.b[x][y] = Math.abs(baccumulator);
        }
    }
    return output;
}

/**
 * Performs a pythagorean combination of two images. Each pixel in the output image
 * is equivalent to the sum of the squares of the corresponding pixel in the two
 * input images.
 * @param image1 
 * @param image2 
 */
export function combineConvolutions(image1: RGBImage, image2: RGBImage): RGBImage {
    let width = image1.getWidth();
    let height = image1.getHeight();
    let output = RGBImage.fromDimensions(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
            let r1 = image1.r[x][y];
            let r2 = image2.r[x][y];
            let g1 = image1.g[x][y];
            let g2 = image2.g[x][y];
            let b1 = image1.b[x][y];
            let b2 = image2.b[x][y];

            output.r[x][y] = Math.floor(Math.sqrt((r1 * r1) + (r2 * r2)));
            output.g[x][y] = Math.floor(Math.sqrt((g1 * g1) + (g2 * g2)));
            output.b[x][y] = Math.floor(Math.sqrt((b1 * b1) + (b2 * b2)));
        }
    }

    return output;
}

/**
 * Initialises the webcam and scales all canvases on the page to the dimensions of the camera's image
 */
export function initCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then(
        function (stream) {
            let webcamElement: HTMLVideoElement = document.getElementById('webcam') as HTMLVideoElement;
            webcamElement.srcObject = stream;
            webcamElement.addEventListener('playing', function (event) {
                let canvases = document.getElementsByTagName('canvas');
                for (let i = 0; i < canvases.length; i++) {
                    canvases[i].width = webcamElement.videoWidth;
                    canvases[i].height = webcamElement.videoHeight;
                }
            })
        }
    ).catch(
        function (err: Error) {
            let errType = err.name;
            let alertString = errType;
            switch (errType) {
                case "NotSupportedError":
                    alertString += "\nIf you are using Google Chrome, try changing the 'http' at the start of the url to 'https', or using a different web browser, such as Firefox";
                    break;
                case "NotReadableError":
                    alertString += "\nPlease make sure that your webcam is connected and enabled, and not currently being used by another application.";
                    break;
                case "NotAllowedError":
                    return;
            }

            alert(alertString);

        }
    );
}

/**
 * Performs a simple background subtraction with two images and returns the foreground
 * @param image the image being analyzed
 * @param backgroundModel the background frame
 * @param threshold the difference threshold
 */
export function getForeground(image: RGBImage, backgroundModel: RGBImage, threshold: number): RGBImage {
    backgroundModel = backgroundModel.greyScale();
    let imageGreyscale = image.greyScale();
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

/**
 * Returns the background pixels from a background subtraction
 * @param image
 * @param backgroundModel 
 * @param threshold 
 */
export function getBackground(image: RGBImage, backgroundModel: RGBImage, threshold: number): RGBImage {
    backgroundModel = backgroundModel.greyScale();
    let imageGreyscale = image.greyScale();
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


/**
 * Returns the difference mask of two images
 * @param background the background model
 * @param image the current image
 */
export function imageDiff(background: RGBImage, image: RGBImage): RGBImage {
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

/**
 * Calculates the angles of edges in degrees, based on edge gradients in the x and y directions
 * @param image1 The first image with gradients in the x direction
 * @param image2 The second image with gradients in the y direction
 */
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

/**
 * This function preserves local maxima and discards all other pixels to ensure edges are no thicker than one pixel
 * @param image The edge gradients
 * @param angles The edge angles
 */
function edgeThinning(image: RGBImage, angles: Array<Array<number>>): RGBImage {
    let result = RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
            let angle = angles[x][y];
            if (angle < 22.5) { // Edge is vertical
                if (image.r[x][y] == Math.max(image.r[(x + 1) % image.getWidth()][y], image.r[Math.abs(x - 1)][y], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                } else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            } else if (angle < 67.5) { // Edge is diagonal
                if (image.r[x][y] == Math.max(image.r[x][y], image.r[(x + 1) % image.getWidth()][(y + 1) % image.getHeight()], image.r[Math.abs(x - 1)][Math.abs(y - 1)])
                    || image.r[x][y] == Math.max(image.r[x][y], image.r[(x + 1) % image.getWidth()][Math.abs(y - 1)], image.r[Math.abs(x - 1)][(y + 1) % image.getHeight()])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                } else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            } else { // Edge is horizontal
                if (image.r[x][y] == Math.max(image.r[x][(y + 1) % image.getHeight()], image.r[x][Math.abs(y - 1)], image.r[x][y])) {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = image.r[x][y];
                } else {
                    result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
                }
            }
        }
    }
    return result;
}

/**
 * Performs dual thresholding for canny edge detection. All pixels above the upper threshold are preserved, all remaining pixels above the lower threshold are marked as weak edges, and all other pixels are discarded.
 * @param image 
 * @param threshold1 
 * @param threshold2 
 */
function dualThresholding(image: RGBImage, threshold1: number, threshold2: number): Array<Array<EdgeStrength>> {
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
                strengths[x][y] = EdgeStrength.NO_EDGE;
            }
        }
    }
    return strengths;
}

/**
 * Performs hysteresis for canny edge detection. All pixels that are marked as strong edges are automatically included in the output, all weak edges are preserved in the output if and only if at least one of their 8 immediately neighbouring pixels is a strong edge
 * @param strengths 
 */
function hysteresis(strengths: Array<Array<EdgeStrength>>): RGBImage {
    let width = strengths.length;
    let height = strengths[0].length;
    let output = RGBImage.fromDimensions(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {

            switch (strengths[x][y]) {
                case EdgeStrength.STRONG_EDGE:
                    output.r[x][y] = output.g[x][y] = output.b[x][y] = 255;
                    break;
                case EdgeStrength.WEAK_EDGE:
                    // blob analysis
                    let isEdge = false;
                    let val = 0;
                    for (let blobx = x - 1; blobx <= x + 1; blobx++) {
                        for (let bloby = y - 1; bloby <= y + 1; bloby++) {
                            if (strengths[Math.abs(blobx) % width][Math.abs(bloby) % height] === EdgeStrength.STRONG_EDGE) {
                                isEdge = true;
                                val = 255;
                                break;
                            }
                        }
                        if (isEdge) {
                            break;
                        }
                    }
                    output.r[x][y] = output.g[x][y] = output.b[x][y] = val;
                    break;
                default:
                    output.r[x][y] = output.g[x][y] = output.b[x][y] = 0;
            }
        }
    }
    return output;
}

/**
 * Performs canny edge detection on an image. 
 * @param image the image
 * @param threshold1 the first threshold
 * @param threshold2 the second threshold
 */
export function getCannyEdges(image: RGBImage, threshold1: number, threshold2: number) {
    image = image.greyScale();
    let blurred = convolve1d(image, gauss1d);
    let gx = greyscaleConvolve(blurred, sobelX, 3, 3);
    let gy = greyscaleConvolve(blurred, sobelY, 3, 3);
    let intensity = combineConvolutions(gx, gy);
    let directions = computeEdgeAngles(gx, gy);
    let thinnedEdges = edgeThinning(intensity, directions);
    let thresholded = dualThresholding(thinnedEdges, threshold1, threshold2);
    return hysteresis(thresholded);
}