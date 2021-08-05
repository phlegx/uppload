import { IHandlersParams, IServiceTemplateParams } from "./helpers/interfaces";
export declare class UpploadService {
    type: string;
    name: string;
    invisible: boolean;
    noRecolor: boolean;
    icon: string;
    color: string;
    template: (params: IServiceTemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
    stop: () => void;
    supports: () => boolean;
}
