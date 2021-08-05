import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class Flickr extends MicrolinkBaseClass {
    constructor() {
        super(...arguments);
        this.name = "flickr";
        this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill-rule="nonzero" fill="none"><path d="M117 128a59 59 0 11-118 0 59 59 0 01118 0z" fill="#0063DC"/><path d="M257 128a59 59 0 11-118 0 59 59 0 01118 0z" fill="#FF0084"/></g></svg>`;
        this.noRecolor = true;
        this.color = "#ff0084";
        this.exampleURL = "https://www.flickr.com/photos/renewolf/26111951000/";
        this.validator = (input) => /(https?:\/\/(.+?\.)?(flickr|flic)\.(com|kr)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
    }
}
//# sourceMappingURL=flickr.js.map