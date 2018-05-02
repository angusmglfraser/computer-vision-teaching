import * as Vision from './vision';

/**
 * This still doesn't work. Don't use it yet
 * @param image 
 * @param threshold 
 */
export function getHarrisCorners(image: Vision.RGBImage, threshold: number): Vision.RGBImage {
    image = image.greyScale();
    let result = Vision.RGBImage.fromDimensions(image.getWidth(), image.getHeight());

    // Get x and y gradients
    let x_gradients = Vision.greyscaleConvolve(image, Vision.sobelX, 3, 3);
    let y_gradients = Vision.greyscaleConvolve(image, Vision.sobelY, 3, 3);

    for (let x = 1; x < image.getWidth() - 1; x++) {
        for (let y = 1; y < image.getHeight() - 1; y++) {
            // calculate image gradients over window
            let xacc = 0;
            let yacc = 0;
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    xacc += Math.abs(x_gradients.r[i][j] - x_gradients.r[x][y]);
                    yacc += Math.abs(y_gradients.r[i][j] - y_gradients.r[x][y]);
                }
            }
            xacc /= 9;
            yacc /= 9;
            xacc /= 255;
            yacc /= 255;
            //calculate "cornerness" score using formula: score = det(m) - k * trace(m)^2
            let a = xacc * xacc;
            let b = yacc * yacc;
            let c = xacc * yacc;
            let det = (a * b) - (c * c);
            let trace = a + b;
            let score = - (det - (0.04 * trace * trace));


            // thresholding
            threshold = 0.2;
            if (score > threshold) {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = 255;
            } else {
                result.r[x][y] = result.g[x][y] = result.b[x][y] = score * 255;
            }
        }
    }

    return result;

}