import { IHandlersParams, IUpploadSettings } from "./interfaces";
/**
 * Gets all the DOM elements matching a selector
 * @param query - CSS selector string, HTML element, or an array of them
 */
export declare const getElements: (query?: string | string[] | Element | Element[] | undefined) => Element[];
/**
 * Safely adds an event listener, preventing duplicates
 * @param element - HTML element to add event listener to
 * @param type - Type of event listener to add
 * @param fn - Callback function to call on event
 */
export declare const safeListen: (element: Element, type: string, fn: EventListenerOrEventListenerObject) => void;
/**
 *
 * @param image - An HTML <img> element in the DOM
 */
export declare const fitImageToContainer: (params: IHandlersParams, image: HTMLImageElement | HTMLVideoElement) => Promise<undefined>;
/**
 * Compress an image using lossy canvas compression
 * @param file - Image file to compress
 * @param settings - Uppload settings defined in the constructor
 */
export declare const compressImage: (file: Blob, settings: IUpploadSettings) => Promise<Blob>;
/**
 * Export an HTML canvas to Blob image
 * @param canvas - Canvas element to export
 * @param type - MIME type of image
 * @param quality - Compression ratio (0 to 1)
 */
export declare const canvasToBlob: (canvas: HTMLCanvasElement, type?: string | undefined, quality?: number | undefined) => Promise<Blob>;
