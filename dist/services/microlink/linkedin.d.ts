import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class LinkedIn extends MicrolinkBaseClass {
    name: string;
    icon: string;
    color: string;
    exampleURL: string;
    validator: (input: string) => boolean;
}
