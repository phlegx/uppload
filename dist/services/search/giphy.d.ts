import { SearchBaseClass } from "../../helpers/search";
export interface GIPHYResult {
    id: string;
    title: string;
    url: string;
    images: {
        downsized_large: {
            url: string;
        };
        preview_gif: {
            url: string;
        };
    };
    user?: {
        avatar_url: string;
        display_name: string;
        profile_url: string;
    };
}
export default class GIPHY extends SearchBaseClass<GIPHYResult> {
    constructor(apiKey: string);
}
