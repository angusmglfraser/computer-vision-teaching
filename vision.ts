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

/*
 * This function is necessary since javascript stores 2-dimensional image data
 * in 1-dimensional arrays
 * 
 * Since this function can't return invalid indexes, it isn't very safe. Use wisely
 */
export function getIndex(x: number, y: number, width: number, height: number): number {
	// The following 4 if statements are used to "extend" the image beyond it's boundaries so that edge and corner
	// pixels can be calculated as well.
	if (x < 0) {
		x++;
	}
	if (y < 0) {
		y++;
	}
	if (x >= width) {
		x = width - 1;
	}
	if (y >= height) {
		y = height - 1;
	}
	return (width * y) + x;
}

/*
 * Convolves a greyscale image with kernel
 */
export function convolve(image: ImageData, kernel: Array<Array<number>>, kernelWidth: number, kernelHeight: number, preserveSign = false): ImageData {
	let output: ImageData = new ImageData(image.width, image.height);

	let offsetX = Math.floor(kernelWidth / 2);
	let offsetY = Math.floor(kernelHeight / 2);
	for (let x = 0; x < image.width; x++) {
		for (let y = 0; y < image.height; y++) {
			let raccumulator = 0;
			let gaccumulator = 0;
			let baccumulator = 0;

			for (let kx = 0; kx < kernelWidth; kx++) {
				for (let ky = 0; ky < kernelHeight; ky++) {
					raccumulator += kernel[kx][ky] * image.data[getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4];
					gaccumulator += kernel[kx][ky] * image.data[(getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4) + 1];
					baccumulator += kernel[kx][ky] * image.data[(getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4) + 2];
				}
			}

			let index = getIndex(x, y, image.width, image.height) * 4;
			output.data[index] = preserveSign? raccumulator : Math.abs(raccumulator);
			output.data[index + 1] = preserveSign? gaccumulator : Math.abs(gaccumulator);
			output.data[index + 2] = preserveSign? baccumulator : Math.abs(baccumulator);
			output.data[index + 3] = 255;
		}
	}

	return output;
}

/*
 * Use this for convolving with symmetrical kernels. It has to do far fewer operations. O(n) rather than O(n^2)
 */
export function convolve1d(image: ImageData, kernel: Array<number>, preserveSign = false): ImageData {
	let output: ImageData = new ImageData(image.width, image.height);
	let intermediate: ImageData = new ImageData(image.width, image.height);
	let offset = Math.floor(kernel.length / 2);

	//first convolution
	for (let x = 0; x < image.width; x++) {
		for (let y = 0; y < image.height; y++) {
			let index = getIndex(x,y,image.width,image.height) * 4;
			let raccumulator = 0;
			let gaccumulator = 0;
			let baccumulator = 0;
			for (let i = 0; i < kernel.length; i++) {
				raccumulator += kernel[i] * image.data[getIndex(x + offset - i, y, image.width, image.height) * 4];
				gaccumulator += kernel[i] * image.data[(getIndex(x + offset - i, y, image.width, image.height) * 4) + 1];
				baccumulator += kernel[i] * image.data[(getIndex(x + offset - i, y, image.width, image.height) * 4) + 2];
			}
			intermediate.data[index] = preserveSign? raccumulator : Math.abs(raccumulator);
			intermediate.data[index + 1] = preserveSign? gaccumulator : Math.abs(gaccumulator);
			intermediate.data[index + 2] = preserveSign? baccumulator : Math.abs(baccumulator);
			intermediate.data[index + 3] = 255;
		}
	}

	//second convolution
	for (let x = 0; x < image.width; x++) {
		for (let y = 0; y < image.height; y++) {
			let index = getIndex(x,y,image.width, image.height) * 4;
			let raccumulator = 0;
			let gaccumulator = 0;
			let baccumulator = 0;
			for (let i = 0; i < kernel.length; i++) {
				raccumulator += kernel[i] * intermediate.data[getIndex(x + offset - i, y, intermediate.width, intermediate.height) * 4];
				gaccumulator += kernel[i] * intermediate.data[(getIndex(x + offset - i, y, intermediate.width, intermediate.height) * 4) + 1];
				baccumulator += kernel[i] * intermediate.data[(getIndex(x + offset - i, y, intermediate.width, intermediate.height) * 4) + 2];
			}
			output.data[index] = preserveSign? raccumulator : Math.abs(raccumulator);
			output.data[index + 1] = preserveSign? gaccumulator : Math.abs(gaccumulator);
			output.data[index + 2] = preserveSign? baccumulator : Math.abs(baccumulator);
			output.data[index + 3] = 255;
		}
	}
	return output;
}

/*
 * Returns a greyscaled version of an image
 */
export function greyScale(image: ImageData): ImageData {
	let data = new Uint8ClampedArray(image.data.length);
	for (let i = 0; i < image.data.length; i += 4) {
		let avg = image.data[i] + image.data[i + 1] + image.data[i + 2];
		avg = avg / 3;

		data[i] = data[i + 1] = data[i + 2] = avg;
		// Set opacity to max. Remember, this is RGBA, not RGB
		data[i + 3] = 255;
	}

	return new ImageData(data, image.width, image.height);
}

export function combineConvolutions(image1: ImageData, image2: ImageData): ImageData {
	let output = new ImageData(image1.width, image1.height);

	for (let i = 0; i < image1.data.length; i += 4) {
		let val1 = image1.data[i];
		let val2 = image2.data[i];

		output.data[i] = output.data[i + 1] = output.data[i + 2] = Math.sqrt((val1 * val1) + (val2 * val2));
		output.data[i + 3] = 255;
	}

	return output;
}

export function initCamera(): void {
	navigator.mediaDevices.getUserMedia({ video: true }).then(
		function (stream) {
			let webcamElement: HTMLVideoElement = document.getElementById('webcam') as HTMLVideoElement;
			webcamElement.srcObject = stream;
			webcamElement.addEventListener('playing', function (event) {
				let canvases = document.getElementsByTagName('canvas');
				for (let i = 0; i < canvases.length; i++) {
					canvases[i].width = webcamElement.videoWidth * 0.75;
					canvases[i].height = webcamElement.videoHeight * 0.75;
				}
			})
		}
	).catch(
		function (err) {
			alert(err);
		}
	);
}
