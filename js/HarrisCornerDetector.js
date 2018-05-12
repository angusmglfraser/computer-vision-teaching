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
/**
 * This still doesn't work. Don't use it yet
 * @param image
 * @param threshold
 */
function getHarrisCorners(image, threshold) {
    image = image.greyScale();
    var result = Vision.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
    // Get x and y gradients
    var x_gradients = Vision.greyscaleConvolve(image, Vision.sobelX, 3, 3);
    var y_gradients = Vision.greyscaleConvolve(image, Vision.sobelY, 3, 3);
    for (var x = 1; x < image.getWidth() - 1; x++) {
        for (var y = 1; y < image.getHeight() - 1; y++) {
            // calculate image gradients over window
            var xacc = 0;
            var yacc = 0;
            for (var i = x - 1; i <= x + 1; i++) {
                for (var j = y - 1; j <= y + 1; j++) {
                    xacc += Math.abs(x_gradients.r[i][j] - x_gradients.r[x][y]);
                    yacc += Math.abs(y_gradients.r[i][j] - y_gradients.r[x][y]);
                }
            }
            xacc /= 9;
            yacc /= 9;
            xacc /= 255;
            yacc /= 255;
            //calculate "cornerness" score using formula: score = det(m) - k * trace(m)^2
            var a = xacc * xacc;
            var b = yacc * yacc;
            var c = xacc * yacc;
            var det = (a * b) - (c * c);
            var trace = a + b;
            var score = -(det - (0.04 * trace * trace));
            // thresholding
            threshold = 0.2;
            if (score > threshold) {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = 255;
            }
            else {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = score * 255;
            }
        }
    }
    return result;
}
exports.getHarrisCorners = getHarrisCorners;
//# sourceMappingURL=HarrisCornerDetector.js.map