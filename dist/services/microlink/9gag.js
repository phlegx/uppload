import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class NineGag extends MicrolinkBaseClass {
    constructor() {
        super(...arguments);
        this.name = "ninegag";
        this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M16 64L128 0l111 64v128l-111 64-112-64 44-26 68 39c22-13 45-25 67-39v-51l-67 39L16 90V64zm66 13l46 26 45-26-45-26-46 26z" fill="#000" fill-rule="nonzero"/></svg>`;
        this.color = "#000";
        this.exampleURL = "https://9gag.com/gag/awoBXb8";
        this.validator = (input) => /(https?:\/\/(.+?\.)?9gag\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
    }
}
//# sourceMappingURL=9gag.js.map