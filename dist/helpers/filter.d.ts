import { UpploadEffect } from "../effect";
import { IHandlersParams, ITemplateParams, IUpploadFile } from "./interfaces";
export default class UpploadFilterBaseClass extends UpploadEffect {
    canvas: HTMLCanvasElement;
    originalfileURL: string;
    originalFile: IUpploadFile;
    cssFilter: string;
    max: number;
    unit: string;
    value: number;
    supports: () => boolean;
    template: ({ file, translate }: ITemplateParams) => string;
    imageToCanvasBlob(params: IHandlersParams, filters: string): Promise<Blob | null>;
    handlers: (params: IHandlersParams) => void;
    update(params: IHandlersParams): void;
}
