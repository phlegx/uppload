import { IHandlersParams, ITemplateParams } from "./helpers/interfaces";
export declare class UpploadEffect {
    type: string;
    name: string;
    invisible: boolean;
    noRecolor: boolean;
    color: string;
    icon: string;
    template: (props: ITemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
    supports: () => boolean;
}
