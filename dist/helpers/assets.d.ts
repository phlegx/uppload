import { UpploadService } from "../service";
import { UpploadEffect } from "../effect";
/**
 * Colors an SVG icon with the brand color for a service or effect
 * @param svg - SVG template string
 * @param service - Uppload service object
 */
export declare const colorSVG: (svg: string, service: UpploadService | UpploadEffect) => string;
