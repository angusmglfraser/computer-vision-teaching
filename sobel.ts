import * as Vision from './vision';


let blurring = false;
let animating = false;

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
	if (blurring) {
		inputImage = Vision.convolve(inputImage, Vision.gaussKernel, 5, 5);
	}
	inputImage = Vision.greyScale(inputImage);
	let x = Vision.convolve(inputImage, Vision.sobelKernel, 3, 3);
	let y = Vision.convolve(inputImage, Vision.sobelRotated, 3, 3);
	let both = Vision.combineConvolutions(x, y);

	(document.getElementById('sobelx') as HTMLCanvasElement).getContext('2d').putImageData(x, 0, 0);
	(document.getElementById('sobely') as HTMLCanvasElement).getContext('2d').putImageData(y, 0, 0);
	(document.getElementById('sobelboth') as HTMLCanvasElement).getContext('2d').putImageData(both, 0, 0);

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