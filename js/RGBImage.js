"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage = /** @class */ (function () {
    function RGBImage() {
        // Intentionally blank and private. Use the static constructors. This is done because
        // typescript doesn't allow constructor overloading. To instantiate and RGBImage,
        // instead of using 
        //     new RGBImage(...);
        // use
        //     RGBImage.fromDimensions();
        // or
        //     RGBImage.fromImageData();
    }
    RGBImage.getIndex = function (x, y, width, height) {
        return (width * y) + x;
    };
    /**
     * Constructor to initialise a blank image from given dimensions
     * @param width width of the image
     * @param height height of the image
     */
    RGBImage.fromDimensions = function (width, height) {
        var result = new RGBImage();
        result.width = width;
        result.height = height;
        result.r = new Array(width);
        result.g = new Array(width);
        result.b = new Array(height);
        for (var x = 0; x < width; x++) {
            result.r[x] = new Array(height);
            result.g[x] = new Array(height);
            result.b[x] = new Array(height);
        }
        return result;
    };
    /**
     * Constructor to initialise an image from Javascript's ImageData class
     * @param image
     */
    RGBImage.fromImageData = function (image) {
        var result = new RGBImage();
        result.width = image.width;
        result.height = image.height;
        result.r = new Array(result.width);
        result.g = new Array(result.width);
        result.b = new Array(result.width);
        for (var x = 0; x < result.width; x++) {
            result.r[x] = new Array(result.height);
            result.g[x] = new Array(result.height);
            result.b[x] = new Array(result.height);
            for (var y = 0; y < result.height; y++) {
                var index = RGBImage.getIndex(x, y, result.width, result.height) * 4;
                result.r[x][y] = image.data[index++];
                result.g[x][y] = image.data[index++];
                result.b[x][y] = image.data[index];
            }
        }
        return result;
    };
    /**
     * Returns a copy of this image
     * @param image
     */
    RGBImage.clone = function (image) {
        var result = new RGBImage();
        result.width = image.width;
        result.height = image.height;
        result.r = new Array(result.width);
        result.g = new Array(result.width);
        result.b = new Array(result.width);
        for (var x = 0; x < result.width; x++) {
            result.r[x] = new Array(result.height);
            result.g[x] = new Array(result.height);
            result.b[x] = new Array(result.height);
            for (var y = 0; y < result.height; y++) {
                result.r[x][y] = image.r[x][y];
                result.g[x][y] = image.g[x][y];
                result.b[x][y] = image.b[x][y];
            }
        }
        return result;
    };
    /**
     * Returns the image's width
     */
    RGBImage.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Returns the image's height
     */
    RGBImage.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Returns the image in Javascript's ImageData format.
     */
    RGBImage.prototype.asImageData = function () {
        var result = new ImageData(this.width, this.height);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var index = RGBImage.getIndex(x, y, this.width, this.height) * 4;
                result.data[index++] = this.r[x][y];
                result.data[index++] = this.g[x][y];
                result.data[index++] = this.b[x][y];
                result.data[index] = 255;
            }
        }
        return result;
    };
    /**
     * Draws this image on a canvas
     * @param canvas the canvas on which the image is to be drawn
     */
    RGBImage.prototype.draw = function (canvas) {
        var data = this.asImageData();
        canvas.getContext('2d').putImageData(data, 0, 0);
    };
    /**
     * Returns a greyscaled copy of this image.
     */
    RGBImage.prototype.greyScale = function () {
        var result = RGBImage.fromDimensions(this.width, this.height);
        for (var x = 0; x < result.width; x++) {
            for (var y = 0; y < result.height; y++) {
                var avg = (this.r[x][y] + this.g[x][y] + this.b[x][y]) / 3;
                result.r[x][y] = result.g[x][y] = result.b[x][y] = avg;
            }
        }
        return result;
    };
    return RGBImage;
}());
exports.RGBImage = RGBImage;
