import UpploadFilterBaseClass from "../../helpers/filter";
export default class Grayscale extends UpploadFilterBaseClass {
    name: string;
    icon: string;
    cssFilter: string;
    unit: string;
    value: number;
    max: number;
}
