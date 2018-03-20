"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage = /** @class */ (function () {
    function RGBImage() {
    }
    RGBImage.getIndex = function (x, y, width, height) {
        return (width * y) + x;
    };
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
    RGBImage.prototype.getWidth = function () {
        return this.width;
    };
    RGBImage.prototype.getHeight = function () {
        return this.height;
    };
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
    RGBImage.prototype.draw = function (canvas) {
        var data = this.asImageData();
        canvas.getContext('2d').putImageData(data, 0, 0);
    };
    return RGBImage;
}());
exports.RGBImage = RGBImage;
