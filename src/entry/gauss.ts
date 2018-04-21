import * as Vision from '../vision';
declare var MathJax:any;

let animating = false;
let stdDev: number = +(document.getElementById('stdDev') as HTMLInputElement).value;
let kernelSize = +(document.getElementById('kernelSize') as HTMLInputElement).value;
// This kernel will actually be used for the calculations
let convolutionKernel: Array<number>;
// This kernel will just be displayed, and will not be used in calculations, for efficiency
let displayKernel: Array<Array<number>>;

function computeKernel(size: number, weight: number): Array<number> {
    let result = new Array<number>(size);
    let sumTotal = 0;

    let offset = Math.floor(size / 2);
    for (let i = 0 - offset; i <= offset; i++) {
        sumTotal += result[i + offset] = (1 / Math.sqrt(2 * Math.PI * weight * weight)) * Math.pow(Math.E, 0 - ((i * i) / (2 * weight * weight)));
    }

    for (let i = 0; i < size; i++) {
        result[i] = result[i] / sumTotal;
    }

    return result;
}

function expandKernel(kernel: Array<number>): Array<Array<number>> {
    let result = new Array<Array<number>>(kernel.length);
    for (let x = 0; x < kernel.length; x++) {
        result[x] = new Array<number>(kernel.length);
        for (let y = 0; y < kernel.length; y++) {
            result[x][y] = kernel[x] * kernel[y];
        }
    }
    return result;
}

function writeMatrix(matrix: Array<Array<number>>): void {
    let matrixElement = document.getElementById('matrix');
    let resultString = "\\( \\begin{bmatrix} ";
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length - 1; x++) {
            resultString += matrix[x][y] + " & ";
        }
        resultString += matrix[matrix.length - 1][y] + " \\\\ ";
    }
    resultString += "\\end{bmatrix} \\)";
    matrixElement.innerHTML = resultString;
    MathJax.Hub.Typeset();
}

function computeFrame(): void {
    
    let inputImage: Vision.RGBImage = Vision.getImageFromVideo(document.getElementById('webcam') as HTMLVideoElement, document.getElementById('camfeed') as HTMLCanvasElement);

    let outputImage: Vision.RGBImage = Vision.convolve1d(inputImage, convolutionKernel);

    outputImage.draw(document.getElementById('convolutionout') as HTMLCanvasElement);

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

document.getElementById('kernelSize').addEventListener('change', function (event) {
    let tmp = this as HTMLInputElement;

    let val = tmp.value;
    if (+val != NaN) {
        kernelSize = +val;
    }

    convolutionKernel = computeKernel(kernelSize, stdDev);
    displayKernel = expandKernel(convolutionKernel);
    writeMatrix(displayKernel);
});

document.getElementById('stdDev').addEventListener('change', function (event) {
    let tmp = this as HTMLInputElement;

    let val = tmp.value;
    if (+val != NaN) {
        stdDev = +val;
    }

    convolutionKernel = computeKernel(kernelSize, stdDev);
    displayKernel = expandKernel(convolutionKernel);
    writeMatrix(displayKernel);
});

Vision.initCamera();
convolutionKernel = computeKernel(kernelSize, stdDev);
displayKernel = expandKernel(convolutionKernel);
writeMatrix(displayKernel);