import { UpploadEffect } from '../../effect';
import { IHandlersParams, ITemplateParams } from '../../helpers/interfaces';
export default class Preview extends UpploadEffect {
    name: string;
    icon: string;
    template: ({ file, uppload }: ITemplateParams) => string;
    handlers: (params: IHandlersParams) => void;
}
