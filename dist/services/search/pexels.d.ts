import { SearchBaseClass } from "../../helpers/search";
export interface PexelsResult {
    url: string;
    photographer: string;
    src: {
        original: string;
        large2x: string;
        tiny: string;
    };
}
export default class Pexels extends SearchBaseClass<PexelsResult> {
    constructor(apiKey: string);
}
