import { UpploadEffect } from "../../effect";
import { fitImageToContainer, safeListen, canvasToBlob, } from "../../helpers/elements";
export default class Flip extends UpploadEffect {
    constructor() {
        super(...arguments);
        this.name = "flip";
        this.originalfileURL = "";
        this.originalFile = { blob: new Blob() };
        this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M153 0v256h103L153 0zM0 256h103V0L0 256z" fill="#000" fill-rule="nonzero"/></svg>`;
        this.canvas = document.createElement("canvas");
        this.template = ({ file, translate }) => {
            const image = URL.createObjectURL(file.blob);
            this.originalfileURL = image;
            this.originalFile = file;
            return `
      <div class="uppload-flip">
        <img style="width: 20px" alt="" src="${image}">
      </div>
      <div class="settings">
        <button class="flip-btn-horizontal">${translate("effects.flip.buttons.horizontal")}</button>
        <button class="flip-btn-vertical">${translate("effects.flip.buttons.vertical")}</button>
      </div>
    `;
        };
        this.handlers = (params) => {
            const img = params.uppload.container.querySelector(".uppload-flip img");
            if (img) {
                fitImageToContainer(params, img).then(() => {
                    const horizontal = params.uppload.container.querySelector(".settings button.flip-btn-horizontal");
                    if (horizontal)
                        safeListen(horizontal, "click", this.update.bind(this, params, true, false));
                    const vertical = params.uppload.container.querySelector(".settings button.flip-btn-vertical");
                    if (vertical)
                        safeListen(vertical, "click", this.update.bind(this, params, false, true));
                });
            }
        };
    }
    imageToCanvasBlob(params, flipH = false, flipV = false) {
        return new Promise((resolve) => {
            params.uppload.emitter.emit("processing");
            const scaleH = flipH ? -1 : 1;
            const scaleV = flipV ? -1 : 1;
            this.canvas = document.createElement("canvas");
            const image = document.createElement("img");
            image.src = this.originalfileURL;
            image.onload = () => {
                this.canvas.width = image.width;
                this.canvas.height = image.height;
                const posX = flipH ? image.width * -1 : 0;
                const posY = flipV ? image.height * -1 : 0;
                const context = this.canvas.getContext("2d");
                if (!context)
                    return;
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                context.scale(scaleH, scaleV);
                context.drawImage(image, posX, posY);
                canvasToBlob(this.canvas).then((blob) => {
                    const image = URL.createObjectURL(blob);
                    this.originalfileURL = image;
                    params.uppload.emitter.emit("process");
                    return resolve(blob);
                });
            };
        });
    }
    update(params, x, y) {
        const img = params.uppload.container.querySelector(".uppload-flip img");
        if (!img)
            return;
        this.imageToCanvasBlob(params, x, y).then((blob) => {
            if (!blob)
                return;
            let file = this.originalFile;
            file.blob = blob;
            params.next(file);
            const image = URL.createObjectURL(blob);
            img.setAttribute("src", image);
        });
    }
}
//# sourceMappingURL=index.js.map