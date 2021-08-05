import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class Facebook extends MicrolinkBaseClass {
    name: string;
    icon: string;
    color: string;
    exampleURL: string;
    validator: (input: string) => boolean;
}
