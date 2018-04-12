export class RGBImage {
	private width: number;
	private height: number;

    private static getIndex(x, y, width, height):number {
        return (width * y) + x;
    }

	r: Array<Array<number>>;
	g: Array<Array<number>>;
	b: Array<Array<number>>;

	private constructor() {
		// Intentionally blank and private. Use the static constructors. This is done because
		// typescript doesn't allow constructor overloading. To instantiate and RGBImage,
		// instead of using 
		//     new RGBImage(...);
		// use
		//     RGBImage.fromDimensions();
		// or
		//     RGBImage.fromImageData();
	}

	/**
	 * Constructor to initialise a blank image from given dimensions
	 * @param width width of the image
	 * @param height height of the image
	 */
	public static fromDimensions(width: number, height: number): RGBImage {
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

	/**
	 * Constructor to initialise an image from Javascript's ImageData class
	 * @param image 
	 */
	public static fromImageData(image:ImageData): RGBImage {
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
	
	/**
	 * Returns a copy of this image
	 * @param image 
	 */
	public static clone(image:RGBImage): RGBImage {
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
				result.r[x][y] = image.r[x][y];
				result.g[x][y] = image.g[x][y];
				result.b[x][y] = image.b[x][y];
			}
		}
		return result;
	}

	/**
	 * Returns the image's width
	 */
	public getWidth():number {
		return this.width;
	}

	/**
	 * Returns the image's height
	 */
	public getHeight():number {
		return this.height;
	}

	/**
	 * Returns the image in Javascript's ImageData format. 
	 */
	public asImageData(): ImageData {
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

	/**
	 * Draws this image on a canvas
	 * @param canvas the canvas on which the image is to be drawn
	 */
	public draw(canvas: HTMLCanvasElement) {
		let data = this.asImageData();
		canvas.getContext('2d').putImageData(data,0,0);
	}
}