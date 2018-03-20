"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Camera = /** @class */ (function () {
    function Camera() {
        this.videoElement = document.createElement('video');
        this.camfeed = document.createElement('canvas');
    }
    Camera.getCamera = function () {
        if (Camera.singleton === undefined || Camera.singleton === null) {
            Camera.singleton = new Camera();
        }
        else {
            return Camera.singleton;
        }
    };
    return Camera;
}());
exports.Camera = Camera;
