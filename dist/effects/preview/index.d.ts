import { UpploadEffect } from "../../effect";
import { IHandlersParams, ITemplateParams } from "../../helpers/interfaces";
export default class Preview extends UpploadEffect {
    name: string;
    icon: string;
    template: ({ file }: ITemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
}
