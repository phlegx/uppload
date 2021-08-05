import { UpploadService } from "./service";
import { UpploadEffect } from "./effect";
import { FocusTrap } from "focus-trap";
import mitt from "mitt";
import { IUploader, IMultipleUploader, IUppload, IUpploadSettings, ILanguage, IUpploadFile, IPluginUpdateFunction } from "./helpers/interfaces";
/**
 * Uppload image uploading widget
 */
export declare class Uppload implements IUppload {
    services: UpploadService[];
    effects: UpploadEffect[];
    isOpen: boolean;
    error?: string;
    activeService: string;
    activeEffect: string;
    settings: IUpploadSettings;
    container: HTMLDivElement;
    focusTrap: FocusTrap;
    file: IUpploadFile;
    lang: ILanguage;
    uploader?: IUploader | IMultipleUploader;
    emitter: mitt.Emitter;
    uploadProgress: number;
    inline: boolean;
    transitionDuration: number;
    /**
     * Create a new Uppload instance
     * @param settings - Uppload instance settings
     */
    constructor(settings?: IUpploadSettings);
    /**
     * Update widget settings such as i18n
     * @param settings - Uppload settings object
     */
    updateSettings(settings: IUpploadSettings): void;
    private ready;
    /**
     * Bind the image URL value to DOM elements
     * @param value - URL of the image
     */
    private bind;
    /**
     * Use an uploader, service, or effect in your package
     * @param plugin - A single uploader, service, or effect or an array of them
     */
    use(plugin: UpploadService | UpploadEffect | UpploadService[] | UpploadEffect[]): void;
    /**
     * Remove a plugin (effect or serve) from this instance
     * @param slug - Slug of the plugin to be removed
     */
    remove(slug: string): void;
    /**
     * Update the plugins for this instance
     * @param pluginUpdateFunction - Function to update this instance's plugins
     */
    updatePlugins(pluginUpdateFunction: IPluginUpdateFunction): void;
    /**
     * Install a new uploader, service, or effect to this instance
     * @param plugin - A single uploader, service, or effect
     */
    private install;
    /**
     * Returns whether the modal is currently open
     */
    modalOpen(): boolean;
    /**
     * Open the Uppload widget
     */
    open(): void;
    /**
     * Close the Uppload widget
     */
    close(): void;
    /**
     * Toggles the Uppload widget
     */
    toggle(): void;
    /**
     * Re-render the widget
     */
    private update;
    /**
     * Returns the HTML template for the services navbar
     * @param sidebar - Whether this is an input radio (for sidebar) or buttons (for home)
     */
    private getNavbar;
    /**
     * Returns the HTML template for the effects navbar
     */
    private getEffectsNavbar;
    /**
     * Renders the main container for the widget
     */
    private renderContainer;
    /**
     * Render the content inside the widget container
     */
    private render;
    /**
     * Render the currently active service
     */
    private renderActiveService;
    /**
     * Render the currently active effect
     */
    private renderActiveEffect;
    /**
     * Uploads multiple files to the server
     * @param file
     * @returns JSON response from server
     */
    private uploadMultiple;
    hideHelp(): void;
    /**
     * Show the help article for this plugin in a frame
     * @param url - URL of help webpage
     */
    showHelp(url: string): void;
    /**
     * Updates the file and goes to the active effect
     * @param file - The currently active file Blob
     */
    private next;
    compress(file: Blob): Promise<Blob>;
    /**
     * Upload a file to the server
     * @param file - A Blob object containing the file to upload
     * @returns The file URL
     */
    upload(file: File | Blob): Promise<string>;
    /**
     * Gracefully display an error message
     * @param error - Error to display
     */
    private handle;
    /**
     * Adds event handlers for the widget
     */
    private handlers;
    /**
     * Stops any actions being done by the currently active service
     * For example, if your webcame is being accessed, kill that process
     */
    private stopCurrentService;
    /**
     * Navigate to an Uppload service page
     * @param service - Slug name of service (e.g., instagram)
     */
    navigate(service: string): void;
    /**
     * Add an event listener
     * @param type - Type of event listener (e.g., open)
     * @param handler - Event handler function
     */
    on(type: string, handler: (event?: any) => void): void;
    /**
     * Remove an event listener
     * @param type - Type of event listener (e.g., open)
     * @param handler - Event handler function
     */
    off(type: string, handler: (event?: any) => void): void;
    /**
     * Updates the upload progress
     * @param progressPercent Current progress in percent
     */
    private updateProgress;
}
