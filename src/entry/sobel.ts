import * as Vision from '../vision';


let blurring = false;
let animating = false;

function computeFrame(): void {
	let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);

	if (blurring) {
		inputImage = Vision.convolve(inputImage, Vision.gaussKernel, 5, 5);
	}
	inputImage = inputImage.greyScale();
	let x = Vision.greyscaleConvolve(inputImage, Vision.sobelKernel, 3, 3);
	let y = Vision.greyscaleConvolve(inputImage, Vision.sobelRotated, 3, 3);
	let both = Vision.combineConvolutions(x, y);

	x.draw(document.getElementById('sobelx') as HTMLCanvasElement);
	y.draw(document.getElementById('sobely') as HTMLCanvasElement);
	both.draw(document.getElementById('sobelboth') as HTMLCanvasElement);

	if (animating) {
		requestAnimationFrame(computeFrame);
	}
}


document.getElementById('startBtn').addEventListener('click', function (event) {
	animating = true;
	computeFrame();
});

document.getElementById('stopBtn').addEventListener('click', function (event) {
	animating = false;
});

(document.getElementById('gaussianToggle') as HTMLInputElement).addEventListener('change', function (event) {
	if (this.checked) {
		blurring = true;
	} else {
		blurring = false;
	}
});
Vision.initCamera();