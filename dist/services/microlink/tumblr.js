import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class Tumblr extends MicrolinkBaseClass {
    constructor() {
        super(...arguments);
        this.name = "tumblr";
        this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M164 209c-21 0-25-15-26-25v-76h49V65h-48V0h-39l-2 2c-2 20-11 55-51 69v37h30v80c0 28 18 69 75 68 19 0 41-8 45-15l-12-37c-5 3-14 5-21 5z" fill="#000" fill-rule="evenodd"/></svg>`;
        this.color = "#34526f";
        this.exampleURL = "https://germanpostwarmodern.tumblr.com/post/186653088149/cubicus-building-of-twente-university-1969-73-in";
        this.validator = (input) => /(https?:\/\/(.+?\.)?tumblr\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
    }
}
//# sourceMappingURL=tumblr.js.map