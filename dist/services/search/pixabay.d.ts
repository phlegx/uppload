import { SearchBaseClass } from "../../helpers/search";
export interface PixabayResult {
    id: number;
    largeImageURL: string;
    previewURL: string;
    user: string;
    userImageURL: string;
    pageURL: string;
    tags: string;
}
export default class Pixabay extends SearchBaseClass<PixabayResult> {
    constructor(apiKey: string);
}
