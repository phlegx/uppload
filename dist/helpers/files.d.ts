import { IUpploadFile } from './interfaces';
export declare const blobToUpploadFile: (blob: Blob, name?: string, type?: string, lastModified?: Date) => IUpploadFile;
export declare const safeUpploadFileToFile: (file: IUpploadFile) => Blob;
