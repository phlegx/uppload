import UpploadFilterBaseClass from "../../helpers/filter";
export default class Brightness extends UpploadFilterBaseClass {
    name: string;
    icon: string;
    cssFilter: string;
    unit: string;
    value: number;
    max: number;
}
