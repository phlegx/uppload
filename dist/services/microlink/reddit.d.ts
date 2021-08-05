import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class Reddit extends MicrolinkBaseClass {
    name: string;
    icon: string;
    color: string;
    exampleURL: string;
    validator: (input: string) => boolean;
}
