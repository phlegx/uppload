define(['exports', 'focus-trap', 'mitt', 'cropperjs'], function (exports, createFocusTrap, mitt, Cropper) { 'use strict';

  createFocusTrap = createFocusTrap && Object.prototype.hasOwnProperty.call(createFocusTrap, 'default') ? createFocusTrap['default'] : createFocusTrap;
  mitt = mitt && Object.prototype.hasOwnProperty.call(mitt, 'default') ? mitt['default'] : mitt;
  Cropper = Cropper && Object.prototype.hasOwnProperty.call(Cropper, 'default') ? Cropper['default'] : Cropper;

  class UpploadService {
      constructor() {
          this.type = "service";
          this.name = "";
          this.invisible = false;
          this.noRecolor = false;
          this.icon = "";
          this.color = "#333";
          this.template = () => "";
          this.handlers = () => { };
          this.stop = () => { };
          this.supports = () => true;
      }
  }

  let i18n = {};
  const flattenObject = (ob) => {
      const toReturn = {};
      for (const i in ob) {
          if (!ob.hasOwnProperty(i))
              continue;
          if (typeof ob[i] == "object") {
              const flatObject = flattenObject(ob[i]);
              for (const x in flatObject) {
                  if (!flatObject.hasOwnProperty(x))
                      continue;
                  toReturn[i + "." + x] = flatObject[x];
              }
          }
          else {
              toReturn[i] = ob[i];
          }
      }
      return toReturn;
  };
  /**
   *
   * @param translations
   */
  const setI18N = (translations) => {
      i18n = flattenObject(translations);
  };
  /**
   * Get a translation from i18n setting
   * @param key - Translation key
   * @param params - Single term or array of variables
   */
  const translate = (key, params) => {
      try {
          let term = i18n[key];
          if (typeof params === "string")
              params = [params];
          if (params)
              params.forEach((param, index) => {
                  term = term.replace(`$${index + 1}$`, param);
              });
          if (i18n.helper && typeof i18n.helper === "function")
              term = i18n.helper(term);
          return term;
      }
      catch (error) {
          return "";
      }
  };

  /**
   * Gets all the DOM elements matching a selector
   * @param query - CSS selector string, HTML element, or an array of them
   */
  const getElements = (query) => {
      if (!query)
          return [];
      const elements = [];
      if (typeof query === "string") {
          elements.push(...Array.prototype.slice.call(document.querySelectorAll(query)));
      }
      else if (Array.isArray(query)) {
          query.forEach((item) => {
              if (typeof item === "string") {
                  elements.push(...Array.prototype.slice.call(document.querySelectorAll(item)));
              }
              else {
                  elements.push(item);
              }
          });
      }
      else {
          elements.push(query);
      }
      return elements;
  };
  const listening = [];
  /**
   * Safely adds an event listener, preventing duplicates
   * @param element - HTML element to add event listener to
   * @param type - Type of event listener to add
   * @param fn - Callback function to call on event
   */
  const safeListen = (element, type, fn) => {
      const hasListener = !!listening.find((a) => a.element === element && a.type === type);
      if (hasListener)
          return;
      element.addEventListener(type, fn);
      listening.push({ element, type });
  };
  const safeRequestAnimationFrame = (callback) => {
      if (window.requestAnimationFrame)
          return window.requestAnimationFrame(callback);
      setTimeout(() => {
          callback(0);
      }, 100);
  };
  /**
   *
   * @param image - An HTML <img> element in the DOM
   */
  const fitImageToContainer = (params, image) => {
      return new Promise((resolve) => {
          safeRequestAnimationFrame(() => {
              const parent = image.parentElement;
              const currentDimensions = image.getBoundingClientRect();
              if (!parent)
                  return;
              const dimensions = parent.getBoundingClientRect();
              if (currentDimensions.height < currentDimensions.width) {
                  image.style.height = `${dimensions.height}px`;
                  image.style.width = "auto";
              }
              else {
                  image.style.width = `${dimensions.width}px`;
                  image.style.height = "auto";
              }
              safeRequestAnimationFrame(() => {
                  const currentDimensions = image.getBoundingClientRect();
                  if (currentDimensions.height > dimensions.height) {
                      image.style.height = `${dimensions.height}px`;
                      image.style.width = "auto";
                  }
                  else if (currentDimensions.width > dimensions.width) {
                      image.style.width = `${dimensions.width}px`;
                      image.style.height = "auto";
                  }
                  safeRequestAnimationFrame(() => {
                      const effect = params.uppload.container.querySelector(".uppload-effect");
                      if (effect)
                          effect.style.opacity = "1";
                      resolve();
                  });
              });
          });
      });
  };
  /**
   * Compress an image using lossy canvas compression
   * @param file - Image file to compress
   * @param settings - Uppload settings defined in the constructor
   */
  const compressImage = (file, settings) => new Promise((resolve) => {
      const imageURL = URL.createObjectURL(file);
      const canvas = document.createElement("canvas");
      const image = document.createElement("img");
      const maxSize = settings.maxSize || [
          settings.maxWidth || Infinity,
          settings.maxHeight || Infinity,
      ];
      image.src = imageURL;
      image.onload = () => {
          const type = settings.compressionToMime || "image/jpeg";
          const quality = settings.compression || 1;
          const ratio = image.width / image.height;
          if (image.width > maxSize[0]) {
              image.width = maxSize[0];
              image.height = image.width * (1 / ratio);
          }
          if (image.height > maxSize[1]) {
              image.height = maxSize[1];
              image.width = image.height * ratio;
          }
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          if (!context)
              return resolve(file);
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvasToBlob(canvas, type, quality).then((blob) => {
              if (blob)
                  return resolve(blob);
              resolve(file);
          });
      };
      safeListen(image, "error", () => resolve(file));
  });
  /**
   * Convert a data URI image string to Blob
   * @param dataURI - Data URI of image
   * @source https://stackoverflow.com/a/12300351/1656944
   */
  const dataURItoBlob = (dataURI) => {
      const byteString = atob(dataURI.split(",")[1]);
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++)
          uArray[i] = byteString.charCodeAt(i);
      return new Blob([arrayBuffer], { type: mimeString });
  };
  /**
   * Export an HTML canvas to Blob image
   * @param canvas - Canvas element to export
   * @param type - MIME type of image
   * @param quality - Compression ratio (0 to 1)
   */
  const canvasToBlob = (canvas, type, quality) => {
      return new Promise((resolve, reject) => {
          const context = canvas.getContext("2d");
          let hasTransparency = false;
          /**
           * Check if an image has transparent pixels
           * @source https://stackoverflow.com/a/25923108/1656944
           */
          if (context) {
              try {
                  const data = context.getImageData(0, 0, canvas.width, canvas.height)
                      .data;
                  for (let i = 0; i < data.length; i += 4) {
                      if (data[i + 3] < 255) {
                          hasTransparency = true;
                      }
                  }
              }
              catch (error) { }
          }
          /**
           * If a transparent image is uploaded, like a PNG or GIF,
           * let it through uncompressed
           */
          if (hasTransparency && type !== "image/webp") {
              type = undefined;
              quality = undefined;
          }
          if (typeof canvas.toBlob === "function") {
              canvas.toBlob((blob) => {
                  if (blob)
                      resolve(blob);
                  reject(new Error("errors.image_error"));
              }, type, quality);
          }
          else if (typeof canvas.toDataURL === "function") {
              const dataURI = canvas.toDataURL(type, quality);
              resolve(dataURItoBlob(dataURI));
          }
          else {
              reject(new Error("errors.image_error"));
          }
      });
  };

  /**
   * Colors an SVG icon with the brand color for a service or effect
   * @param svg - SVG template string
   * @param service - Uppload service object
   */
  const colorSVG = (svg, service) => (service.noRecolor ? svg : svg.replace(/#000/g, service.color || "#000"));

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
  const blobToUpploadFile = (blob, name, type, lastModified) => {
      const result = {
          name,
          blob,
          lastModified,
          type,
      };
      return result;
  };
  const safeUpploadFileToFile = (file) => {
      const blob = file.blob;
      file.lastModified = file.lastModified || new Date();
      return safeBlobToFile(blob, file.name, file.lastModified);
  };

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
  class Uppload {
      /**
       * Create a new Uppload instance
       * @param settings - Uppload instance settings
       */
      constructor(settings) {
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
          this.renderContainer();
          div.classList.add("uppload-container");
          const body = document.body;
          if (body) {
              body.appendChild(div);
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
          const serviceRadio = this.container.querySelector(`input[type=radio][value='${this.activeService}']`);
          if (serviceRadio)
              serviceRadio.setAttribute("checked", "checked");
          this.container.style.transition = `${this.transitionDuration}ms`;
          this.container.style.opacity = "0";
          this.update();
          let firstService = this.settings.defaultService;
          if (this.services.length === 3)
              this.navigate(this.services[2].name);
          if (firstService)
              this.navigate(firstService);
          safeListen(document.body, "keyup", (e) => {
              if (e.key === "Escape" && this.open)
                  this.close();
          });
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
            ? `<input type="radio" id="uppload-service-radio-${service.name}" value="${service.name}" name="uppload-radio">`
            : ""}
          <${sidebar
            ? `label for="uppload-service-radio-${service.name}"`
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
      <input type="radio" id="uppload-effect-radio-${effect.name}" value="${effect.name}" name="uppload-effect-radio">
        <label for="uppload-effect-radio-${effect.name}">
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
        <div class="uppload-help-loading">
          <div class="uppload-loader">
            <div></div>
            <p class="uppload-loader-text">${translate("help.loading")}</p>
          </div>
        </div>
        <div class="uppload-help">
          <div><button><span>${translate("help.close")}</span><span aria-hidden="true">&times;</span></button></div>
          <iframe></iframe>
        </div>
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
                  const listener = () => {
                      help.classList.add("visible");
                      if (helpLoading)
                          helpLoading.classList.remove("visible");
                  };
                  safeListen(iframe, "load", listener);
                  safeListen(iframe, "error", () => {
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
          if (this.activeEffect) ;
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
          if (activeRadio)
              activeRadio.setAttribute("checked", "checked");
      }
      compress(file) {
          if (this.settings.compressionFromMimes &&
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
                  const serviceRadio = this.container.querySelector(`input[type=radio][value='${service}']`);
                  if (serviceRadio)
                      serviceRadio.setAttribute("checked", "checked");
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
                  this.activeService = "default";
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
              progressText.innerHTML = `${parseInt(progressPercent.toString())}%`;
          this.emitter.emit("progress", this.updateProgress);
      }
  }

  class UpploadEffect {
      constructor() {
          this.type = "effect";
          this.name = "";
          this.invisible = false;
          this.noRecolor = false;
          this.color = "#000";
          this.icon = "";
          this.template = () => "";
          this.handlers = () => { };
          this.supports = () => true;
      }
  }

  /**
   * Make an HTTP request with the Fetch API and cache results
   * @param input API endpoint
   * @param settings HTTP Fetch configuration
   */
  function cachedFetch(input, settings) {
      const storage = sessionStorage;
      return new Promise((resolve, reject) => {
          const key = `uppload_cache_${JSON.stringify(input)}`;
          const maxTTL = new Date();
          maxTTL.setDate(maxTTL.getDate() + 1);
          const cachedResult = storage.getItem(key);
          if (cachedResult) {
              const cachedResultData = JSON.parse(cachedResult);
              if (cachedResultData.ttl &&
                  new Date(cachedResultData.ttl).getTime() > new Date().getTime())
                  return resolve(cachedResultData.result);
          }
          window
              .fetch(input, settings)
              .then((response) => {
              if (!response.ok)
                  throw new Error("errors.response_not_ok");
              return response.json();
          })
              .then((result) => {
              storage.setItem(key, JSON.stringify({
                  ttl: maxTTL,
                  updatedAt: new Date(),
                  result,
              }));
              resolve(result);
          })
              .catch((error) => reject(error));
      });
  }
  /**
   * Get a file Blob from an image URL
   * @param url - URL of an image
   */
  const imageUrlToBlob = (url) => {
      return new Promise((resolve, reject) => {
          window
              .fetch(`https://images.weserv.nl/?url=${encodeURIComponent(url)}`)
              .then((response) => {
              if (!response.ok)
                  throw new Error("errors.response_not_ok");
              return response.blob();
          })
              .then((blob) => resolve(blob))
              .catch((error) => reject(error));
      });
  };

  const de = {
      upload: "Hochladen",
      cancel: "Stornieren",
      close: "Schließen",
      uploading: "Hochladen ...",
      uploaded: "Hochgeladen",
      fetching: "Bild abrufen von $1$ ...",
      poweredBy: "Ermöglicht durch $1$",
      needHelp: "Benötigen Sie Hilfe?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Beim Abrufen dieser Datei ist ein Fehler aufgetreten",
          unable_to_search: "Bei der Suche ist ein Fehler aufgetreten",
          invalid_service_url: "Dies ist keine $1$ -URL",
          invalid_url: "Diese URL ist ungültig",
          upload_aborted: "Dein Upload wurde abgebrochen",
          upload_error: "Beim Hochladen dieser Datei ist ein Fehler aufgetreten",
          file_type_not_allowed: "Dieser Dateityp wird nicht unterstützt",
          file_too_large: "Die Datei muss kleiner als $1$ sein",
      },
      help: {
          loading: "Ladehilfe...",
          close: "Hilfe schließen",
      },
      services: {
          default: {
              heading: "Wählen Sie ein Bild aus",
          },
          local: {
              title: "Wählen Sie eine Datei",
              button: "Wählen Sie eine Datei aus",
              or: "von",
              drop: "Ziehen Sie eine Datei hierher, um sie hochzuladen",
          },
          camera: {
              title: "Kamera",
              button: "Webcam Foto",
              switch: "Kamera wechseln",
              waiting: "Warten auf Kameraerlaubnis ...",
              unableToRead: "Wir können das Video nicht von Ihrer Kamera lesen. Dies kann daran liegen, dass Sie nicht die erforderliche Berechtigung erteilt haben oder dass Ihr Gerät den Kamerazugriff nicht unterstützt.",
          },
          microlink: {
              button: "Import von $1$",
              label: "$1$ $2$ URL",
              placeholder: "Geben Sie eine URL von 1 bis 2 US-Dollar ein",
              type: "Post",
          },
          url: {
              title: "Direkte URL",
              label: "Bild-URL",
              placeholder: "Geben Sie eine Bild-URL ein",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "ein foto",
          },
          ninegag: {
              title: "9GAG",
              type: "ein foto",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "Foto-Tweet",
          },
          pinterest: {
              title: "Pinterest",
              type: "Stift",
          },
          flipboard: {
              title: "Flipboard",
              type: "artikel",
          },
          fotki: {
              title: "Fotos",
              type: "ein foto",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "Wir lieben es",
          },
          screenshot: {
              title: "Bildschirmfoto",
              button: "Screenshot machen",
              label: "URL der Webseite",
              placeholder: "Geben Sie eine URL ein",
              loading: "Machen Sie einen Screenshot ...",
          },
          search: {
              button: "Suchen Sie nach $1$",
              label: "Suchen Sie nach einem Bild",
              placeholder: "Suche nach etwas",
              imagesPoweredBy: "Bilder möglich gemacht von $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Aufspritzen",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Beispiel",
          },
          filters: {
              title: "Filter",
          },
          crop: {
              title: "Zuschneiden",
              aspectRatios: {
                  free: "Frei",
                  square: "voll",
              },
          },
          rotate: {
              title: "Wende dich",
          },
          flip: {
              title: "Dreh dich um",
              buttons: {
                  horizontal: "Horizontal",
                  vertical: "Vertikal",
              },
          },
          sharpen: {
              title: "Schärfen",
          },
          blur: {
              title: "Unschärfe",
          },
          brightness: {
              title: "Helligkeit",
          },
          contrast: {
              title: "Kontrast",
          },
          grayscale: {
              title: "Graustufen",
          },
          "hue-rotate": {
              title: "Farbton drehen",
          },
          invert: {
              title: "Umdrehen",
          },
          saturate: {
              title: "Sättigen",
          },
          sepia: {
              title: "Sepia",
          },
      },
  };

  const en = {
      upload: "Upload",
      cancel: "Cancel",
      close: "Close",
      uploading: "Uploading...",
      uploaded: "Uploaded",
      fetching: "Getting your image from $1$...",
      poweredBy: "Powered by $1$",
      needHelp: "Need help?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "We got an error fetching this file",
          unable_to_search: "We got an error searching",
          invalid_service_url: "This is not $A$ $1$ URL",
          invalid_url: "This URL seems to be invalid",
          upload_aborted: "Your upload was cancelled",
          upload_error: "We got an error uploading this file",
          file_type_not_allowed: "This file type is not allowed",
          file_too_large: "Your file should be smaller than $1$",
      },
      help: {
          loading: "Loading help...",
          close: "Close help",
      },
      services: {
          default: {
              heading: "Select an image",
          },
          local: {
              title: "Choose file",
              button: "Select a file",
              or: "or",
              drop: "Drop files here",
          },
          camera: {
              title: "Camera",
              button: "Click photo",
              switch: "Switch camera",
              waiting: "Waiting for permission...",
              unableToRead: "We're not able to read your camera's video. This may be because you didn't grant the required permission, or because your device doesn't support camera access.",
          },
          microlink: {
              button: "Import from $1$",
              label: "$1$ $2$ URL",
              placeholder: "Enter $A$ $1$ $2$ URL",
              type: "post",
          },
          url: {
              title: "Direct URL",
              label: "Image URL",
              placeholder: "Enter an image URL",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "photo",
          },
          ninegag: {
              title: "9GAG",
              type: "photo",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "image tweet",
          },
          pinterest: {
              title: "Pinterest",
              type: "pin",
          },
          flipboard: {
              title: "Flipboard",
              type: "article",
          },
          fotki: {
              title: "Fotki",
              type: "photo",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Screenshot",
              button: "Take screenshot",
              label: "Webpage URL",
              placeholder: "Enter a webpage URL",
              loading: "Taking a screenshot...",
          },
          search: {
              button: "Search on $1$",
              label: "Find an image",
              placeholder: "Search for something",
              imagesPoweredBy: "Images powered by $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Preview",
          },
          filters: {
              title: "Filters",
          },
          crop: {
              title: "Crop",
              aspectRatios: {
                  free: "Free",
                  square: "Square",
              },
          },
          rotate: {
              title: "Rotate",
          },
          flip: {
              title: "Flip",
              buttons: {
                  horizontal: "Horizontal",
                  vertical: "Vertical",
              },
          },
          sharpen: {
              title: "Sharpen",
          },
          blur: {
              title: "Blur",
          },
          brightness: {
              title: "Brightness",
          },
          contrast: {
              title: "Contrast",
          },
          grayscale: {
              title: "Grayscale",
          },
          "hue-rotate": {
              title: "Hue rotate",
          },
          invert: {
              title: "Invert",
          },
          saturate: {
              title: "Saturate",
          },
          sepia: {
              title: "Sepia",
          },
      },
      /**
       * Helpers can transform a string before returning it
       * You can define a language-specific helper here
       */
      helper: (text) => {
          // Replace all instances of $A$ with "a" or "an"
          const AAN = "$A$";
          while (text.indexOf(AAN) !== -1) {
              const index = text.indexOf(AAN);
              if (text.length > index + 3) {
                  if (["a", "e", "i", "o", "u"].indexOf(text[index + 4].toLowerCase()) !==
                      -1) {
                      text = text.replace(AAN, "an");
                  }
                  else {
                      text = text.replace(AAN, "a");
                  }
              }
          }
          return text;
      },
  };

  const es = {
      upload: "Subir",
      cancel: "Cancelar",
      close: "Cerrar",
      uploading: "Subiendo...",
      uploaded: "Subido",
      fetching: "Obteniendo imagen desde $1$ ...",
      poweredBy: "Hecho posible por $1$",
      needHelp: "¿Necesitas ayuda?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Se produjo un error al obtener este archivo",
          unable_to_search: "Se produjo un error al buscar",
          invalid_service_url: "Esta no es una URL de $1$",
          invalid_url: "Esta URL no es válida.",
          upload_aborted: "Tu carga ha sido cancelada",
          upload_error: "Se produjo un error al subir este archivo",
          file_type_not_allowed: "Este tipo de archivo no está permitido",
          file_too_large: "El archivo debe ser inferior a $1$",
      },
      help: {
          loading: "Cargando ayuda...",
          close: "Cerrar ayuda",
      },
      services: {
          default: {
              heading: "Selecciona una imagen",
          },
          local: {
              title: "Elige un archivo",
              button: "Selecciona un archivo",
              or: "o",
              drop: "Arrastra un archivo aquí para subir",
          },
          camera: {
              title: "Cámara",
              button: "Foto de la webcam",
              switch: "Cambiar de cámara",
              waiting: "Esperando el permiso de la cámara...",
              unableToRead: "No podemos leer el video de su cámara. Esto puede deberse a que no ha otorgado el permiso requerido o porque su dispositivo no admite el acceso a la cámara.",
          },
          microlink: {
              button: "Importar desde $1$",
              label: "$1$ $2$ URL",
              placeholder: "Ingrese una URL de $1$ $2$",
              type: "enviar",
          },
          url: {
              title: "URL directa",
              label: "URL de la imagen",
              placeholder: "Ingrese la URL de la imagen",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "una foto",
          },
          ninegag: {
              title: "9GAG",
              type: "una foto",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "imagen de twitter",
          },
          pinterest: {
              title: "Pinterest",
              type: "pin",
          },
          flipboard: {
              title: "Flipboard",
              type: "artículo",
          },
          fotki: {
              title: "fotos",
              type: "una foto",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Captura de pantalla",
              button: "Tomar captura de pantalla",
              label: "URL de la página web",
              placeholder: "Ingresa una URL",
              loading: "Tomando una captura de pantalla ...",
          },
          search: {
              button: "Buscar en $1$",
              label: "Busca una imagen",
              placeholder: "Buscar algo",
              imagesPoweredBy: "Imágenes posibles por $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Vista Previa",
          },
          filters: {
              title: "Filtros",
          },
          crop: {
              title: "Recortar",
              aspectRatios: {
                  free: "Libre",
                  square: "Cuadrado",
              },
          },
          rotate: {
              title: "Rotar",
          },
          flip: {
              title: "Dar vuelta",
              buttons: {
                  horizontal: "Horizontal",
                  vertical: "Vertical",
              },
          },
          sharpen: {
              title: "Agudizar",
          },
          blur: {
              title: "Desenfocar",
          },
          brightness: {
              title: "Brillo",
          },
          contrast: {
              title: "Contraste",
          },
          grayscale: {
              title: "Escala de grises",
          },
          "hue-rotate": {
              title: "Rotar tono",
          },
          invert: {
              title: "Invertir",
          },
          saturate: {
              title: "Saturar",
          },
          sepia: {
              title: "Sepia",
          },
      },
  };

  const fr = {
      upload: "Télécharger",
      cancel: "Annuler",
      close: "Fermer",
      uploading: "Télécharger...",
      uploaded: "Téléchargé",
      fetching: "Obtenir une image à partir de $1$ ...",
      poweredBy: "Rendu possible par $1$",
      needHelp: "Besoin d'aide?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Une erreur s'est produite lors de la récupération de ce fichier.",
          unable_to_search: "Une erreur est survenue lors de la recherche",
          invalid_service_url: "Ce n'est pas une URL $1$",
          invalid_url: "Cette URL est invalide",
          upload_aborted: "Votre téléchargement a été annulé",
          upload_error: "Une erreur s'est produite lors du téléchargement de ce fichier.",
          file_type_not_allowed: "Ce type de fichier n'est pas supporté",
          file_too_large: "Le fichier doit être inférieur à $1$",
      },
      help: {
          loading: "Aide au chargement...",
          close: "Fermer l'aide",
      },
      services: {
          default: {
              heading: "Sélectionnez une image",
          },
          local: {
              title: "Choisissez un fichier",
              button: "Sélectionnez un fichier",
              or: "de",
              drop: "Faites glisser un fichier ici pour le télécharger",
          },
          camera: {
              title: "Caméra",
              button: "Photo webcam",
              switch: "Changer de caméra",
              waiting: "En attente de la permission de la caméra ...",
              unableToRead: "Nous ne pouvons pas lire la vidéo à partir de votre caméra. Cela peut être dû au fait que vous n'avez pas accordé l'autorisation requise ou que votre appareil ne prend pas en charge l'accès à la caméra.",
          },
          microlink: {
              button: "Importation à partir de $1$",
              label: "$1$ $2$ URL",
              placeholder: "Entrez une URL $1$ $2$",
              type: "poster",
          },
          url: {
              title: "Directe URL",
              label: "URL de l'image",
              placeholder: "Entrez une URL d'image",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "une photo",
          },
          ninegag: {
              title: "9GAG",
              type: "une photo",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Gazouillement",
              type: "photo tweet",
          },
          pinterest: {
              title: "Pinterest",
              type: "épingle",
          },
          flipboard: {
              title: "Flipboard",
              type: "article",
          },
          fotki: {
              title: "Photos",
              type: "une photo",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "Nous avons le coeur",
          },
          screenshot: {
              title: "Capture d'écran",
              button: "Prendre une capture d'écran",
              label: "URL de la page Web",
              placeholder: "Entrez une URL",
              loading: "Prenez une capture d'écran ...",
          },
          search: {
              button: "Recherche de $1$",
              label: "Rechercher une image",
              placeholder: "Rechercher quelque chose",
              imagesPoweredBy: "Images rendues possibles par $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Exemple",
          },
          filters: {
              title: "Les filtres",
          },
          crop: {
              title: "Récolte",
              aspectRatios: {
                  free: "Libre",
                  square: "Plein",
              },
          },
          rotate: {
              title: "Tournant",
          },
          flip: {
              title: "Faire demi-tour",
              buttons: {
                  horizontal: "Horizontal",
                  vertical: "Vertical",
              },
          },
          sharpen: {
              title: "Netteté",
          },
          blur: {
              title: "Flou",
          },
          brightness: {
              title: "La luminosité",
          },
          contrast: {
              title: "Contraste",
          },
          grayscale: {
              title: "Niveaux de gris",
          },
          "hue-rotate": {
              title: "Faire pivoter la teinte",
          },
          invert: {
              title: "Retourner",
          },
          saturate: {
              title: "Saturer",
          },
          sepia: {
              title: "Sépia",
          },
      },
  };

  const hi = {
      upload: "अपलोड",
      cancel: "रद्द करना",
      close: "बंद करे",
      uploading: "अपलोड हो रहा है...",
      uploaded: "अपलोड हो गया",
      fetching: "हम आपकी तस्वीर $1$ से ला रहे हैं...",
      poweredBy: "$1$ द्वारा संचालित",
      needHelp: "मदद चाहिए?",
      units: {
          px: "पिक्सेल",
          "%": "प्रतिशत",
          deg: "डिग्री",
      },
      errors: {
          response_not_ok: "आपकी फ़ाइल लाने में एक त्रुटि हुई",
          unable_to_search: "ढूंढे में एक त्रुटि हुई",
          invalid_service_url: "यह एक $1$ यूआरएल नहीं है",
          invalid_url: "यह यूआरएल गलत है",
          upload_aborted: "आपका अपलोड रद्द हो गया है",
          upload_error: "आपका अपलोड कारसे टूट एक त्रुटि हुई",
          file_type_not_allowed: "यह फाइल टाइप अनुमति नहीं हैं",
          file_too_large: "आपकी फाइल $1$ से छोटी होनी चाहिए",
      },
      help: {
          loading: "मदद लोड हो रही है...",
          close: "मदद बंद करें",
      },
      services: {
          default: {
              heading: "एक तस्वीर चुनें",
          },
          local: {
              title: "एक फाइल चुनें",
              button: "फाइल चुनें",
              or: "या",
              drop: "यहां फाइल छोड़ें",
          },
          camera: {
              title: "कैमरा",
              button: "तस्वीर खीचें",
              switch: "कैमरा बदलें",
              waiting: "अनुमति की प्रतीक्षा की जा रही है...",
              unableToRead: "हम आपका वीडियो नहीं पढ़ पा रहे हैं I यह इसीलिए हो सकता है क्यूंकि आपने अनुमति नहीं दी, या क्योंकि आपके युक्ति में कैमरा नहीं है I",
          },
          microlink: {
              button: "$1$ से आयात",
              label: "$1$ $2$ यूआरएल",
              placeholder: "एक $1$ $2$ यूआरएल दर्ज करें",
              type: "पद",
          },
          url: {
              title: "यूआरएल",
              label: "छवि यूआरएल",
              placeholder: "एक छवि यूआरएल दर्ज करें",
          },
          instagram: {
              title: "इंस्टाग्राम",
          },
          facebook: {
              title: "फेसबुक",
          },
          flickr: {
              title: "फ़्लिकर",
              type: "तस्वीर",
          },
          ninegag: {
              title: "नाइन गैग",
              type: "तस्वीर",
          },
          deviantart: {
              title: "देवीअनत-आर्ट",
          },
          artstation: {
              title: "आर्ट-स्टेशन",
          },
          twitter: {
              title: "ट्विटर",
              type: "तस्वीर ट्वीट",
          },
          pinterest: {
              title: "पिनटेरेस्ट",
              type: "पिन",
          },
          flipboard: {
              title: "फ्लिपबोर्ड",
              type: "लेख",
          },
          fotki: {
              title: "फोटकी",
              type: "तस्वीर",
          },
          linkedin: {
              title: "लिंक्ड-इन",
          },
          reddit: {
              title: "रेड्डिट",
          },
          tumblr: {
              title: "तुमब्लर",
          },
          weheartit: {
              title: "वी हार्ट इट",
          },
          screenshot: {
              title: "स्क्रीनशॉट",
              button: "स्क्रीनशॉट लें",
              label: "वेब पृष्ठ यूआरएल",
              placeholder: "एक वेब पृष्ठ यूआरएल दर्ज करें",
              loading: "स्क्रीनशॉट लिया जा रहा है...",
          },
          search: {
              button: "$1$ पर ढूंढें",
              label: "तस्वीर ढूंढें",
              placeholder: "कुछ ढूंढें",
              imagesPoweredBy: "तस्वीरें $1$ द्वारा संचालित",
          },
          giphy: {
              title: "गिफी",
          },
          unsplash: {
              title: "उनस्प्लैश",
          },
          pixabay: {
              title: "पिक्साबे",
          },
          pexels: {
              title: "पिक्सेल्स",
          },
      },
      effects: {
          preview: {
              title: "पूर्वावलोकन",
          },
          filters: {
              title: "फ़िल्टर",
          },
          crop: {
              title: "क्रॉप",
              aspectRatios: {
                  free: "फ़्री",
                  square: "वर्ग",
              },
          },
          rotate: {
              title: "घुमाएँ",
          },
          flip: {
              title: "फ्लिप",
              buttons: {
                  horizontal: "क्षैतिज",
                  vertical: "खड़ा",
              },
          },
          sharpen: {
              title: "पैना",
          },
          blur: {
              title: "कलंक",
          },
          brightness: {
              title: "चमक",
          },
          contrast: {
              title: "कंट्रास्ट",
          },
          grayscale: {
              title: "ग्रेस्केल",
          },
          "hue-rotate": {
              title: "रंग घुमाना",
          },
          invert: {
              title: "रंग पलटना",
          },
          saturate: {
              title: "सैच्युरेट",
          },
          sepia: {
              title: "सीपिया",
          },
      },
  };

  const it = {
      upload: "Caricare",
      cancel: "Annulla",
      close: "Vicino",
      uploading: "Carica ...",
      uploaded: "caricato",
      fetching: "Ottieni immagine da $1$ ...",
      poweredBy: "Reso possibile da $1$",
      needHelp: "Hai bisogno di aiuto?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Si è verificato un errore durante il recupero di questo file",
          unable_to_search: "Si è verificato un errore durante la ricerca",
          invalid_service_url: "Questo non è un $1$ URL",
          invalid_url: "Questo URL non è valido",
          upload_aborted: "Il tuo caricamento è stato annullato",
          upload_error: "Si è verificato un errore durante il caricamento di questo file",
          file_type_not_allowed: "Questo tipo di file non è supportato",
          file_too_large: "Il file deve essere inferiore a $1$",
      },
      help: {
          loading: "Caricamento della guida...",
          close: "Aiuto vicino",
      },
      services: {
          default: {
              heading: "Seleziona un'immagine",
          },
          local: {
              title: "Scegli un file",
              button: "Seleziona un file",
              or: "di",
              drop: "Trascina qui un file per caricarlo",
          },
          camera: {
              title: "telecamera",
              button: "Foto della webcam",
              switch: "Cambia fotocamera",
              waiting: "In attesa di autorizzazione della fotocamera ...",
              unableToRead: "Non possiamo leggere il video dalla tua fotocamera. Ciò può essere dovuto al fatto che non hai concesso l'autorizzazione richiesta o perché il tuo dispositivo non supporta l'accesso alla videocamera.",
          },
          microlink: {
              button: "Importa da $1$",
              label: "$1$ $2$ URL",
              placeholder: "Inserisci un URL da $1$ $2$",
              type: "inviare",
          },
          url: {
              title: "URL diretto",
              label: "URL immagine",
              placeholder: "Inserisci un URL immagine",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "una foto",
          },
          ninegag: {
              title: "9GAG",
              type: "una foto",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "cinguettio",
              type: "tweet fotografico",
          },
          pinterest: {
              title: "Pinterest",
              type: "perno",
          },
          flipboard: {
              title: "Flipboard",
              type: "articolo",
          },
          fotki: {
              title: "foto",
              type: "una foto",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Immagine dello schermo",
              button: "Fai uno screenshot",
              label: "URL della pagina web",
              placeholder: "Inserisci un URL",
              loading: "Fai uno screenshot ...",
          },
          search: {
              button: "Cerca $1$",
              label: "Cerca un'immagine",
              placeholder: "Cerca qualcosa",
              imagesPoweredBy: "Immagini rese possibili da $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "esempio",
          },
          filters: {
              title: "filtri",
          },
          crop: {
              title: "raccolto",
              aspectRatios: {
                  free: "Gratuito",
                  square: "pieno",
              },
          },
          rotate: {
              title: "torcere",
          },
          flip: {
              title: "Voltati",
              buttons: {
                  horizontal: "orizzontale",
                  vertical: "verticale",
              },
          },
          sharpen: {
              title: "affinare",
          },
          blur: {
              title: "dissolvenza",
          },
          brightness: {
              title: "luminosità",
          },
          contrast: {
              title: "Contrasto",
          },
          grayscale: {
              title: "Scala di grigi",
          },
          "hue-rotate": {
              title: "Ruota tonalità",
          },
          invert: {
              title: "Girare",
          },
          saturate: {
              title: "satiate",
          },
          sepia: {
              title: "nero di seppia",
          },
      },
  };

  const nl = {
      upload: "Uploaden",
      cancel: "Annuleren",
      close: "Sluiten",
      uploading: "Uploaden...",
      uploaded: "Geupload",
      fetching: "Bezig met het ophalen van afbeelding vanaf $1$...",
      poweredBy: "Mede mogelijk gemaakt door $1$",
      needHelp: "Hulp nodig?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Er is een fout opgetreden bij het ophalen van dit bestand",
          unable_to_search: "Er is een fout opgetreden bij het zoeken",
          invalid_service_url: "Dit is geen $1$-URL",
          invalid_url: "Deze URL is ongeldig",
          upload_aborted: "Je upload is geannuleerd",
          upload_error: "Er is een fout opgetreden bij het uploaden van dit bestand",
          file_type_not_allowed: "Dit bestandstype wordt niet ondersteund",
          file_too_large: "Het bestand moet kleiner zijn dan $1$",
      },
      help: {
          loading: "Bezig met het laden van hulp...",
          close: "Hulp sluiten",
      },
      services: {
          default: {
              heading: "Selecteer een afbeelding",
          },
          local: {
              title: "Kies een bestand",
              button: "Selecteer een bestand",
              or: "of",
              drop: "Sleep hier een bestand om te uploaden",
          },
          camera: {
              title: "Camera",
              button: "Webcam foto",
              switch: "Switch camera",
              waiting: "Wachten op camera permissie...",
              unableToRead: "We kunnen de video van uw camera niet lezen. Dit kan zijn omdat u niet de vereiste toestemming hebt verleend of omdat uw apparaat geen cameratoegang ondersteunt.",
          },
          microlink: {
              button: "Importeer van $1$",
              label: "$1$ $2$ URL",
              placeholder: "Voer een $1$-$2$-URL in",
              type: "post",
          },
          url: {
              title: "Directe URL",
              label: "Afbeeldings-URL",
              placeholder: "Voer een afbeeldings-URL in",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "foto",
          },
          ninegag: {
              title: "9GAG",
              type: "foto",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "foto tweet",
          },
          pinterest: {
              title: "Pinterest",
              type: "pin",
          },
          flipboard: {
              title: "Flipboard",
              type: "artikel",
          },
          fotki: {
              title: "Fotki",
              type: "foto",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Screenshot",
              button: "Screenshot maken",
              label: "URL van webpagina",
              placeholder: "Voer een URL in",
              loading: "Bezig met het maken van een screenshot...",
          },
          search: {
              button: "Zoeken op $1$",
              label: "Zoek een afbeelding",
              placeholder: "Zoek naar iets",
              imagesPoweredBy: "Afbeeldingen mogelijk gemaakt door $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Voorbeeld",
          },
          filters: {
              title: "Filters",
          },
          crop: {
              title: "Bijsnijden",
              aspectRatios: {
                  free: "Free",
                  square: "Plein",
              },
          },
          rotate: {
              title: "Draaien",
          },
          flip: {
              title: "Omdraaien",
              buttons: {
                  horizontal: "Horizontaal",
                  vertical: "Verticaal",
              },
          },
          sharpen: {
              title: "Verscherpen",
          },
          blur: {
              title: "Vervagen",
          },
          brightness: {
              title: "Helderheid",
          },
          contrast: {
              title: "Contrast",
          },
          grayscale: {
              title: "Grijstinten",
          },
          "hue-rotate": {
              title: "Tint roteren",
          },
          invert: {
              title: "Omkeren",
          },
          saturate: {
              title: "Verzadigen",
          },
          sepia: {
              title: "Sepia",
          },
      },
  };

  const pt = {
      upload: "Enviar",
      cancel: "Cancelar",
      close: "Fechar",
      uploading: "Enviando...",
      uploaded: "Enviado",
      fetching: "Buscando imagem de $1$...",
      poweredBy: "Fornecido por $1$",
      needHelp: "Precisa de ajuda?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Ocorreu um erro ao buscar este arquivo",
          unable_to_search: "Não foi possível realizar a busca",
          invalid_service_url: "Esta URL não pertence a $1$",
          invalid_url: "Esta URL parece ser inválida",
          upload_aborted: "Seu envio foi cancelado",
          upload_error: "Ocorreu um erro durante o envio deste arquivo",
          file_type_not_allowed: "Este tipo de arquivo não é permitido",
          file_too_large: "Seu arquivo deve ser menor que $1$",
      },
      help: {
          loading: "Carregando ajuda...",
          close: "Fechar Ajuda",
      },
      services: {
          default: {
              heading: "Selecione uma imagem",
          },
          local: {
              title: "Escolher arquivo",
              button: "Selecione um arquivo",
              or: "ou",
              drop: "Arraste-os para cá",
          },
          camera: {
              title: "Câmera",
              button: "Tirar foto",
              switch: "Mudar câmera",
              waiting: "Esperando a permissão...",
              unableToRead: "Não foi possível obter acesso a câmera. Isto pode ter ocorrido se você não tiver permitido ou seu dispositivo suportar acesso a câmera.",
          },
          microlink: {
              button: "Importar $1$",
              label: "$2$ do $1$",
              placeholder: "Insira a URL do $2$ do $1$",
              type: "post",
          },
          url: {
              title: "URL",
              label: "URL da imagem",
              placeholder: "Insira a URL da imagem",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "foto",
          },
          ninegag: {
              title: "9GAG",
              type: "foto",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "tweet",
          },
          pinterest: {
              title: "Pinterest",
              type: "pin",
          },
          flipboard: {
              title: "Flipboard",
              type: "artigo",
          },
          fotki: {
              title: "Fotki",
              type: "foto",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Captura de tela (screenshot)",
              button: "Fazer captura da tela",
              label: "URL do site",
              placeholder: "Insira a URL do site",
              loading: "Fazendo captura...",
          },
          search: {
              button: "Pesquisar no $1$",
              label: "Procure uma imagem",
              placeholder: "Procurar algo",
              imagesPoweredBy: "Busca de imagens fornecida por $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Previsualização",
          },
          filters: {
              title: "Filtros",
          },
          crop: {
              title: "Corte",
              aspectRatios: {
                  free: "Livre",
                  square: "Quadrado",
              },
          },
          rotate: {
              title: "Rotacionar",
          },
          flip: {
              title: "Inverter",
              buttons: {
                  horizontal: "Horizontal",
                  vertical: "Vertical",
              },
          },
          sharpen: {
              title: "Aguçar",
          },
          blur: {
              title: "Desfocar",
          },
          brightness: {
              title: "Brilho",
          },
          contrast: {
              title: "Contraste",
          },
          grayscale: {
              title: "Escala de cinza",
          },
          "hue-rotate": {
              title: "Matiz",
          },
          invert: {
              title: "Inverter",
          },
          saturate: {
              title: "Saturar",
          },
          sepia: {
              title: "Sépia",
          },
      },
  };

  const ro = {
      upload: "Încărcare",
      cancel: "Anulare",
      close: "Închide",
      uploading: "Încărcare...",
      uploaded: "Încărcat",
      fetching: "Obținere imagine de la $1$...",
      poweredBy: "Susținut de $1$",
      needHelp: "Ai nevoie de ajutor?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "S-a produs o eroare in timpul obținerii acestui fișier",
          unable_to_search: "S-a produs o eroare in timpul căutării",
          invalid_service_url: "Acesta nu este un URL de $1$",
          invalid_url: "Acest URL nu este valid",
          upload_aborted: "Încărcare a fost anulată",
          upload_error: "S-a produs o eroare in timpul încărcarii acestui fișier",
          file_type_not_allowed: "Acest tip de fișier nu este permis.",
          file_too_large: "Fișierul trebuie să fie mai mic de $1$",
      },
      help: {
          loading: "Se obține ajutor...",
          close: "Închidere ajutor",
      },
      services: {
          default: {
              heading: "Selectează o imagine",
          },
          local: {
              title: "Alege un fișier",
              button: "Selectează un fișier",
              or: "ori",
              drop: "Plasați fișierele aici",
          },
          camera: {
              title: "Cameră",
              button: "Capturează o imagine",
              switch: "Schimbă camera",
              waiting: "Se așteaptă permisiunea...",
              unableToRead: "Nu putem să citim semnalul video al camerei. Acest lucru se poate întâmpla pentru că nu ați acordat permisiunea necesară sau pentru că dispozitivul dvs. nu acceptă accesul camerei.",
          },
          microlink: {
              button: "Importă de pe $1$",
              label: "$1$ $2$ URL",
              placeholder: "Tastează $1$ $2$ URL",
              type: "trimite",
          },
          url: {
              title: "URL direct",
              label: "URL imagine",
              placeholder: "Tastează URL-ul imaginii",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "fotografie",
          },
          ninegag: {
              title: "9GAG",
              type: "fotografie",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "tweet imagine",
          },
          pinterest: {
              title: "Pinterest",
              type: "pin",
          },
          flipboard: {
              title: "Flipboard",
              type: "articol",
          },
          fotki: {
              title: "Fotki",
              type: "fotografie",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Captură de ecran",
              button: "Capturează ecran",
              label: "URL pagină web",
              placeholder: "Tastează URL-ul imaginii",
              loading: "Se capturează ecranul...",
          },
          search: {
              button: "Caută pe $1$",
              label: "Găsește o imagine",
              placeholder: "Caută ceva",
              imagesPoweredBy: "Imagini provenite de la $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "Previzualizare",
          },
          filters: {
              title: "Filtre",
          },
          crop: {
              title: "Decupare",
              aspectRatios: {
                  free: "Liber",
                  square: "Pătrat",
              },
          },
          rotate: {
              title: "Rotire",
          },
          flip: {
              title: "Oglindire",
              buttons: {
                  horizontal: "Orizontal",
                  vertical: "Vertical",
              },
          },
          sharpen: {
              title: "Accentuare",
          },
          blur: {
              title: "Estompare",
          },
          brightness: {
              title: "Luminozitate",
          },
          contrast: {
              title: "Contrast",
          },
          grayscale: {
              title: "Scară tonurilor de gri",
          },
          "hue-rotate": {
              title: "Rotire tonuri",
          },
          invert: {
              title: "Inversare",
          },
          saturate: {
              title: "Saturare",
          },
          sepia: {
              title: "Sepia",
          },
      },
  };

  const ru = {
      upload: "Загрузить",
      cancel: "Отмена",
      close: "близко",
      uploading: "Загрузка... ",
      uploaded: "загруженное",
      fetching: "Скачиваем изображение с $1$... ",
      poweredBy: "Стало возможным благодаря $1$",
      needHelp: "Нужна помощь?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Произошла ошибка при получении этого файла",
          unable_to_search: "Произошла ошибка при поиске",
          invalid_service_url: "Это не URL $1$",
          invalid_url: "Этот URL недействителен",
          upload_aborted: "Ваша загрузка была отменена",
          upload_error: "Произошла ошибка при загрузке этого файла",
          file_type_not_allowed: "Этот тип файла не поддерживается",
          file_too_large: "Файл должен быть не более $1$",
      },
      help: {
          loading: "Загрузка...",
          close: "Закрыть",
      },
      services: {
          default: {
              heading: "Выберите изображение",
          },
          local: {
              title: "Выберите файл",
              button: "Выберите файл",
              or: "или",
              drop: "Перетащите файл сюда, чтобы загрузить",
          },
          camera: {
              title: "Камера",
              button: "Cделать фото",
              switch: "Переключить камеру",
              waiting: "Жду разрешения камеры...",
              unableToRead: "Мы не можем получить доступ к вашей камере. Это может быть связано с тем, что вы не предоставили разрешение, или ваше устройство не поддерживает доступ к камере.",
          },
          microlink: {
              button: "Скачать из $1$",
              label: "Ссылка на $1$ $2$",
              placeholder: "Введите ссылку на $1$ $2$",
              type: "пост",
          },
          url: {
              title: "Ссылка",
              label: "Ссылка на изображение",
              placeholder: "Введите ссылку на изображение",
              button: "Скачать изображение",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "фото",
          },
          ninegag: {
              title: "9GAG",
              type: "фото",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "фото твит",
          },
          pinterest: {
              title: "Pinterest",
              type: "pin",
          },
          flipboard: {
              title: "Flipboard",
              type: "статья",
          },
          fotki: {
              title: "Fotki",
              type: "фото",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "Скриншот",
              button: "Сделать скриншот",
              label: "Ссылка на сайт",
              placeholder: "Введите ссылку",
              loading: "Скриншотим...",
          },
          search: {
              button: "Поиск на $1$",
              label: "Поиск изображений",
              placeholder: "",
              imagesPoweredBy: "картинки предоставлены $1$",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "пример",
          },
          filters: {
              title: "Фильтры",
          },
          crop: {
              title: "Обрезать",
              aspectRatios: {
                  free: "Свободный",
                  square: "Квадрат",
              },
          },
          rotate: {
              title: "Поворот",
          },
          flip: {
              title: "Отразить",
              buttons: {
                  horizontal: "Горизонтально",
                  vertical: "Вертикально",
              },
          },
          sharpen: {
              title: "Резкость",
          },
          blur: {
              title: "Размытие",
          },
          brightness: {
              title: "Яркость",
          },
          contrast: {
              title: "Контраст",
          },
          grayscale: {
              title: "Оттенки серого",
          },
          "hue-rotate": {
              title: "Повернуть оттенок",
          },
          invert: {
              title: "Инверсия",
          },
          saturate: {
              title: "Насыщенность",
          },
          sepia: {
              title: "Сепия",
          },
      },
  };

  const tr = {
      upload: "Yükleme",
      cancel: "İptal etmek",
      close: "Kapat",
      uploading: "Yükle ...",
      uploaded: "yüklenen",
      fetching: "$1$ 'dan resim al ...",
      poweredBy: "$1$ ile mümkün oldu",
      needHelp: "Yardıma mı ihtiyacınız var?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "Bu dosya alınırken bir hata oluştu",
          unable_to_search: "Aranırken bir hata oluştu",
          invalid_service_url: "Bu bir $1$ URL değil",
          invalid_url: "Bu URL geçersiz",
          upload_aborted: "Yüklemeniz iptal edildi",
          upload_error: "Bu dosya yüklenirken bir hata oluştu",
          file_type_not_allowed: "Bu dosya türü desteklenmiyor",
          file_too_large: "Dosya $1$ 'dan az olmalı",
      },
      help: {
          loading: "Yardım yükleniyor...",
          close: "Yardımı kapat",
      },
      services: {
          default: {
              heading: "Bir resim seç",
          },
          local: {
              title: "Bir dosya seç",
              button: "Bir dosya seç",
              or: "arasında",
              drop: "Yüklemek için bir dosyayı buraya sürükleyin",
          },
          camera: {
              title: "Kamera",
              button: "Webcam fotoğraf",
              switch: "Kamera değiştir",
              waiting: "Kamera izni bekleniyor ...",
              unableToRead: "Videoyu kameranızdan okuyamıyoruz. Bunun nedeni gerekli izni vermediğiniz veya cihazınızın kamera erişimini desteklememesi olabilir.",
          },
          microlink: {
              button: "1 $ 'dan içe aktar",
              label: "$1$ $2$ URL",
              placeholder: "Bir $1$ $2$ URL girin",
              type: "posta",
          },
          url: {
              title: "Doğrudan URL",
              label: "Image URL",
              placeholder: "Bir resim URL’si girin",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "bir fotoğraf",
          },
          ninegag: {
              title: "9gag",
              type: "bir fotoğraf",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "heyecan",
              type: "fotoğraf tweet",
          },
          pinterest: {
              title: "pinterest",
              type: "toplu iğne",
          },
          flipboard: {
              title: "Flipboard",
              type: "makale",
          },
          fotki: {
              title: "Resimler",
              type: "bir fotoğraf",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "Biz kalp",
          },
          screenshot: {
              title: "Ekran görüntüsü",
              button: "Ekran görüntüsü al",
              label: "Web sayfasının URL'si",
              placeholder: "Bir URL girin",
              loading: "Ekran görüntüsü al ...",
          },
          search: {
              button: "$1$ için ara",
              label: "Bir resim arayın",
              placeholder: "Bir şey arayın",
              imagesPoweredBy: "Görüntüler $1$ 'a kadar mümkün kılındı",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "örnek",
          },
          filters: {
              title: "Filtreler",
          },
          crop: {
              title: "ekin",
              aspectRatios: {
                  free: "Ücretsiz",
                  square: "tam",
              },
          },
          rotate: {
              title: "büküm",
          },
          flip: {
              title: "Arkanı dön",
              buttons: {
                  horizontal: "yatay",
                  vertical: "dikey",
              },
          },
          sharpen: {
              title: "keskinleştirme",
          },
          blur: {
              title: "karartmak",
          },
          brightness: {
              title: "parlaklık",
          },
          contrast: {
              title: "Kontrast",
          },
          grayscale: {
              title: "Gri tonlama",
          },
          "hue-rotate": {
              title: "Tonu döndür",
          },
          invert: {
              title: "Ters çevir",
          },
          saturate: {
              title: "doyurmak",
          },
          sepia: {
              title: "Sepya",
          },
      },
  };

  const zhTW = {
      upload: "上載",
      cancel: "取消",
      close: "關",
      uploading: "上傳中...",
      uploaded: "已上傳",
      fetching: "正在取得您的影像從 $1$...",
      poweredBy: "由 $1$ 提供",
      needHelp: "需要幫助嗎?",
      units: {
          px: "px",
          "%": "%",
          deg: "°",
      },
      errors: {
          response_not_ok: "我們在抓取這個檔案時發生錯誤",
          unable_to_search: "我們在搜尋時發生錯誤",
          invalid_service_url: "這不是一個 $1$ 網址",
          invalid_url: "這個網址似乎無效",
          upload_aborted: "您的上傳已取消",
          upload_error: "我們在上傳這個檔案時發生錯誤",
          file_type_not_allowed: "這個檔案類型不被允許",
          file_too_large: "您的檔案應該小於 $1$",
      },
      help: {
          loading: "讀取幫助中...",
          close: "關閉幫助",
      },
      services: {
          default: {
              heading: "選擇一個影像",
          },
          local: {
              title: "選擇檔案",
              button: "選擇一個檔案",
              or: "或",
              drop: "拖曳檔案至此",
          },
          camera: {
              title: "相機",
              button: "點擊照片",
              switch: "切換照片",
              waiting: "等待權限授權中...",
              unableToRead: "我們無法從您的相機讀取影像，這可能是因為您拒絕了授予權限或是因為您的裝置不支援存取相機",
          },
          microlink: {
              button: "匯入 $1$",
              label: "$1$ $2$ 網址",
              placeholder: "請輸入一個 $1$ 的 $2$ 網址",
              type: "post",
          },
          url: {
              title: "網址",
              label: "影像網址",
              placeholder: "請輸入一個影像網址",
          },
          instagram: {
              title: "Instagram",
          },
          facebook: {
              title: "Facebook",
          },
          flickr: {
              title: "Flickr",
              type: "圖像",
          },
          ninegag: {
              title: "9GAG",
              type: "圖像",
          },
          deviantart: {
              title: "DeviantArt",
          },
          artstation: {
              title: "ArtStation",
          },
          twitter: {
              title: "Twitter",
              type: "影像推文",
          },
          pinterest: {
              title: "Pinterest",
              type: "釘文",
          },
          flipboard: {
              title: "Flipboard",
              type: "文章",
          },
          fotki: {
              title: "Fotki",
              type: "影像",
          },
          linkedin: {
              title: "LinkedIn",
          },
          reddit: {
              title: "Reddit",
          },
          tumblr: {
              title: "Tumblr",
          },
          weheartit: {
              title: "We Heart It",
          },
          screenshot: {
              title: "螢幕截圖",
              button: "擷取螢幕截圖",
              label: "網頁網址",
              placeholder: "請輸入一個網頁網址",
              loading: "正在擷取螢幕截圖...",
          },
          search: {
              button: "搜尋 $1$",
              label: "找一張影像",
              placeholder: "請輸入關鍵字",
              imagesPoweredBy: "影像由 $1$ 提供",
          },
          giphy: {
              title: "GIPHY",
          },
          unsplash: {
              title: "Unsplash",
          },
          pixabay: {
              title: "Pixabay",
          },
          pexels: {
              title: "Pexels",
          },
      },
      effects: {
          preview: {
              title: "預覽",
          },
          filters: {
              title: "濾鏡",
          },
          crop: {
              title: "剪裁",
              aspectRatios: {
                  free: "自由",
                  square: "正方形",
              },
          },
          rotate: {
              title: "旋轉",
          },
          flip: {
              title: "翻轉",
              buttons: {
                  horizontal: "水平",
                  vertical: "垂直",
              },
          },
          sharpen: {
              title: "銳化",
          },
          blur: {
              title: "模糊",
          },
          brightness: {
              title: "亮度",
          },
          contrast: {
              title: "對比",
          },
          grayscale: {
              title: "灰階",
          },
          "hue-rotate": {
              title: "色相旋轉",
          },
          invert: {
              title: "負片效果",
          },
          saturate: {
              title: "飽和度",
          },
          sepia: {
              title: "懷舊(黃褐色)",
          },
      },
  };

  const xhrUploader = ({ endpoint, fileKeyName = "file", method = "POST", responseKey = "url", responseFunction, settingsFunction, }) => {
      return (file, updateProgress) => new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append(fileKeyName, file);
          const xmlHttp = new XMLHttpRequest();
          xmlHttp.open(method, endpoint, true);
          if (typeof settingsFunction === "function")
              settingsFunction(xmlHttp);
          xmlHttp.addEventListener("progress", (event) => {
              if (typeof updateProgress === "function")
                  updateProgress(event.loaded / event.total);
          });
          xmlHttp.addEventListener("load", () => {
              const responseText = xmlHttp.responseText;
              if (typeof responseFunction === "function")
                  return resolve(responseFunction(responseText));
              const json = JSON.parse(responseText);
              return resolve(json[responseKey]);
          });
          xmlHttp.addEventListener("error", () => reject("errors.response_not_ok"));
          xmlHttp.addEventListener("abort", () => reject("errors.upload_aborted"));
          xmlHttp.send(formData);
      });
  };
  const fetchUploader = ({ endpoint, settingsFunction, method = "POST", fileKeyName = "file", responseKey = "url", responseFunction, }) => {
      return (file) => new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append(fileKeyName, file);
          window
              .fetch(endpoint, settingsFunction
              ? settingsFunction(file)
              : {
                  method,
                  body: formData,
              })
              .then((response) => {
              if (!response.ok)
                  throw new Error("errors.response_not_ok");
              return response.json();
          })
              .then((json) => {
              if (typeof responseFunction === "function")
                  return resolve(responseFunction(json));
              return resolve(json[responseKey]);
          })
              .catch(() => reject("errors.response_not_ok"));
      });
  };

  class Camera extends UpploadService {
      constructor() {
          super(...arguments);
          this.name = "camera";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M63 65l17-33c2-3 5-5 9-5h78c4 0 8 2 9 5l17 33h33c17 0 30 13 30 29v106c0 16-13 29-30 29H30c-17 0-30-13-30-29V94c0-16 13-29 30-29h33zm65 126c27 0 49-22 49-49 0-26-22-48-49-48s-49 22-49 48c0 27 22 49 49 49zm0-20c-16 0-30-13-30-29s14-28 30-28 30 12 30 28-14 29-30 29zm79-48c5 0 10-4 10-9 0-6-5-10-10-10-6 0-10 4-10 10 0 5 4 9 10 9z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#16a085";
          this.canvas = document.createElement("canvas");
          this.gotError = false;
          this.waiting = false;
          this.frontCamera = false;
          this.supports = () => !!(window.navigator.mediaDevices &&
              window.navigator.mediaDevices.enumerateDevices &&
              !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
          this.template = ({ translate }) => {
              return `
      <div class="service-main">
        <div class="camera-waiting">${translate("services.camera.waiting")}</div>
        <div class="camera-error">
          <p>${translate("services.camera.unableToRead")}</p>
          <p><a href="https://uppload.js.org/help/camera" target="_blank">${translate("needHelp")}</a></p>
        </div>
        <div class="camera-success">
          <video class="camera-stream"></video>
        </div>
      </div>
      <footer class="service-footer">
        <!--<button
          class="camera-switch uppload-button"
        >${translate("services.camera.switch")}</button>-->
        <button
          class="camera-click uppload-button uppload-button--cta"
          style="background: ${this.color}"
        >${translate("services.camera.button")}</button>
      </footer>
      <button class="need-help-link"><span>${translate("needHelp")}</span aria-hidden="true"><span>?</span></button>
    `;
          };
          this.stop = () => {
              if (this.stream)
                  this.stream.getTracks().forEach((track) => track.stop());
          };
          this.handlers = (params) => {
              this.waiting = true;
              this.update(params);
              const constraints = {
                  audio: false,
                  video: { width: 1280, height: 1280 },
              };
              this.startStream(params, constraints);
              const clickButton = params.uppload.container.querySelector(".camera-click");
              if (clickButton)
                  safeListen(clickButton, "click", this.clickPhoto.bind(this, params));
              const switchButton = params.uppload.container.querySelector(".camera-click");
              if (switchButton)
                  safeListen(switchButton, "click", this.switchCamera.bind(this, params));
              const helpButton = params.uppload.container.querySelector(".need-help-link");
              if (helpButton)
                  safeListen(helpButton, "click", () => params.showHelp("/services/camera"));
          };
      }
      update(params) {
          const waiting = params.uppload.container.querySelector(".camera-waiting");
          if (waiting) {
              waiting.style.display = "none";
              waiting.style.opacity = "0";
          }
          const error = params.uppload.container.querySelector(".camera-error");
          if (error) {
              error.style.display = "none";
              error.style.opacity = "0";
          }
          const success = params.uppload.container.querySelector(".camera-success");
          if (success) {
              success.style.display = "none";
              success.style.opacity = "0";
          }
          const footer = params.uppload.container.querySelector(".service-footer");
          if (footer) {
              footer.style.display = "none";
              footer.style.opacity = "0";
          }
          if (this.gotError) {
              if (error) {
                  error.style.display = "";
                  error.style.opacity = "1";
              }
          }
          else if (this.waiting) {
              if (waiting) {
                  waiting.style.display = "";
                  waiting.style.opacity = "1";
              }
          }
          else {
              if (success) {
                  success.style.display = "";
                  success.style.opacity = "1";
              }
              if (footer) {
                  footer.style.display = "";
                  footer.style.opacity = "1";
              }
          }
      }
      switchCamera(params) {
          this.frontCamera = !this.frontCamera;
          const constraints = {
              audio: false,
              video: {
                  width: 1280,
                  height: 1280,
                  facingMode: this.frontCamera ? "user" : "environment",
              },
          };
          this.startStream(params, constraints);
      }
      clickPhoto(params) {
          this.canvas = document.createElement("canvas");
          const video = params.uppload.container.querySelector("video.camera-stream");
          if (!video)
              return;
          if (!this.stream)
              return;
          const videoSize = video.getBoundingClientRect();
          let width = videoSize.width;
          let height = videoSize.height;
          this.stream.getTracks().forEach((track) => {
              const settings = track.getSettings();
              if (settings.width)
                  width = settings.width;
              if (settings.height)
                  height = settings.height;
          });
          this.canvas.width = width;
          this.canvas.height = height;
          const context = this.canvas.getContext("2d");
          if (!context)
              return;
          context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          context.drawImage(video, 0, 0, width, height);
          canvasToBlob(this.canvas).then((blob) => params.next(blobToUpploadFile(blob, `camera-photo-${Math.random().toString(36).slice(2)}.png`, "image/png", new Date())));
      }
      startStream(params, constraints) {
          this.stop();
          window.navigator.mediaDevices
              .getUserMedia(constraints)
              .then((mediaStream) => {
              this.stream = mediaStream;
              const video = params.uppload.container.querySelector("video.camera-stream");
              if (video) {
                  video.srcObject = mediaStream;
                  safeListen(video, "loadedmetadata", () => video.play());
                  fitImageToContainer(params, video);
              }
          })
              .catch(() => {
              this.gotError = true;
          })
              .then(() => {
              this.waiting = false;
              this.update(params);
          });
      }
  }

  const generateFileName = (file, service) => {
      file.name = `${service}-import-${Math.random().toString(36).slice(2)}`;
      return file;
  };
  class MicrolinkBaseClass extends UpploadService {
      constructor() {
          super(...arguments);
          this.loading = false;
          this.exampleURL = "";
          this.validator = () => true;
          this.template = ({ translate }) => {
              return `
      <div class="microlink-container">
      <form class="microlink-search-form">
        <div class="service-icon">${colorSVG(this.icon, this)}</div>
        <label>
          <span>${translate(`services.${this.name}.label`) ||
                translate("services.microlink.label", [
                    translate(`services.${this.name}.title`) || this.name,
                    translate(`services.${this.name}.type`) ||
                        translate("services.microlink.type"),
                ])}</span>
          <input class="microlink-search-input" type="url" placeholder="${translate(`services.${this.name}.placeholder`) ||
                translate("services.microlink.placeholder", [
                    translate(`services.${this.name}.title`) || this.name,
                    translate(`services.${this.name}.type`) ||
                        translate("services.microlink.type"),
                ]) ||
                ""}" required>
        </label>
        <button type="submit" style="background: ${this.color}">${translate(`services.${this.name}.button`) ||
                translate("services.microlink.button", translate(`services.${this.name}.title`) || this.name)}</button></form><button class="need-help-link"><span>${translate("needHelp")}</span aria-hidden="true"><span>?</span></button></div>
    <div class="uppload-loader microlink-loader">
    <div></div>
    <p>${translate(`services.${this.name}.loading`) ||
                translate("services.microlink.loading", translate(`services.${this.name}.title`) || this.name) ||
                translate("fetching", translate(`services.${this.name}.title`))}</p>
  </div>`;
          };
          this.handlers = (params) => {
              const form = params.uppload.container.querySelector(`.microlink-search-form`);
              if (form) {
                  safeListen(form, "submit", (event) => {
                      event.preventDefault();
                      const input = params.uppload.container.querySelector(`.microlink-search-input`);
                      if (input) {
                          const url = input.value;
                          if (!this.validator(url))
                              return params.handle(new Error("errors.invalid_url"));
                          this.loading = true;
                          this.update(params);
                          if (this.name === "screenshot") {
                              imageUrlToBlob(`https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`)
                                  .then((blob) => params.next(generateFileName(blobToUpploadFile(blob), this.name)))
                                  .catch((error) => params.handle(error))
                                  .then(() => (this.loading = false));
                          }
                          else if (this.name === "url") {
                              imageUrlToBlob(url)
                                  .then((blob) => params.next(generateFileName(blobToUpploadFile(blob), this.name)))
                                  .catch((error) => params.handle(error));
                          }
                          else {
                              cachedFetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
                                  .then((result) => {
                                  if (!result.data.image || !result.data.image.url)
                                      throw new Error("errors.response_not_ok");
                                  return result.data.image.url;
                              })
                                  .then((url) => imageUrlToBlob(url))
                                  .then((blob) => params.next(generateFileName(blobToUpploadFile(blob), this.name)))
                                  .catch((error) => params.handle(error));
                          }
                      }
                      return false;
                  });
              }
              const helpButton = params.uppload.container.querySelector(".need-help-link");
              if (helpButton)
                  safeListen(helpButton, "click", () => params.showHelp(`/services/${["url", "screenshot"].indexOf(this.name) !== -1
                    ? this.name
                    : `import-from-web-service/${this.name}`}`));
          };
      }
      update(params) {
          const loader = params.uppload.container.querySelector(".microlink-loader");
          const container = params.uppload.container.querySelector(".microlink-container");
          if (container)
              container.style.display = this.loading ? "none" : "";
          if (loader)
              loader.style.display = this.loading ? "flex" : "none";
      }
  }

  class Instagram extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "instagram";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M180.8.8a94 94 0 0131 6 62.7 62.7 0 0122.7 14.7 62.7 62.7 0 0114.7 22.7 94 94 0 016 31c.6 13.1.7 17.7.8 48.8v8c0 31.1-.2 35.7-.8 48.8a94 94 0 01-6 31 65.4 65.4 0 01-37.4 37.4 94 94 0 01-31 6c-13.1.6-17.7.7-48.8.8h-8c-31.1 0-35.7-.2-48.8-.8a94 94 0 01-31-6 62.7 62.7 0 01-22.7-14.7 62.7 62.7 0 01-14.7-22.7 94 94 0 01-6-31c-.6-12.9-.7-17.5-.8-47V123c0-30.2.2-34.8.8-47.8a94 94 0 016-31 62.7 62.7 0 0114.7-22.7A62.7 62.7 0 0144.2 6.8a94 94 0 0131-6 811 811 0 0147-.8H133c30.2 0 34.8.2 47.8.8zM132 26h-8.7c-23.4 0-27.1.1-37.4.6a74.9 74.9 0 00-24.7 4.8 50 50 0 00-18 11.7 50 50 0 00-11.8 18A74.9 74.9 0 0026.6 86c-.4 10.2-.6 13.9-.6 36.6v11c0 22.7.2 26.4.6 36.6a74.9 74.9 0 004.8 24.7 50 50 0 0011.7 18 50 50 0 0018 11.8 74.9 74.9 0 0024.8 4.8c10.5.5 14.1.6 38.9.6h6.4c24.8 0 28.4-.1 38.9-.6a74.9 74.9 0 0024.7-4.8 52.2 52.2 0 0029.8-29.8 74.9 74.9 0 004.8-24.7c.5-10.5.6-14.1.6-39v-6.3c0-24.8-.1-28.4-.6-38.9a74.9 74.9 0 00-4.8-24.7 50 50 0 00-11.7-18 50 50 0 00-18-11.8 74.9 74.9 0 00-24.8-4.8c-10.4-.5-14-.6-38.1-.6zm0 18.4c23.6 0 27 .1 37.2.6 10 .4 15.4 2 19 3.5 4.4 1.6 8.4 4.2 11.7 7.6 3.4 3.3 6 7.3 7.6 11.7 1.4 3.6 3 9 3.5 19 .5 10.2.6 13.6.6 37.3v7.8c0 23.7-.1 27-.6 37.3-.4 10-2 15.4-3.5 19a33.8 33.8 0 01-19.3 19.3c-3.6 1.4-9 3-19 3.5-10.3.5-13.7.6-38 .6h-7a643 643 0 01-37.4-.6c-10-.4-15.4-2-19-3.5a31.6 31.6 0 01-11.7-7.6c-3.4-3.3-6-7.3-7.6-11.7-1.4-3.6-3-9-3.5-19-.5-10.3-.6-13.7-.6-38v-7c0-23.8.1-27.2.6-37.4.4-10 2-15.4 3.5-19 1.6-4.4 4.2-8.4 7.6-11.7 3.3-3.4 7.3-6 11.7-7.6 3.6-1.4 9-3 19-3.5 10.2-.5 13.6-.6 37.3-.6zM128.4 75a52.5 52.5 0 100 105 52.5 52.5 0 000-105zm0 18.4a34 34 0 110 68.2 34 34 0 010-68.2zM182 62a12 12 0 100 24 12 12 0 000-24z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#cc3366";
          this.exampleURL = "https://www.instagram.com/p/Bu_T4RihQFB/";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(instagram|instagr)\.(com|am)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Facebook extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "facebook";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0c71 0 128 58 128 129 0 64-47 117-108 127v-89h30l6-38h-36v-24c0-10 5-20 21-20h16V53s-15-3-29-3c-29 0-48 18-48 50v29H75v37h1v1h32v89C47 246 1 194 0 131v-2C0 58 57 0 128 0z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#1b69f6";
          this.exampleURL = "https://www.facebook.com/elninotech/photos/a.2066268863489861/2066268886823192/?type=3&theater";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(facebook|fb)\.(com|me)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Local extends UpploadService {
      constructor({ mimeTypes, maxFileSize, } = {}) {
          super();
          this.name = "local";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path d="M177 56L125 4l-3-2v57h57c0-2-1-3-2-3z"/><path d="M173 113h8V75h-66c-5 0-8-4-8-8V1H27c-4 0-8 4-8 8v184c0 4 4 8 8 8h65v-8c0-45 36-80 81-80z"/><path d="M173 128c-36 0-65 29-65 64s29 64 65 64c35 0 64-29 64-64s-29-64-64-64zm27 63h-14v33c0 2-2 3-4 3h-20c-2 0-3-1-3-3v-33h-14c-3 0-5-3-3-5l28-30c1-2 3-2 5 0l27 30c2 2 1 5-2 5z"/></g></svg>`;
          this.color = "#34495e";
          this.mimeTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];
          this.maxFileSize = Infinity;
          this.template = (params) => {
              return `<div class="drop-area">
      <div>${params.translate("services.local.drop")}</div>
      <em>${params.translate("services.local.or")}</em>
      <button class="uppload-button uppload-button--cta" style="background: ${this.color}">${params.translate("services.local.button")}</button>
    </div>
      <div class="alternate-input">
        <input type="file" accept="${this.mimeTypes.join()}"${params.uppload.settings.multiple ? " multiple" : ""}></div><button class="need-help-link"><span>${translate("needHelp")}</span aria-hidden="true"><span>?</span></button>`;
          };
          this.handlers = (params) => {
              const dropArea = params.uppload.container.querySelector(".drop-area");
              if (dropArea) {
                  safeListen(dropArea, "drop", (event) => this.dropHandler(params, event));
                  safeListen(dropArea, "dragover", (event) => this.dragHandler(params, event));
                  safeListen(dropArea, "dragend", (event) => this.dragStop(params, event));
                  safeListen(dropArea, "dragexit", (event) => this.dragStop(params, event));
                  safeListen(dropArea, "dragleave", (event) => this.dragStop(params, event));
                  safeListen(dropArea, "click", (event) => this.fileSelect(params, event));
              }
              const input = params.uppload.container.querySelector(".alternate-input input[type=file]");
              if (input)
                  safeListen(input, "change", (event) => this.getFile(params, event));
              const helpButton = params.uppload.container.querySelector(".need-help-link");
              if (helpButton)
                  safeListen(helpButton, "click", () => params.showHelp("/services/local"));
          };
          if (mimeTypes)
              this.mimeTypes = mimeTypes;
          if (maxFileSize)
              this.maxFileSize = maxFileSize;
      }
      getFile(params, event) {
          event.preventDefault();
          const files = event.target.files;
          let file = null;
          if (files) {
              if (params.uppload.settings.multiple && files.length > 1)
                  return params.uploadMultiple(Array.from(files));
              for (let i = 0; i < files.length; i++) {
                  const item = files[i];
                  if (this.mimeTypes.indexOf(item.type) !== -1)
                      if (item.size < this.maxFileSize)
                          file = item;
                      else
                          params.handle(new Error(params.translate("errors.file_too_large", `${this.maxFileSize} bytes`)));
              }
          }
          if (!file)
              return;
          if (file)
              params.next({
                  blob: file,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified
                      ? new Date(file.lastModified)
                      : undefined,
                  name: file.name,
              });
      }
      fileSelect(params, event) {
          const input = params.uppload.container.querySelector(".alternate-input input[type=file]");
          if (input)
              input.click();
      }
      dragStop(params, event) {
          const dropArea = params.uppload.container.querySelector(".drop-area");
          if (dropArea)
              dropArea.classList.remove("drop-area-active");
      }
      dragHandler(params, event) {
          event.preventDefault();
          const dropArea = params.uppload.container.querySelector(".drop-area");
          if (dropArea)
              dropArea.classList.add("drop-area-active");
      }
      dropHandler(params, event) {
          event.preventDefault();
          this.dragStop(params, event);
          let file = null; // getAsFile() returns File | null
          if (event.dataTransfer && event.dataTransfer.items) {
              for (let i = 0; i < event.dataTransfer.items.length; i++) {
                  const item = event.dataTransfer.items[i];
                  if (item.kind === "file" && this.mimeTypes.indexOf(item.type) !== -1) {
                      file = item.getAsFile();
                      if (!file || file.size > this.maxFileSize) {
                          file = null;
                          params.handle(new Error(params.translate("errors.file_too_large", `${this.maxFileSize} bytes`)));
                      }
                  }
              }
          }
          if (!file)
              return;
          if (file)
              params.next({
                  blob: file,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified
                      ? new Date(file.lastModified)
                      : undefined,
                  name: file.name,
              });
      }
  }

  const generateFileName$1 = (file, service, query) => {
      file.name = `${query || `${service}-import`}-${Math.random()
        .toString(36)
        .slice(2)}.jpg`;
      file.type = "image/jpeg";
      return file;
  };
  class SearchBaseClass extends UpploadService {
      constructor({ apiKey, name, icon, color, poweredByUrl, popularEndpoint, searchEndpoint, getButton, getPopularResults, getSearchResults, noRecolor, fetchSettings, }) {
          super();
          this.results = [];
          this.loading = false;
          this.noRecolor = false;
          this.template = ({ translate }) => {
              return `
      <div class="search-container"><form class="search-search-form">
      <div class="service-icon">${colorSVG(this.icon, this)}</div>
      <label><span>${translate(`services.${this.name}.label`) ||
                translate("services.search.label")}</span>
        <input class="search-search-input" type="search" placeholder="${translate(`services.search.placeholder`)}" required></label>
        <button type="submit" style="background: ${this.color}">${translate(`services.search.button`, translate(`services.${this.name}.title`))}</button>
      </form>
      <div class="search-images"></div>
      <p class="search-footer">${translate("services.search.imagesPoweredBy", `<a href="${this.poweredByUrl}" target="_blank">${translate(`services.${this.name}.title`)}</a>`)}</p></div>
      <button class="need-help-link"><span>${translate("needHelp")}</span aria-hidden="true"><span>?</span></button>
      <div class="uppload-loader search-loader">
        <div></div>
        <p>${translate("fetching", translate(`services.${this.name}.title`))}</p>
      </div>
    `;
          };
          this.handlers = (params) => {
              const form = params.uppload.container.querySelector(`.search-search-form`);
              if (form) {
                  safeListen(form, "submit", (event) => {
                      const input = params.uppload.container.querySelector(`.search-search-input`);
                      if (input) {
                          const query = input.value;
                          cachedFetch(this.searchEndpoint(this.apiKey, query), this.fetchSettings)
                              .then((json) => {
                              this.results = this.getSearchResults(json);
                              this.update(params);
                          })
                              .catch(() => params.handle(new Error("errors.unable_to_search")));
                      }
                      event.preventDefault();
                      return false;
                  });
              }
              this.updateImages(params);
              const imageButtons = params.uppload.container.querySelectorAll(".search-images button");
              imageButtons.forEach((image) => {
                  safeListen(image, "click", () => {
                      const url = image.getAttribute("data-full-url");
                      this.loading = true;
                      this.update(params);
                      if (url)
                          imageUrlToBlob(url)
                              .then((blob) => params.next(generateFileName$1(blobToUpploadFile(blob), this.name, image.getAttribute("aria-label"))))
                              .catch((error) => params.handle("errors.response_not_ok"))
                              .then(() => (this.loading = false));
                  });
              });
              const helpButton = params.uppload.container.querySelector(".need-help-link");
              if (helpButton)
                  safeListen(helpButton, "click", () => params.showHelp(`/services/search/${this.name}`));
          };
          this.name = name;
          this.icon = icon;
          this.color = color;
          this.apiKey = apiKey;
          this.noRecolor = !!noRecolor;
          this.poweredByUrl = poweredByUrl;
          this.popularEndpoint = popularEndpoint(this.apiKey);
          this.searchEndpoint = searchEndpoint;
          this.getButton = getButton;
          this.getPopularResults = getPopularResults;
          this.getSearchResults = getSearchResults;
          if (fetchSettings)
              this.fetchSettings = fetchSettings(this.apiKey);
          if (this.popularEndpoint)
              cachedFetch(this.popularEndpoint, this.fetchSettings)
                  .then((photos) => {
                  this.results = this.getPopularResults(photos);
              })
                  .catch(() => { });
      }
      updateImages(params) {
          const imagesContainer = params.uppload.container.querySelector(".search-images");
          if (imagesContainer) {
              imagesContainer.innerHTML = `
        ${this.results.map((result) => this.getButton(result)).join("\n")}
      `;
          }
      }
      update(params) {
          this.updateImages(params);
          if (params)
              this.handlers(params);
          const loader = params.uppload.container.querySelector(".search-loader");
          const container = params.uppload.container.querySelector(".search-container");
          if (container)
              container.style.display = this.loading ? "none" : "";
          if (loader)
              loader.style.display = this.loading ? "flex" : "none";
      }
  }

  class GIPHY extends SearchBaseClass {
      constructor(apiKey) {
          super({
              apiKey,
              name: "giphy",
              icon: `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill-rule="nonzero" fill="none"><path fill="#000" d="M54 29h149v198H54z"/><path fill="#04FF8E" d="M24 22h30v212H24z"/><path fill="#8E2EFF" d="M203 80h30v154h-30z"/><path fill="#00C5FF" d="M24 227h209v29H24z"/><path fill="#FFF152" d="M24 0h119v29H24z"/><path fill="#FF5B5B" d="M203 59V29h-30V0h-30v88h90V59"/><path fill="#551C99" d="M203 117V88h30"/><path fill="#999131" d="M143 0v29h-29"/></g></svg>`,
              color: "#a800ff",
              noRecolor: true,
              poweredByUrl: "https://giphy.com",
              popularEndpoint: (apiKey) => `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=18&rating=G`,
              searchEndpoint: (apiKey, query) => `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=18&offset=0&rating=G&lang=en`,
              getButton: (image) => `<div class="result">
        <button aria-label="${image.title}" data-full-url="${image.images.downsized_large.url}" style="background-image: url('${image.images.preview_gif.url}')"></button></div>`,
              getSearchResults: (response) => response.data,
              getPopularResults: (response) => response.data,
          });
      }
  }

  class Pixabay extends SearchBaseClass {
      constructor(apiKey) {
          super({
              apiKey,
              name: "pixabay",
              icon: `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M137 91c5 30-13 60-40 72-16 8-35 6-52 6H27v56H0V96a69 69 0 0169-65c33-1 65 26 68 60zm13-55l33 48h1l33-48h33l-46 68 52 71h-34l-38-52h-1l-38 52h-34l52-71-46-68h33zM33 80c-7 12-5 26-5 39v23h41c19 0 38-15 41-35 4-19-9-40-28-46-18-7-40 2-49 19z" fill="#000" fill-rule="nonzero"/></svg>`,
              color: "#2ec66d",
              poweredByUrl: "https://pixabay.com",
              popularEndpoint: (apiKey) => `https://pixabay.com/api/?key=${apiKey}&per_page=18&image_type=photo`,
              searchEndpoint: (apiKey, query) => `https://pixabay.com/api/?key=${apiKey}&per_page=18&q=${encodeURIComponent(query)}&image_type=photo`,
              getButton: (image) => `<div class="result">
        <button aria-label="${image.tags}" data-full-url="${image.largeImageURL}" style="background-image: url('${image.previewURL}')"></button><small class="author">
        <img alt="" src="${image.userImageURL}">
        <span>${image.user}</span>
      </small></div>`,
              getSearchResults: (response) => response.hits,
              getPopularResults: (response) => response.hits,
          });
      }
  }

  class Unsplash extends SearchBaseClass {
      constructor(apiKey) {
          super({
              apiKey,
              name: "unsplash",
              icon: `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M81 113v72h94v-72h81v143H0V113h81zM175 0v71H81V0h94z" fill="#000" fill-rule="evenodd"/></svg>`,
              color: "#333",
              poweredByUrl: "https://unsplash.com",
              popularEndpoint: (apiKey) => `https://api.unsplash.com/photos?client_id=${apiKey}`,
              searchEndpoint: (apiKey, query) => `https://api.unsplash.com/search/photos?client_id=${this.apiKey}&page=1&query=${encodeURIComponent(query)}`,
              getButton: (image) => `<div class="result">
        <button aria-label="${image.alt_description || image.description}" data-full-url="${image.urls.regular}" style="background-image: url('${image.urls.thumb}')"></button>
        <small class="author">
          <img alt="" src="${image.user.profile_image.small}">
          <span>${image.user.name}</span>
        </small>
      </div>`,
              getSearchResults: (response) => response.results,
              getPopularResults: (response) => response,
          });
      }
  }

  class Pexels extends SearchBaseClass {
      constructor(apiKey) {
          super({
              apiKey,
              name: "pexels",
              icon: `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M21 0h-4v255l72 1h71v-35l1-35 4-1a97 97 0 0053-33 81 81 0 0013-22l7-22v-3-23-2l-1-3v-2a95 95 0 00-42-60l-3-3-13-6a98 98 0 00-30-6H21zm130 37a85 85 0 008 1l11 5a57 57 0 0131 62c-5 23-23 41-45 45l-20 1h-12v68H53v-91l1-91h97z" fill="#000" fill-rule="nonzero"/></svg>`,
              color: "#05a081",
              poweredByUrl: "https://pexels.com",
              popularEndpoint: (apiKey) => `https://api.pexels.com/v1/curated?per_page=9&page=1`,
              searchEndpoint: (apiKey, query) => `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&page=1`,
              getButton: (image) => `<div class="result">
        <button aria-label="${image.photographer || ""}" data-full-url="${image.src.large2x}" style="background-image: url('${image.src.tiny}')"></button><small class="author">
        <span>${image.photographer}</span>
      </small></div>`,
              getSearchResults: (response) => response.photos,
              getPopularResults: (response) => response.photos,
              fetchSettings: (apiKey) => ({
                  headers: {
                      Authorization: apiKey,
                  },
              }),
          });
      }
  }

  class URL$1 extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "url";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path d="M200 151l36-36a67 67 0 10-95-95L89 72a67 67 0 0012 105l28-28a31 31 0 01-14-51l52-52a31 31 0 0143 43l-15 15c6 15 8 31 5 47z"/><path d="M56 105l-36 36a67 67 0 1095 95l52-52a67 67 0 00-12-105l-28 28a31 31 0 0114 51l-52 52a31 31 0 01-43-43l15-15c-6-15-8-31-5-47z"/></g></svg>`;
          this.color = "#8e44ad";
      }
  }

  class Screenshot extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "screenshot";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M189 256h-25v-54h39v-38h53v92h-67zM0 210v-46h53v38h40v54H0v-46zm151-34h-10v-20h15v-15h20v35h-25zm-71-17v-18h20v15h15v20H80v-17zm0-62V80h35v20h-15v15H80V97zm76 10v-7h-15V80h35v35h-20v-8zM0 46V0h93v53H53v39H0V46zm203 27V53h-39V0h92v92h-53V73z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#e67e22";
      }
  }

  class Flickr extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "flickr";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill-rule="nonzero" fill="none"><path d="M117 128a59 59 0 11-118 0 59 59 0 01118 0z" fill="#0063DC"/><path d="M257 128a59 59 0 11-118 0 59 59 0 01118 0z" fill="#FF0084"/></g></svg>`;
          this.noRecolor = true;
          this.color = "#ff0084";
          this.exampleURL = "https://www.flickr.com/photos/renewolf/26111951000/";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(flickr|flic)\.(com|kr)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Pinterest extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "pinterest";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0a128 128 0 00-47 247c-1-10-2-25 1-36l15-64s-4-8-4-19c0-18 10-31 23-31 11 0 16 8 16 18 0 11-7 27-11 43-3 12 7 23 19 23 23 0 41-24 41-59 0-31-22-52-54-52-36 0-58 27-58 55 0 11 5 23 10 30l1 3-4 15c0 2-1 3-4 1-16-7-26-30-26-49 0-41 30-78 85-78 44 0 79 32 79 74 0 44-28 80-67 80-13 0-25-7-29-15l-8 31c-3 11-11 25-16 33A128 128 0 10128 0z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#e60023";
          this.exampleURL = "https://pinterest.com/pin/437201076327078006/";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(pinterest|pin)\.(com|it)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class DeviantArt extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "deviantart";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#000" fill-rule="nonzero" d="M208 44V0h-49l-2 5-22 35-7 9H49v66h44l5 5-49 89v47h49l2-5 24-42 4-6h80v-62h-44l-5-4z"/></svg>`;
          this.color = "#00d159";
          this.exampleURL = "https://www.deviantart.com/artbycatherineradley/art/Despair-820869682";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(deviantart|fav)\.(com|me)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class NineGag extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "ninegag";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M16 64L128 0l111 64v128l-111 64-112-64 44-26 68 39c22-13 45-25 67-39v-51l-67 39L16 90V64zm66 13l46 26 45-26-45-26-46 26z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#000";
          this.exampleURL = "https://9gag.com/gag/awoBXb8";
          this.validator = (input) => /(https?:\/\/(.+?\.)?9gag\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class ArtStation extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "artstation";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M158 189l30 51H45c-10 0-19-5-23-14L0 189h158zM100 15h45c10 0 18 5 23 13v1l84 146a26 26 0 01-1 29v1l-21 35L100 15h45zM79 51l58 101H21L79 51z" fill="#000" fill-rule="evenodd"/></svg>`;
          this.color = "#3ea2cf";
          this.exampleURL = "https://www.artstation.com/artwork/VdGOkZ";
          this.validator = (input) => /(https?:\/\/(.+?\.)?artstation\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Twitter extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "twitter";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M81 232A148 148 0 00230 76c10-8 19-17 26-27-9 4-20 7-30 8 11-7 19-17 23-29-10 6-21 10-33 13a52 52 0 00-90 47C82 86 44 65 18 34a52 52 0 0016 70c-9-1-17-3-24-7v1c0 25 18 47 42 51a53 53 0 01-23 1c6 21 26 36 49 37a105 105 0 01-78 21c23 15 51 24 81 24" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#1da1f2";
          this.exampleURL = "https://twitter.com/elninoict/status/1106176415622418433";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(twitter|t)\.(co|com)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Flipboard extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "flipboard";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path opacity=".8" d="M85 85h85v85H85z"/><path opacity=".9" d="M85 0h171v85H85z"/><path d="M0 0h85v256H0z"/></g></svg>`;
          this.color = "#e12828";
          this.exampleURL = "https://flipboard.com/@bbcfuture/how-climate-change-could-kill-the-red-apple/f-c8d499b4ca%2Fbbc.com";
          this.validator = (input) => /(https?:\/\/(.+?\.)?(flipboard|flip)\.(com|it)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Fotki extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "fotki";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M188 105c-2-10-8-16-17-18l4-1c15-4 20-13 17-28l-7-38c-3-17-13-20-21-20l-19 4-77 22c-5 2-12 4-16 11-3 6-2 14-1 19l53 183c3 11 10 17 20 17h4l28-8c12-3 18-13 16-24l-3-11-13-67 3-1 13-3c13-3 19-12 17-25l-1-12zm-29 28l-22 5-5 2 13 64 5 25c1 5-2 9-7 11l-17 4c-5 1-9-2-11-8l-14-51L63 52c-3-9-1-12 8-14l77-22c9-3 13 0 15 9l8 39c1 8-1 11-9 14l-43 12 5 18 30-6c7-1 10 2 12 9l1 10c1 7-1 11-8 12z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#5471B9";
          this.exampleURL = "https://public.fotki.com/EricAnke/holland/molens/20170928-162510.html";
          this.validator = (input) => /(https?:\/\/(.+?\.)?fotki\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class LinkedIn extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "linkedin";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M19 256h218c10 0 19-8 19-18V18c0-10-8-18-19-18H19C9 0 0 8 0 18v220c0 10 8 18 19 18h218zM58 83c-13 0-21-9-21-20s8-20 22-20c13 0 21 9 21 20s-8 20-22 20zm80 131H99V99h39v16c5-8 14-19 34-19h1c25 0 44 17 44 52v66h-39v-62c0-15-5-26-19-26-11 0-17 7-20 14l-1 10v64zm-60 0H39V99h39v115zm60-99h-1 1z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#0e76a8";
          this.exampleURL = "https://www.linkedin.com/posts/explorius-vastgoedontwikkeling-b-v-_el-nino-huurt-kantoor-in-enschede-activity-6480386878641180672-7DC_";
          this.validator = (input) => /(https?:\/\/(.+?\.)?linkedin\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Reddit extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "reddit";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M152 164v3c-5 5-13 7-24 7s-19-2-24-7v-3h3c4 4 11 6 21 6s17-2 21-6h3zm-37-26a10 10 0 00-20 0 10 10 0 0020 0zm141-10a128 128 0 11-256 0 128 128 0 01256 0zm-53-1a17 17 0 00-28-12c-12-8-27-12-44-13l10-29 25 6h-1a14 14 0 0028 0 13 13 0 00-27-5l-26-6c-2 0-3 0-3 2l-11 32c-17 0-33 5-45 13a16 16 0 00-28 12c0 6 4 11 9 14l-1 5c0 24 30 44 67 44 36 0 66-20 66-44v-5c5-3 9-8 9-14zm-52 1c-6 0-10 5-10 10a10 10 0 0020 0c0-5-5-10-10-10z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#ff4301";
          this.exampleURL = "https://www.reddit.com/r/thenetherlands/comments/dz1myk/a_beautiful_morning_in_ermelo/";
          this.validator = (input) => /(https?:\/\/(.+?\.)?reddit\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Tumblr extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "tumblr";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M164 209c-21 0-25-15-26-25v-76h49V65h-48V0h-39l-2 2c-2 20-11 55-51 69v37h30v80c0 28 18 69 75 68 19 0 41-8 45-15l-12-37c-5 3-14 5-21 5z" fill="#000" fill-rule="evenodd"/></svg>`;
          this.color = "#34526f";
          this.exampleURL = "https://germanpostwarmodern.tumblr.com/post/186653088149/cubicus-building-of-twente-university-1969-73-in";
          this.validator = (input) => /(https?:\/\/(.+?\.)?tumblr\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class WeHeartIt extends MicrolinkBaseClass {
      constructor() {
          super(...arguments);
          this.name = "weheartit";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M231 36c-18-16-40-23-64-13-12 5-24 11-34 20l-5 5-5-5c-10-8-20-15-31-20s-22-8-35-6C25 22-2 56 0 89l1 15c5 31 22 55 44 77a364 364 0 0083 59l5-3c23-13 45-28 65-45 21-20 40-41 51-68 13-34 8-66-18-88z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.color = "#ff5464";
          this.exampleURL = "https://weheartit.com/entry/221671573";
          this.validator = (input) => /(https?:\/\/(.+?\.)?weheartit\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(input);
      }
  }

  class Crop extends UpploadEffect {
      constructor({ aspectRatio, aspectRatioOptions, hideAspectRatioSettings, autoCropArea, viewMode, } = {}) {
          super();
          this.name = "crop";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M74 0v182h134v-25h-26V74H99V48h96c4 0 7 1 9 4 3 2 4 5 4 9v121h48v26h-48v48h-26v-48H61a13 13 0 01-13-13V74H0V48h48V0h26z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.aspectRatio = NaN;
          this.hideAspectRatioSettings = false;
          this.aspectRatioOptions = {
              free: NaN,
              square: 1,
              "16:9": 16 / 9,
          };
          this.autoCropArea = 1;
          this.viewMode = 1;
          this.originalFile = { blob: new Blob() };
          this.template = ({ file, translate }) => {
              const image = URL.createObjectURL(file.blob);
              this.originalFile = file;
              return `
      <div class="uppload-cropping-element">
        <img style="width: 20px" alt="" src="${image}">
      </div>
      ${!this.aspectRatio && !this.hideAspectRatioSettings
                ? `<div class="uppload-actions">
        ${Object.keys(this.aspectRatioOptions)
                    .map((aspectRatio, index) => `
          <input value="${this.aspectRatioOptions[aspectRatio]}" data-name="${aspectRatio}" name="crop-aspect-ratio" type="radio"${!index ? " checked" : ""} id="crop-aspect-ratio-${aspectRatio}">
          <label for="crop-aspect-ratio-${aspectRatio}">${translate(`effects.crop.aspectRatios.${aspectRatio}`) ||
                    aspectRatio}</label>`)
                    .join("")}
      </div>`
                : ""}
    `;
          };
          this.handlers = (params) => {
              const cropperElement = params.uppload.container.querySelector(".uppload-cropping-element img");
              const originalFile = this.originalFile;
              const type = originalFile.type &&
                  ["image/jpeg", "image/webp"].indexOf(originalFile.type) !== -1
                  ? originalFile.type
                  : "image/png";
              if (cropperElement) {
                  fitImageToContainer(params, cropperElement).then(() => {
                      const cropper = new Cropper(cropperElement, {
                          aspectRatio: this.aspectRatio,
                          autoCropArea: this.autoCropArea,
                          viewMode: this.viewMode,
                          ready() {
                              canvasToBlob(cropper.getCroppedCanvas(), type).then((blob) => {
                                  originalFile.blob = blob;
                                  params.next(originalFile);
                              });
                          },
                          cropend() {
                              canvasToBlob(cropper.getCroppedCanvas(), type).then((blob) => {
                                  originalFile.blob = blob;
                                  params.next(originalFile);
                              });
                          },
                      });
                      const aspectRatios = params.uppload.container.querySelectorAll("input[name='crop-aspect-ratio']");
                      aspectRatios.forEach((aspectRatio) => {
                          safeListen(aspectRatio, "change", () => {
                              const selectedAspectRatio = params.uppload.container.querySelector("input[name='crop-aspect-ratio']:checked");
                              if (selectedAspectRatio) {
                                  cropper.setAspectRatio(this.aspectRatioOptions[selectedAspectRatio.getAttribute("data-name") || "free"]);
                                  canvasToBlob(cropper.getCroppedCanvas(), type).then((blob) => {
                                      originalFile.blob = blob;
                                      params.next(originalFile);
                                  });
                              }
                          });
                      });
                  });
              }
          };
          if (aspectRatio)
              this.aspectRatio = aspectRatio;
          if (aspectRatioOptions)
              this.aspectRatioOptions = aspectRatioOptions;
          if (autoCropArea)
              this.autoCropArea = autoCropArea;
          if (viewMode)
              this.viewMode = viewMode;
          if (hideAspectRatioSettings)
              this.hideAspectRatioSettings = hideAspectRatioSettings;
      }
  }

  class Rotate extends UpploadEffect {
      constructor() {
          super(...arguments);
          this.name = "rotate";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M139 37a110 110 0 014 218v-37a73 73 0 00-4-144v36L66 55l73-55v37zM61 234c15 11 33 18 52 21v-37c-9-2-18-6-25-11l-27 27zm-20-21c-12-15-19-33-22-52h37c2 9 6 18 11 26l-26 26zM40 81c-11 14-19 32-21 51h37c2-11 7-21 13-29L40 81z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.value = 0;
          this.max = 360;
          this.unit = "deg";
          this.originalFile = { blob: new Blob() };
          this.template = ({ file, translate }) => {
              const image = URL.createObjectURL(file.blob);
              this.originalFile = file;
              return `
      <div class="uppload-rotating-element">
        <img style="width: 20px" alt="" src="${image}">
      </div>
      <div class="settings">
        <input type="range" value="${this.value}" min="0" max="${this.max}">
        <span class="value"><span>0</span>${translate(`units.${this.unit}`) || this.unit}</span>
      </div>
    `;
          };
          this.handlers = (params) => {
              const rotatorElement = params.uppload.container.querySelector(".uppload-rotating-element img");
              const originalFile = this.originalFile;
              if (rotatorElement) {
                  fitImageToContainer(params, rotatorElement).then(() => {
                      const rotator = new Cropper(rotatorElement, {
                          autoCropArea: 1,
                          viewMode: 1,
                          dragMode: "none",
                          cropBoxMovable: false,
                          cropBoxResizable: false,
                          toggleDragModeOnDblclick: false,
                          ready() {
                              params.uppload.emitter.emit("processing");
                              canvasToBlob(rotator.getCroppedCanvas()).then((blob) => {
                                  originalFile.blob = blob;
                                  params.uppload.emitter.emit("process");
                                  params.next(originalFile);
                              });
                          },
                      });
                      const range = params.uppload.container.querySelector(".settings input[type='range']");
                      if (range)
                          safeListen(range, "change", () => {
                              let value = 0;
                              const range = params.uppload.container.querySelector(".settings input[type='range']");
                              if (range)
                                  value = parseInt(range.value);
                              const displayer = params.uppload.container.querySelector(".settings .value span");
                              if (displayer)
                                  displayer.innerHTML = value.toString();
                              rotator.rotate(value - this.value);
                              this.value = value;
                              params.uppload.emitter.emit("processing");
                              canvasToBlob(rotator.getCroppedCanvas()).then((blob) => {
                                  originalFile.blob = blob;
                                  params.uppload.emitter.emit("process");
                                  params.next(originalFile);
                              });
                          });
                  });
              }
          };
      }
  }

  class Flip extends UpploadEffect {
      constructor() {
          super(...arguments);
          this.name = "flip";
          this.originalfileURL = "";
          this.originalFile = { blob: new Blob() };
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M153 0v256h103L153 0zM0 256h103V0L0 256z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.canvas = document.createElement("canvas");
          this.template = ({ file, translate }) => {
              const image = URL.createObjectURL(file.blob);
              this.originalfileURL = image;
              this.originalFile = file;
              return `
      <div class="uppload-flip">
        <img style="width: 20px" alt="" src="${image}">
      </div>
      <div class="settings">
        <button class="flip-btn-horizontal">${translate("effects.flip.buttons.horizontal")}</button>
        <button class="flip-btn-vertical">${translate("effects.flip.buttons.vertical")}</button>
      </div>
    `;
          };
          this.handlers = (params) => {
              const img = params.uppload.container.querySelector(".uppload-flip img");
              if (img) {
                  fitImageToContainer(params, img).then(() => {
                      const horizontal = params.uppload.container.querySelector(".settings button.flip-btn-horizontal");
                      if (horizontal)
                          safeListen(horizontal, "click", this.update.bind(this, params, true, false));
                      const vertical = params.uppload.container.querySelector(".settings button.flip-btn-vertical");
                      if (vertical)
                          safeListen(vertical, "click", this.update.bind(this, params, false, true));
                  });
              }
          };
      }
      imageToCanvasBlob(params, flipH = false, flipV = false) {
          return new Promise((resolve) => {
              params.uppload.emitter.emit("processing");
              const scaleH = flipH ? -1 : 1;
              const scaleV = flipV ? -1 : 1;
              this.canvas = document.createElement("canvas");
              const image = document.createElement("img");
              image.src = this.originalfileURL;
              image.onload = () => {
                  this.canvas.width = image.width;
                  this.canvas.height = image.height;
                  const posX = flipH ? image.width * -1 : 0;
                  const posY = flipV ? image.height * -1 : 0;
                  const context = this.canvas.getContext("2d");
                  if (!context)
                      return;
                  context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                  context.scale(scaleH, scaleV);
                  context.drawImage(image, posX, posY);
                  canvasToBlob(this.canvas).then((blob) => {
                      const image = URL.createObjectURL(blob);
                      this.originalfileURL = image;
                      params.uppload.emitter.emit("process");
                      return resolve(blob);
                  });
              };
          });
      }
      update(params, x, y) {
          const img = params.uppload.container.querySelector(".uppload-flip img");
          if (!img)
              return;
          this.imageToCanvasBlob(params, x, y).then((blob) => {
              if (!blob)
                  return;
              let file = this.originalFile;
              file.blob = blob;
              params.next(file);
              const image = URL.createObjectURL(blob);
              img.setAttribute("src", image);
          });
      }
  }

  class Preview extends UpploadEffect {
      constructor() {
          super(...arguments);
          this.name = "preview";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 18)" fill="#000" fill-rule="nonzero"><path d="M244 40h-29V10c0-6-5-10-10-10H10C4 0 0 4 0 10v160c0 5 4 10 10 10h29v30c0 6 4 10 9 10h195c6 0 10-4 10-10V50c0-5-4-10-9-10zm-10 136l-40-45c-4-5-11-5-15 0l-17 19-38-45c-4-5-13-5-17 0l-49 58V60h176v116zM19 160V20h176v20H49c-6 0-10 5-10 10v110H19z"/><ellipse cx="202.5" cy="94" rx="15.5" ry="16"/></g></svg>`;
          this.template = ({ file }) => {
              const image = URL.createObjectURL(file.blob);
              return `
      <div class="uppload-preview-element">
        <img style="width: 20px" alt="" src="${image}">
      </div>
    `;
          };
          this.handlers = (params) => {
              const image = params.uppload.container.querySelector(".uppload-preview-element img");
              if (image)
                  fitImageToContainer(params, image);
          };
      }
  }

  class UpploadFilterBaseClass extends UpploadEffect {
      constructor() {
          super(...arguments);
          this.canvas = document.createElement("canvas");
          this.originalfileURL = "";
          this.originalFile = { blob: new Blob() };
          this.cssFilter = "";
          this.max = 10;
          this.unit = "px";
          this.value = 0;
          this.supports = () => {
              var _a;
              return !!(this.canvas.getContext &&
                  this.canvas.getContext("2d") &&
                  typeof ((_a = this.canvas.getContext("2d")) === null || _a === void 0 ? void 0 : _a.filter) === "string");
          };
          this.template = ({ file, translate }) => {
              const image = URL.createObjectURL(file.blob);
              this.originalfileURL = image;
              this.originalFile = file;
              return `
      <div class="uppload-hue-image">
        <img style="width: 20px" alt="" src="${image}">
      </div>
      <div class="settings">
        <input type="range" value="${this.value}" min="0" max="${this.max}">
        <span class="value"><span>0</span>${translate(`units.${this.unit}`) || this.unit}</span>
      </div>
    `;
          };
          this.handlers = (params) => {
              const hueElement = params.uppload.container.querySelector(".uppload-hue-image img");
              if (hueElement) {
                  fitImageToContainer(params, hueElement).then(() => {
                      const range = params.uppload.container.querySelector(".settings input[type='range']");
                      if (range)
                          safeListen(range, "change", this.update.bind(this, params));
                  });
              }
          };
      }
      imageToCanvasBlob(params, filters) {
          params.uppload.emitter.emit("processing");
          return new Promise((resolve) => {
              this.canvas = document.createElement("canvas");
              const image = document.createElement("img");
              image.src = this.originalfileURL;
              image.onload = () => {
                  this.canvas.width = image.width;
                  this.canvas.height = image.height;
                  const context = this.canvas.getContext("2d");
                  if (!context)
                      return;
                  context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                  context.filter = filters;
                  context.drawImage(image, 0, 0);
                  canvasToBlob(this.canvas).then((blob) => {
                      params.uppload.emitter.emit("process");
                      return resolve(blob);
                  });
              };
          });
      }
      update(params) {
          let value = 0;
          const range = params.uppload.container.querySelector(".settings input[type='range']");
          if (range)
              value = parseInt(range.value);
          const displayer = params.uppload.container.querySelector(".settings .value span");
          if (displayer)
              displayer.innerHTML = value.toString();
          const hueElement = params.uppload.container.querySelector(".uppload-hue-image img");
          if (!hueElement)
              return;
          this.imageToCanvasBlob(params, `${this.cssFilter}(${range.value}${this.unit})`).then((blob) => {
              if (!blob)
                  return;
              this.originalFile.blob = blob;
              params.next(this.originalFile);
              const image = URL.createObjectURL(blob);
              hueElement.setAttribute("src", image);
          });
      }
  }

  class Brightness extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "brightness";
          this.icon = `<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M128 0l37 37h54v54l37 37-37 37v54h-54l-37 37-37-37H37v-54L0 128l37-37V37h54l37-37zm0 53a75 75 0 100 150 75 75 0 000-150zm0 21a54 54 0 110 108 54 54 0 010-108z"/></svg>`;
          this.cssFilter = "brightness";
          this.unit = "%";
          this.value = 100;
          this.max = 200;
      }
  }

  class Blur extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "blur";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0l-7 7s-21 23-41 54c-21 31-42 70-42 105a90 90 0 00180 0c0-35-22-74-42-105-21-31-42-54-42-54l-6-7zm36 166h18c0 30-25 54-54 54v-18c20 0 36-16 36-36z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.cssFilter = "blur";
          this.unit = "px";
      }
  }

  class Contrast extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "contrast";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0c35 0 66 13 90 38 25 25 38 55 38 90s-13 66-38 90c-24 25-55 38-90 38s-65-13-90-38c-25-24-38-55-38-90s13-65 38-90S93 0 128 0zm67 62a91 91 0 00-67-28v188c26 0 48-9 67-28 18-18 27-40 27-66s-9-48-27-66z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.cssFilter = "contrast";
          this.unit = "%";
          this.value = 100;
          this.max = 200;
      }
  }

  class Grayscale extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "grayscale";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M181 196l30 30c-20 17-44 27-71 30h-1v-43c15-2 30-8 42-17zm-105-1c11 9 25 16 40 18h1v43c-27-2-52-13-71-29l-1-1 31-31zm138-56h42c-2 27-13 52-29 71l-1 1-30-30c9-12 16-27 18-42zm-170 0c1 15 7 29 16 41h1l-31 31c-17-20-28-44-30-71v-1h44zM210 8a27 27 0 0138 38l-38 37 10 10c5 5 5 13 0 18l-1 1c-5 5-13 4-18-1l-10-9-47 47c-5 5-15 9-22 10h-6l-17-2-2-17v-6c0-7 5-17 10-23l47-47-10-9c-5-5-5-14 0-19h1c5-5 13-5 18 0l10 10zm-47 66l-47 47c-3 3-5 9-6 13v1l11 10c4 0 11-3 14-5l47-47-19-19zM30 45l31 31c-9 11-15 25-17 40v1H0c2-27 13-52 30-72zm87-45v43c-15 2-29 8-41 17v1L45 30C65 13 90 2 117 0z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.cssFilter = "grayscale";
          this.unit = "%";
          this.value = 0;
          this.max = 100;
      }
  }

  class HueRotate extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "hue-rotate";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M213 114c-30 0-69 0-76-87-2-17-13-27-30-27-22 0-48 14-68 36C13 65 2 102 6 141c6 62 66 115 129 115 64 0 116-52 116-115 0-26-18-27-38-27zM77 101a24 24 0 110-48 24 24 0 010 48zm-8 28a24 24 0 110 48 24 24 0 010-48zm83 74a24 24 0 11-48 0 24 24 0 0148 0zm68-40a24 24 0 11-47 0 24 24 0 0147 0z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.cssFilter = "hue-rotate";
          this.unit = "deg";
          this.value = 0;
          this.max = 360;
      }
  }

  class Invert extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "invert";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path d="M214 145a100 100 0 010 10l-7 25 1-2c-3 7-8 15-13 21l2-2c-5 7-11 12-18 18l3-2c-7 5-14 9-22 12l3-1a98 98 0 01-22 7 101 101 0 01-23 0c-9-1-17-3-25-7l3 1c-8-3-15-7-22-12l3 2c-7-6-13-11-18-18l2 2c-5-6-10-14-13-21l1 2a98 98 0 01-6-21 102 102 0 010-24c1-8 3-17 6-25l-1 3c3-8 8-15 13-22l-2 3 15-17a657 657 0 0163-57h-17a1561 1561 0 0175 71c5 7 10 14 13 22l-1-3a100 100 0 017 35c0 7 6 13 12 12 6 0 12-5 12-12a112 112 0 00-38-83 676 676 0 00-50-48L137 3h-1c-2-2-5-3-8-3s-6 1-8 3a1704 1704 0 00-49 43c-9 9-19 18-27 29a118 118 0 00-19 30 109 109 0 005 90 111 111 0 0089 60 110 110 0 00119-110c0-6-6-12-12-12-7 1-12 6-12 12z"/><path d="M226 145c0 55-44 99-98 99V12s58 49 76 71c14 17 22 39 22 62z"/></g></svg>`;
          this.cssFilter = "invert";
          this.unit = "%";
          this.value = 0;
          this.max = 100;
      }
  }

  class Sepia extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "sepia";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M13 0h230c6 0 11 5 12 11v233c0 7-5 12-11 12H13c-7 0-12-5-12-11V12C1 5 6 0 12 0h231zm219 23H24v160h208V23zM110 72l31 42c2 2 5 2 7 1v-1l13-12c2-2 5-2 7 0v1l35 50c3 3 1 7-3 7H55c-4 0-6-4-4-7l51-81c2-2 6-3 8 0zm65-26a18 18 0 110 36 18 18 0 010-36z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.cssFilter = "sepia";
          this.unit = "%";
          this.value = 0;
          this.max = 100;
      }
  }

  class Saturate extends UpploadFilterBaseClass {
      constructor() {
          super(...arguments);
          this.name = "saturate";
          this.icon = `<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M127 0a82 82 0 00-75 50l-1 2a81 81 0 00-3 10l-1 3-1 7v9a99 99 0 0181 4 99 99 0 0182-4v-8-1l-1-7-1-3a82 82 0 00-3-10l-1-2a82 82 0 00-76-50zM82 92c-12 0-23 3-33 7l-1 1c4 19 14 35 29 46 5-19 17-36 32-49-8-3-17-5-27-5zm91 0c-10 0-19 2-27 5 15 13 26 30 32 49 15-11 25-27 29-46l-1-1c-10-4-21-7-33-7zm-46 14a82 82 0 00-34 50 82 82 0 0069 0c-5-21-17-39-35-50zm-96 4a82 82 0 00-27 39l-1 2-2 9v5a83 83 0 00-1 17c4 39 35 70 74 74h8c9 0 18-2 26-5a100 100 0 01-35-85c-20-13-35-33-42-56zm192 0c-6 23-21 43-41 56v8c0 31-14 58-36 77a70 70 0 0035 5c39-4 69-35 73-74a82 82 0 000-17v-2-3l-2-9-1-2c-5-15-15-29-28-39zM91 175c0 28 14 52 35 66l1-1 2 1c21-14 34-38 35-66a99 99 0 01-73 0z" fill="#000" fill-rule="nonzero"/></svg>`;
          this.cssFilter = "saturate";
          this.unit = "%";
          this.value = 100;
          this.max = 200;
      }
  }

  exports.ArtStation = ArtStation;
  exports.Blur = Blur;
  exports.Brightness = Brightness;
  exports.Camera = Camera;
  exports.Contrast = Contrast;
  exports.Crop = Crop;
  exports.DeviantArt = DeviantArt;
  exports.Facebook = Facebook;
  exports.Flickr = Flickr;
  exports.Flip = Flip;
  exports.Flipboard = Flipboard;
  exports.Fotki = Fotki;
  exports.GIPHY = GIPHY;
  exports.Grayscale = Grayscale;
  exports.HueRotate = HueRotate;
  exports.Instagram = Instagram;
  exports.Invert = Invert;
  exports.LinkedIn = LinkedIn;
  exports.Local = Local;
  exports.NineGag = NineGag;
  exports.Pexels = Pexels;
  exports.Pinterest = Pinterest;
  exports.Pixabay = Pixabay;
  exports.Preview = Preview;
  exports.Reddit = Reddit;
  exports.Rotate = Rotate;
  exports.Saturate = Saturate;
  exports.Screenshot = Screenshot;
  exports.Sepia = Sepia;
  exports.Tumblr = Tumblr;
  exports.Twitter = Twitter;
  exports.URL = URL$1;
  exports.Unsplash = Unsplash;
  exports.Uppload = Uppload;
  exports.UpploadEffect = UpploadEffect;
  exports.UpploadService = UpploadService;
  exports.WeHeartIt = WeHeartIt;
  exports.cachedFetch = cachedFetch;
  exports.canvasToBlob = canvasToBlob;
  exports.compressImage = compressImage;
  exports.de = de;
  exports.en = en;
  exports.es = es;
  exports.fetchUploader = fetchUploader;
  exports.fitImageToContainer = fitImageToContainer;
  exports.flattenObject = flattenObject;
  exports.fr = fr;
  exports.getElements = getElements;
  exports.hi = hi;
  exports.imageUrlToBlob = imageUrlToBlob;
  exports.it = it;
  exports.nl = nl;
  exports.pt = pt;
  exports.ro = ro;
  exports.ru = ru;
  exports.safeListen = safeListen;
  exports.setI18N = setI18N;
  exports.tr = tr;
  exports.translate = translate;
  exports.xhrUploader = xhrUploader;
  exports.zhTW = zhTW;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=index.amd.js.map
