import * as Vision from '../vision';


let blurring = false;
let animating = false;

function computeFrame(): void {
	let inputImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);

	if (blurring) {
		inputImage = Vision.RGBConvolve(inputImage, Vision.gaussKernel, 5, 5);
	}
	inputImage = Vision.RGBGreyScale(inputImage);
	let x = Vision.RGBConvolve(inputImage, Vision.sobelKernel, 3, 3);
	let y = Vision.RGBConvolve(inputImage, Vision.sobelRotated, 3, 3);
	let both = Vision.RGBcombineConvolutions(x, y);

	(document.getElementById('sobelx') as HTMLCanvasElement).getContext('2d').putImageData(x.asImageData(), 0, 0);
	(document.getElementById('sobely') as HTMLCanvasElement).getContext('2d').putImageData(y.asImageData(), 0, 0);
	(document.getElementById('sobelboth') as HTMLCanvasElement).getContext('2d').putImageData(both.asImageData(), 0, 0);

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