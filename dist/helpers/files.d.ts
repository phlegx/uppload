import { IUpploadFile } from "./interfaces";
export declare const blobToUpploadFile: (blob: Blob, name?: string | undefined, type?: string | undefined, lastModified?: Date | undefined) => IUpploadFile;
export declare const safeUpploadFileToFile: (file: IUpploadFile) => Blob;
