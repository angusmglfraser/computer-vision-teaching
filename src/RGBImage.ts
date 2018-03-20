export class RGBImage {
	private width: number;
	private height: number;

    private static getIndex(x, y, width, height):number {
        return (width * y) + x;
    }

	r: Array<Array<number>>;
	g: Array<Array<number>>;
	b: Array<Array<number>>;

	static fromDimensions(width: number, height: number): RGBImage {
		let result = new RGBImage();
		result.width = width;
		result.height = height;
		result.r = new Array<Array<number>>(width);
		result.g = new Array<Array<number>>(width);
		result.b = new Array<Array<number>>(height);

		for (let x = 0; x < width; x++) {
			result.r[x] = new Array<number>(height);
			result.g[x] = new Array<number>(height);
			result.b[x] = new Array<number>(height);
		}
		return result;
	}

	static fromImageData(image:ImageData): RGBImage {
		let result = new RGBImage();
		result.width = image.width;
		result.height = image.height;

		result.r = new Array<Array<number>>(result.width);
		result.g = new Array<Array<number>>(result.width);
		result.b = new Array<Array<number>>(result.width);

		for (let x = 0; x < result.width; x++) {
			result.r[x] = new Array<number>(result.height);
			result.g[x] = new Array<number>(result.height);
			result.b[x] = new Array<number>(result.height);
			for (let y = 0; y < result.height; y++) {
				let index = RGBImage.getIndex(x,y,result.width,result.height) * 4;
				result.r[x][y] = image.data[index++];
				result.g[x][y] = image.data[index++];
				result.b[x][y] = image.data[index];
			}
		}
		return result;
	}


	getWidth():number {
		return this.width;
	}

	getHeight():number {
		return this.height;
	}

	asImageData(): ImageData {
		let result = new ImageData(this.width, this.height);

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				let index = RGBImage.getIndex(x,y,this.width,this.height) * 4;
				result.data[index++] = this.r[x][y];
				result.data[index++] = this.g[x][y];
				result.data[index++] = this.b[x][y];
				result.data[index] = 255;
			}
		}

		return result;
	}

	draw(canvas: HTMLCanvasElement) {
		let data = this.asImageData();
		canvas.getContext('2d').putImageData(data,0,0);
	}
}