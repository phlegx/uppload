import { SearchBaseClass } from "../../helpers/search";
export interface UnsplashResult {
    id: string;
    alt_description: string;
    description: string;
    urls: {
        regular: string;
        thumb: string;
    };
    user: {
        name: string;
        profile_image: {
            small: string;
        };
    };
}
export default class Unsplash extends SearchBaseClass<UnsplashResult> {
    constructor(apiKey: string);
}
