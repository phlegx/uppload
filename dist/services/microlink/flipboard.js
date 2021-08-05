import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class Flipboard extends MicrolinkBaseClass {
    constructor() {
        super(...arguments);
        this.name = "flipboard";
        this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path opacity=".8" d="M85 85h85v85H85z"/><path opacity=".9" d="M85 0h171v85H85z"/><path d="M0 0h85v256H0z"/></g></svg>`;
        this.color = "#e12828";
        this.exampleURL = "https://flipboard.com/@bbcfuture/how-climate-change-could-kill-the-red-apple/f-c8d499b4ca%2Fbbc.com";
        this.validator = (input) => /(https?:\/\/(.+?\.)?(flipboard|flip)\.(com|it)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
    }
}
//# sourceMappingURL=flipboard.js.map