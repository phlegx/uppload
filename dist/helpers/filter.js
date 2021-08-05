import { UpploadEffect } from "../effect";
import { safeListen, fitImageToContainer, canvasToBlob, } from "../helpers/elements";
export default class UpploadFilterBaseClass extends UpploadEffect {
    constructor() {
        super(...arguments);
        this.canvas = document.createElement("canvas");
        this.originalfileURL = "";
        this.originalFile = { blob: new Blob() };
        this.cssFilter = "";
        this.max = 10;
        this.unit = "px";
        this.value = 0;
        this.supports = () => {
            var _a;
            return !!(this.canvas.getContext &&
                this.canvas.getContext("2d") &&
                typeof ((_a = this.canvas.getContext("2d")) === null || _a === void 0 ? void 0 : _a.filter) === "string");
        };
        this.template = ({ file, translate }) => {
            const image = URL.createObjectURL(file.blob);
            this.originalfileURL = image;
            this.originalFile = file;
            return `
      <div class="uppload-hue-image">
        <img style="width: 20px" alt="" src="${image}">
      </div>
      <div class="settings">
        <input type="range" value="${this.value}" min="0" max="${this.max}">
        <span class="value"><span>0</span>${translate(`units.${this.unit}`) || this.unit}</span>
      </div>
    `;
        };
        this.handlers = (params) => {
            const hueElement = params.uppload.container.querySelector(".uppload-hue-image img");
            if (hueElement) {
                fitImageToContainer(params, hueElement).then(() => {
                    const range = params.uppload.container.querySelector(".settings input[type='range']");
                    if (range)
                        safeListen(range, "change", this.update.bind(this, params));
                });
            }
        };
    }
    imageToCanvasBlob(params, filters) {
        params.uppload.emitter.emit("processing");
        return new Promise((resolve) => {
            this.canvas = document.createElement("canvas");
            const image = document.createElement("img");
            image.src = this.originalfileURL;
            image.onload = () => {
                this.canvas.width = image.width;
                this.canvas.height = image.height;
                const context = this.canvas.getContext("2d");
                if (!context)
                    return;
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                context.filter = filters;
                context.drawImage(image, 0, 0);
                canvasToBlob(this.canvas).then((blob) => {
                    params.uppload.emitter.emit("process");
                    return resolve(blob);
                });
            };
        });
    }
    update(params) {
        let value = 0;
        const range = params.uppload.container.querySelector(".settings input[type='range']");
        if (range)
            value = parseInt(range.value);
        const displayer = params.uppload.container.querySelector(".settings .value span");
        if (displayer)
            displayer.innerHTML = value.toString();
        const hueElement = params.uppload.container.querySelector(".uppload-hue-image img");
        if (!hueElement)
            return;
        this.imageToCanvasBlob(params, `${this.cssFilter}(${range.value}${this.unit})`).then((blob) => {
            if (!blob)
                return;
            this.originalFile.blob = blob;
            params.next(this.originalFile);
            const image = URL.createObjectURL(blob);
            hueElement.setAttribute("src", image);
        });
    }
}
//# sourceMappingURL=filter.js.map