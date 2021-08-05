import UpploadFilterBaseClass from "../../helpers/filter";
export default class Brightness extends UpploadFilterBaseClass {
    constructor() {
        super(...arguments);
        this.name = "brightness";
        this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M128 0l37 37h54v54l37 37-37 37v54h-54l-37 37-37-37H37v-54L0 128l37-37V37h54l37-37zm0 53a75 75 0 100 150 75 75 0 000-150zm0 21a54 54 0 110 108 54 54 0 010-108z"/></svg>`;
        this.cssFilter = "brightness";
        this.unit = "%";
        this.value = 100;
        this.max = 200;
    }
}
//# sourceMappingURL=brightness.js.map