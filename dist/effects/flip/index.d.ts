import { UpploadEffect } from "../../effect";
import { IHandlersParams, ITemplateParams, IUpploadFile } from "../../helpers/interfaces";
export default class Flip extends UpploadEffect {
    name: string;
    originalfileURL: string;
    originalFile: IUpploadFile;
    icon: string;
    canvas: HTMLCanvasElement;
    template: ({ file, translate }: ITemplateParams) => string;
    imageToCanvasBlob(params: IHandlersParams, flipH?: boolean, flipV?: boolean): Promise<Blob | null>;
    update(params: IHandlersParams, x: boolean, y: boolean): void;
    handlers: (params: IHandlersParams) => void;
}
