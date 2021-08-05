/**
 * Make an HTTP request with the Fetch API and cache results
 * @param input API endpoint
 * @param settings HTTP Fetch configuration
 */
export declare function cachedFetch<T>(input: RequestInfo, settings?: RequestInit): Promise<T>;
/**
 * Get a file Blob from an image URL
 * @param url - URL of an image
 */
export declare const imageUrlToBlob: (url: string) => Promise<Blob>;
