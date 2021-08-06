import { UpploadService } from "../service";
import { safeListen, fitImageToContainer, canvasToBlob, } from "../helpers/elements";
import { blobToUpploadFile } from "../helpers/files";
export default class Camera extends UpploadService {
    constructor() {
        super(...arguments);
        this.name = "camera";
        this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M63 65l17-33c2-3 5-5 9-5h78c4 0 8 2 9 5l17 33h33c17 0 30 13 30 29v106c0 16-13 29-30 29H30c-17 0-30-13-30-29V94c0-16 13-29 30-29h33zm65 126c27 0 49-22 49-49 0-26-22-48-49-48s-49 22-49 48c0 27 22 49 49 49zm0-20c-16 0-30-13-30-29s14-28 30-28 30 12 30 28-14 29-30 29zm79-48c5 0 10-4 10-9 0-6-5-10-10-10-6 0-10 4-10 10 0 5 4 9 10 9z" fill="#000" fill-rule="nonzero"/></svg>`;
        this.color = "#16a085";
        this.canvas = document.createElement("canvas");
        this.gotError = false;
        this.waiting = false;
        this.frontCamera = false;
        this.supports = () => !!(window.navigator.mediaDevices &&
            window.navigator.mediaDevices.enumerateDevices &&
            !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        this.template = ({ translate, uppload }) => {
            return `
      <div class="service-main">
        <div class="camera-waiting">${translate("services.camera.waiting")}</div>
        <div class="camera-error">
          <p>${translate("services.camera.unableToRead")}</p>
          <p><a href="https://uppload.js.org/help/camera" target="_blank">${translate("needHelp")}</a></p>
        </div>
        <div class="camera-success">
          <video class="camera-stream"></video>
        </div>
      </div>
      <footer class="service-footer">
        <!--<button
          class="camera-switch uppload-button"
        >${translate("services.camera.switch")}</button>-->
        <button
          class="camera-click uppload-button uppload-button--cta"
          style="background: ${this.color}"
        >${translate("services.camera.button")}</button>
      </footer>
      ${!uppload.settings.disableHelp ? `<button class="need-help-link"><span>${translate("needHelp")}</span aria-hidden="true"><span>?</span></button>` : ""}
    `;
        };
        this.stop = () => {
            if (this.stream)
                this.stream.getTracks().forEach((track) => track.stop());
        };
        this.handlers = (params) => {
            this.waiting = true;
            this.update(params);
            const constraints = {
                audio: false,
                video: { width: 1280, height: 1280 },
            };
            this.startStream(params, constraints);
            const clickButton = params.uppload.container.querySelector(".camera-click");
            if (clickButton)
                safeListen(clickButton, "click", this.clickPhoto.bind(this, params));
            const switchButton = params.uppload.container.querySelector(".camera-click");
            if (switchButton)
                safeListen(switchButton, "click", this.switchCamera.bind(this, params));
            const helpButton = params.uppload.container.querySelector(".need-help-link");
            if (helpButton)
                safeListen(helpButton, "click", () => params.showHelp("/services/camera"));
        };
    }
    update(params) {
        const waiting = params.uppload.container.querySelector(".camera-waiting");
        if (waiting) {
            waiting.style.display = "none";
            waiting.style.opacity = "0";
        }
        const error = params.uppload.container.querySelector(".camera-error");
        if (error) {
            error.style.display = "none";
            error.style.opacity = "0";
        }
        const success = params.uppload.container.querySelector(".camera-success");
        if (success) {
            success.style.display = "none";
            success.style.opacity = "0";
        }
        const footer = params.uppload.container.querySelector(".service-footer");
        if (footer) {
            footer.style.display = "none";
            footer.style.opacity = "0";
        }
        if (this.gotError) {
            if (error) {
                error.style.display = "";
                error.style.opacity = "1";
            }
        }
        else if (this.waiting) {
            if (waiting) {
                waiting.style.display = "";
                waiting.style.opacity = "1";
            }
        }
        else {
            if (success) {
                success.style.display = "";
                success.style.opacity = "1";
            }
            if (footer) {
                footer.style.display = "";
                footer.style.opacity = "1";
            }
        }
    }
    switchCamera(params) {
        this.frontCamera = !this.frontCamera;
        const constraints = {
            audio: false,
            video: {
                width: 1280,
                height: 1280,
                facingMode: this.frontCamera ? "user" : "environment",
            },
        };
        this.startStream(params, constraints);
    }
    clickPhoto(params) {
        this.canvas = document.createElement("canvas");
        const video = params.uppload.container.querySelector("video.camera-stream");
        if (!video)
            return;
        if (!this.stream)
            return;
        const videoSize = video.getBoundingClientRect();
        let width = videoSize.width;
        let height = videoSize.height;
        this.stream.getTracks().forEach((track) => {
            const settings = track.getSettings();
            if (settings.width)
                width = settings.width;
            if (settings.height)
                height = settings.height;
        });
        this.canvas.width = width;
        this.canvas.height = height;
        const context = this.canvas.getContext("2d");
        if (!context)
            return;
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.drawImage(video, 0, 0, width, height);
        canvasToBlob(this.canvas).then((blob) => params.next(blobToUpploadFile(blob, `camera-photo-${Math.random().toString(36).slice(2)}.png`, "image/png", new Date())));
    }
    startStream(params, constraints) {
        this.stop();
        window.navigator.mediaDevices
            .getUserMedia(constraints)
            .then((mediaStream) => {
            this.stream = mediaStream;
            const video = params.uppload.container.querySelector("video.camera-stream");
            if (video) {
                video.srcObject = mediaStream;
                safeListen(video, "loadedmetadata", () => video.play());
                fitImageToContainer(params, video);
            }
        })
            .catch(() => {
            this.gotError = true;
        })
            .then(() => {
            this.waiting = false;
            this.update(params);
        });
    }
}
//# sourceMappingURL=camera.js.map
