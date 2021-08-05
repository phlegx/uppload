/**
 * Convert a blob to a native File
 * @param blob - Blob to convert to file
 * @param fileName - Name of the file
 * @param lastModified - Date modified
 */
const safeBlobToFile = (blob, fileName, lastModified) => {
    try {
        return new File([blob], fileName || "file_name", {
            lastModified: (lastModified || new Date()).getTime(),
            type: blob.type,
        });
    }
    catch (error) {
        return blob;
    }
};
export const blobToUpploadFile = (blob, name, type, lastModified) => {
    const result = {
        name,
        blob,
        lastModified,
        type,
    };
    return result;
};
export const safeUpploadFileToFile = (file) => {
    const blob = file.blob;
    file.lastModified = file.lastModified || new Date();
    return safeBlobToFile(blob, file.name, file.lastModified);
};
//# sourceMappingURL=files.js.map