import { UpploadService } from "../service";
import { IHandlersParams, IServiceTemplateParams } from "../helpers/interfaces";
export declare class SearchBaseClass<ImageResult = any> extends UpploadService {
    apiKey: string;
    results: ImageResult[];
    loading: boolean;
    poweredByUrl: string;
    popularEndpoint: string;
    searchEndpoint: (apiKey: string, query: string) => string;
    getButton: (image: ImageResult) => string;
    getPopularResults: (response: any) => ImageResult[];
    getSearchResults: (response: any) => ImageResult[];
    noRecolor: boolean;
    fetchSettings?: RequestInit;
    constructor({ apiKey, name, icon, color, poweredByUrl, popularEndpoint, searchEndpoint, getButton, getPopularResults, getSearchResults, noRecolor, fetchSettings, }: {
        name: string;
        icon: string;
        color: string;
        apiKey: string;
        poweredByUrl: string;
        popularEndpoint: (apiKey: string) => string;
        searchEndpoint: (apiKey: string, query: string) => string;
        getButton: (image: ImageResult) => string;
        getPopularResults: (response: any) => ImageResult[];
        getSearchResults: (response: any) => ImageResult[];
        noRecolor?: boolean;
        fetchSettings?: (apiKey: string) => RequestInit;
    });
    updateImages(params: IHandlersParams): void;
    update(params: IHandlersParams): void;
    template: ({ translate }: IServiceTemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
}
