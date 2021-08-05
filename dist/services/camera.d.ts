import { UpploadService } from "../service";
import { IHandlersParams, IServiceTemplateParams } from "../helpers/interfaces";
export default class Camera extends UpploadService {
    name: string;
    icon: string;
    color: string;
    stream?: MediaStream;
    canvas: HTMLCanvasElement;
    gotError: boolean;
    waiting: boolean;
    frontCamera: boolean;
    supports: () => boolean;
    template: ({ translate }: IServiceTemplateParams) => string;
    stop: () => void;
    update(params: IHandlersParams): void;
    handlers: (params: IHandlersParams) => void;
    switchCamera(params: IHandlersParams): void;
    clickPhoto(params: IHandlersParams): void;
    startStream(params: IHandlersParams, constraints: MediaStreamConstraints): void;
}
