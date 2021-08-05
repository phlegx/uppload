import { MicrolinkBaseClass } from "../../helpers/microlink";
export default class Flickr extends MicrolinkBaseClass {
    name: string;
    icon: string;
    noRecolor: boolean;
    color: string;
    exampleURL: string;
    validator: (input: string) => boolean;
}
