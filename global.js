const gaussKernel = [
    [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273],
    [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
    [7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273],
    [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273],
    [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273]
];

/*
 * This function is necessary since javascript stores 2-dimensional image data
 * in 1-dimensional arrays
 * 
 * Since this function can't return invalid indexes, it isn't very safe. Use wisely
 */
export function getIndex(x, y, width, height) {
  	// The following 4 if statements are used to "extend" the image beyond it's boundaries so that edge and corner
   	// pixels can be calculated as well.
   	if (x < 0) {
   		x++;
    }
    if (y < 0) {
	    y++;
   	}
   	if (x >= width) {
   		x = width - 1;
    }
    if (y >= height) {
	    y = height - 1;
   	}
   	return (width * y) + x;
}

/*
 * Convolves image with kernel
 */
export function convolve(image, kernel, kernelWidth, kernelHeight, preserveSign = false) {
    var output = new ImageData(image.width, image.height);

    var offsetX = Math.floor(kernelWidth / 2);
    var offsetY = Math.floor(kernelHeight / 2);
    for (let x = 0; x < image.width; x++) {
	    for (let y = 0; y < image.height; y ++) {
		    let accumulator = 0;

		    for (let kx = 0; kx < kernelWidth; kx++) {
			    for (let ky = 0; ky < kernelHeight; ky++) {
   					accumulator += kernel[kx][ky] * image.data[getIndex(x + offsetX - kx, y + offsetY - ky, image.width, image.height) * 4];
			    }
		    }

		    let index = getIndex(x,y,image.width,image.height) * 4;
		    output.data[index] = output.data[index + 1] = output.data[index + 2] = preserveSign? accumulator : Math.abs(accumulator);
    		output.data[index + 3] = 255;
   		}
    }

   	return output;
}

/*
 * Returns a greyscaled version of an image
 */
export function greyScale(image) {
    let data = new Uint8ClampedArray(image.data.length);
    for (let i = 0; i < image.data.length; i+=4) {
        let avg = image.data[i] + image.data[i+1] + image.data[i+2];
        avg = avg / 3;

        data[i] = data[i+1] = data[i+2] = avg;
        // Set opacity to max. Remember, this is RGBA, not RGB
        data[i+3] = 255;
    }

    return new ImageData(data, image.width, image.height);
}

export function combineConvolutions(image1, image2) {
    var output = new ImageData(image1.width, image1.height);

    for (var i = 0; i < image1.data.length; i+=4) {
        var val1 = image1.data[i];
        var val2 = image2.data[i];

        output.data[i] = output.data[i + 1] = output.data[i + 2] = Math.sqrt((val1 * val1) + (val2 * val2));
        output.data[i + 3] = 255;
    }

    return output;
}

export function initCamera() {
    navigator.mediaDevices.getUserMedia({video: true}).then(
        function(stream) {
            let webcamElement = document.getElementById('webcam');
            webcamElement.srcObject = stream;
            webcamElement.addEventListener('playing', function(event) {
                let canvases = document.getElementsByTagName('canvas');
                for (var i = 0; i < canvases.length; i++) {
                    canvases[i].width = webcamElement.videoWidth * 0.75;
                    canvases[i].height = webcamElement.videoHeight * 0.75;
                }
            })
        }
    ).catch(
        function(err) {
            alert(err);
        }
    );
}