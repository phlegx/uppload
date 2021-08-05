import { UpploadEffect } from "../../effect";
import { IHandlersParams, ITemplateParams, IUpploadFile } from "../../helpers/interfaces";
export default class Rotate extends UpploadEffect {
    name: string;
    icon: string;
    value: number;
    max: number;
    unit: string;
    originalFile: IUpploadFile;
    template: ({ file, translate }: ITemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
}
