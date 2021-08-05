export declare const flattenObject: (ob: any) => any;
/**
 *
 * @param translations
 */
export declare const setI18N: (translations: any) => void;
/**
 * Get a translation from i18n setting
 * @param key - Translation key
 * @param params - Single term or array of variables
 */
export declare const translate: (key: string, params?: string | string[] | undefined) => string;
