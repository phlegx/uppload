import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class ArtStation extends MicrolinkBaseClass {
    constructor() {
        super(...arguments);
        this.name = "artstation";
        this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M158 189l30 51H45c-10 0-19-5-23-14L0 189h158zM100 15h45c10 0 18 5 23 13v1l84 146a26 26 0 01-1 29v1l-21 35L100 15h45zM79 51l58 101H21L79 51z" fill="#000" fill-rule="evenodd"/></svg>`;
        this.color = "#3ea2cf";
        this.exampleURL = "https://www.artstation.com/artwork/VdGOkZ";
        this.validator = (input) => /(https?:\/\/(.+?\.)?artstation\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
    }
}
//# sourceMappingURL=artstation.js.map