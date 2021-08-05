/**
 * Colors an SVG icon with the brand color for a service or effect
 * @param svg - SVG template string
 * @param service - Uppload service object
 */
export const colorSVG = (svg, service) => (service.noRecolor ? svg : svg.replace(/#000/g, service.color || "#000"));
//# sourceMappingURL=assets.js.map