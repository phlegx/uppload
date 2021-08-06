import { Uppload, UpploadEffect, UpploadService } from "../";
export declare type IElements = string | string[] | Element | Element[];
export declare type ITranslator = (key: string, params?: string | string[]) => string;
export interface IUppload {
    services: UpploadService[];
    effects: UpploadEffect[];
    isOpen: boolean;
    error?: string;
    activeService: string;
    activeEffect: string;
    settings: IUpploadSettings;
    container: HTMLDivElement;
}
export interface IUpploadSettings {
    value?: string;
    bind?: IElements;
    call?: IElements;
    defaultService?: string;
    lang?: ILanguage;
    uploader?: IUploader;
    inline?: boolean;
    customClass?: string;
    multiple?: boolean;
    compression?: number;
    compressionToMime?: string;
    compressionFromMimes?: string[];
    maxWidth?: number;
    maxHeight?: number;
    maxSize?: [number, number];
    compressor?: (file: Blob) => Promise<Blob>;
    transitionDuration?: number;
    disableModalClickClose?: boolean;
    disableHelp?: boolean;
}
export interface IHandlersParams {
    upload: (file: Blob) => Promise<string>;
    uploadMultiple: (file: Blob[]) => Promise<string>;
    next: (file: IUpploadFile) => void;
    showHelp: (url: string) => void;
    handle: (error: any) => void;
    uppload: Uppload;
    translate: ITranslator;
}
export interface ITemplateParams {
    file: IUpploadFile;
    translate: ITranslator;
}
export interface IServiceTemplateParams {
    uppload: Uppload;
    translate: ITranslator;
}
export declare type IUploader = (file: Blob, updateProgress?: (progress: number) => void) => Promise<string>;
export declare type IMultipleUploader = (file: Blob[], updateProgress?: (progress: number) => void) => Promise<string>;
export declare type ILanguageHelper = (text: string) => string;
export interface ILanguage {
    [index: string]: string | ILanguage | ILanguageHelper | any;
}
export interface IUpploadFile {
    blob: Blob;
    name?: string;
    type?: string;
    size?: number;
    lastModified?: Date;
}
export declare type IUpploadPlugins = UpploadService[] | UpploadEffect[] | (UpploadService | UpploadEffect)[];
export declare type IPluginUpdateFunction = (plugins: IUpploadPlugins) => IUpploadPlugins;
