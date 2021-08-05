export class UpploadService {
    constructor() {
        this.type = "service";
        this.name = "";
        this.invisible = false;
        this.noRecolor = false;
        this.icon = "";
        this.color = "#333";
        this.template = () => "";
        this.handlers = () => { };
        this.stop = () => { };
        this.supports = () => true;
    }
}
//# sourceMappingURL=service.js.map