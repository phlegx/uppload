import { UpploadService } from "../service";
import { IHandlersParams, IServiceTemplateParams } from "./interfaces";
export declare class MicrolinkBaseClass extends UpploadService {
    loading: boolean;
    exampleURL: string;
    validator: (value: string) => boolean;
    template: ({ translate }: IServiceTemplateParams) => string;
    update(params: IHandlersParams): void;
    handlers: (params: IHandlersParams) => void;
}
