import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class DeviantArt extends MicrolinkBaseClass {
    name: string;
    icon: string;
    color: string;
    exampleURL: string;
    validator: (input: string) => boolean;
}
