import { RGBImage } from './RGBImage';

export class MovingAverageBackgroundSubtractor {
    private buffer: Buffer<RGBImage>;
    private currentBackground: RGBImage;
    private bufferSize: number;

    constructor(size: number) {
        this.bufferSize = 1;
        this.buffer = new Buffer<RGBImage>(size);
    }

    public addFrame(image: RGBImage) {
        if (this.currentBackground == null) {
            this.currentBackground = RGBImage.clone(image);
        }
        let tempModel = RGBImage.fromDimensions(image.getWidth(), image.getHeight());
        for (let x = 0; x < tempModel.getWidth(); x++) {
            for (let y = 0; y < tempModel.getHeight(); y++) {
                tempModel.r[x][y] = this.currentBackground.r[x][y] * this.bufferSize;
                tempModel.g[x][y] = this.currentBackground.g[x][y] * this.bufferSize;
                tempModel.b[x][y] = this.currentBackground.b[x][y] * this.bufferSize;
            }
        }
        if (this.bufferSize < this.buffer.getCapacity()) {
            this.bufferSize++;
            this.buffer.add(image);
            for (let x = 0; x < image.getWidth(); x++) {
                for (let y = 0; y < image.getHeight(); y++) {
                    tempModel.r[x][y] = (tempModel.r[x][y] + image.r[x][y]) / this.bufferSize;
                    tempModel.g[x][y] = (tempModel.g[x][y] + image.g[x][y]) / this.bufferSize;
                    tempModel.b[x][y] = (tempModel.b[x][y] + image.b[x][y]) / this.bufferSize;
                }
            }
        } else {
            this.buffer.add(image);
            let toRemove:RGBImage = this.buffer.removeFirstNode();
            for (let x = 0; x < image.getWidth(); x++) {
                for (let y = 0; y < image.getHeight(); y++) {
                    tempModel.r[x][y] = (tempModel.r[x][y] - toRemove.r[x][y] + image.r[x][y]) / this.bufferSize;
                    tempModel.g[x][y] = (tempModel.g[x][y] - toRemove.g[x][y] + image.g[x][y]) / this.bufferSize;
                    tempModel.b[x][y] = (tempModel.b[x][y] - toRemove.b[x][y] + image.b[x][y]) / this.bufferSize;
                }
            }
        }

        this.currentBackground = tempModel;
    }

    public getBackgroundModel(): RGBImage {
        return this.currentBackground;
    }

    public setBufferSize(num:number) {
        if (num > this.bufferSize) {
            this.buffer.setSize(num);
        } else {
            this.buffer.setSize(num);
            this.recalculateBackgroundModel();
            this.bufferSize = this.buffer.getSize();
        }
    }

    private recalculateBackgroundModel() {
        let iter = new BufferIterator<RGBImage>(this.buffer);
        let background = RGBImage.fromDimensions(this.currentBackground.getWidth(), this.currentBackground.getHeight());
        while (iter.hasNext()) {
            let frame = iter.next();
            for (let x = 0; x < this.currentBackground.getWidth(); x++) {
                for (let y = 0; y < this.currentBackground.getHeight(); y++) {
                    background.r[x][y] += frame.r[x][y];
                    background.g[x][y] += frame.g[x][y];
                    background.b[x][y] += frame.b[x][y];
                }
            }
        }
        for (let x = 0; x < this.currentBackground.getWidth(); x++) {
            for (let y = 0; y < this.currentBackground.getHeight(); y++) {
                background.r[x][y] = background.r[x][y] / this.bufferSize;
                background.g[x][y] = background.g[x][y] / this.bufferSize;
                background.b[x][y] = background.b[x][y] / this.bufferSize;
            }
        }
    }
}


class BufferIterator<T> {
    private buffer: Buffer<T>;
    private currentNode: Node<T>;
    constructor(buf: Buffer<T>) {
        this.currentNode = buf.getFirstNode();
    }

    public hasNext(): boolean {
        return this.currentNode.next != null && this.currentNode.next != undefined;
    }

    public next(): T {
        let res = this.currentNode.data;
        this.currentNode = this.currentNode.next;
        return res;
    }
}

/**
 * The data structure used for the frame buffer for moving average background subtraction. It's essentially a doubly
 * linked list but it can have a fixed capacity and when that capacity is reached and a new object is added, the first
 * node in the list is discarded. 
 */
class Buffer<T> {
    private first: Node<T>;
    private last: Node<T>;
    private size: number;
    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
    }

    public add(obj: T) {
        if (this.size == 0) {
            this.first = new Node<T>(obj);
            this.last = this.first;
            this.size++;
        } else if (this.size < this.capacity) {
            this.last.next = new Node<T>(obj);
            this.last.next.previous = this.last;
            this.last = this.last.next;
            this.size++;
        } else {
            this.last.next = new Node<T>(obj);
            this.last.next.previous = this.last;
            this.last = this.last.next;
            this.first = this.first.next;
            this.first.previous = null;
        }
    }

    public removeFirstNode(): T {
        let result = this.first.data;
        this.first = this.first.next;
        this.first.previous = null;
        return result;
    }

    public removeLastNode(): T {
        let result = this.last.data;
        this.last = this.last.previous;
        this.last.next = null;
        return result;
    }

    public getFirstNode(): Node<T> {
        return this.first;
    }

    public getSize(): number {
        return this.size;
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public setSize(num:number) {
        if (this.capacity <= num) {
            this.capacity = num;
        } else {
            let diff = this.capacity - num;
            for (let i = 0; i < diff; i++) {

            }
        }
    }
}

class Node<T> {
    constructor(obj: T) {
        this.data = obj;
        this.previous = null;
        this.next = null;
    }

    data: T;
    previous: Node<T>;
    next: Node<T>
}