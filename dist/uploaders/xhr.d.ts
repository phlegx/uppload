import { IUploader } from "../helpers/interfaces";
export declare const xhrUploader: ({ endpoint, fileKeyName, method, responseKey, responseFunction, settingsFunction, }: {
    endpoint: string;
    fileKeyName?: string | undefined;
    method?: string | undefined;
    responseKey?: string | undefined;
    responseFunction?: ((responseText: string) => string) | undefined;
    settingsFunction?: ((xmlHttp: XMLHttpRequest) => void | XMLHttpRequest) | undefined;
}) => IUploader;
export declare const fetchUploader: ({ endpoint, settingsFunction, method, fileKeyName, responseKey, responseFunction, }: {
    endpoint: RequestInfo;
    settingsFunction?: ((file: Blob) => RequestInit) | undefined;
    method?: string | undefined;
    fileKeyName?: string | undefined;
    responseKey?: string | undefined;
    responseFunction?: ((responseText: string) => string) | undefined;
}) => IUploader;
