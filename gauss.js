"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Vision = __importStar(require("./vision"));
var animating = false;
var stdDev = +document.getElementById('stdDev').value;
var kernelSize = +document.getElementById('kernelSize').value;
// This kernel will actually be used for the calculations
var convolutionKernel;
// This kernel will just be displayed, and will not be used in calculations, for efficiency
var displayKernel;
function computeKernel(size, weight) {
    var result = new Array(size);
    var sumTotal = 0;
    var offset = Math.floor(size / 2);
    for (var i = 0 - offset; i <= offset; i++) {
        sumTotal += result[i + offset] = (1 / Math.sqrt(2 * Math.PI * weight * weight)) * Math.pow(Math.E, 0 - ((i * i) / (2 * weight * weight)));
    }
    for (var i = 0; i < size; i++) {
        result[i] = result[i] / sumTotal;
    }
    return result;
}
function expandKernel(kernel) {
    var result = new Array(kernel.length);
    for (var x = 0; x < kernel.length; x++) {
        result[x] = new Array(kernel.length);
        for (var y = 0; y < kernel.length; y++) {
            result[x][y] = kernel[x] * kernel[y];
        }
    }
    return result;
}
function writeMatrix(matrix) {
    var matrixElement = document.getElementById('matrix');
    var resultString = "";
    for (var y = 0; y < matrix.length; y++) {
        resultString += "<tr>";
        for (var x = 0; x < matrix[y].length; x++) {
            resultString += "<td>" + matrix[x][y] + "</td>";
        }
        resultString += "</tr>";
    }
    matrixElement.innerHTML = resultString;
}
function computeFrame() {
    var videoElement = document.getElementById('webcam');
    var camfeedctx = document.getElementById('camfeed').getContext('2d');
    camfeedctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
    var inputImage = camfeedctx.getImageData(0, 0, videoElement.videoWidth * 0.75, videoElement.videoHeight * 0.75);
    var outputImage = Vision.convolve1d(inputImage, convolutionKernel);
    document.getElementById('convolutionout').getContext('2d').putImageData(outputImage, 0, 0);
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
    var tmp = this;
    var val = tmp.value;
    if (+val != NaN) {
        kernelSize = +val;
    }
    convolutionKernel = computeKernel(kernelSize, stdDev);
    displayKernel = expandKernel(convolutionKernel);
    writeMatrix(displayKernel);
});
document.getElementById('stdDev').addEventListener('change', function (event) {
    var tmp = this;
    var val = tmp.value;
    if (+val != NaN) {
        stdDev = +val;
    }
    convolutionKernel = computeKernel(kernelSize, stdDev);
    displayKernel = expandKernel(convolutionKernel);
    writeMatrix(displayKernel);
});
Vision.initCamera();
//# sourceMappingURL=gauss.js.map