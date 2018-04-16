"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage_1 = require("./RGBImage");
var Vision = __importStar(require("./vision"));
function getHarrisCorners(image, threshold) {
    image = Vision.greyScale(image);
    var result = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    // Get x and y gradients
    var x_gradients = Vision.greyscaleConvolve(image, Vision.sobelKernel, 3, 3);
    var y_gradients = Vision.greyscaleConvolve(image, Vision.sobelRotated, 3, 3);
    for (var x = 1; x < image.getWidth() - 1; x++) {
        for (var y = 1; y < image.getHeight() - 1; y++) {
            // calculate image gradients over window
            var xacc = 0;
            var yacc = 0;
            for (var i = x - 1; i <= x + 1; i++) {
                for (var j = y - 1; j <= y + 1; j++) {
                    xacc += x_gradients.r[i][j];
                    yacc += y_gradients.r[i][j];
                }
            }
            //calculate "cornerness" score using formula: score = det(m) - k * trace(m)^2
            var matrix = [xacc * xacc, xacc * yacc, xacc * yacc, yacc * yacc];
            var det = determinant(matrix);
            var trace = matrix[1] + matrix[2];
            var score = det - (0.04 * trace * trace);
            if (score > 0) {
                console.log(score);
            }
            // thresholding
            if (score > threshold) {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = 255;
            }
            else {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
            }
        }
    }
    return result;
}
exports.getHarrisCorners = getHarrisCorners;
/**
 * Returns the determinant of a 2x2 matrix (input as a 1d matrix)
 * @param matrix
 */
function determinant(matrix) {
    return (matrix[0] * matrix[3]) - (matrix[1] * matrix[2]);
}
