import {RGBImage} from './RGBImage';

export const gaussKernel: Array<Array<number>> = [
	[1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273],
	[4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
	[7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273],
	[4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
	[1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273]
];

export const sobelKernel = [
	[1, 0, -1],
	[2, 0, -2],
	[1, 0, -1]
];
export const sobelRotated = [
	[1, 2, 1],
	[0, 0, 0],
	[-1, -2, -1]
];

/**
 * Returns the current frame on a canvas
 * @param canvas 
 */
export function getImageFromCanvas(canvas: HTMLCanvasElement) : RGBImage {
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
 * Returns a greyscaled version of an image
 * @param image 
 */
export function greyScale(image: RGBImage): RGBImage {
	let width = image.getWidth();
	let height = image.getHeight();
	let result = RGBImage.fromDimensions(width, height);

	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			let avg = Math.floor((image.r[x][y] + image.g[x][y] + image.b[x][y]) / 3);
			result.r[x][y] = result.g[x][y] = result.b[x][y] = avg;
		}
	}

	return result;
}

/**
 * Performs a pythagorean combination of two images. Each pixel in the output image
 * is equivalent to the sum of the squares of the corresponding pixel in the two
 * input images.
 * @param image1 
 * @param image2 
 */
export function combineConvolutions(image1: RGBImage, image2: RGBImage) : RGBImage {
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
		function (err) {
			alert(err);
		}
	);
}
