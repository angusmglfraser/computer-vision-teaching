export class Camera {
    private videoElement:HTMLVideoElement;
    private camfeed:HTMLCanvasElement;
    private scale:number
    private static singleton:Camera;

    static getCamera(): Camera {
        if (Camera.singleton === undefined || Camera.singleton === null) {
            Camera.singleton = new Camera();
        } else {
            return Camera.singleton;
        }
    }

    private constructor() {
        this.videoElement = document.createElement('video') as HTMLVideoElement;
        this.camfeed = document.createElement('canvas') as HTMLCanvasElement;
    }
}