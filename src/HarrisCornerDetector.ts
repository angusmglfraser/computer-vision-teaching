import * as Vision from './vision';


export function getHarrisCorners(image: Vision.RGBImage, threshold: number): Vision.RGBImage {
    image = image.greyScale();
    let result = Vision.RGBImage.fromDimensions(image.getWidth(), image.getHeight());

    // Get x and y gradients
    let x_gradients = Vision.greyscaleConvolve(image, Vision.sobelKernel, 3, 3);
    let y_gradients = Vision.greyscaleConvolve(image, Vision.sobelRotated, 3, 3);

    for (let x = 1; x < image.getWidth() - 1; x++) {
        for (let y = 1; y < image.getHeight() - 1; y++) {
            // calculate image gradients over window
            let xacc = 0;
            let yacc = 0;
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    xacc += x_gradients.r[i][j];
                    yacc += y_gradients.r[i][j];
                }
            }
            xacc /= 9;
            yacc /= 9;
            //calculate "cornerness" score using formula: score = det(m) - k * trace(m)^2
            let a = xacc * xacc;
            let b = yacc * yacc;
            let c = xacc * yacc;
            let det = (a * b) - (c * c);
            let trace = a + b;
            let score = det - (0.4 * trace * trace);
            
            console.log(score);

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