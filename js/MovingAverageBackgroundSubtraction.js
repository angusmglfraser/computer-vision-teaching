"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGBImage_1 = require("./RGBImage");
var MovingAverageBackgroundSubtractor = /** @class */ (function () {
    function MovingAverageBackgroundSubtractor(size) {
        this.buffer = new DLinkedList();
        this.capacity = size;
        this.currentBackground = null;
    }
    MovingAverageBackgroundSubtractor.prototype.addFrame = function (image) {
        var size = this.buffer.getSize();
        if (this.currentBackground == null) {
            this.currentBackground = image;
            this.buffer.add(image);
        }
        else {
            var tempModel = void 0;
            if (this.buffer.getSize() < this.capacity) {
                tempModel = RGBImage_1.RGBImage.clone(this.currentBackground);
                for (var x = 0; x < image.getWidth(); x++) {
                    for (var y = 0; y < image.getHeight(); y++) {
                        tempModel.r[x][y] *= size;
                        tempModel.g[x][y] *= size;
                        tempModel.b[x][y] *= size;
                        tempModel.r[x][y] += image.r[x][y];
                        tempModel.g[x][y] += image.g[x][y];
                        tempModel.b[x][y] += image.b[x][y];
                    }
                }
            }
            else {
                tempModel = RGBImage_1.RGBImage.clone(this.currentBackground);
                var toRemove = this.buffer.removeFirstNode();
                for (var x = 0; x < image.getWidth(); x++) {
                    for (var y = 0; y < image.getHeight(); y++) {
                        tempModel.r[x][y] *= size;
                        tempModel.g[x][y] *= size;
                        tempModel.b[x][y] *= size;
                        tempModel.r[x][y] -= toRemove.r[x][y];
                        tempModel.g[x][y] -= toRemove.g[x][y];
                        tempModel.b[x][y] -= toRemove.b[x][y];
                        tempModel.r[x][y] += image.r[x][y];
                        tempModel.g[x][y] += image.g[x][y];
                        tempModel.b[x][y] += image.b[x][y];
                    }
                }
            }
            this.buffer.add(image);
            for (var x = 0; x < image.getWidth(); x++) {
                for (var y = 0; y < image.getHeight(); y++) {
                    tempModel.r[x][y] /= this.buffer.getSize();
                    tempModel.g[x][y] /= this.buffer.getSize();
                    tempModel.b[x][y] /= this.buffer.getSize();
                }
            }
            this.currentBackground = tempModel;
        }
    };
    MovingAverageBackgroundSubtractor.prototype.getBackgroundModel = function () {
        return this.currentBackground;
    };
    MovingAverageBackgroundSubtractor.prototype.setBufferSize = function (num) {
        if (num > this.buffer.getSize()) {
            this.capacity = num;
        }
        else {
            this.capacity = num;
            while (this.buffer.getSize() > this.capacity) {
                this.buffer.removeFirstNode();
            }
            this.recalculateBackgroundModel();
        }
    };
    MovingAverageBackgroundSubtractor.prototype.recalculateBackgroundModel = function () {
        var iter = new DLinkedListIterator(this.buffer);
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
                background.r[x][y] = background.r[x][y] / this.buffer.getSize();
                background.g[x][y] = background.g[x][y] / this.buffer.getSize();
                background.b[x][y] = background.b[x][y] / this.buffer.getSize();
            }
        }
    };
    return MovingAverageBackgroundSubtractor;
}());
exports.MovingAverageBackgroundSubtractor = MovingAverageBackgroundSubtractor;
var DLinkedListIterator = /** @class */ (function () {
    function DLinkedListIterator(buf) {
        this.currentNode = buf.getFirstNode();
    }
    DLinkedListIterator.prototype.hasNext = function () {
        return this.currentNode.next != null && this.currentNode.next != undefined;
    };
    DLinkedListIterator.prototype.next = function () {
        var res = this.currentNode.data;
        this.currentNode = this.currentNode.next;
        return res;
    };
    return DLinkedListIterator;
}());
/**
 * The data structure used for the frame buffer for moving average background subtraction. It's essentially a doubly
 * linked list but it can have a fixed capacity and when that capacity is reached and a new object is added, the first
 * node in the list is discarded.
 */
var DLinkedList = /** @class */ (function () {
    function DLinkedList() {
        this.size = 0;
    }
    DLinkedList.prototype.add = function (obj) {
        if (this.size == 0) {
            this.first = new Node(obj);
            this.last = this.first;
        }
        else {
            this.last.next = new Node(obj);
            this.last.next.previous = this.last;
            this.last = this.last.next;
        }
        this.size++;
    };
    DLinkedList.prototype.removeFirstNode = function () {
        var result = this.first.data;
        this.first = this.first.next;
        this.first.previous = null;
        this.size--;
        return result;
    };
    DLinkedList.prototype.removeLastNode = function () {
        var result = this.last.data;
        this.last = this.last.previous;
        this.last.next = null;
        this.size--;
        return result;
    };
    DLinkedList.prototype.getFirstNode = function () {
        return this.first;
    };
    DLinkedList.prototype.getLastNode = function () {
        return this.last;
    };
    DLinkedList.prototype.getSize = function () {
        return this.size;
    };
    return DLinkedList;
}());
var Node = /** @class */ (function () {
    function Node(obj) {
        this.data = obj;
        this.previous = null;
        this.next = null;
    }
    return Node;
}());
