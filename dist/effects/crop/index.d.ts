import { UpploadEffect } from '../../effect';
import { default as Cropper } from 'cropperjs';
import { IHandlersParams, ITemplateParams, IUpploadFile } from '../../helpers/interfaces';
type CropNum = 1 | 2 | 3 | undefined;
interface CropEffectOptions extends Partial<Cropper.Options> {
    aspectRatio?: number;
    aspectRatioOptions?: {
        [index: string]: number;
    };
    hideAspectRatioSettings?: boolean;
    autoCropArea?: CropNum;
    viewMode?: CropNum;
}
export default class Crop extends UpploadEffect {
    name: string;
    icon: string;
    aspectRatio: number;
    hideAspectRatioSettings: boolean;
    aspectRatioOptions: {
        [index: string]: number;
    };
    autoCropArea: CropNum;
    viewMode: CropNum;
    originalFile: IUpploadFile;
    cropperOptions: Partial<Cropper.Options>;
    constructor({ aspectRatio, aspectRatioOptions, hideAspectRatioSettings, autoCropArea, viewMode, ...additionalOptions }?: CropEffectOptions);
    template: ({ file, translate }: ITemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
}
export {};
