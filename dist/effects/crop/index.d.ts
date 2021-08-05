import { UpploadEffect } from "../../effect";
import { IHandlersParams, ITemplateParams, IUpploadFile } from "../../helpers/interfaces";
declare type CropNum = 1 | 2 | 3 | undefined;
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
    constructor({ aspectRatio, aspectRatioOptions, hideAspectRatioSettings, autoCropArea, viewMode, }?: {
        aspectRatio?: number;
        aspectRatioOptions?: {
            [index: string]: number;
        };
        hideAspectRatioSettings?: boolean;
        autoCropArea?: CropNum;
        viewMode?: CropNum;
    });
    template: ({ file, translate }: ITemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
}
export {};
