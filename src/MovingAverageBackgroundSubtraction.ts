import { RGBImage } from './RGBImage';
import { getImageFromVideo } from './vision';

export class MovingAverageBackgroundSubtractor {
    private buffer: DLinkedList<RGBImage>;
    private currentBackground: RGBImage;
    private capacity: number;

    constructor(size: number) {
        this.buffer = new DLinkedList<RGBImage>();
        this.capacity = size;
        this.currentBackground = null;
    }

    public addFrame(image: RGBImage): void {
        let size = this.buffer.getSize();
        if (this.currentBackground == null) {
            this.currentBackground = image;
            this.buffer.add(image);
        } else {
            let tempModel: RGBImage;
            if (this.buffer.getSize() < this.capacity) {
                tempModel = RGBImage.clone(this.currentBackground);
                for (let x = 0; x < image.getWidth(); x++) {
                    for (let y = 0; y < image.getHeight(); y++) {
                        tempModel.r[x][y] *= size;
                        tempModel.g[x][y] *= size;
                        tempModel.b[x][y] *= size;
                        tempModel.r[x][y] += image.r[x][y];
                        tempModel.g[x][y] += image.g[x][y];
                        tempModel.b[x][y] += image.b[x][y];
                    }
                }
            } else {
                tempModel = RGBImage.clone(this.currentBackground);
                let toRemove = this.buffer.removeFirstNode();
                for (let x = 0; x < image.getWidth(); x++) {
                    for (let y = 0; y < image.getHeight(); y++) {
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
            for (let x = 0; x < image.getWidth(); x++) {
                for (let y = 0; y < image.getHeight(); y++) {
                    tempModel.r[x][y] /= this.buffer.getSize();
                    tempModel.g[x][y] /= this.buffer.getSize();
                    tempModel.b[x][y] /= this.buffer.getSize();
                }
            }
            this.currentBackground = tempModel;
        }
    }

    public getBackgroundModel(): RGBImage {
        return this.currentBackground;
    }

    public setBufferSize(num: number): void {
        if (num > this.buffer.getSize()) {
            this.capacity = num;
        } else {
            this.capacity = num;
            while (this.buffer.getSize() > this.capacity) {
                this.buffer.removeFirstNode();
            }
            this.recalculateBackgroundModel();
        }
    }

    private recalculateBackgroundModel(): void {
        let iter = new DLinkedListIterator<RGBImage>(this.buffer);
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
                background.r[x][y] = background.r[x][y] / this.buffer.getSize();
                background.g[x][y] = background.g[x][y] / this.buffer.getSize();
                background.b[x][y] = background.b[x][y] / this.buffer.getSize();
            }
        }
    }
}


class DLinkedListIterator<T> {
    private buffer: DLinkedList<T>;
    private currentNode: Node<T>;
    constructor(buf: DLinkedList<T>) {
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


class DLinkedList<T> {
    private first: Node<T>;
    private last: Node<T>;
    private size: number;

    constructor() {
        this.size = 0;
    }

    public add(obj: T): void {
        if (this.size == 0) {
            this.first = new Node<T>(obj);
            this.last = this.first;
        } else {
            this.last.next = new Node<T>(obj);
            this.last.next.previous = this.last;
            this.last = this.last.next;
        }
        this.size++;
    }

    public removeFirstNode(): T {
        let result = this.first.data;
        this.first = this.first.next;
        this.first.previous = null;
        this.size--;
        return result;
    }

    public removeLastNode(): T {
        let result = this.last.data;
        this.last = this.last.previous;
        this.last.next = null;
        this.size--;
        return result;
    }

    public getFirstNode(): Node<T> {
        return this.first;
    }

    public getLastNode(): Node<T> {
        return this.last;
    }

    public getSize(): number {
        return this.size;
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