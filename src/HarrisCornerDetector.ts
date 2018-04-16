import { RGBImage } from './RGBImage';
import * as Vision from './vision';


export function getHarrisCorners(image: RGBImage, threshold: number):RGBImage {
    image = Vision.greyScale(image);
    let result = RGBImage.fromDimensions(image.getWidth(), image.getHeight());

    // Get x and y gradients
    let x_gradients = Vision.greyscaleConvolve(image, Vision.sobelKernel, 3, 3);
    let y_gradients = Vision.greyscaleConvolve(image, Vision.sobelRotated, 3, 3);

    for (let x = 1; x < image.getWidth() - 1; x++) {
        for (let y = 1; y < image.getHeight() - 1; y++) {
            // calculate image gradients over window
            let xacc = 0;
            let yacc = 0;
            for (let i = x -1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    xacc += x_gradients.r[i][j];
                    yacc += y_gradients.r[i][j];
                }
            }

            //calculate "cornerness" score using formula: score = det(m) - k * trace(m)^2
            let matrix = [xacc * xacc, xacc * yacc, xacc * yacc, yacc * yacc];
            let det = determinant(matrix);
            let trace = matrix[1] + matrix[2];
            let score = det - (0.04 * trace * trace);
            if (score > 0) {
                console.log(score);
            }

            // thresholding
            if (score > threshold) {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = 255;
            } else {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = 0;
            }
        }
    }

    return result;

}

/**
 * Returns the determinant of a 2x2 matrix (input as a 1d matrix)
 * @param matrix 
 */
function determinant(matrix:Array<number>):number {
    return (matrix[0] * matrix[3]) - (matrix[1] * matrix[2])
}