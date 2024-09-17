import { UpploadService } from "./service";
import { setI18N, translate } from "./helpers/i18n";
import { getElements, safeListen, safeUnlisten, compressImage } from "./helpers/elements";
import { colorSVG } from "./helpers/assets";
import createFocusTrap from "focus-trap";
import mitt from "mitt";
import { safeUpploadFileToFile, blobToUpploadFile } from "./helpers/files";
class DefaultService extends UpploadService {
    constructor() {
        super(...arguments);
        this.name = "default";
        this.invisible = true;
        this.template = () => `<p>${translate("services.default.heading")}</p>`;
    }
}
class UploadingService extends UpploadService {
    constructor() {
        super(...arguments);
        this.name = "uploading";
        this.invisible = true;
        this.template = () => `<div class="uppload-loader">
  <div></div>
    <p class="uppload-loader-text">${translate("uploading")}<span class="progress"></span></p>
  </div>`;
    }
}
/**
 * Uppload image uploading widget
 */
export class Uppload {
    /**
     * Create a new Uppload instance
     * @param settings - Uppload instance settings
     */
    constructor(settings) {
        this.id = +new Date()
        this.services = [new DefaultService(), new UploadingService()];
        this.effects = [];
        this.isOpen = false;
        this.activeService = "default";
        this.activeEffect = "";
        this.file = { blob: new Blob() };
        this.lang = {};
        this.emitter = mitt();
        this.uploadProgress = 0;
        this.inline = false;
        this.transitionDuration = 300;
        this.settings = {};
        this.updateSettings(settings || {});
        const div = document.createElement("div");
        div.setAttribute("id", `uppload-${this.id}`);
        this.renderContainer();
        div.classList.add("uppload-container");
        const wrapper = this.wrapper ? document.querySelector(this.wrapper) : document.body;
        if (wrapper) {
            wrapper.appendChild(div);
        }
        this.container = div;
        this.focusTrap = createFocusTrap(this.container, {
            initialFocus: () => this.container.querySelector("button"),
        });
        requestAnimationFrame(() => this.update());
        /**
         * Loader during file processing in effects
         * https://github.com/elninotech/uppload/issues/111
         */
        this.emitter.on("processing", () => {
            const loader = this.container.querySelector(".processing-loader");
            if (loader)
                loader.classList.add("visible");
        });
        this.emitter.on("process", () => {
            const loader = this.container.querySelector(".processing-loader");
            if (loader)
                loader.classList.remove("visible");
        });
    }
    /**
     * Update widget settings such as i18n
     * @param settings - Uppload settings object
     */
    updateSettings(settings) {
        this.settings = Object.assign(Object.assign({}, this.settings), settings);
        this.emitter.emit("settingsUpdated", settings);
        if (settings.id)
            this.id = settings.id;
        if (settings.wrapper)
            this.wrapper = settings.wrapper;
        if (settings.lang)
            setI18N(settings.lang);
        if (settings.defaultService)
            this.activeService = settings.defaultService;
        if (settings.lang)
            this.lang = settings.lang;
        if (settings.transitionDuration)
            this.transitionDuration = settings.transitionDuration;
        if (settings.uploader)
            this.uploader = settings.uploader;
        this.inline = !!settings.inline;
        this.renderContainer();
        this.update();
    }
    ready() {
        if (this.settings.value)
            this.bind(this.settings.value);
        this.renderContainer();
        this.emitter.emit("ready");
    }
    /**
     * Bind the image URL value to DOM elements
     * @param value - URL of the image
     */
    bind(value) {
        if (this.settings.bind) {
            const elements = getElements(this.settings.bind);
            elements.forEach((element) => {
                if (element.nodeName === "IMG") {
                    element.setAttribute("src", value);
                }
                else {
                    element.setAttribute("value", value);
                }
            });
            this.emitter.emit("bind");
        }
    }
    /**
     * Use an uploader, service, or effect in your package
     * @param plugin - A single uploader, service, or effect or an array of them
     */
    use(plugin) {
        if (Array.isArray(plugin)) {
            plugin.forEach((item) => this.install(item));
        }
        else {
            this.install(plugin);
        }
    }
    /**
     * Remove a plugin (effect or serve) from this instance
     * @param slug - Slug of the plugin to be removed
     */
    remove(slug) {
        this.services = this.services.filter((service) => service.name !== slug);
        this.effects = this.effects.filter((service) => service.name !== slug);
        this.update();
        this.emitter.emit("remove", slug);
    }
    /**
     * Update the plugins for this instance
     * @param pluginUpdateFunction - Function to update this instance's plugins
     */
    updatePlugins(pluginUpdateFunction) {
        const plugins = pluginUpdateFunction(this.services);
        const services = plugins.filter((plugin) => plugin.type === "service");
        const hasDefaultService = !!services.filter((service) => service.name === "default").length;
        const hasUploadingService = !!services.filter((service) => service.name === "uploading").length;
        if (!hasUploadingService)
            services.unshift(new UploadingService());
        if (!hasDefaultService)
            services.unshift(new DefaultService());
        this.services = services;
        this.effects = plugins.filter((plugin) => plugin.type === "effect");
        this.update();
    }
    /**
     * Install a new uploader, service, or effect to this instance
     * @param plugin - A single uploader, service, or effect
     */
    install(plugin) {
        // Check if the browser supports this plugin
        if (!plugin.supports())
            return;
        if (plugin.type === "service") {
            // Install this service if it isn't already installed
            const has = !!this.services.filter((service) => service.name === plugin.name).length;
            if (!has)
                this.services.push(plugin);
            this.ready();
        }
        else if (plugin.type === "effect") {
            const has = !!this.effects.filter((effect) => effect.name === plugin.name)
                .length;
            if (!has)
                this.effects.push(plugin);
            this.ready();
        }
    }
    /**
     * Returns whether the modal is currently open
     */
    modalOpen() {
        return this.isOpen;
    }
    /**
     * Open the Uppload widget
     */
    open() {
        if (this.isOpen)
            return;
        this.isOpen = true;
        this.file = { blob: new Blob() };
        this.activeService = "default";
        this.activeEffect = "";
        this.container.style.transition = `${this.transitionDuration}ms`;
        this.container.style.opacity = "0";
        this.update();
        const firstService = this.settings.defaultService;
        if (firstService)
            this.navigate(firstService);
        else if (this.services.length === 3)
            this.navigate(this.services[2].name);
        const serviceRadio = this.container.querySelector(`input[type=radio][value='${this.activeService}']`);
        if (serviceRadio) {
            serviceRadio.setAttribute("checked", "checked");
            serviceRadio.checked = true;
        }
        const escape = (e) => {
            if (e.key === "Escape" && this.isOpen) {
                this.close();
            }
        };
        safeUnlisten(document.body, "keyup", escape);
        safeListen(document.body, "keyup", escape);
        setTimeout(() => {
            this.container.style.opacity = "1";
        }, 1);
        this.emitter.emit("open");
    }
    /**
     * Close the Uppload widget
     */
    close() {
        if (!this.isOpen)
            return;
        this.stopCurrentService();
        this.isOpen = false;
        this.emitter.emit("close");
        this.container.style.opacity = "0";
        setTimeout(() => this.update(), this.transitionDuration);
    }
    /**
     * Toggles the Uppload widget
     */
    toggle() {
        if (this.modalOpen())
            this.close();
        else
            this.open();
    }
    /**
     * Re-render the widget
     */
    update() {
        if (!this.container)
            return;
        this.hideHelp();
        if (this.settings.customClass)
            this.container.classList.add(this.settings.customClass);
        if (this.inline)
            this.container.classList.add("uppload-inline");
        const content = this.container.querySelector(".uppload-active-container");
        if (content)
            content.innerHTML = this.render();
        const aside = this.container.querySelector("aside");
        if (aside && this.activeService !== "default" && !this.activeEffect)
            aside.style.display = "block";
        const footerEffectsNav = this.container.querySelector(".effects-nav");
        if (aside && footerEffectsNav && this.activeEffect) {
            footerEffectsNav.style.display = "";
            aside.style.display = "none";
        }
        else if (aside && footerEffectsNav && this.activeService === "default") {
            aside.style.display = "none";
            footerEffectsNav.style.display = "none";
        }
        else if (aside && footerEffectsNav) {
            aside.style.display = "";
            footerEffectsNav.style.display = "none";
        }
        const effectsContainer = this.container.querySelector(".uppload-effect");
        if (effectsContainer)
            effectsContainer.style.display = this.activeEffect ? "" : "none";
        window.requestAnimationFrame(() => this.handlers());
        if (!this.isOpen) {
            this.container.classList.remove("visible");
            this.focusTrap.deactivate();
        }
        else {
            this.container.classList.add("visible");
            this.focusTrap.activate();
        }
        const effectsNav = this.container.querySelector("footer.effects-nav .effects-tabs");
        if (effectsNav) {
            const parent = effectsNav.parentElement;
            if (parent) {
                let totalButtonsWidth = 0;
                const buttons = parent.querySelectorAll(".effects-continue");
                buttons.forEach((button) => {
                    const buttonSize = button.getBoundingClientRect();
                    totalButtonsWidth += buttonSize.width;
                });
                const size = parent.getBoundingClientRect();
                effectsNav.style.width = `${size.width - totalButtonsWidth}px`;
            }
        }
        const sideNavbar = this.container.querySelector("aside");
        if (sideNavbar && this.services.length === 3)
            sideNavbar.classList.add("uppload-services--single");
        const help = this.container.querySelector(".uppload-help");
        if (help) {
            help.classList.remove("visible");
            safeListen(help, "click", () => this.hideHelp());
        }
    }
    /**
     * Returns the HTML template for the services navbar
     * @param sidebar - Whether this is an input radio (for sidebar) or buttons (for home)
     */
    getNavbar(sidebar = false) {
        return `<${sidebar ? "nav" : "div"} class="uppload-services">
      ${this.services
            .filter((service) => !service.invisible)
            .map((service) => `<div data-uppload-service="${service.name}" class="uppload-service-name">
          ${sidebar
            ? `<input type="radio" id="uppload-service-radio-${service.name}-${this.id}" value="${service.name}" name="uppload-radio" ${service.name === this.activeService ? `checked="checked"` : ""}>`
            : ""}
          <${sidebar
            ? `label for="uppload-service-radio-${service.name}-${this.id}"`
            : "button"} data-uppload-service="${service.name}">
            ${service.icon.indexOf("http") === 0
            ? `<img class="service-icon" alt="" src="${service.icon}">`
            : colorSVG(service.icon, service)}
            <span>${this.lang.services &&
            this.lang.services[service.name] &&
            this.lang.services[service.name].title
            ? this.lang.services[service.name].title
            : service.name}</span>
          </${sidebar ? "label" : "button"}>
        </div>`)
            .join("")}
    </${sidebar ? "nav" : "div"}>`;
    }
    /**
     * Returns the HTML template for the effects navbar
     */
    getEffectsNavbar() {
        return `<div class="effects-continue">
    <button class="effects-continue--cancel">${translate("cancel")}</button>
  </div><div class="effects-tabs"><div class="effects-tabs-flow">
      ${this.effects
            .map((effect) => `
      <input type="radio" id="uppload-effect-radio-${effect.name}-${this.id}" value="${effect.name}" name="uppload-effect-radio">
        <label for="uppload-effect-radio-${effect.name}-${this.id}">
          ${effect.icon.indexOf("http") === 0
            ? `<img class="effect-icon" alt="" src="${effect.icon}">`
            : colorSVG(effect.icon, effect)}
          <span>${this.lang.effects &&
            this.lang.effects[effect.name] &&
            this.lang.effects[effect.name].title
            ? this.lang.effects[effect.name].title
            : effect.name}</span>
        </label>
      `)
            .join("")}
      </div></div><div class="effects-continue">
        <button class="effects-continue--upload">${translate("upload")}</button>
      </div>`;
    }
    /**
     * Renders the main container for the widget
     */
    renderContainer() {
        if (this.container)
            this.container.innerHTML = `
      <div class="uppload-modal">
        <div class="processing-loader"></div>
        <aside style="display: none">
          ${this.getNavbar(true)}
        </aside>
        <section>
          ${this.error ? `<div class="uppload-error">${this.error}</div>` : ""}
          <div class="uppload-active-container"></div>
          <footer style="display: none" class="effects-nav">${this.getEffectsNavbar()}</footer>
        </section>
        ${!this.settings.disableHelp ? `
        <div class="uppload-help-loading">
          <div class="uppload-loader">
            <div></div>
            <p class="uppload-loader-text">${translate("help.loading")}</p>
          </div>
        </div>
        <div class="uppload-help">
          <div><button><span>${translate("help.close")}</span><span aria-hidden="true">&times;</span></button></div>
          <iframe></iframe>
        </div>` : ""}
      </div>
      <div class="uppload-modal-bg">
        <button class="uppload-close" aria-label="${translate("close")}">&times;</button>
      </div>
    `;
    }
    /**
     * Render the content inside the widget container
     */
    render() {
        return `
      ${this.error ? `<div class="uppload-error">${this.error}</div>` : ""}
      ${this.activeEffect
            ? `<div class="uppload-effect uppload-effect--${this.activeEffect || "none"}">
      ${this.activeEffect && this.file ? this.renderActiveEffect(this.file) : ""}
    </div>`
            : `<div class="uppload-service uppload-service--${this.activeService}">
      ${this.activeEffect && this.file ? "" : this.renderActiveService()}
      ${this.activeService === "default" ? this.getNavbar() : ""}
    </div>`}`;
    }
    /**
     * Render the currently active service
     */
    renderActiveService() {
        const activeServices = this.services.filter((service) => service.name === this.activeService);
        if (activeServices.length) {
            const activeService = activeServices[0];
            requestAnimationFrame(() => {
                if (typeof activeService.handlers === "function")
                    activeService.handlers({
                        next: this.next.bind(this),
                        upload: this.upload.bind(this),
                        uploadMultiple: this.uploadMultiple.bind(this),
                        handle: this.handle.bind(this),
                        showHelp: this.showHelp.bind(this),
                        uppload: this,
                        translate,
                    });
            });
            return `${typeof activeService.template === "function"
                ? activeService.template({ translate, uppload: this })
                : ""}`;
        }
    }
    /**
     * Render the currently active effect
     */
    renderActiveEffect(file) {
        const activeEffects = this.effects.filter((effect) => effect.name === this.activeEffect);
        if (activeEffects.length) {
            const activeEffect = activeEffects[0];
            requestAnimationFrame(() => {
                if (typeof activeEffect.handlers === "function")
                    activeEffect.handlers({
                        next: this.next.bind(this),
                        upload: this.upload.bind(this),
                        uploadMultiple: this.uploadMultiple.bind(this),
                        handle: this.handle.bind(this),
                        showHelp: this.showHelp.bind(this),
                        uppload: this,
                        translate,
                    });
            });
            return `
        <div class="active-effect-container">${typeof activeEffect.template === "function"
                ? activeEffect.template({ file, translate })
                : ""}</div>
      `;
        }
    }
    /**
     * Uploads multiple files to the server
     * @param file
     * @returns JSON response from server
     */
    uploadMultiple(file) {
        this.emitter.emit("before-upload");
        return new Promise((resolve) => {
            this.navigate("uploading");
            if (this.uploader && typeof this.uploader === "function") {
                this.uploader(file, this.updateProgress.bind(this))
                    .then((response) => {
                    this.navigate("default");
                    resolve(response);
                    this.emitter.emit("upload", response);
                    this.close();
                })
                    .catch((error) => this.handle(error));
            }
            else {
                this.handle(new Error("no-uploader"));
            }
        });
    }
    hideHelp() {
        const help = this.container.querySelector(".uppload-help");
        const helpLoading = this.container.querySelector(".uppload-help-loading");
        const sideNavbar = this.container.querySelector("aside");
        const section = this.container.querySelector("section");
        if (helpLoading)
            helpLoading.classList.remove("visible");
        if (help)
            help.classList.remove("visible");
        if (sideNavbar)
            sideNavbar.style.display = "";
        if (section)
            section.style.display = "";
        this.emitter.emit("hide-help");
    }
    /**
     * Show the help article for this plugin in a frame
     * @param url - URL of help webpage
     */
    showHelp(url) {
        this.emitter.emit("help", url);
        const aside = this.container.querySelector("aside");
        if (aside)
            aside.style.display = "none";
        const section = this.container.querySelector("section");
        if (section)
            section.style.display = "none";
        const helpLoading = this.container.querySelector(".uppload-help-loading");
        if (helpLoading)
            helpLoading.classList.add("visible");
        const help = this.container.querySelector(".uppload-help");
        if (help) {
            const iframe = help.querySelector("iframe");
            if (iframe) {
                iframe.setAttribute("src", `https://uppload.js.org/help${url}`);
                let completed = false;
                const listener = () => {
                    completed = true;
                    help.classList.add("visible");
                    if (helpLoading)
                        helpLoading.classList.remove("visible");
                };
                safeListen(iframe, "load", listener);
                safeListen(iframe, "error", () => {
                    completed = true;
                    this.hideHelp();
                });
            }
        }
    }
    /**
     * Updates the file and goes to the active effect
     * @param file - The currently active file Blob
     */
    next(file) {
        this.emitter.emit("next", file);
        this.file = file;
        if (this.activeEffect) {
            // There's already an active effect
        }
        else {
            // Find the first effect and navigate to that
            // Unless the file type is not an image
            if (this.effects.length &&
                file.type &&
                file.type.indexOf("image/") === 0) {
                this.activeEffect = this.effects[0].name;
                this.update();
            }
            else {
                return this.upload(safeUpploadFileToFile(file));
            }
        }
        // Set active state to current effect
        const activeRadio = this.container.querySelector(`input[name='uppload-effect-radio'][value='${this.activeEffect}']`);
        if (activeRadio) {
            activeRadio.setAttribute("checked", "checked");
            activeRadio.checked = true;
        }
    }
    compress(file) {
        if (!this.settings.compressionFromMimes ||
            this.settings.compressionFromMimes.indexOf(file.type) === -1)
            return new Promise((resolve) => resolve(file));
        if (typeof this.settings.compressor === "function")
            return this.settings.compressor(file);
        return compressImage(file, this.settings);
    }
    /**
     * Upload a file to the server
     * @param file - A Blob object containing the file to upload
     * @returns The file URL
     */
    upload(file) {
        this.emitter.emit("before-upload", file);
        return new Promise((resolve, reject) => {
            this.navigate("uploading");
            let upploadFile = blobToUpploadFile(file);
            try {
                if (typeof file.name === "string")
                    upploadFile = blobToUpploadFile(file, file.name, file.type, new Date(file.lastModified));
            }
            catch (error) { }
            if (this.uploader && typeof this.uploader === "function") {
                this.compress(file)
                    .then((file) => {
                    if (this.settings.compression)
                        this.emitter.emit("compress", file);
                    return file;
                })
                    .then((blob) => {
                    upploadFile.blob = blob;
                    return safeUpploadFileToFile(upploadFile);
                })
                    .then((file) => this.uploader(file, this.updateProgress.bind(this)))
                    .then((url) => {
                    this.bind(url);
                    this.navigate("default");
                    resolve(url);
                    this.emitter.emit("upload", url);
                    this.close();
                })
                    .catch((error) => this.handle(error));
            }
            else {
                reject("no-uploader");
            }
        });
    }
    /**
     * Gracefully display an error message
     * @param error - Error to display
     */
    handle(error) {
        this.error = translate(error.message) || error.message;
        this.emitter.emit("error", this.error);
        this.update();
        if (this.activeService === "uploading")
            this.navigate("default");
        setTimeout(() => {
            this.error = undefined;
            this.update();
        }, 4000);
    }
    /**
     * Adds event handlers for the widget
     */
    handlers() {
        const openFunction = () => this.open();
        const closeFunction = () => this.close();
        /**
         * Clicking on each sidebar link should open its service
         */
        const defaultServiceLinks = this.container.querySelectorAll(".uppload-service--default .uppload-service-name button");
        defaultServiceLinks.forEach((link) => {
            const linkFunction = (e) => {
                const service = link.getAttribute("data-uppload-service");
                const serviceRadio = this.container.querySelector(`input[type=radio][value='${service}']`);
                if (serviceRadio) {
                    serviceRadio.setAttribute("checked", "checked");
                    serviceRadio.checked = true;
                }
                if (service) {
                    this.navigate(service);
                    const serviceDiv = this.container.querySelector(`[data-uppload-service="${service}"]`);
                    if (serviceDiv && serviceDiv.parentElement) {
                        let top = 0;
                        let left = 0;
                        const serviceDivRect = serviceDiv.getBoundingClientRect();
                        const serviceNavRect = serviceDiv.parentElement.getBoundingClientRect();
                        top = serviceDivRect.top - serviceNavRect.top;
                        left = serviceDivRect.left - serviceNavRect.left;
                        const aside = serviceDiv.parentElement.parentElement;
                        try {
                            // Edge doesn't support scrollTo and throws an error
                            if (aside)
                                aside.scrollTo(left, top);
                        }
                        catch (error) { }
                    }
                }
                e.preventDefault();
                return false;
            };
            safeListen(link, "click", linkFunction);
        });
        /**
         * Clicking on each sidebar link should open its service
         */
        const inputRadios = this.container.querySelectorAll(".uppload-services input[type='radio']");
        inputRadios.forEach((radio) => {
            const radioFunction = (e) => {
                const inputRadio = this.container.querySelector("[name='uppload-radio']:checked");
                if (!inputRadio)
                    return;
                const service = inputRadio.value;
                this.navigate(service);
            };
            safeListen(radio, "change", radioFunction);
        });
        /**
         * Clicking on each sidebar link should open its service
         */
        const effectInputRadios = this.container.querySelectorAll(".effects-nav input[type='radio']");
        effectInputRadios.forEach((radio) => {
            const radioFunction = (e) => {
                const inputRadio = this.container.querySelector("[name='uppload-effect-radio']:checked");
                if (!inputRadio)
                    return;
                const effect = inputRadio.value;
                this.activeEffect = effect;
                this.update();
            };
            safeListen(radio, "change", radioFunction);
        });
        /**
         * Clicking on the background should close the modal
         */
        const background = this.container.querySelector(".uppload-modal-bg");
        const closeButton = this.container.querySelector(".uppload-close");
        if (background && !this.settings.disableModalClickClose) {
            safeListen(background, "click", closeFunction);
        }
        else if (closeButton) {
            safeListen(closeButton, "click", closeFunction);
        }
        /**
         * All elements in `call` should open the modal on click
         */
        if (this.settings.call) {
            const elements = getElements(this.settings.call);
            elements.forEach((element) => {
                safeListen(element, "click", openFunction);
            });
        }
        /**
         * Clicking on the cancel button restarts the process
         */
        const cancelButton = this.container.querySelector(".effects-continue--cancel");
        if (cancelButton)
            safeListen(cancelButton, "click", () => {
                this.file = { blob: new Blob() };
                this.activeEffect = "";
                this.update();
            });
        /**
         * Clicking on the cancel button restarts the process
         */
        const uploadButton = this.container.querySelector(".effects-continue--upload");
        if (uploadButton)
            safeListen(uploadButton, "click", () => {
                if (!this.file)
                    return;
                this.activeService = "";
                this.activeEffect = "";
                this.upload(safeUpploadFileToFile(this.file));
            });
    }
    /**
     * Stops any actions being done by the currently active service
     * For example, if your webcame is being accessed, kill that process
     */
    stopCurrentService() {
        const currentService = this.services.filter((item) => item.name === this.activeService);
        if (currentService.length) {
            const service = currentService[0];
            service.stop();
        }
    }
    /**
     * Navigate to an Uppload service page
     * @param service - Slug name of service (e.g., instagram)
     */
    navigate(service) {
        if (!this.services.filter((item) => item.name === service).length)
            throw new Error("invalid-service");
        this.stopCurrentService();
        this.activeService = service;
        this.update();
        const focusable = this.container.querySelector(".uppload-active-container input, .uppload-active-container button");
        if (focusable)
            focusable.focus();
    }
    /**
     * Add an event listener
     * @param type - Type of event listener (e.g., open)
     * @param handler - Event handler function
     */
    on(type, handler) {
        return this.emitter.on(type, handler);
    }
    /**
     * Remove an event listener
     * @param type - Type of event listener (e.g., open)
     * @param handler - Event handler function
     */
    off(type, handler) {
        return this.emitter.off(type, handler);
    }
    /**
     * Updates the upload progress
     * @param progressPercent Current progress in percent
     */
    updateProgress(progressPercent) {
        this.uploadProgress = progressPercent;
        const progressText = this.container.querySelector(".uppload-loader-text .progress");
        if (progressText)
            progressText.innerHTML = `${parseInt(progressPercent.toString())} %`;
        this.emitter.emit("progress", this.updateProgress);
    }
}
//# sourceMappingURL=uppload.js.map