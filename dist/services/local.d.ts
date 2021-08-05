import { UpploadService } from "../service";
import { IHandlersParams, IServiceTemplateParams } from "../helpers/interfaces";
export default class Local extends UpploadService {
    name: string;
    icon: string;
    color: string;
    mimeTypes: string[];
    maxFileSize: number;
    constructor({ mimeTypes, maxFileSize, }?: {
        mimeTypes?: string[];
        maxFileSize?: number;
    });
    template: (params: IServiceTemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
    getFile(params: IHandlersParams, event: Event): Promise<string> | undefined;
    fileSelect(params: IHandlersParams, event: Event): void;
    private dragStop;
    dragHandler(params: IHandlersParams, event: Event): void;
    dropHandler(params: IHandlersParams, event: DragEvent): void;
}
