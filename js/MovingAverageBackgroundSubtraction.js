"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage_1 = require("./RGBImage");
var MovingAverageBackgroundSubtractor = /** @class */ (function () {
    function MovingAverageBackgroundSubtractor(size) {
        this.bufferSize = 1;
        this.buffer = new Buffer(size);
    }
    MovingAverageBackgroundSubtractor.prototype.addFrame = function (image) {
        if (this.currentBackground == null) {
            this.currentBackground = RGBImage_1.RGBImage.clone(image);
        }
        var tempModel = RGBImage_1.RGBImage.fromDimensions(image.getWidth(), image.getHeight());
        for (var x = 0; x < tempModel.getWidth(); x++) {
            for (var y = 0; y < tempModel.getHeight(); y++) {
                tempModel.r[x][y] = this.currentBackground.r[x][y] * this.bufferSize;
                tempModel.g[x][y] = this.currentBackground.g[x][y] * this.bufferSize;
                tempModel.b[x][y] = this.currentBackground.b[x][y] * this.bufferSize;
            }
        }
        if (this.bufferSize < this.buffer.getCapacity()) {
            this.bufferSize++;
            this.buffer.add(image);
            for (var x = 0; x < image.getWidth(); x++) {
                for (var y = 0; y < image.getHeight(); y++) {
                    tempModel.r[x][y] = (tempModel.r[x][y] + image.r[x][y]) / this.bufferSize;
                    tempModel.g[x][y] = (tempModel.g[x][y] + image.g[x][y]) / this.bufferSize;
                    tempModel.b[x][y] = (tempModel.b[x][y] + image.b[x][y]) / this.bufferSize;
                }
            }
        }
        else {
            this.buffer.add(image);
            var toRemove = this.buffer.removeFirstNode();
            for (var x = 0; x < image.getWidth(); x++) {
                for (var y = 0; y < image.getHeight(); y++) {
                    tempModel.r[x][y] = (tempModel.r[x][y] - toRemove.r[x][y] + image.r[x][y]) / this.bufferSize;
                    tempModel.g[x][y] = (tempModel.g[x][y] - toRemove.g[x][y] + image.g[x][y]) / this.bufferSize;
                    tempModel.b[x][y] = (tempModel.b[x][y] - toRemove.b[x][y] + image.b[x][y]) / this.bufferSize;
                }
            }
        }
        this.currentBackground = tempModel;
    };
    MovingAverageBackgroundSubtractor.prototype.getBackgroundModel = function () {
        return this.currentBackground;
    };
    MovingAverageBackgroundSubtractor.prototype.setBufferSize = function (num) {
        if (num > this.bufferSize) {
            this.buffer.setSize(num);
        }
        else {
            this.buffer.setSize(num);
            this.recalculateBackgroundModel();
            this.bufferSize = this.buffer.getSize();
        }
    };
    MovingAverageBackgroundSubtractor.prototype.recalculateBackgroundModel = function () {
        var iter = new BufferIterator(this.buffer);
        var background = RGBImage_1.RGBImage.fromDimensions(this.currentBackground.getWidth(), this.currentBackground.getHeight());
        while (iter.hasNext()) {
            var frame = iter.next();
            for (var x = 0; x < this.currentBackground.getWidth(); x++) {
                for (var y = 0; y < this.currentBackground.getHeight(); y++) {
                    background.r[x][y] += frame.r[x][y];
                    background.g[x][y] += frame.g[x][y];
                    background.b[x][y] += frame.b[x][y];
                }
            }
        }
        for (var x = 0; x < this.currentBackground.getWidth(); x++) {
            for (var y = 0; y < this.currentBackground.getHeight(); y++) {
                background.r[x][y] = background.r[x][y] / this.bufferSize;
                background.g[x][y] = background.g[x][y] / this.bufferSize;
                background.b[x][y] = background.b[x][y] / this.bufferSize;
            }
        }
    };
    return MovingAverageBackgroundSubtractor;
}());
exports.MovingAverageBackgroundSubtractor = MovingAverageBackgroundSubtractor;
var BufferIterator = /** @class */ (function () {
    function BufferIterator(buf) {
        this.currentNode = buf.getFirstNode();
    }
    BufferIterator.prototype.hasNext = function () {
        return this.currentNode.next != null && this.currentNode.next != undefined;
    };
    BufferIterator.prototype.next = function () {
        var res = this.currentNode.data;
        this.currentNode = this.currentNode.next;
        return res;
    };
    return BufferIterator;
}());
/**
 * The data structure used for the frame buffer for moving average background subtraction. It's essentially a doubly
 * linked list but it can have a fixed capacity and when that capacity is reached and a new object is added, the first
 * node in the list is discarded.
 */
var Buffer = /** @class */ (function () {
    function Buffer(capacity) {
        this.capacity = capacity;
        this.size = 0;
    }
    Buffer.prototype.add = function (obj) {
        if (this.size == 0) {
            this.first = new Node(obj);
            this.last = this.first;
            this.size++;
        }
        else if (this.size < this.capacity) {
            this.last.next = new Node(obj);
            this.last.next.previous = this.last;
            this.last = this.last.next;
            this.size++;
        }
        else {
            this.last.next = new Node(obj);
            this.last.next.previous = this.last;
            this.last = this.last.next;
            this.first = this.first.next;
            this.first.previous = null;
        }
    };
    Buffer.prototype.removeFirstNode = function () {
        var result = this.first.data;
        this.first = this.first.next;
        this.first.previous = null;
        return result;
    };
    Buffer.prototype.removeLastNode = function () {
        var result = this.last.data;
        this.last = this.last.previous;
        this.last.next = null;
        return result;
    };
    Buffer.prototype.getFirstNode = function () {
        return this.first;
    };
    Buffer.prototype.getSize = function () {
        return this.size;
    };
    Buffer.prototype.getCapacity = function () {
        return this.capacity;
    };
    Buffer.prototype.setSize = function (num) {
        if (this.capacity <= num) {
            this.capacity = num;
        }
        else {
            var diff = this.capacity - num;
            for (var i = 0; i < diff; i++) {
            }
        }
    };
    return Buffer;
}());
var Node = /** @class */ (function () {
    function Node(obj) {
        this.data = obj;
        this.previous = null;
        this.next = null;
    }
    return Node;
}());
