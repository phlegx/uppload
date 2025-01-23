var N = Object.defineProperty;
var W = (o, t, e) => t in o ? N(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var i = (o, t, e) => (W(o, typeof t != "symbol" ? t + "" : t, e), e);
import { createFocusTrap as Y } from "focus-trap";
import Z from "mitt";
import O from "cropperjs";
class $ {
  constructor() {
    i(this, "type", "service");
    i(this, "name", "");
    i(this, "invisible", !1);
    i(this, "noRecolor", !1);
    i(this, "icon", "");
    i(this, "color", "#333");
    i(this, "template", () => "");
    i(this, "handlers", () => {
    });
    i(this, "stop", () => {
    });
    i(this, "supports", () => !0);
  }
}
let z = {};
const j = (o) => {
  const t = {};
  for (const e in o)
    if (o.hasOwnProperty(e))
      if (typeof o[e] == "object") {
        const a = j(o[e]);
        for (const l in a)
          a.hasOwnProperty(l) && (t[e + "." + l] = a[l]);
      } else
        t[e] = o[e];
  return t;
}, K = (o) => {
  z = j(o);
}, v = (o, t) => {
  try {
    let e = z[o];
    return typeof t == "string" && (t = [t]), t && t.forEach((a, l) => {
      e = e.replace(`$${l + 1}$`, a);
    }), z.helper && typeof z.helper == "function" && (e = z.helper(e)), e;
  } catch {
    return "";
  }
}, T = (o) => {
  if (!o)
    return [];
  const t = [];
  return typeof o == "string" ? t.push(
    ...Array.prototype.slice.call(document.querySelectorAll(o))
  ) : Array.isArray(o) ? o.forEach((e) => {
    typeof e == "string" ? t.push(
      ...Array.prototype.slice.call(document.querySelectorAll(e))
    ) : t.push(e);
  }) : t.push(o), t;
}, D = [], p = (o, t, e) => {
  D.find(
    (l) => l.element === o && l.type === t
  ) || (o.addEventListener(t, e), D.push({ element: o, type: t }));
}, F = (o) => {
  if (window.requestAnimationFrame)
    return window.requestAnimationFrame(o);
  setTimeout(() => {
    o(0);
  }, 100);
}, k = (o, t) => new Promise((e, a) => {
  const l = () => {
    t.removeEventListener("load", n), t.removeEventListener("error", r);
  }, r = (c) => {
    l(), a(c);
  }, n = () => {
    F(() => {
      const c = t.parentElement, s = t.getBoundingClientRect();
      if (!c) {
        l();
        return;
      }
      const d = c.getBoundingClientRect();
      s.height < s.width ? (t.style.height = `${d.height}px`, t.style.width = "auto") : (t.style.width = `${d.width}px`, t.style.height = "auto"), F(() => {
        const h = t.getBoundingClientRect();
        h.height > d.height ? (t.style.height = `${d.height}px`, t.style.width = "auto") : h.width > d.width && (t.style.width = `${d.width}px`, t.style.height = "auto"), F(() => {
          const u = o.uppload.container.querySelector(
            ".uppload-effect"
          );
          u && (u.style.opacity = "1"), l(), e(void 0);
        });
      });
    });
  };
  l(), t.addEventListener("load", n), t.addEventListener("error", r), t.src = t.src;
}), J = (o, t) => new Promise((e) => {
  const a = URL.createObjectURL(o), l = document.createElement("canvas"), r = document.createElement("img"), n = t.maxSize || [
    t.maxWidth || 1 / 0,
    t.maxHeight || 1 / 0
  ];
  r.src = a, r.onload = () => {
    const c = t.compressionToMime || "image/jpeg", s = t.compression || 1, d = r.width / r.height;
    r.width > n[0] && (r.width = n[0], r.height = r.width * (1 / d)), r.height > n[1] && (r.height = n[1], r.width = r.height * d), l.width = r.width, l.height = r.height;
    const h = l.getContext("2d");
    if (!h)
      return e(o);
    h.clearRect(0, 0, l.width, l.height), h.drawImage(r, 0, 0, l.width, l.height), b(l, c, s).then((u) => {
      if (u)
        return e(u);
      e(o);
    });
  }, p(r, "error", () => e(o));
}), Q = (o) => {
  const t = atob(o.split(",")[1]), e = o.split(",")[0].split(":")[1].split(";")[0], a = new ArrayBuffer(t.length), l = new Uint8Array(a);
  for (let r = 0; r < t.length; r++)
    l[r] = t.charCodeAt(r);
  return new Blob([a], { type: e });
}, b = (o, t, e) => new Promise((a, l) => {
  const r = o.getContext("2d");
  let n = !1;
  if (r)
    try {
      const c = r.getImageData(
        0,
        0,
        o.width,
        o.height
      ).data;
      for (let s = 0; s < c.length; s += 4)
        c[s + 3] < 255 && (n = !0);
    } catch {
    }
  if (n && t !== "image/webp" && (t = void 0, e = void 0), typeof o.toBlob == "function")
    o.toBlob(
      (c) => {
        c && a(c), l(new Error("errors.image_error"));
      },
      t,
      e
    );
  else if (typeof o.toDataURL == "function") {
    const c = o.toDataURL(t, e);
    a(Q(c));
  } else
    l(new Error("errors.image_error"));
}), L = (o, t) => t.noRecolor ? o : o.replace(/#000/g, t.color || "#000"), X = (o, t, e) => {
  try {
    return new File([o], t || "file_name", {
      lastModified: (e || new Date()).getTime(),
      type: o.type
    });
  } catch {
    return o;
  }
}, w = (o, t, e, a) => ({
  name: t,
  blob: o,
  lastModified: a,
  type: e
}), B = (o) => {
  const t = o.blob;
  return o.lastModified = o.lastModified || new Date(), X(t, o.name, o.lastModified);
};
class V extends $ {
  constructor() {
    super(...arguments);
    i(this, "name", "default");
    i(this, "invisible", !0);
    i(this, "template", () => `<p>${v("services.default.heading")}</p>`);
  }
}
class G extends $ {
  constructor() {
    super(...arguments);
    i(this, "name", "uploading");
    i(this, "invisible", !0);
    i(this, "template", () => `<div class="uppload-loader">
  <div></div>
    <p class="uppload-loader-text">${v(
      "uploading"
    )}<span class="progress"></span></p>
  </div>`);
  }
}
class oe {
  /**
   * Create a new Uppload instance
   * @param settings - Uppload instance settings
   */
  constructor(t) {
    i(this, "services", [new V(), new G()]);
    i(this, "effects", []);
    i(this, "isOpen", !1);
    i(this, "error");
    i(this, "activeService", "default");
    i(this, "activeEffect", "");
    i(this, "settings");
    i(this, "container");
    i(this, "focusTrap");
    i(this, "file", { blob: new Blob() });
    i(this, "lang", {});
    i(this, "uploader");
    i(this, "emitter", Z());
    i(this, "uploadProgress", 0);
    i(this, "inline", !1);
    i(this, "transitionDuration", 300);
    i(this, "uId", "");
    i(this, "wrapper", "");
    this.settings = {}, this.updateSettings(t || {}), this.uId = this.settings.customid ?? (Math.random() + 1).toString(36).substring(7), this.container = document.createElement("div"), this.container.setAttribute("id", `uppload-${this.uId}`), this.renderContainer(), this.container.classList.add("uppload-container");
    const e = this.wrapper ? document.querySelector(this.wrapper) ?? document.body : document.body;
    e && e.appendChild(this.container), this.focusTrap = Y(this.container, {
      initialFocus: () => this.container.querySelector("button")
    }), requestAnimationFrame(() => this.update()), this.emitter.on("processing", () => {
      const a = this.container.querySelector(".processing-loader");
      a && a.classList.add("visible");
    }), this.emitter.on("process", () => {
      const a = this.container.querySelector(".processing-loader");
      a && a.classList.remove("visible");
    });
  }
  /**
   * Update widget settings such as i18n
   * @param settings - Uppload settings object
   */
  updateSettings(t) {
    this.settings = { ...this.settings, ...t }, this.emitter.emit("settingsUpdated", t), t.customid && (this.uId = t.customid), t.wrapper && (this.wrapper = t.wrapper), t.lang && K(t.lang), t.defaultService && (this.activeService = t.defaultService), t.lang && (this.lang = t.lang), typeof t.transitionDuration < "u" && (this.transitionDuration = t.transitionDuration), t.uploader && (this.uploader = t.uploader), this.inline = !!t.inline, this.renderContainer(), this.update();
  }
  ready() {
    this.settings.value && this.bind(this.settings.value), this.renderContainer(), this.settings.defaultModalOpen && !this.isOpen && this.open(), this.emitter.emit("ready");
  }
  /**
   * Bind the image URL value to DOM elements
   * @param value - URL of the image
   */
  bind(t) {
    this.settings.bind && (T(this.settings.bind).forEach((a) => {
      a.nodeName === "IMG" ? a.setAttribute("src", t) : a.setAttribute("value", t);
    }), this.emitter.emit("bind"));
  }
  /**
   * Use an uploader, service, or effect in your package
   * @param plugin - A single uploader, service, or effect or an array of them
   */
  use(t) {
    Array.isArray(t) ? t.forEach(
      (e) => this.install(e)
    ) : this.install(t);
  }
  /**
   * Remove a plugin (effect or serve) from this instance
   * @param slug - Slug of the plugin to be removed
   */
  remove(t) {
    this.services = this.services.filter((e) => e.name !== t), this.effects = this.effects.filter((e) => e.name !== t), this.update(), this.emitter.emit("remove", t);
  }
  /**
   * Update the plugins for this instance
   * @param pluginUpdateFunction - Function to update this instance's plugins
   */
  updatePlugins(t) {
    const e = t(this.services), a = e.filter(
      (n) => n.type === "service"
    ), l = !!a.filter(
      (n) => n.name === "default"
    ).length;
    !!a.filter(
      (n) => n.name === "uploading"
    ).length || a.unshift(new G()), l || a.unshift(new V()), this.services = a, this.effects = e.filter(
      (n) => n.type === "effect"
    ), this.update();
  }
  /**
   * Install a new uploader, service, or effect to this instance
   * @param plugin - A single uploader, service, or effect
   */
  install(t) {
    t.supports() && (t.type === "service" ? (this.services.filter(
      (a) => a.name === t.name
    ).length || this.services.push(t), this.ready()) : t.type === "effect" && (this.effects.filter((a) => a.name === t.name).length || this.effects.push(t), this.ready()));
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
    this.isOpen = !0, this.file = { blob: new Blob() }, this.activeService = "default", this.activeEffect = "", this.container.style.transition = `${this.transitionDuration}ms`, this.container.style.opacity = "0", this.update();
    const t = this.settings.defaultService;
    t ? this.navigate(t) : this.services.length === 3 && this.navigate(this.services[2].name);
    const e = this.container.querySelector(
      `input[type=radio][value='${this.activeService}']`
    );
    e && (e.setAttribute("checked", "checked"), e.checked = !0), p(document.body, "keyup", (a) => {
      a.key === "Escape" && this.isOpen && this.close();
    }), setTimeout(() => {
      this.container.style.opacity = "1";
    }, 1), this.emitter.emit("open");
  }
  /**
   * Close the Uppload widget
   */
  close() {
    this.isOpen && (this.stopCurrentService(), this.isOpen = !1, this.file = { blob: new Blob() }, this.emitter.emit("close"), this.container.style.opacity = "0", setTimeout(() => this.update(), this.transitionDuration));
  }
  /**
   * Toggles the Uppload widget
   */
  toggle() {
    this.modalOpen() ? this.close() : this.open();
  }
  /**
   * Re-render the widget
   */
  update() {
    if (!this.container)
      return;
    this.hideHelp(), this.settings.customClass && this.container.classList.add(this.settings.customClass), this.inline && this.container.classList.add("uppload-inline");
    const t = this.container.querySelector(".uppload-active-container");
    t && (t.innerHTML = this.render());
    const e = this.container.querySelector("aside");
    e && this.activeService !== "default" && !this.activeEffect && (e.style.display = "block");
    const a = this.container.querySelector(".effects-nav");
    e && a && this.activeEffect ? (this.settings.disableEffectsNavbar || (a.style.display = ""), e.style.display = "none") : e && a && this.activeService === "default" ? (e.style.display = "none", a.style.display = "none") : e && a && (e.style.display = "", a.style.display = "none");
    const l = this.container.querySelector(
      ".uppload-effect"
    );
    l && (l.style.display = this.activeEffect ? "" : "none"), window.requestAnimationFrame(() => this.handlers()), this.isOpen ? (this.container.classList.add("visible"), this.focusTrap.activate()) : (this.container.classList.remove("visible"), this.focusTrap.deactivate());
    const r = this.container.querySelector(
      "footer.effects-nav .effects-tabs"
    );
    if (r) {
      const s = r.parentElement;
      if (s) {
        let d = 0;
        s.querySelectorAll(".effects-continue").forEach((f) => {
          const g = f.getBoundingClientRect();
          d += g.width;
        });
        const u = s.getBoundingClientRect();
        r.style.width = `${u.width - d}px`;
      }
    }
    const n = this.container.querySelector("aside");
    n && this.services.length === 3 && n.classList.add("uppload-services--single");
    const c = this.container.querySelector(".uppload-help");
    c && (c.classList.remove("visible"), p(c, "click", () => this.hideHelp()));
  }
  /**
   * Returns the HTML template for the services navbar
   * @param sidebar - Whether this is an input radio (for sidebar) or buttons (for home)
   */
  getNavbar(t = !1) {
    return `<${t ? "nav" : "div"} class="uppload-services">
      ${this.services.filter((e) => !e.invisible).map(
      (e) => `<div data-uppload-service="${e.name}" class="uppload-service-name">
          ${t ? `<input type="radio" id="uppload-service-radio-${this.uId}-${e.name}" value="${e.name}" name="uppload-radio" ${e.name === this.activeService ? 'checked="checked"' : ""}>` : ""}
          <${t ? `label for="uppload-service-radio-${this.uId}-${e.name}"` : "button"} data-uppload-service="${e.name}">
            ${e.icon.indexOf("http") === 0 ? `<img class="service-icon" alt="" src="${e.icon}">` : L(e.icon, e)}
            <span>${this.lang.services && this.lang.services[e.name] && this.lang.services[e.name].title ? this.lang.services[e.name].title : e.name}</span>
          </${t ? "label" : "button"}>
        </div>`
    ).join("")}
    </${t ? "nav" : "div"}>`;
  }
  /**
   * Returns the HTML template for the effects navbar
   */
  getEffectsNavbar() {
    return this.settings.disableEffectsNavbar ? "" : `${this.settings.disableCancelButton ? "" : `
      <div class="effects-continue"><button class="effects-continue--cancel">${v("cancel")}</button></div>`}
      <div class="effects-tabs"><div class="effects-tabs-flow">
      ${this.effects.map(
      (t) => `
      <input type="radio" id="uppload-effect-radio-${this.uId}-${t.name}" value="${t.name}" name="uppload-effect-radio">
        <label for="uppload-effect-radio-${this.uId}-${t.name}">
          ${t.icon.indexOf("http") === 0 ? `<img class="effect-icon" alt="" src="${t.icon}">` : L(t.icon, t)}
          <span>${this.lang.effects && this.lang.effects[t.name] && this.lang.effects[t.name].title ? this.lang.effects[t.name].title : t.name}</span>
        </label>
      `
    ).join("")}
      </div></div>
      ${this.settings.disableUploadButton ? "" : `
        <div class="effects-continue"><button class="effects-continue--upload">${v("upload")}</button></div>`}
      `;
  }
  /**
   * Renders the main container for the widget
   */
  renderContainer() {
    this.container && (this.container.innerHTML = `
      <div class="uppload-modal">
        <div class="processing-loader"></div>
        <aside style="display: none">
          ${this.getNavbar(!0)}
        </aside>
        <section>
          ${this.error ? `<div class="uppload-error">${this.error}</div>` : ""}
          <div class="uppload-active-container"></div>
          <footer style="display: none" class="effects-nav">${this.getEffectsNavbar()}</footer>
        </section>
        ${this.settings.disableHelp ? "" : `
        <div class="uppload-help-loading">
          <div class="uppload-loader">
            <div></div>
            <p class="uppload-loader-text">${v("help.loading")}</p>
          </div>
        </div>
        <div class="uppload-help">
          <div><button><span>${v(
      "help.close"
    )}</span><span aria-hidden="true">&times;</span></button></div>
          <iframe></iframe>
        </div>
        `}
      </div>
      <div class="uppload-modal-bg">
        <button class="uppload-close" aria-label="${v(
      "close"
    )}">&times;</button>
      </div>
    `);
  }
  /**
   * Render the content inside the widget container
   */
  render() {
    return `
      ${this.error ? `<div class="uppload-error">${this.error}</div>` : ""}
      ${this.activeEffect ? `<div class="uppload-effect uppload-effect--${this.activeEffect || "none"}">
      ${this.activeEffect && this.file ? this.renderActiveEffect(this.file) : ""}
    </div>` : `<div class="uppload-service uppload-service--${this.activeService}">
      ${this.activeEffect && this.file ? "" : this.renderActiveService()}
      ${this.activeService === "default" ? this.getNavbar() : ""}
    </div>`}`;
  }
  /**
   * Render the currently active service
   */
  renderActiveService() {
    const t = this.services.filter(
      (a) => a.name === this.activeService
    );
    if (!t.length)
      return "";
    const e = t[0];
    return requestAnimationFrame(() => {
      typeof e.handlers == "function" && e.handlers({
        next: this.next.bind(this),
        upload: this.upload.bind(this),
        uploadMultiple: this.uploadMultiple.bind(this),
        handle: this.handle.bind(this),
        showHelp: this.showHelp.bind(this),
        uppload: this,
        translate: v
      });
    }), `${typeof e.template == "function" ? e.template({ translate: v, uppload: this }) : ""}`;
  }
  /**
   * Render the currently active effect
   */
  renderActiveEffect(t) {
    const e = this.effects.filter(
      (l) => l.name === this.activeEffect
    );
    if (!e.length)
      return "";
    const a = e[0];
    return requestAnimationFrame(() => {
      typeof a.handlers == "function" && a.handlers({
        next: this.next.bind(this),
        upload: this.upload.bind(this),
        uploadMultiple: this.uploadMultiple.bind(this),
        handle: this.handle.bind(this),
        showHelp: this.showHelp.bind(this),
        uppload: this,
        translate: v
      });
    }), `
        <div class="active-effect-container">${typeof a.template == "function" ? a.template({ file: t, translate: v }) : ""}</div>
      `;
  }
  /**
   * Uploads multiple files to the server
   * @param file
   * @returns JSON response from server
   */
  uploadMultiple(t) {
    return this.emitter.emit("before-upload"), new Promise((e) => {
      this.navigate("uploading"), this.uploader && typeof this.uploader == "function" ? this.uploader(
        t,
        this.updateProgress.bind(this)
      ).then((a) => {
        this.navigate(this.settings.defaultService ?? "default"), e(a), this.emitter.emit("upload", a), this.close();
      }).catch((a) => this.handle(a)) : this.handle(new Error("no-uploader"));
    });
  }
  hideHelp() {
    const t = this.container.querySelector(".uppload-help"), e = this.container.querySelector(".uppload-help-loading"), a = this.container.querySelector("aside"), l = this.container.querySelector("section");
    e && e.classList.remove("visible"), t && t.classList.remove("visible"), a && (a.style.display = ""), l && (l.style.display = ""), this.emitter.emit("hide-help");
  }
  /**
   * Show the help article for this plugin in a frame
   * @param url - URL of help webpage
   */
  showHelp(t) {
    this.emitter.emit("help", t);
    const e = this.container.querySelector("aside");
    e && (e.style.display = "none");
    const a = this.container.querySelector("section");
    a && (a.style.display = "none");
    const l = this.container.querySelector(".uppload-help-loading");
    l && l.classList.add("visible");
    const r = this.container.querySelector(".uppload-help");
    if (r) {
      const n = r.querySelector("iframe");
      n && (n.setAttribute("src", `https://uppload.js.org/help${t}`), p(n, "load", () => {
        r.classList.add("visible"), l && l.classList.remove("visible");
      }), p(n, "error", () => this.hideHelp()));
    }
  }
  /**
   * Updates the file and goes to the active effect
   * @param file - The currently active file Blob
   */
  next(t) {
    if (this.emitter.emit("next", t), this.file = t, !this.activeEffect)
      if (this.effects.length && t.type && (t.type.indexOf("image/") === 0 || this.effects[0].name === "preview"))
        this.activeEffect = this.effects[0].name, this.update(), this.emitter.emit("next-effect", { file: t, effect: this.activeEffect });
      else
        return this.upload(B(t));
    const e = this.container.querySelector(
      `input[name='uppload-effect-radio'][value='${this.activeEffect}']`
    );
    e && (e.setAttribute("checked", "checked"), e.checked = !0);
  }
  compress(t) {
    return !this.settings.compressionFromMimes || this.settings.compressionFromMimes.indexOf(t.type) === -1 ? new Promise((e) => e(t)) : typeof this.settings.compressor == "function" ? this.settings.compressor(t) : J(t, this.settings);
  }
  /**
   * Upload a file to the server
   * @param file - A Blob object containing the file to upload
   * @returns The file URL
   */
  upload(t) {
    return this.emitter.emit("before-upload", t), new Promise((e, a) => {
      this.navigate("uploading");
      let l = w(t);
      try {
        typeof t.name == "string" && (l = w(
          t,
          t.name,
          t.type,
          new Date(t.lastModified)
        ));
      } catch {
      }
      this.uploader && typeof this.uploader == "function" ? this.compress(t).then((r) => (this.settings.compression && this.emitter.emit("compress", r), r)).then((r) => (l.blob = r, B(l))).then(
        (r) => this.uploader(r, this.updateProgress.bind(this))
      ).then((r) => {
        this.bind(r), this.settings.disableAfterUploadNavigate || this.navigate(this.settings.defaultService ?? "default"), e(r), this.emitter.emit("upload", r), this.settings.disableAfterUploadClose || this.close();
      }).catch((r) => this.handle(r)) : a("no-uploader");
    });
  }
  /**
   * Gracefully display an error message
   * @param error - Error to display
   */
  handle(t) {
    this.error = v(t.message) || t.message, this.emitter.emit("error", this.error), this.update(), this.activeService === "uploading" && this.navigate(this.settings.defaultService ?? "default"), setTimeout(() => {
      this.error = void 0, this.update();
    }, 4e3);
  }
  /**
   * Adds event handlers for the widget
   */
  handlers() {
    const t = () => this.open(), e = () => this.close();
    this.container.querySelectorAll(
      ".uppload-service--default .uppload-service-name button"
    ).forEach((h) => {
      p(h, "click", (f) => {
        const g = h.getAttribute("data-uppload-service"), R = this.container.querySelector(
          `input[type=radio][value='${g}']`
        );
        if (R && R.setAttribute("checked", "checked"), g) {
          this.navigate(g);
          const x = this.container.querySelector(
            `[data-uppload-service="${g}"]`
          );
          if (x && x.parentElement) {
            let E = 0, I = 0;
            const q = x.getBoundingClientRect(), M = x.parentElement.getBoundingClientRect();
            E = q.top - M.top, I = q.left - M.left;
            const P = x.parentElement.parentElement;
            try {
              P && P.scrollTo(I, E);
            } catch {
            }
          }
        }
        return f.preventDefault(), !1;
      });
    }), this.container.querySelectorAll(".uppload-services input[type='radio']").forEach((h) => {
      p(h, "change", () => {
        const f = this.container.querySelector(
          "[name='uppload-radio']:checked"
        );
        if (!f)
          return;
        const g = f.value;
        this.navigate(g);
      });
    }), this.container.querySelectorAll(".effects-nav input[type='radio']").forEach((h) => {
      p(h, "change", () => {
        const f = this.container.querySelector(
          "[name='uppload-effect-radio']:checked"
        );
        if (!f)
          return;
        const g = f.value;
        this.activeEffect = g, this.update();
      });
    });
    const n = this.container.querySelector(".uppload-modal-bg"), c = this.container.querySelector(".uppload-close");
    n && !this.settings.disableModalClickClose ? p(n, "click", e) : c && p(c, "click", e), this.settings.call && T(this.settings.call).forEach((u) => {
      p(u, "click", t);
    });
    const s = this.container.querySelector(
      ".effects-continue--cancel"
    );
    s && p(s, "click", () => {
      this.doCancel();
    });
    const d = this.container.querySelector(
      ".effects-continue--upload"
    );
    d && p(d, "click", () => {
      this.doUpload();
    });
  }
  /**
   * Programmatically call cancel like click on cancel button.
   */
  doCancel() {
    this.file = { blob: new Blob() }, this.activeService = this.settings.defaultService ?? "default", this.activeEffect = "", this.update();
  }
  /**
   * Programmatically call upload like click on upload button.
   */
  doUpload() {
    this.file && (this.activeService = "", this.activeEffect = "", this.upload(B(this.file)));
  }
  /**
   * Stops any actions being done by the currently active service
   * For example, if your webcame is being accessed, kill that process
   */
  stopCurrentService() {
    const t = this.services.filter(
      (e) => e.name === this.activeService
    );
    t.length && (t[0].stop(), this.activeService = this.services[0].name);
  }
  /**
   * Navigate to an Uppload service page
   * @param service - Slug name of service (e.g., instagram)
   */
  navigate(t) {
    if (!this.services.filter((a) => a.name === t).length)
      throw new Error("invalid-service");
    this.stopCurrentService(), this.activeService = t, this.update();
    const e = this.container.querySelector(
      ".uppload-active-container input, .uppload-active-container button"
    );
    e && e.focus();
  }
  /**
   * Add an event listener
   * @param type - Type of event listener (e.g., open)
   * @param handler - Event handler function
   */
  on(t, e) {
    return this.emitter.on(t, e);
  }
  /**
   * Remove an event listener
   * @param type - Type of event listener (e.g., open)
   * @param handler - Event handler function
   */
  off(t, e) {
    return this.emitter.off(t, e);
  }
  /**
   * Updates the upload progress
   * @param progressPercent Current progress in percent
   */
  updateProgress(t) {
    this.uploadProgress = t;
    const e = this.container.querySelector(
      ".uppload-loader-text .progress"
    );
    e && (e.innerHTML = `${parseInt(t.toString())} %`), this.emitter.emit("progress", this.updateProgress);
  }
}
class S {
  constructor() {
    i(this, "type", "effect");
    i(this, "name", "");
    i(this, "invisible", !1);
    i(this, "noRecolor", !1);
    i(this, "color", "#000");
    i(this, "icon", "");
    i(this, "template", () => "");
    i(this, "handlers", () => {
    });
    i(this, "supports", () => !0);
  }
}
function H(o, t) {
  const e = sessionStorage;
  return new Promise((a, l) => {
    const r = `uppload_cache_${JSON.stringify(o)}`, n = new Date();
    n.setDate(n.getDate() + 1);
    const c = e.getItem(r);
    if (c) {
      const s = JSON.parse(c);
      if (s.ttl && new Date(s.ttl).getTime() > new Date().getTime())
        return a(s.result);
    }
    window.fetch(o, t).then((s) => {
      if (!s.ok)
        throw new Error("errors.response_not_ok");
      return s.json();
    }).then((s) => {
      e.setItem(
        r,
        JSON.stringify({
          ttl: n,
          updatedAt: new Date(),
          result: s
        })
      ), a(s);
    }).catch((s) => l(s));
  });
}
const _ = (o) => new Promise((t, e) => {
  window.fetch(`https://wsrv.nl/?url=${encodeURIComponent(o)}`).then((a) => {
    if (!a.ok)
      throw new Error("errors.response_not_ok");
    return a.blob();
  }).then((a) => t(a)).catch((a) => e(a));
}), A = (o, t) => (o.name = `${t}-import-${Math.random().toString(36).slice(2)}`, o);
class m extends $ {
  constructor() {
    super(...arguments);
    i(this, "loading", !1);
    i(this, "exampleURL", "");
    i(this, "validator", () => !0);
    i(this, "template", ({ translate: e, uppload: a }) => `
      <div class="microlink-container">
      <form class="microlink-search-form">
        <div class="service-icon">${L(this.icon, this)}</div>
        <label>
          <span>${e(`services.${this.name}.label`) || e("services.microlink.label", [
      e(`services.${this.name}.title`) || this.name,
      e(`services.${this.name}.type`) || e("services.microlink.type")
    ])}</span>
          <input class="microlink-search-input" type="url" placeholder="${e(`services.${this.name}.placeholder`) || e("services.microlink.placeholder", [
      e(`services.${this.name}.title`) || this.name,
      e(`services.${this.name}.type`) || e("services.microlink.type")
    ]) || ""}" required>
        </label>
        <button type="submit" style="background: ${this.color}">${e(`services.${this.name}.button`) || e(
      "services.microlink.button",
      e(`services.${this.name}.title`) || this.name
    )}</button></form>${a.settings.disableHelp ? "" : `<button class="need-help-link"><span>${e(
      "needHelp"
    )}</span aria-hidden="true"><span>?</span></button>`}</div>
    <div class="uppload-loader microlink-loader">
    <div></div>
    <p>${e(`services.${this.name}.loading`) || e(
      "services.microlink.loading",
      e(`services.${this.name}.title`) || this.name
    ) || e("fetching", e(`services.${this.name}.title`))}</p>
  </div>`);
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(
        ".microlink-search-form"
      );
      a && p(a, "submit", (r) => {
        r.preventDefault();
        const n = e.uppload.container.querySelector(
          ".microlink-search-input"
        );
        if (n) {
          const c = n.value;
          if (!this.validator(c))
            return e.handle(new Error("errors.invalid_url"));
          this.loading = !0, this.update(e), this.name === "screenshot" ? _(
            `https://api.microlink.io?url=${encodeURIComponent(
              c
            )}&screenshot=true&meta=false&embed=screenshot.url`
          ).then(
            (s) => e.next(
              A(w(s), this.name)
            )
          ).catch((s) => e.handle(s)).then(() => this.loading = !1) : this.name === "url" ? _(c).then(
            (s) => e.next(
              A(w(s), this.name)
            )
          ).catch((s) => e.handle(s)) : H(`https://api.microlink.io/?url=${encodeURIComponent(c)}`).then((s) => {
            if (!s.data.image || !s.data.image.url)
              throw new Error("errors.response_not_ok");
            return s.data.image.url;
          }).then((s) => _(s)).then(
            (s) => e.next(
              A(w(s), this.name)
            )
          ).catch((s) => e.handle(s));
        }
        return !1;
      });
      const l = e.uppload.container.querySelector(".need-help-link");
      l && p(
        l,
        "click",
        () => e.showHelp(
          `/services/${["url", "screenshot"].indexOf(this.name) !== -1 ? this.name : `import-from-web-service/${this.name}`}`
        )
      );
    });
  }
  update(e) {
    const a = e.uppload.container.querySelector(
      ".microlink-loader"
    ), l = e.uppload.container.querySelector(
      ".microlink-container"
    );
    l && (l.style.display = this.loading ? "none" : ""), a && (a.style.display = this.loading ? "flex" : "none");
  }
}
const ee = (o, t, e) => (o.name = `${e || `${t}-import`}-${Math.random().toString(36).slice(2)}.jpg`, o.type = "image/jpeg", o);
class U extends $ {
  constructor({
    apiKey: e,
    name: a,
    icon: l,
    color: r,
    poweredByUrl: n,
    popularEndpoint: c,
    searchEndpoint: s,
    getButton: d,
    getPopularResults: h,
    getSearchResults: u,
    noRecolor: f,
    fetchSettings: g
  }) {
    super();
    i(this, "apiKey");
    i(this, "results", []);
    i(this, "loading", !1);
    i(this, "poweredByUrl");
    i(this, "popularEndpoint");
    i(this, "searchEndpoint");
    i(this, "getButton");
    i(this, "getPopularResults");
    i(this, "getSearchResults");
    i(this, "noRecolor", !1);
    i(this, "fetchSettings");
    i(this, "template", ({ translate: e, uppload: a }) => `
      <div class="search-container"><form class="search-search-form">
      <div class="service-icon">${L(this.icon, this)}</div>
      <label><span>${e(`services.${this.name}.label`) || e("services.search.label")}</span>
        <input class="search-search-input" type="search" placeholder="${e(
      "services.search.placeholder"
    )}" required></label>
        <button type="submit" style="background: ${this.color}">${e(
      "services.search.button",
      e(`services.${this.name}.title`)
    )}</button>
      </form>
      <div class="search-images"></div>
      <p class="search-footer">${e(
      "services.search.imagesPoweredBy",
      `<a href="${this.poweredByUrl}" target="_blank">${e(
        `services.${this.name}.title`
      )}</a>`
    )}</p></div>${a.settings.disableHelp ? "" : `<button class="need-help-link"><span>${e(
      "needHelp"
    )}</span aria-hidden="true"><span>?</span></button>`}<div class="uppload-loader search-loader">
        <div></div>
        <p>${e(
      "fetching",
      e(`services.${this.name}.title`)
    )}</p>
      </div>
    `);
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(
        ".search-search-form"
      );
      a && p(a, "submit", (n) => {
        const c = e.uppload.container.querySelector(
          ".search-search-input"
        );
        if (c) {
          const s = c.value;
          H(
            this.searchEndpoint(this.apiKey, s),
            this.fetchSettings
          ).then((d) => {
            this.results = this.getSearchResults(d), this.update(e);
          }).catch(() => e.handle(new Error("errors.unable_to_search")));
        }
        return n.preventDefault(), !1;
      }), this.updateImages(e), e.uppload.container.querySelectorAll(
        ".search-images button"
      ).forEach((n) => {
        p(n, "click", () => {
          const c = n.getAttribute("data-full-url");
          this.loading = !0, this.update(e), c && _(c).then(
            (s) => e.next(
              ee(
                w(s),
                this.name,
                n.getAttribute("aria-label")
              )
            )
          ).catch(() => e.handle("errors.response_not_ok")).then(() => this.loading = !1);
        });
      });
      const r = e.uppload.container.querySelector(".need-help-link");
      r && p(
        r,
        "click",
        () => e.showHelp(`/services/search/${this.name}`)
      );
    });
    this.name = a, this.icon = l, this.color = r, this.apiKey = e, this.noRecolor = !!f, this.poweredByUrl = n, this.popularEndpoint = c(this.apiKey), this.searchEndpoint = s, this.getButton = d, this.getPopularResults = h, this.getSearchResults = u, g && (this.fetchSettings = g(this.apiKey)), this.popularEndpoint && H(this.popularEndpoint, this.fetchSettings).then((R) => {
      this.results = this.getPopularResults(R);
    }).catch(() => {
    });
  }
  updateImages(e) {
    const a = e.uppload.container.querySelector(".search-images");
    a && (a.innerHTML = `
        ${this.results.map((l) => this.getButton(l)).join(`
`)}
      `);
  }
  update(e) {
    this.updateImages(e), e && this.handlers(e);
    const a = e.uppload.container.querySelector(
      ".search-loader"
    ), l = e.uppload.container.querySelector(
      ".search-container"
    );
    l && (l.style.display = this.loading ? "none" : ""), a && (a.style.display = this.loading ? "flex" : "none");
  }
}
const ne = {
  upload: "hochladen",
  cancel: "abbrechen",
  close: "schließen",
  uploading: "Hochladen...",
  uploaded: "Hochgeladen",
  fetching: "Bild abrufen von $1$...",
  poweredBy: "Ermöglicht durch $1$",
  needHelp: "Hilfe benötigt?",
  units: {
    px: "px",
    "%": "%",
    deg: "°"
  },
  errors: {
    response_not_ok: "Beim Abrufen dieser Datei ist ein Fehler aufgetreten",
    unable_to_search: "Bei der Suche ist ein Fehler aufgetreten",
    invalid_service_url: "Dies ist keine $1$ -URL",
    invalid_url: "Diese URL ist ungültig",
    upload_aborted: "Dein Upload wurde abgebrochen",
    upload_error: "Beim Hochladen dieser Datei ist ein Fehler aufgetreten",
    file_type_not_allowed: "Dieser Dateityp wird nicht unterstützt",
    file_too_large: "Die Datei muss kleiner als $1$ sein"
  },
  help: {
    loading: "Ladehilfe...",
    close: "Hilfe schließen"
  },
  services: {
    default: {
      heading: "Wähle ein Bild aus"
    },
    local: {
      title: "Wähle eine Datei",
      button: "Wähle eine Datei aus",
      or: "oder",
      drop: "Ziehe eine Datei hierher, um sie hochzuladen"
    },
    camera: {
      title: "Kamera",
      button: "Webcam Foto",
      switch: "Kamera wechseln",
      waiting: "Warten auf Kameraerlaubnis...",
      unableToRead: "Wir können das Video nicht von der Kamera lesen. Dies kann daran liegen, dass nicht die erforderliche Berechtigung erteilt wurde oder dass das Gerät den Kamerazugriff nicht unterstützt."
    },
    microlink: {
      button: "Importieren von $1$",
      label: "$1$ $2$ URL",
      placeholder: "Gib eine URL von $1$ $2$ ein",
      type: "Post"
    },
    url: {
      title: "Direkte URL",
      label: "Bild-URL",
      placeholder: "Gib eine Bild-URL ein"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "Foto"
    },
    ninegag: {
      title: "9GAG",
      type: "Foto"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "Foto-Tweet"
    },
    pinterest: {
      title: "Pinterest",
      type: "Pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "Artikel"
    },
    fotki: {
      title: "Fotki",
      type: "Foto"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Bildschirmfoto",
      button: "Bildschirmfoto erstellen",
      label: "URL der Webseite",
      placeholder: "Gib eine URL ein",
      loading: "Mache ein Bildschirmfoto..."
    },
    search: {
      button: "Suche nach $1$",
      label: "Suche nach einem Bild",
      placeholder: "Suche nach etwas",
      imagesPoweredBy: "Ermöglicht durch $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Vorschau"
    },
    filters: {
      title: "Filter"
    },
    crop: {
      title: "Zuschneiden",
      aspectRatios: {
        free: "Frei",
        square: "voll"
      }
    },
    rotate: {
      title: "Drehen"
    },
    flip: {
      title: "Spiegeln",
      buttons: {
        horizontal: "Horizontal",
        vertical: "Vertikal"
      }
    },
    sharpen: {
      title: "Schärfen"
    },
    blur: {
      title: "Unschärfe"
    },
    brightness: {
      title: "Helligkeit"
    },
    contrast: {
      title: "Kontrast"
    },
    grayscale: {
      title: "Graustufen"
    },
    "hue-rotate": {
      title: "Farbton drehen"
    },
    invert: {
      title: "Invertieren"
    },
    saturate: {
      title: "Sättigen"
    },
    sepia: {
      title: "Sepia"
    }
  }
}, se = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "We got an error fetching this file",
    unable_to_search: "We got an error searching",
    invalid_service_url: "This is not $A$ $1$ URL",
    invalid_url: "This URL seems to be invalid",
    upload_aborted: "Your upload was cancelled",
    upload_error: "We got an error uploading this file",
    file_type_not_allowed: "This file type is not allowed",
    file_too_large: "Your file should be smaller than $1$"
  },
  help: {
    loading: "Loading help...",
    close: "Close help"
  },
  services: {
    default: {
      heading: "Select an image"
    },
    local: {
      title: "Choose file",
      button: "Select a file",
      or: "or",
      drop: "Drop files here"
    },
    camera: {
      title: "Camera",
      button: "Click photo",
      switch: "Switch camera",
      waiting: "Waiting for permission...",
      unableToRead: "We're not able to read your camera's video. This may be because you didn't grant the required permission, or because your camera is in use by another application."
    },
    microlink: {
      button: "Import from $1$",
      label: "$1$ $2$ URL",
      placeholder: "Enter $A$ $1$ $2$ URL",
      type: "post"
    },
    url: {
      title: "Direct URL",
      label: "Image URL",
      placeholder: "Enter an image URL"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "photo"
    },
    ninegag: {
      title: "9GAG",
      type: "photo"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "image tweet"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "article"
    },
    fotki: {
      title: "Fotki",
      type: "photo"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Screenshot",
      button: "Take screenshot",
      label: "Webpage URL",
      placeholder: "Enter a webpage URL",
      loading: "Taking a screenshot..."
    },
    search: {
      button: "Search on $1$",
      label: "Find an image",
      placeholder: "Search for something",
      imagesPoweredBy: "Images powered by $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Preview"
    },
    filters: {
      title: "Filters"
    },
    crop: {
      title: "Crop",
      aspectRatios: {
        free: "Free",
        square: "Square"
      }
    },
    rotate: {
      title: "Rotate"
    },
    flip: {
      title: "Flip",
      buttons: {
        horizontal: "Horizontal",
        vertical: "Vertical"
      }
    },
    sharpen: {
      title: "Sharpen"
    },
    blur: {
      title: "Blur"
    },
    brightness: {
      title: "Brightness"
    },
    contrast: {
      title: "Contrast"
    },
    grayscale: {
      title: "Grayscale"
    },
    "hue-rotate": {
      title: "Hue rotate"
    },
    invert: {
      title: "Invert"
    },
    saturate: {
      title: "Saturate"
    },
    sepia: {
      title: "Sepia"
    }
  },
  /**
   * Helpers can transform a string before returning it
   * You can define a language-specific helper here
   */
  helper: (o) => {
    const t = "$A$";
    for (; o.indexOf(t) !== -1; ) {
      const e = o.indexOf(t);
      o.length > e + 3 && (["a", "e", "i", "o", "u"].indexOf(o[e + 4].toLowerCase()) !== -1 ? o = o.replace(t, "an") : o = o.replace(t, "a"));
    }
    return o;
  }
}, ce = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "Se produjo un error al obtener este archivo",
    unable_to_search: "Se produjo un error al buscar",
    invalid_service_url: "Esta no es una URL de $1$",
    invalid_url: "Esta URL no es válida.",
    upload_aborted: "Tu carga ha sido cancelada",
    upload_error: "Se produjo un error al subir este archivo",
    file_type_not_allowed: "Este tipo de archivo no está permitido",
    file_too_large: "El archivo debe ser inferior a $1$"
  },
  help: {
    loading: "Cargando ayuda...",
    close: "Cerrar ayuda"
  },
  services: {
    default: {
      heading: "Selecciona una imagen"
    },
    local: {
      title: "Elige un archivo",
      button: "Selecciona un archivo",
      or: "o",
      drop: "Arrastra un archivo aquí para subir"
    },
    camera: {
      title: "Cámara",
      button: "Foto de la webcam",
      switch: "Cambiar de cámara",
      waiting: "Esperando el permiso de la cámara...",
      unableToRead: "No podemos leer el video de su cámara. Esto puede deberse a que no ha otorgado el permiso requerido o porque su dispositivo no admite el acceso a la cámara."
    },
    microlink: {
      button: "Importar desde $1$",
      label: "$1$ $2$ URL",
      placeholder: "Ingrese una URL de $1$ $2$",
      type: "enviar"
    },
    url: {
      title: "URL directa",
      label: "URL de la imagen",
      placeholder: "Ingrese la URL de la imagen"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "una foto"
    },
    ninegag: {
      title: "9GAG",
      type: "una foto"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "imagen de twitter"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "artículo"
    },
    fotki: {
      title: "fotos",
      type: "una foto"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Captura de pantalla",
      button: "Tomar captura de pantalla",
      label: "URL de la página web",
      placeholder: "Ingresa una URL",
      loading: "Tomando una captura de pantalla ..."
    },
    search: {
      button: "Buscar en $1$",
      label: "Busca una imagen",
      placeholder: "Buscar algo",
      imagesPoweredBy: "Imágenes posibles por $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Vista Previa"
    },
    filters: {
      title: "Filtros"
    },
    crop: {
      title: "Recortar",
      aspectRatios: {
        free: "Libre",
        square: "Cuadrado"
      }
    },
    rotate: {
      title: "Rotar"
    },
    flip: {
      title: "Dar vuelta",
      buttons: {
        horizontal: "Horizontal",
        vertical: "Vertical"
      }
    },
    sharpen: {
      title: "Agudizar"
    },
    blur: {
      title: "Desenfocar"
    },
    brightness: {
      title: "Brillo"
    },
    contrast: {
      title: "Contraste"
    },
    grayscale: {
      title: "Escala de grises"
    },
    "hue-rotate": {
      title: "Rotar tono"
    },
    invert: {
      title: "Invertir"
    },
    saturate: {
      title: "Saturar"
    },
    sepia: {
      title: "Sepia"
    }
  }
}, de = {
  upload: "آپلود",
  cancel: "لغو",
  close: "بستن",
  uploading: "در حال بارگذاری...",
  uploaded: "آپلود شد",
  fetching: "در حال دریافت تصویر شما $1$...",
  poweredBy: "پشتیبانی شده توسط $1$",
  needHelp: "نیاز به کمک دارید؟",
  units: {
    px: "px",
    "%": "%",
    deg: "°"
  },
  errors: {
    response_not_ok: "در دریافت این فایل با خطا مواجه شدیم",
    unable_to_search: "در جستجو با خطا مواجه شدیم",
    invalid_service_url: "لینک $1$ نشانی اینترنتی نیست",
    invalid_url: "به نظر می رسد این نشانی اینترنتی نامعتبر است",
    upload_aborted: "آپلود شما لغو شد",
    upload_error: "هنگام آپلود این فایل با خطا مواجه شدیم",
    file_type_not_allowed: "این نوع فایل مجاز نیست",
    file_too_large: "فایل شما باید کوچکتر از $1$ باشد"
  },
  help: {
    loading: "در حال بارگذاری راهنما...",
    close: "بستن راهنما"
  },
  services: {
    default: {
      heading: "یک تصویر را انتخاب کنید"
    },
    local: {
      title: "انتخاب فایل",
      button: "یک فایل را انتخاب کنید",
      or: "یا",
      drop: "فایل‌ها را اینجا رها کنید"
    },
    camera: {
      title: "دوربین",
      button: "روی عکس کلیک کنید",
      switch: "تغییر دوربین",
      waiting: "منتظر اجازه...",
      unableToRead: "ما دسترسی به دوربین شما را نداریم. این ممکن است به این دلیل باشد که مجوز لازم را نداده‌اید یا اینکه دوربین شما توسط برنامه دیگری در حال استفاده است."
    },
    microlink: {
      button: "اضافه کردن از $1$",
      label: "$1$ $2$ لینک",
      placeholder: "لینک $1$ $2$ را وارد کنید",
      type: "ارسال"
    },
    url: {
      title: "لینک مستقیم",
      label: "لینک عکس",
      placeholder: "لینک عکس را وارد کنید"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "photo"
    },
    ninegag: {
      title: "9GAG",
      type: "photo"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "image tweet"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "article"
    },
    fotki: {
      title: "Fotki",
      type: "photo"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "اسکرین‌شات",
      button: "گرفتن اسکرین‌شات",
      label: "آدرس صفحه‌ی اینترنتی",
      placeholder: "آدرس صفحه‌ی اینترنتی را وارد کنید",
      loading: "در حال گرفتن اسکرین‌شات..."
    },
    search: {
      button: "جستجو در $1$",
      label: "جستجوی عکس",
      placeholder: "جستجو برای چیزی",
      imagesPoweredBy: "تصاویر پشتیبانی شده توسط $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "پیش‌نمایش"
    },
    filters: {
      title: "فیلترها"
    },
    crop: {
      title: "برش",
      aspectRatios: {
        free: "آزاد",
        square: "مربع"
      }
    },
    rotate: {
      title: "چرخش"
    },
    flip: {
      title: "برگرداندن",
      buttons: {
        horizontal: "افقی",
        vertical: "عمودی"
      }
    },
    sharpen: {
      title: "تیز کردن"
    },
    blur: {
      title: "بلور"
    },
    brightness: {
      title: "روشنایی"
    },
    contrast: {
      title: "کنتراست"
    },
    grayscale: {
      title: "سیاه‌سفید"
    },
    "hue-rotate": {
      title: "چرخش رنگ"
    },
    invert: {
      title: "معکوس کردن"
    },
    saturate: {
      title: "تشبیه"
    },
    sepia: {
      title: "سپیا"
    }
  }
}, pe = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "Une erreur s'est produite lors de la récupération de ce fichier.",
    unable_to_search: "Une erreur est survenue lors de la recherche",
    invalid_service_url: "Ce n'est pas une URL $1$",
    invalid_url: "Cette URL est invalide",
    upload_aborted: "Votre téléchargement a été annulé",
    upload_error: "Une erreur s'est produite lors du téléchargement de ce fichier.",
    file_type_not_allowed: "Ce type de fichier n'est pas supporté",
    file_too_large: "Le fichier doit être inférieur à $1$"
  },
  help: {
    loading: "Aide au chargement...",
    close: "Fermer l'aide"
  },
  services: {
    default: {
      heading: "Sélectionnez une image"
    },
    local: {
      title: "Choisissez un fichier",
      button: "Sélectionnez un fichier",
      or: "de",
      drop: "Faites glisser un fichier ici pour le télécharger"
    },
    camera: {
      title: "Caméra",
      button: "Photo webcam",
      switch: "Changer de caméra",
      waiting: "En attente de la permission de la caméra ...",
      unableToRead: "Nous ne pouvons pas lire la vidéo à partir de votre caméra. Cela peut être dû au fait que vous n'avez pas accordé l'autorisation requise ou que votre appareil ne prend pas en charge l'accès à la caméra."
    },
    microlink: {
      button: "Importation à partir de $1$",
      label: "$1$ $2$ URL",
      placeholder: "Entrez une URL $1$ $2$",
      type: "poster"
    },
    url: {
      title: "Directe URL",
      label: "URL de l'image",
      placeholder: "Entrez une URL d'image"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "une photo"
    },
    ninegag: {
      title: "9GAG",
      type: "une photo"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Gazouillement",
      type: "photo tweet"
    },
    pinterest: {
      title: "Pinterest",
      type: "épingle"
    },
    flipboard: {
      title: "Flipboard",
      type: "article"
    },
    fotki: {
      title: "Photos",
      type: "une photo"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "Nous avons le coeur"
    },
    screenshot: {
      title: "Capture d'écran",
      button: "Prendre une capture d'écran",
      label: "URL de la page Web",
      placeholder: "Entrez une URL",
      loading: "Prenez une capture d'écran ..."
    },
    search: {
      button: "Recherche de $1$",
      label: "Rechercher une image",
      placeholder: "Rechercher quelque chose",
      imagesPoweredBy: "Images rendues possibles par $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Exemple"
    },
    filters: {
      title: "Les filtres"
    },
    crop: {
      title: "Récolte",
      aspectRatios: {
        free: "Libre",
        square: "Plein"
      }
    },
    rotate: {
      title: "Tournant"
    },
    flip: {
      title: "Faire demi-tour",
      buttons: {
        horizontal: "Horizontal",
        vertical: "Vertical"
      }
    },
    sharpen: {
      title: "Netteté"
    },
    blur: {
      title: "Flou"
    },
    brightness: {
      title: "La luminosité"
    },
    contrast: {
      title: "Contraste"
    },
    grayscale: {
      title: "Niveaux de gris"
    },
    "hue-rotate": {
      title: "Faire pivoter la teinte"
    },
    invert: {
      title: "Retourner"
    },
    saturate: {
      title: "Saturer"
    },
    sepia: {
      title: "Sépia"
    }
  }
}, he = {
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
    deg: "डिग्री"
  },
  errors: {
    response_not_ok: "आपकी फ़ाइल लाने में एक त्रुटि हुई",
    unable_to_search: "ढूंढे में एक त्रुटि हुई",
    invalid_service_url: "यह एक $1$ यूआरएल नहीं है",
    invalid_url: "यह यूआरएल गलत है",
    upload_aborted: "आपका अपलोड रद्द हो गया है",
    upload_error: "आपका अपलोड कारसे टूट एक त्रुटि हुई",
    file_type_not_allowed: "यह फाइल टाइप अनुमति नहीं हैं",
    file_too_large: "आपकी फाइल $1$ से छोटी होनी चाहिए"
  },
  help: {
    loading: "मदद लोड हो रही है...",
    close: "मदद बंद करें"
  },
  services: {
    default: {
      heading: "एक तस्वीर चुनें"
    },
    local: {
      title: "एक फाइल चुनें",
      button: "फाइल चुनें",
      or: "या",
      drop: "यहां फाइल छोड़ें"
    },
    camera: {
      title: "कैमरा",
      button: "तस्वीर खीचें",
      switch: "कैमरा बदलें",
      waiting: "अनुमति की प्रतीक्षा की जा रही है...",
      unableToRead: "हम आपका वीडियो नहीं पढ़ पा रहे हैं I यह इसीलिए हो सकता है क्यूंकि आपने अनुमति नहीं दी, या क्योंकि आपके युक्ति में कैमरा नहीं है I"
    },
    microlink: {
      button: "$1$ से आयात",
      label: "$1$ $2$ यूआरएल",
      placeholder: "एक $1$ $2$ यूआरएल दर्ज करें",
      type: "पद"
    },
    url: {
      title: "यूआरएल",
      label: "छवि यूआरएल",
      placeholder: "एक छवि यूआरएल दर्ज करें"
    },
    instagram: {
      title: "इंस्टाग्राम"
    },
    facebook: {
      title: "फेसबुक"
    },
    flickr: {
      title: "फ़्लिकर",
      type: "तस्वीर"
    },
    ninegag: {
      title: "नाइन गैग",
      type: "तस्वीर"
    },
    deviantart: {
      title: "देवीअनत-आर्ट"
    },
    artstation: {
      title: "आर्ट-स्टेशन"
    },
    twitter: {
      title: "ट्विटर",
      type: "तस्वीर ट्वीट"
    },
    pinterest: {
      title: "पिनटेरेस्ट",
      type: "पिन"
    },
    flipboard: {
      title: "फ्लिपबोर्ड",
      type: "लेख"
    },
    fotki: {
      title: "फोटकी",
      type: "तस्वीर"
    },
    linkedin: {
      title: "लिंक्ड-इन"
    },
    reddit: {
      title: "रेड्डिट"
    },
    tumblr: {
      title: "तुमब्लर"
    },
    weheartit: {
      title: "वी हार्ट इट"
    },
    screenshot: {
      title: "स्क्रीनशॉट",
      button: "स्क्रीनशॉट लें",
      label: "वेब पृष्ठ यूआरएल",
      placeholder: "एक वेब पृष्ठ यूआरएल दर्ज करें",
      loading: "स्क्रीनशॉट लिया जा रहा है..."
    },
    search: {
      button: "$1$ पर ढूंढें",
      label: "तस्वीर ढूंढें",
      placeholder: "कुछ ढूंढें",
      imagesPoweredBy: "तस्वीरें $1$ द्वारा संचालित"
    },
    giphy: {
      title: "गिफी"
    },
    unsplash: {
      title: "उनस्प्लैश"
    },
    pixabay: {
      title: "पिक्साबे"
    },
    pexels: {
      title: "पिक्सेल्स"
    }
  },
  effects: {
    preview: {
      title: "पूर्वावलोकन"
    },
    filters: {
      title: "फ़िल्टर"
    },
    crop: {
      title: "क्रॉप",
      aspectRatios: {
        free: "फ़्री",
        square: "वर्ग"
      }
    },
    rotate: {
      title: "घुमाएँ"
    },
    flip: {
      title: "फ्लिप",
      buttons: {
        horizontal: "क्षैतिज",
        vertical: "खड़ा"
      }
    },
    sharpen: {
      title: "पैना"
    },
    blur: {
      title: "कलंक"
    },
    brightness: {
      title: "चमक"
    },
    contrast: {
      title: "कंट्रास्ट"
    },
    grayscale: {
      title: "ग्रेस्केल"
    },
    "hue-rotate": {
      title: "रंग घुमाना"
    },
    invert: {
      title: "रंग पलटना"
    },
    saturate: {
      title: "सैच्युरेट"
    },
    sepia: {
      title: "सीपिया"
    }
  }
}, ue = {
  upload: "carica",
  cancel: "annulla",
  close: "chiudi",
  uploading: "Carica...",
  uploaded: "caricato",
  fetching: "Ottieni immagine da $1$...",
  poweredBy: "Reso possibile da $1$",
  needHelp: "Bisogno di aiuto?",
  units: {
    px: "px",
    "%": "%",
    deg: "°"
  },
  errors: {
    response_not_ok: "Si è verificato un errore durante il recupero di questo file",
    unable_to_search: "Si è verificato un errore durante la ricerca",
    invalid_service_url: "Questo non è un $1$ URL",
    invalid_url: "Questo URL non è valido",
    upload_aborted: "Il tuo caricamento è stato annullato",
    upload_error: "Si è verificato un errore durante il caricamento di questo file",
    file_type_not_allowed: "Questo tipo di file non è supportato",
    file_too_large: "Il file deve essere inferiore a $1$"
  },
  help: {
    loading: "Caricamento della guida...",
    close: "Chiudi aiuto"
  },
  services: {
    default: {
      heading: "Seleziona un'immagine"
    },
    local: {
      title: "Scegli un file",
      button: "Seleziona un file",
      or: "o",
      drop: "Trascina qui un file per caricarlo"
    },
    camera: {
      title: "Telecamera",
      button: "Foto della telecamera",
      switch: "Cambia telecamera",
      waiting: "In attesa di autorizzazione della telecamera...",
      unableToRead: "Non é possibile leggere il video della telecamera. Ciò può essere dovuto al fatto che non hai concesso l'autorizzazione richiesta o perché il tuo dispositivo non supporta l'accesso alla telecamera."
    },
    microlink: {
      button: "Importa da $1$",
      label: "$1$ $2$ URL",
      placeholder: "Inserisci un URL da $1$ $2$",
      type: "inviare"
    },
    url: {
      title: "URL diretto",
      label: "URL immagine",
      placeholder: "Inserisci un URL immagine"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "foto"
    },
    ninegag: {
      title: "9GAG",
      type: "foto"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "cinguettio",
      type: "tweet fotografico"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "articolo"
    },
    fotki: {
      title: "Fotki",
      type: "foto"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Screenshot",
      button: "Fai uno screenshot",
      label: "URL della pagina web",
      placeholder: "Inserisci un URL",
      loading: "Fai uno screenshot..."
    },
    search: {
      button: "Cerca $1$",
      label: "Cerca un'immagine",
      placeholder: "Cerca qualcosa",
      imagesPoweredBy: "Reso possibile da $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Anteprima"
    },
    filters: {
      title: "Filtri"
    },
    crop: {
      title: "Taglio",
      aspectRatios: {
        free: "libero",
        square: "quadrato"
      }
    },
    rotate: {
      title: "Ruotare"
    },
    flip: {
      title: "Capovolgere",
      buttons: {
        horizontal: "orizzontale",
        vertical: "verticale"
      }
    },
    sharpen: {
      title: "Affinare"
    },
    blur: {
      title: "Sfocare"
    },
    brightness: {
      title: "Luminosità"
    },
    contrast: {
      title: "Contrasto"
    },
    grayscale: {
      title: "Scala di grigi"
    },
    "hue-rotate": {
      title: "Ruota tonalità"
    },
    invert: {
      title: "Invertire"
    },
    saturate: {
      title: "Saturare"
    },
    sepia: {
      title: "Seppia"
    }
  }
}, fe = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "Er is een fout opgetreden bij het ophalen van dit bestand",
    unable_to_search: "Er is een fout opgetreden bij het zoeken",
    invalid_service_url: "Dit is geen $1$-URL",
    invalid_url: "Deze URL is ongeldig",
    upload_aborted: "Je upload is geannuleerd",
    upload_error: "Er is een fout opgetreden bij het uploaden van dit bestand",
    file_type_not_allowed: "Dit bestandstype wordt niet ondersteund",
    file_too_large: "Het bestand moet kleiner zijn dan $1$"
  },
  help: {
    loading: "Bezig met het laden van hulp...",
    close: "Hulp sluiten"
  },
  services: {
    default: {
      heading: "Selecteer een afbeelding"
    },
    local: {
      title: "Kies een bestand",
      button: "Selecteer een bestand",
      or: "of",
      drop: "Sleep hier een bestand om te uploaden"
    },
    camera: {
      title: "Camera",
      button: "Webcam foto",
      switch: "Switch camera",
      waiting: "Wachten op camera permissie...",
      unableToRead: "We kunnen de video van uw camera niet lezen. Dit kan zijn omdat u niet de vereiste toestemming hebt verleend of omdat uw apparaat geen cameratoegang ondersteunt."
    },
    microlink: {
      button: "Importeer van $1$",
      label: "$1$ $2$ URL",
      placeholder: "Voer een $1$-$2$-URL in",
      type: "post"
    },
    url: {
      title: "Directe URL",
      label: "Afbeeldings-URL",
      placeholder: "Voer een afbeeldings-URL in"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "foto"
    },
    ninegag: {
      title: "9GAG",
      type: "foto"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "foto tweet"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "artikel"
    },
    fotki: {
      title: "Fotki",
      type: "foto"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Screenshot",
      button: "Screenshot maken",
      label: "URL van webpagina",
      placeholder: "Voer een URL in",
      loading: "Bezig met het maken van een screenshot..."
    },
    search: {
      button: "Zoeken op $1$",
      label: "Zoek een afbeelding",
      placeholder: "Zoek naar iets",
      imagesPoweredBy: "Afbeeldingen mogelijk gemaakt door $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Voorbeeld"
    },
    filters: {
      title: "Filters"
    },
    crop: {
      title: "Bijsnijden",
      aspectRatios: {
        free: "Free",
        square: "Plein"
      }
    },
    rotate: {
      title: "Draaien"
    },
    flip: {
      title: "Omdraaien",
      buttons: {
        horizontal: "Horizontaal",
        vertical: "Verticaal"
      }
    },
    sharpen: {
      title: "Verscherpen"
    },
    blur: {
      title: "Vervagen"
    },
    brightness: {
      title: "Helderheid"
    },
    contrast: {
      title: "Contrast"
    },
    grayscale: {
      title: "Grijstinten"
    },
    "hue-rotate": {
      title: "Tint roteren"
    },
    invert: {
      title: "Omkeren"
    },
    saturate: {
      title: "Verzadigen"
    },
    sepia: {
      title: "Sepia"
    }
  }
}, ge = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "Ocorreu um erro ao buscar este arquivo",
    unable_to_search: "Não foi possível realizar a busca",
    invalid_service_url: "Esta URL não pertence a $1$",
    invalid_url: "Esta URL parece ser inválida",
    upload_aborted: "Seu envio foi cancelado",
    upload_error: "Ocorreu um erro durante o envio deste arquivo",
    file_type_not_allowed: "Este tipo de arquivo não é permitido",
    file_too_large: "Seu arquivo deve ser menor que $1$"
  },
  help: {
    loading: "Carregando ajuda...",
    close: "Fechar Ajuda"
  },
  services: {
    default: {
      heading: "Selecione uma imagem"
    },
    local: {
      title: "Escolher arquivo",
      button: "Selecione um arquivo",
      or: "ou",
      drop: "Arraste-os para cá"
    },
    camera: {
      title: "Câmera",
      button: "Tirar foto",
      switch: "Mudar câmera",
      waiting: "Esperando a permissão...",
      unableToRead: "Não foi possível obter acesso a câmera. Isto pode ter ocorrido se você não tiver permitido ou seu dispositivo suportar acesso a câmera."
    },
    microlink: {
      button: "Importar $1$",
      label: "$2$ do $1$",
      placeholder: "Insira a URL do $2$ do $1$",
      type: "post"
    },
    url: {
      title: "URL",
      label: "URL da imagem",
      placeholder: "Insira a URL da imagem"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "foto"
    },
    ninegag: {
      title: "9GAG",
      type: "foto"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "tweet"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "artigo"
    },
    fotki: {
      title: "Fotki",
      type: "foto"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Captura de tela (screenshot)",
      button: "Fazer captura da tela",
      label: "URL do site",
      placeholder: "Insira a URL do site",
      loading: "Fazendo captura..."
    },
    search: {
      button: "Pesquisar no $1$",
      label: "Procure uma imagem",
      placeholder: "Procurar algo",
      imagesPoweredBy: "Busca de imagens fornecida por $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Previsualização"
    },
    filters: {
      title: "Filtros"
    },
    crop: {
      title: "Corte",
      aspectRatios: {
        free: "Livre",
        square: "Quadrado"
      }
    },
    rotate: {
      title: "Rotacionar"
    },
    flip: {
      title: "Inverter",
      buttons: {
        horizontal: "Horizontal",
        vertical: "Vertical"
      }
    },
    sharpen: {
      title: "Aguçar"
    },
    blur: {
      title: "Desfocar"
    },
    brightness: {
      title: "Brilho"
    },
    contrast: {
      title: "Contraste"
    },
    grayscale: {
      title: "Escala de cinza"
    },
    "hue-rotate": {
      title: "Matiz"
    },
    invert: {
      title: "Inverter"
    },
    saturate: {
      title: "Saturar"
    },
    sepia: {
      title: "Sépia"
    }
  }
}, me = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "S-a produs o eroare in timpul obținerii acestui fișier",
    unable_to_search: "S-a produs o eroare in timpul căutării",
    invalid_service_url: "Acesta nu este un URL de $1$",
    invalid_url: "Acest URL nu este valid",
    upload_aborted: "Încărcare a fost anulată",
    upload_error: "S-a produs o eroare in timpul încărcarii acestui fișier",
    file_type_not_allowed: "Acest tip de fișier nu este permis.",
    file_too_large: "Fișierul trebuie să fie mai mic de $1$"
  },
  help: {
    loading: "Se obține ajutor...",
    close: "Închidere ajutor"
  },
  services: {
    default: {
      heading: "Selectează o imagine"
    },
    local: {
      title: "Alege un fișier",
      button: "Selectează un fișier",
      or: "ori",
      drop: "Plasați fișierele aici"
    },
    camera: {
      title: "Cameră",
      button: "Capturează o imagine",
      switch: "Schimbă camera",
      waiting: "Se așteaptă permisiunea...",
      unableToRead: "Nu putem să citim semnalul video al camerei. Acest lucru se poate întâmpla pentru că nu ați acordat permisiunea necesară sau pentru că dispozitivul dvs. nu acceptă accesul camerei."
    },
    microlink: {
      button: "Importă de pe $1$",
      label: "$1$ $2$ URL",
      placeholder: "Tastează $1$ $2$ URL",
      type: "trimite"
    },
    url: {
      title: "URL direct",
      label: "URL imagine",
      placeholder: "Tastează URL-ul imaginii"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "fotografie"
    },
    ninegag: {
      title: "9GAG",
      type: "fotografie"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "tweet imagine"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "articol"
    },
    fotki: {
      title: "Fotki",
      type: "fotografie"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Captură de ecran",
      button: "Capturează ecran",
      label: "URL pagină web",
      placeholder: "Tastează URL-ul imaginii",
      loading: "Se capturează ecranul..."
    },
    search: {
      button: "Caută pe $1$",
      label: "Găsește o imagine",
      placeholder: "Caută ceva",
      imagesPoweredBy: "Imagini provenite de la $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Previzualizare"
    },
    filters: {
      title: "Filtre"
    },
    crop: {
      title: "Decupare",
      aspectRatios: {
        free: "Liber",
        square: "Pătrat"
      }
    },
    rotate: {
      title: "Rotire"
    },
    flip: {
      title: "Oglindire",
      buttons: {
        horizontal: "Orizontal",
        vertical: "Vertical"
      }
    },
    sharpen: {
      title: "Accentuare"
    },
    blur: {
      title: "Estompare"
    },
    brightness: {
      title: "Luminozitate"
    },
    contrast: {
      title: "Contrast"
    },
    grayscale: {
      title: "Scară tonurilor de gri"
    },
    "hue-rotate": {
      title: "Rotire tonuri"
    },
    invert: {
      title: "Inversare"
    },
    saturate: {
      title: "Saturare"
    },
    sepia: {
      title: "Sepia"
    }
  }
}, ve = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "Произошла ошибка при получении этого файла",
    unable_to_search: "Произошла ошибка при поиске",
    invalid_service_url: "Это не URL $1$",
    invalid_url: "Этот URL недействителен",
    upload_aborted: "Ваша загрузка была отменена",
    upload_error: "Произошла ошибка при загрузке этого файла",
    file_type_not_allowed: "Этот тип файла не поддерживается",
    file_too_large: "Файл должен быть не более $1$"
  },
  help: {
    loading: "Загрузка...",
    close: "Закрыть"
  },
  services: {
    default: {
      heading: "Выберите изображение"
    },
    local: {
      title: "Выберите файл",
      button: "Выберите файл",
      or: "или",
      drop: "Перетащите файл сюда, чтобы загрузить"
    },
    camera: {
      title: "Камера",
      button: "Cделать фото",
      switch: "Переключить камеру",
      waiting: "Жду разрешения камеры...",
      unableToRead: "Мы не можем получить доступ к вашей камере. Это может быть связано с тем, что вы не предоставили разрешение, или ваше устройство не поддерживает доступ к камере."
    },
    microlink: {
      button: "Скачать из $1$",
      label: "Ссылка на $1$ $2$",
      placeholder: "Введите ссылку на $1$ $2$",
      type: "пост"
    },
    url: {
      title: "Ссылка",
      label: "Ссылка на изображение",
      placeholder: "Введите ссылку на изображение",
      button: "Скачать изображение"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "фото"
    },
    ninegag: {
      title: "9GAG",
      type: "фото"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "фото твит"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "статья"
    },
    fotki: {
      title: "Fotki",
      type: "фото"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Скриншот",
      button: "Сделать скриншот",
      label: "Ссылка на сайт",
      placeholder: "Введите ссылку",
      loading: "Скриншотим..."
    },
    search: {
      button: "Поиск на $1$",
      label: "Поиск изображений",
      placeholder: "",
      imagesPoweredBy: "картинки предоставлены $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "пример"
    },
    filters: {
      title: "Фильтры"
    },
    crop: {
      title: "Обрезать",
      aspectRatios: {
        free: "Свободный",
        square: "Квадрат"
      }
    },
    rotate: {
      title: "Поворот"
    },
    flip: {
      title: "Отразить",
      buttons: {
        horizontal: "Горизонтально",
        vertical: "Вертикально"
      }
    },
    sharpen: {
      title: "Резкость"
    },
    blur: {
      title: "Размытие"
    },
    brightness: {
      title: "Яркость"
    },
    contrast: {
      title: "Контраст"
    },
    grayscale: {
      title: "Оттенки серого"
    },
    "hue-rotate": {
      title: "Повернуть оттенок"
    },
    invert: {
      title: "Инверсия"
    },
    saturate: {
      title: "Насыщенность"
    },
    sepia: {
      title: "Сепия"
    }
  }
}, be = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "Bu dosya alınırken bir hata oluştu",
    unable_to_search: "Aranırken bir hata oluştu",
    invalid_service_url: "Bu bir $1$ URL değil",
    invalid_url: "Bu URL geçersiz",
    upload_aborted: "Yüklemeniz iptal edildi",
    upload_error: "Bu dosya yüklenirken bir hata oluştu",
    file_type_not_allowed: "Bu dosya türü desteklenmiyor",
    file_too_large: "Dosya $1$ 'dan az olmalı"
  },
  help: {
    loading: "Yardım yükleniyor...",
    close: "Yardımı kapat"
  },
  services: {
    default: {
      heading: "Bir resim seç"
    },
    local: {
      title: "Bir dosya seç",
      button: "Bir dosya seç",
      or: "arasında",
      drop: "Yüklemek için bir dosyayı buraya sürükleyin"
    },
    camera: {
      title: "Kamera",
      button: "Webcam fotoğraf",
      switch: "Kamera değiştir",
      waiting: "Kamera izni bekleniyor ...",
      unableToRead: "Videoyu kameranızdan okuyamıyoruz. Bunun nedeni gerekli izni vermediğiniz veya cihazınızın kamera erişimini desteklememesi olabilir."
    },
    microlink: {
      button: "1 $ 'dan içe aktar",
      label: "$1$ $2$ URL",
      placeholder: "Bir $1$ $2$ URL girin",
      type: "posta"
    },
    url: {
      title: "Doğrudan URL",
      label: "Image URL",
      placeholder: "Bir resim URL’si girin"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "bir fotoğraf"
    },
    ninegag: {
      title: "9gag",
      type: "bir fotoğraf"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "heyecan",
      type: "fotoğraf tweet"
    },
    pinterest: {
      title: "pinterest",
      type: "toplu iğne"
    },
    flipboard: {
      title: "Flipboard",
      type: "makale"
    },
    fotki: {
      title: "Resimler",
      type: "bir fotoğraf"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "Biz kalp"
    },
    screenshot: {
      title: "Ekran görüntüsü",
      button: "Ekran görüntüsü al",
      label: "Web sayfasının URL'si",
      placeholder: "Bir URL girin",
      loading: "Ekran görüntüsü al ..."
    },
    search: {
      button: "$1$ için ara",
      label: "Bir resim arayın",
      placeholder: "Bir şey arayın",
      imagesPoweredBy: "Görüntüler $1$ 'a kadar mümkün kılındı"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "örnek"
    },
    filters: {
      title: "Filtreler"
    },
    crop: {
      title: "ekin",
      aspectRatios: {
        free: "Ücretsiz",
        square: "tam"
      }
    },
    rotate: {
      title: "büküm"
    },
    flip: {
      title: "Arkanı dön",
      buttons: {
        horizontal: "yatay",
        vertical: "dikey"
      }
    },
    sharpen: {
      title: "keskinleştirme"
    },
    blur: {
      title: "karartmak"
    },
    brightness: {
      title: "parlaklık"
    },
    contrast: {
      title: "Kontrast"
    },
    grayscale: {
      title: "Gri tonlama"
    },
    "hue-rotate": {
      title: "Tonu döndür"
    },
    invert: {
      title: "Ters çevir"
    },
    saturate: {
      title: "doyurmak"
    },
    sepia: {
      title: "Sepya"
    }
  }
}, ye = {
  upload: "Завантажити",
  cancel: "Відмінити",
  close: "Закрити",
  uploading: "Завантаження...",
  uploaded: "Завантажено",
  fetching: "Отримання зображення з $1$...",
  poweredBy: "Розроблено $1$",
  needHelp: "Потрібна допомога?",
  units: {
    px: " піксел",
    "%": "%",
    deg: "°"
  },
  errors: {
    response_not_ok: "Сталася помилка під час виклику файлу",
    unable_to_search: "Сталася помилка пошуку",
    invalid_service_url: "Це не $A$ $1$ URL адреса",
    invalid_url: "Ця URL адреса недійсна",
    upload_aborted: "Ваше завантаження скасовано",
    upload_error: "Сталася помилка під час завантаження цього файлу",
    file_type_not_allowed: "Цей тип файлу не підтримується",
    file_too_large: "Файл має бути менший ніж $1$"
  },
  help: {
    loading: "Завантаження допомоги...",
    close: "Відмовитись від допомоги"
  },
  services: {
    default: {
      heading: "Оберіть зображення"
    },
    local: {
      title: "Оберіть файл",
      button: "Оберіть",
      or: "або",
      drop: "Перетягніть файли сюди"
    },
    camera: {
      title: "Камера",
      button: "Зняти",
      switch: "Змінити камеру",
      waiting: "Чекаю на дозвіл...",
      unableToRead: "Не можу побачити відео з вашої камери. Можливо, ви не надали потрібний дозвіл або ваш пристрій не підтримує доступ до камери."
    },
    microlink: {
      button: "Імпорт з $1$",
      label: "$1$ $2$ URL адреса",
      placeholder: "Введіть $A$ $1$ $2$ URL адресу",
      type: "ввести"
    },
    url: {
      title: "Пряма URL адреса",
      label: "URL адреса зображення",
      placeholder: "Введіть URL адресу зображення"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "фото"
    },
    ninegag: {
      title: "9GAG",
      type: "фото"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "твіт зображення"
    },
    pinterest: {
      title: "Pinterest",
      type: "pin"
    },
    flipboard: {
      title: "Flipboard",
      type: "стаття"
    },
    fotki: {
      title: "Fotki",
      type: "фото"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "Скріншот",
      button: "Зробити знімок екрана",
      label: "URL адреса сторінки",
      placeholder: "Введіть URL сторінки",
      loading: "Роблю знімок екрана..."
    },
    search: {
      button: "Шукати в $1$",
      label: "Знайти зображення",
      placeholder: "Спробуйте пошук",
      imagesPoweredBy: "Зображення запропоновані $1$"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "Попередній перегляд"
    },
    filters: {
      title: "Фільтри"
    },
    crop: {
      title: "Обрізання",
      aspectRatios: {
        free: "Вільне",
        square: "Квадрат"
      }
    },
    rotate: {
      title: "Обертання"
    },
    flip: {
      title: "Відображення",
      buttons: {
        horizontal: "Горизонтальне",
        vertical: "Вертикальне"
      }
    },
    sharpen: {
      title: "Різкість"
    },
    blur: {
      title: "Розмиття"
    },
    brightness: {
      title: "Яскравість"
    },
    contrast: {
      title: "Контраст"
    },
    grayscale: {
      title: "Відтінки сірого"
    },
    "hue-rotate": {
      title: "Обернення відтінку"
    },
    invert: {
      title: "Інверсія"
    },
    saturate: {
      title: "Насиченість"
    },
    sepia: {
      title: "Сепія"
    }
  }
}, we = {
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
    deg: "°"
  },
  errors: {
    response_not_ok: "我們在抓取這個檔案時發生錯誤",
    unable_to_search: "我們在搜尋時發生錯誤",
    invalid_service_url: "這不是一個 $1$ 網址",
    invalid_url: "這個網址似乎無效",
    upload_aborted: "您的上傳已取消",
    upload_error: "我們在上傳這個檔案時發生錯誤",
    file_type_not_allowed: "這個檔案類型不被允許",
    file_too_large: "您的檔案應該小於 $1$"
  },
  help: {
    loading: "讀取幫助中...",
    close: "關閉幫助"
  },
  services: {
    default: {
      heading: "選擇一個影像"
    },
    local: {
      title: "選擇檔案",
      button: "選擇一個檔案",
      or: "或",
      drop: "拖曳檔案至此"
    },
    camera: {
      title: "相機",
      button: "點擊照片",
      switch: "切換照片",
      waiting: "等待權限授權中...",
      unableToRead: "我們無法從您的相機讀取影像，這可能是因為您拒絕了授予權限或是因為您的裝置不支援存取相機"
    },
    microlink: {
      button: "匯入 $1$",
      label: "$1$ $2$ 網址",
      placeholder: "請輸入一個 $1$ 的 $2$ 網址",
      type: "post"
    },
    url: {
      title: "網址",
      label: "影像網址",
      placeholder: "請輸入一個影像網址"
    },
    instagram: {
      title: "Instagram"
    },
    facebook: {
      title: "Facebook"
    },
    flickr: {
      title: "Flickr",
      type: "圖像"
    },
    ninegag: {
      title: "9GAG",
      type: "圖像"
    },
    deviantart: {
      title: "DeviantArt"
    },
    artstation: {
      title: "ArtStation"
    },
    twitter: {
      title: "Twitter",
      type: "影像推文"
    },
    pinterest: {
      title: "Pinterest",
      type: "釘文"
    },
    flipboard: {
      title: "Flipboard",
      type: "文章"
    },
    fotki: {
      title: "Fotki",
      type: "影像"
    },
    linkedin: {
      title: "LinkedIn"
    },
    reddit: {
      title: "Reddit"
    },
    tumblr: {
      title: "Tumblr"
    },
    weheartit: {
      title: "We Heart It"
    },
    screenshot: {
      title: "螢幕截圖",
      button: "擷取螢幕截圖",
      label: "網頁網址",
      placeholder: "請輸入一個網頁網址",
      loading: "正在擷取螢幕截圖..."
    },
    search: {
      button: "搜尋 $1$",
      label: "找一張影像",
      placeholder: "請輸入關鍵字",
      imagesPoweredBy: "影像由 $1$ 提供"
    },
    giphy: {
      title: "GIPHY"
    },
    unsplash: {
      title: "Unsplash"
    },
    pixabay: {
      title: "Pixabay"
    },
    pexels: {
      title: "Pexels"
    }
  },
  effects: {
    preview: {
      title: "預覽"
    },
    filters: {
      title: "濾鏡"
    },
    crop: {
      title: "剪裁",
      aspectRatios: {
        free: "自由",
        square: "正方形"
      }
    },
    rotate: {
      title: "旋轉"
    },
    flip: {
      title: "翻轉",
      buttons: {
        horizontal: "水平",
        vertical: "垂直"
      }
    },
    sharpen: {
      title: "銳化"
    },
    blur: {
      title: "模糊"
    },
    brightness: {
      title: "亮度"
    },
    contrast: {
      title: "對比"
    },
    grayscale: {
      title: "灰階"
    },
    "hue-rotate": {
      title: "色相旋轉"
    },
    invert: {
      title: "負片效果"
    },
    saturate: {
      title: "飽和度"
    },
    sepia: {
      title: "懷舊(黃褐色)"
    }
  }
}, $e = ({
  endpoint: o,
  fileKeyName: t = "file",
  method: e = "POST",
  responseKey: a = "url",
  responseFunction: l,
  settingsFunction: r
}) => (n, c) => new Promise((s, d) => {
  const h = new FormData();
  h.append(t, n);
  const u = new XMLHttpRequest();
  u.open(e, o, !0), typeof r == "function" && r(u), u.addEventListener("progress", (f) => {
    typeof c == "function" && c(f.loaded / f.total);
  }), u.addEventListener("load", () => {
    const f = u.responseText;
    if (typeof l == "function")
      return s(l(f));
    const g = JSON.parse(f);
    return s(g[a]);
  }), u.addEventListener("error", () => d("errors.response_not_ok")), u.addEventListener("abort", () => d("errors.upload_aborted")), u.send(h);
}), ke = ({
  endpoint: o,
  settingsFunction: t,
  method: e = "POST",
  fileKeyName: a = "file",
  responseKey: l = "url",
  responseFunction: r
}) => (n) => new Promise((c, s) => {
  const d = new FormData();
  d.append(a, n), window.fetch(
    o,
    t ? t(n) : {
      method: e,
      body: d
    }
  ).then((h) => {
    if (!h.ok)
      throw new Error("errors.response_not_ok");
    return h.json();
  }).then((h) => c(typeof r == "function" ? r(h) : h[l])).catch(() => s("errors.response_not_ok"));
});
class xe extends $ {
  constructor() {
    super(...arguments);
    i(this, "name", "camera");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M63 65l17-33c2-3 5-5 9-5h78c4 0 8 2 9 5l17 33h33c17 0 30 13 30 29v106c0 16-13 29-30 29H30c-17 0-30-13-30-29V94c0-16 13-29 30-29h33zm65 126c27 0 49-22 49-49 0-26-22-48-49-48s-49 22-49 48c0 27 22 49 49 49zm0-20c-16 0-30-13-30-29s14-28 30-28 30 12 30 28-14 29-30 29zm79-48c5 0 10-4 10-9 0-6-5-10-10-10-6 0-10 4-10 10 0 5 4 9 10 9z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#16a085");
    i(this, "stream");
    i(this, "canvas", document.createElement("canvas"));
    i(this, "gotError", !1);
    i(this, "waiting", !1);
    i(this, "frontCamera", !1);
    i(this, "supports", () => window.navigator.mediaDevices && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    i(this, "template", ({ translate: e, uppload: a }) => `
      <div class="service-main">
        <div class="camera-waiting">${e(
      "services.camera.waiting"
    )}</div>
        <div class="camera-error">
          <p>${e("services.camera.unableToRead")}</p>
          ${a.settings.disableHelp ? "" : `<p><a href="https://uppload.js.org/help/services/camera" target="_blank">${e(
      "needHelp"
    )}</a></p>`}
        </div>
        <div class="camera-success">
          <video class="camera-stream"></video>
        </div>
      </div>
      <footer class="service-footer">
        <!--<button
          class="camera-switch uppload-button"
        >${e("services.camera.switch")}</button>-->
        <button
          class="camera-click uppload-button uppload-button--cta"
          style="background: ${this.color}"
        >${e("services.camera.button")}</button>
      </footer>${a.settings.disableHelp ? "" : `<button class="need-help-link"><span>${e(
      "needHelp"
    )}</span aria-hidden="true"><span>?</span></button>`}`);
    i(this, "stop", () => {
      this.stream && this.stream.getTracks().forEach((e) => e.stop());
    });
    i(this, "handlers", (e) => {
      this.waiting = !0, this.update(e);
      const a = {
        audio: !1,
        video: { width: 1280, height: 1280 }
      };
      this.startStream(e, a);
      const l = e.uppload.container.querySelector(".camera-click");
      l && p(l, "click", this.clickPhoto.bind(this, e));
      const r = e.uppload.container.querySelector(".camera-click");
      r && p(r, "click", this.switchCamera.bind(this, e));
      const n = e.uppload.container.querySelector(".need-help-link");
      n && p(
        n,
        "click",
        () => e.showHelp("/services/camera")
      );
    });
  }
  update(e) {
    const a = e.uppload.container.querySelector(
      ".camera-waiting"
    );
    a && (a.style.display = "none", a.style.opacity = "0");
    const l = e.uppload.container.querySelector(
      ".camera-error"
    );
    l && (l.style.display = "none", l.style.opacity = "0");
    const r = e.uppload.container.querySelector(
      ".camera-success"
    );
    r && (r.style.display = "none", r.style.opacity = "0");
    const n = e.uppload.container.querySelector(
      ".service-footer"
    );
    n && (n.style.display = "none", n.style.opacity = "0"), this.gotError ? l && (l.style.display = "", l.style.opacity = "1") : this.waiting ? a && (a.style.display = "", a.style.opacity = "1") : (r && (r.style.display = "", r.style.opacity = "1"), n && (n.style.display = "", n.style.opacity = "1"));
  }
  switchCamera(e) {
    this.frontCamera = !this.frontCamera;
    const a = {
      audio: !1,
      video: {
        width: 1280,
        height: 1280,
        facingMode: this.frontCamera ? "user" : "environment"
      }
    };
    this.startStream(e, a);
  }
  clickPhoto(e) {
    this.canvas = document.createElement("canvas");
    const a = e.uppload.container.querySelector(
      "video.camera-stream"
    );
    if (!a || !this.stream)
      return;
    const l = a.getBoundingClientRect();
    let r = l.width, n = l.height;
    this.stream.getTracks().forEach((s) => {
      const d = s.getSettings();
      d.width && (r = d.width), d.height && (n = d.height);
    }), this.canvas.width = r, this.canvas.height = n;
    const c = this.canvas.getContext("2d");
    c && (c.clearRect(0, 0, this.canvas.width, this.canvas.height), c.drawImage(a, 0, 0, r, n), b(this.canvas).then(
      (s) => e.next(
        w(
          s,
          `camera-photo-${Math.random().toString(36).slice(2)}.png`,
          "image/png",
          new Date()
        )
      )
    ));
  }
  startStream(e, a) {
    this.stop(), window.navigator.mediaDevices.getUserMedia(a).then((l) => {
      this.stream = l;
      const r = e.uppload.container.querySelector(
        "video.camera-stream"
      );
      r && (r.srcObject = l, p(r, "loadedmetadata", () => r.play()), k(e, r));
    }).catch(() => {
      this.gotError = !0;
    }).then(() => {
      this.waiting = !1, this.update(e);
    });
  }
}
class ze extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "instagram");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M180.8.8a94 94 0 0131 6 62.7 62.7 0 0122.7 14.7 62.7 62.7 0 0114.7 22.7 94 94 0 016 31c.6 13.1.7 17.7.8 48.8v8c0 31.1-.2 35.7-.8 48.8a94 94 0 01-6 31 65.4 65.4 0 01-37.4 37.4 94 94 0 01-31 6c-13.1.6-17.7.7-48.8.8h-8c-31.1 0-35.7-.2-48.8-.8a94 94 0 01-31-6 62.7 62.7 0 01-22.7-14.7 62.7 62.7 0 01-14.7-22.7 94 94 0 01-6-31c-.6-12.9-.7-17.5-.8-47V123c0-30.2.2-34.8.8-47.8a94 94 0 016-31 62.7 62.7 0 0114.7-22.7A62.7 62.7 0 0144.2 6.8a94 94 0 0131-6 811 811 0 0147-.8H133c30.2 0 34.8.2 47.8.8zM132 26h-8.7c-23.4 0-27.1.1-37.4.6a74.9 74.9 0 00-24.7 4.8 50 50 0 00-18 11.7 50 50 0 00-11.8 18A74.9 74.9 0 0026.6 86c-.4 10.2-.6 13.9-.6 36.6v11c0 22.7.2 26.4.6 36.6a74.9 74.9 0 004.8 24.7 50 50 0 0011.7 18 50 50 0 0018 11.8 74.9 74.9 0 0024.8 4.8c10.5.5 14.1.6 38.9.6h6.4c24.8 0 28.4-.1 38.9-.6a74.9 74.9 0 0024.7-4.8 52.2 52.2 0 0029.8-29.8 74.9 74.9 0 004.8-24.7c.5-10.5.6-14.1.6-39v-6.3c0-24.8-.1-28.4-.6-38.9a74.9 74.9 0 00-4.8-24.7 50 50 0 00-11.7-18 50 50 0 00-18-11.8 74.9 74.9 0 00-24.8-4.8c-10.4-.5-14-.6-38.1-.6zm0 18.4c23.6 0 27 .1 37.2.6 10 .4 15.4 2 19 3.5 4.4 1.6 8.4 4.2 11.7 7.6 3.4 3.3 6 7.3 7.6 11.7 1.4 3.6 3 9 3.5 19 .5 10.2.6 13.6.6 37.3v7.8c0 23.7-.1 27-.6 37.3-.4 10-2 15.4-3.5 19a33.8 33.8 0 01-19.3 19.3c-3.6 1.4-9 3-19 3.5-10.3.5-13.7.6-38 .6h-7a643 643 0 01-37.4-.6c-10-.4-15.4-2-19-3.5a31.6 31.6 0 01-11.7-7.6c-3.4-3.3-6-7.3-7.6-11.7-1.4-3.6-3-9-3.5-19-.5-10.3-.6-13.7-.6-38v-7c0-23.8.1-27.2.6-37.4.4-10 2-15.4 3.5-19 1.6-4.4 4.2-8.4 7.6-11.7 3.3-3.4 7.3-6 11.7-7.6 3.6-1.4 9-3 19-3.5 10.2-.5 13.6-.6 37.3-.6zM128.4 75a52.5 52.5 0 100 105 52.5 52.5 0 000-105zm0 18.4a34 34 0 110 68.2 34 34 0 010-68.2zM182 62a12 12 0 100 24 12 12 0 000-24z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#cc3366");
    i(this, "exampleURL", "https://www.instagram.com/p/Bu_T4RihQFB/");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(instagram|instagr)\.(com|am)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Se extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "facebook");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0c71 0 128 58 128 129 0 64-47 117-108 127v-89h30l6-38h-36v-24c0-10 5-20 21-20h16V53s-15-3-29-3c-29 0-48 18-48 50v29H75v37h1v1h32v89C47 246 1 194 0 131v-2C0 58 57 0 128 0z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#1b69f6");
    i(this, "exampleURL", "https://www.facebook.com/elninotech/photos/a.2066268863489861/2066268886823192/?type=3&theater");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(facebook|fb)\.(com|me)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
const C = (o, t = 2) => {
  if (o === 0)
    return "0 Bytes";
  const e = 1024, a = t < 0 ? 0 : t, l = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB",
    "EB",
    "ZB",
    "YB"
  ], r = Math.floor(Math.log(o) / Math.log(e)), n = l[r];
  return parseFloat((o / Math.pow(e, r)).toFixed(a)) + " " + n;
};
class Re extends $ {
  constructor({
    mimeTypes: e,
    maxFileSize: a
  } = {}) {
    super();
    i(this, "name", "local");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path d="M177 56L125 4l-3-2v57h57c0-2-1-3-2-3z"/><path d="M173 113h8V75h-66c-5 0-8-4-8-8V1H27c-4 0-8 4-8 8v184c0 4 4 8 8 8h65v-8c0-45 36-80 81-80z"/><path d="M173 128c-36 0-65 29-65 64s29 64 65 64c35 0 64-29 64-64s-29-64-64-64zm27 63h-14v33c0 2-2 3-4 3h-20c-2 0-3-1-3-3v-33h-14c-3 0-5-3-3-5l28-30c1-2 3-2 5 0l27 30c2 2 1 5-2 5z"/></g></svg>');
    i(this, "color", "#34495e");
    i(this, "mimeTypes", ["image/gif", "image/jpeg", "image/jpg", "image/png"]);
    i(this, "maxFileSize", 1 / 0);
    i(this, "template", (e) => `<div class="drop-area">
      <div>${e.translate("services.local.drop")}</div>
      <em>${e.translate("services.local.or")}</em>
      <button class="uppload-button uppload-button--cta" style="background: ${this.color}">${e.translate("services.local.button")}</button>
    </div>
      <div class="alternate-input">
        <input type="file" accept="${this.mimeTypes.join()}"${e.uppload.settings.multiple ? " multiple" : ""}></div>${e.uppload.settings.disableHelp ? "" : `<button class="need-help-link"><span>${v(
      "needHelp"
    )}</span aria-hidden="true"><span>?</span></button>`}`);
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(".drop-area");
      a && (p(
        a,
        "drop",
        (n) => this.dropHandler(e, n)
      ), p(
        a,
        "dragover",
        (n) => this.dragHandler(e, n)
      ), p(a, "dragend", (n) => this.dragStop(e, n)), p(a, "dragexit", (n) => this.dragStop(e, n)), p(a, "dragleave", (n) => this.dragStop(e, n)), p(a, "click", (n) => this.fileSelect(e, n)));
      const l = e.uppload.container.querySelector(
        ".alternate-input input[type=file]"
      );
      l && p(l, "change", (n) => this.getFile(e, n));
      const r = e.uppload.container.querySelector(".need-help-link");
      r && p(r, "click", () => e.showHelp("/services/local"));
    });
    e && (this.mimeTypes = e), a && (this.maxFileSize = a);
  }
  getFile(e, a) {
    a.preventDefault();
    const l = a.target.files;
    let r = null;
    if (l) {
      if (e.uppload.settings.multiple && l.length > 1)
        return e.uploadMultiple(Array.from(l));
      for (let n = 0; n < l.length; n++) {
        const c = l[n];
        this.mimeTypes.indexOf(c.type) !== -1 && (c.size < this.maxFileSize ? r = c : e.handle(
          new Error(
            e.translate(
              "errors.file_too_large",
              C(this.maxFileSize)
            )
          )
        ));
      }
    }
    r && r && e.next({
      blob: r,
      size: r.size,
      type: r.type,
      lastModified: r.lastModified ? new Date(r.lastModified) : void 0,
      name: r.name
    });
  }
  fileSelect(e, a) {
    const l = e.uppload.container.querySelector(
      ".alternate-input input[type=file]"
    );
    l && l.click();
  }
  dragStop(e, a) {
    const l = e.uppload.container.querySelector(".drop-area");
    l && l.classList.remove("drop-area-active");
  }
  dragHandler(e, a) {
    a.preventDefault();
    const l = e.uppload.container.querySelector(".drop-area");
    l && l.classList.add("drop-area-active");
  }
  dropHandler(e, a) {
    a.preventDefault(), this.dragStop(e, a);
    let l = null;
    if (a.dataTransfer && a.dataTransfer.items)
      for (let r = 0; r < a.dataTransfer.items.length; r++) {
        const n = a.dataTransfer.items[r];
        n.kind === "file" && this.mimeTypes.indexOf(n.type) !== -1 && (l = n.getAsFile(), (!l || l.size > this.maxFileSize) && (l = null, e.handle(
          new Error(
            e.translate(
              "errors.file_too_large",
              C(this.maxFileSize)
            )
          )
        )));
      }
    l && l && e.next({
      blob: l,
      size: l.size,
      type: l.type,
      lastModified: l.lastModified ? new Date(l.lastModified) : void 0,
      name: l.name
    });
  }
}
class _e extends U {
  constructor(t) {
    super({
      apiKey: t,
      name: "giphy",
      icon: '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill-rule="nonzero" fill="none"><path fill="#000" d="M54 29h149v198H54z"/><path fill="#04FF8E" d="M24 22h30v212H24z"/><path fill="#8E2EFF" d="M203 80h30v154h-30z"/><path fill="#00C5FF" d="M24 227h209v29H24z"/><path fill="#FFF152" d="M24 0h119v29H24z"/><path fill="#FF5B5B" d="M203 59V29h-30V0h-30v88h90V59"/><path fill="#551C99" d="M203 117V88h30"/><path fill="#999131" d="M143 0v29h-29"/></g></svg>',
      color: "#a800ff",
      noRecolor: !0,
      poweredByUrl: "https://giphy.com",
      popularEndpoint: (e) => `https://api.giphy.com/v1/gifs/trending?api_key=${e}&limit=18&rating=G`,
      searchEndpoint: (e, a) => `https://api.giphy.com/v1/gifs/search?api_key=${e}&q=${encodeURIComponent(
        a
      )}&limit=18&offset=0&rating=G&lang=en`,
      getButton: (e) => `<div class="result">
        <button aria-label="${e.title}" data-full-url="${e.images.downsized_large.url}" style="background-image: url('${e.images.preview_gif.url}')"></button></div>`,
      getSearchResults: (e) => e.data,
      getPopularResults: (e) => e.data
    });
  }
}
class Le extends U {
  constructor(t) {
    super({
      apiKey: t,
      name: "pixabay",
      icon: '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M137 91c5 30-13 60-40 72-16 8-35 6-52 6H27v56H0V96a69 69 0 0169-65c33-1 65 26 68 60zm13-55l33 48h1l33-48h33l-46 68 52 71h-34l-38-52h-1l-38 52h-34l52-71-46-68h33zM33 80c-7 12-5 26-5 39v23h41c19 0 38-15 41-35 4-19-9-40-28-46-18-7-40 2-49 19z" fill="#000" fill-rule="nonzero"/></svg>',
      color: "#2ec66d",
      poweredByUrl: "https://pixabay.com",
      popularEndpoint: (e) => `https://pixabay.com/api/?key=${e}&per_page=18&image_type=photo`,
      searchEndpoint: (e, a) => `https://pixabay.com/api/?key=${e}&per_page=18&q=${encodeURIComponent(
        a
      )}&image_type=photo`,
      getButton: (e) => `<div class="result">
        <button aria-label="${e.tags}" data-full-url="${e.largeImageURL}" style="background-image: url('${e.previewURL}')"></button><small class="author">
        <img alt="" src="${e.userImageURL}">
        <span>${e.user}</span>
      </small></div>`,
      getSearchResults: (e) => e.hits,
      getPopularResults: (e) => e.hits
    });
  }
}
class Ue extends U {
  constructor(t) {
    super({
      apiKey: t,
      name: "unsplash",
      icon: '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M81 113v72h94v-72h81v143H0V113h81zM175 0v71H81V0h94z" fill="#000" fill-rule="evenodd"/></svg>',
      color: "#333",
      poweredByUrl: "https://unsplash.com",
      popularEndpoint: (e) => `https://api.unsplash.com/photos?client_id=${e}`,
      searchEndpoint: (e, a) => `https://api.unsplash.com/search/photos?client_id=${e}&page=1&query=${encodeURIComponent(
        a
      )}`,
      getButton: (e) => `<div class="result">
        <button aria-label="${e.alt_description || e.description}" data-full-url="${e.urls.regular}" style="background-image: url('${e.urls.thumb}')"></button>
        <small class="author">
          <img alt="" src="${e.user.profile_image.small}">
          <span>${e.user.name}</span>
        </small>
      </div>`,
      getSearchResults: (e) => e.results,
      getPopularResults: (e) => e
    });
  }
}
class Fe extends U {
  constructor(t) {
    super({
      apiKey: t,
      name: "pexels",
      icon: '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M21 0h-4v255l72 1h71v-35l1-35 4-1a97 97 0 0053-33 81 81 0 0013-22l7-22v-3-23-2l-1-3v-2a95 95 0 00-42-60l-3-3-13-6a98 98 0 00-30-6H21zm130 37a85 85 0 008 1l11 5a57 57 0 0131 62c-5 23-23 41-45 45l-20 1h-12v68H53v-91l1-91h97z" fill="#000" fill-rule="nonzero"/></svg>',
      color: "#05a081",
      poweredByUrl: "https://pexels.com",
      popularEndpoint: (e) => "https://api.pexels.com/v1/curated?per_page=9&page=1",
      searchEndpoint: (e, a) => `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        a
      )}&per_page=12&page=1`,
      getButton: (e) => `<div class="result">
        <button aria-label="${e.photographer || ""}" data-full-url="${e.src.large2x}" style="background-image: url('${e.src.tiny}')"></button><small class="author">
        <span>${e.photographer}</span>
      </small></div>`,
      getSearchResults: (e) => e.photos,
      getPopularResults: (e) => e.photos,
      fetchSettings: (e) => ({
        headers: {
          Authorization: e
        }
      })
    });
  }
}
let Be = class extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "url");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path d="M200 151l36-36a67 67 0 10-95-95L89 72a67 67 0 0012 105l28-28a31 31 0 01-14-51l52-52a31 31 0 0143 43l-15 15c6 15 8 31 5 47z"/><path d="M56 105l-36 36a67 67 0 1095 95l52-52a67 67 0 00-12-105l-28 28a31 31 0 0114 51l-52 52a31 31 0 01-43-43l15-15c-6-15-8-31-5-47z"/></g></svg>');
    i(this, "color", "#8e44ad");
  }
};
class He extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "screenshot");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M189 256h-25v-54h39v-38h53v92h-67zM0 210v-46h53v38h40v54H0v-46zm151-34h-10v-20h15v-15h20v35h-25zm-71-17v-18h20v15h15v20H80v-17zm0-62V80h35v20h-15v15H80V97zm76 10v-7h-15V80h35v35h-20v-8zM0 46V0h93v53H53v39H0V46zm203 27V53h-39V0h92v92h-53V73z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#e67e22");
  }
}
class Ce extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "flickr");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill-rule="nonzero" fill="none"><path d="M117 128a59 59 0 11-118 0 59 59 0 01118 0z" fill="#0063DC"/><path d="M257 128a59 59 0 11-118 0 59 59 0 01118 0z" fill="#FF0084"/></g></svg>');
    i(this, "noRecolor", !0);
    i(this, "color", "#ff0084");
    i(this, "exampleURL", "https://www.flickr.com/photos/renewolf/26111951000/");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(flickr|flic)\.(com|kr)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Ee extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "pinterest");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0a128 128 0 00-47 247c-1-10-2-25 1-36l15-64s-4-8-4-19c0-18 10-31 23-31 11 0 16 8 16 18 0 11-7 27-11 43-3 12 7 23 19 23 23 0 41-24 41-59 0-31-22-52-54-52-36 0-58 27-58 55 0 11 5 23 10 30l1 3-4 15c0 2-1 3-4 1-16-7-26-30-26-49 0-41 30-78 85-78 44 0 79 32 79 74 0 44-28 80-67 80-13 0-25-7-29-15l-8 31c-3 11-11 25-16 33A128 128 0 10128 0z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#e60023");
    i(this, "exampleURL", "https://pinterest.com/pin/437201076327078006/");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(pinterest|pin)\.(com|it)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Ie extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "deviantart");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#000" fill-rule="nonzero" d="M208 44V0h-49l-2 5-22 35-7 9H49v66h44l5 5-49 89v47h49l2-5 24-42 4-6h80v-62h-44l-5-4z"/></svg>');
    i(this, "color", "#00d159");
    i(this, "exampleURL", "https://www.deviantart.com/artbycatherineradley/art/Despair-820869682");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(deviantart|fav)\.(com|me)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class qe extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "ninegag");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M16 64L128 0l111 64v128l-111 64-112-64 44-26 68 39c22-13 45-25 67-39v-51l-67 39L16 90V64zm66 13l46 26 45-26-45-26-46 26z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#000");
    i(this, "exampleURL", "https://9gag.com/gag/awoBXb8");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?9gag\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Me extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "artstation");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M158 189l30 51H45c-10 0-19-5-23-14L0 189h158zM100 15h45c10 0 18 5 23 13v1l84 146a26 26 0 01-1 29v1l-21 35L100 15h45zM79 51l58 101H21L79 51z" fill="#000" fill-rule="evenodd"/></svg>');
    i(this, "color", "#3ea2cf");
    i(this, "exampleURL", "https://www.artstation.com/artwork/VdGOkZ");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?artstation\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Pe extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "twitter");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M81 232A148 148 0 00230 76c10-8 19-17 26-27-9 4-20 7-30 8 11-7 19-17 23-29-10 6-21 10-33 13a52 52 0 00-90 47C82 86 44 65 18 34a52 52 0 0016 70c-9-1-17-3-24-7v1c0 25 18 47 42 51a53 53 0 01-23 1c6 21 26 36 49 37a105 105 0 01-78 21c23 15 51 24 81 24" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#1da1f2");
    i(this, "exampleURL", "https://twitter.com/elninoict/status/1106176415622418433");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(twitter|t)\.(co|com)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Te extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "flipboard");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path opacity=".8" d="M85 85h85v85H85z"/><path opacity=".9" d="M85 0h171v85H85z"/><path d="M0 0h85v256H0z"/></g></svg>');
    i(this, "color", "#e12828");
    i(this, "exampleURL", "https://flipboard.com/@bbcfuture/how-climate-change-could-kill-the-red-apple/f-c8d499b4ca%2Fbbc.com");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?(flipboard|flip)\.(com|it)(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class De extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "fotki");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M188 105c-2-10-8-16-17-18l4-1c15-4 20-13 17-28l-7-38c-3-17-13-20-21-20l-19 4-77 22c-5 2-12 4-16 11-3 6-2 14-1 19l53 183c3 11 10 17 20 17h4l28-8c12-3 18-13 16-24l-3-11-13-67 3-1 13-3c13-3 19-12 17-25l-1-12zm-29 28l-22 5-5 2 13 64 5 25c1 5-2 9-7 11l-17 4c-5 1-9-2-11-8l-14-51L63 52c-3-9-1-12 8-14l77-22c9-3 13 0 15 9l8 39c1 8-1 11-9 14l-43 12 5 18 30-6c7-1 10 2 12 9l1 10c1 7-1 11-8 12z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#5471B9");
    i(this, "exampleURL", "https://public.fotki.com/EricAnke/holland/molens/20170928-162510.html");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?fotki\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Ve extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "linkedin");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M19 256h218c10 0 19-8 19-18V18c0-10-8-18-19-18H19C9 0 0 8 0 18v220c0 10 8 18 19 18h218zM58 83c-13 0-21-9-21-20s8-20 22-20c13 0 21 9 21 20s-8 20-22 20zm80 131H99V99h39v16c5-8 14-19 34-19h1c25 0 44 17 44 52v66h-39v-62c0-15-5-26-19-26-11 0-17 7-20 14l-1 10v64zm-60 0H39V99h39v115zm60-99h-1 1z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#0e76a8");
    i(this, "exampleURL", "https://www.linkedin.com/posts/explorius-vastgoedontwikkeling-b-v-_el-nino-huurt-kantoor-in-enschede-activity-6480386878641180672-7DC_");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?linkedin\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Ge extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "reddit");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M152 164v3c-5 5-13 7-24 7s-19-2-24-7v-3h3c4 4 11 6 21 6s17-2 21-6h3zm-37-26a10 10 0 00-20 0 10 10 0 0020 0zm141-10a128 128 0 11-256 0 128 128 0 01256 0zm-53-1a17 17 0 00-28-12c-12-8-27-12-44-13l10-29 25 6h-1a14 14 0 0028 0 13 13 0 00-27-5l-26-6c-2 0-3 0-3 2l-11 32c-17 0-33 5-45 13a16 16 0 00-28 12c0 6 4 11 9 14l-1 5c0 24 30 44 67 44 36 0 66-20 66-44v-5c5-3 9-8 9-14zm-52 1c-6 0-10 5-10 10a10 10 0 0020 0c0-5-5-10-10-10z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#ff4301");
    i(this, "exampleURL", "https://www.reddit.com/r/thenetherlands/comments/dz1myk/a_beautiful_morning_in_ermelo/");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?reddit\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Oe extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "tumblr");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M164 209c-21 0-25-15-26-25v-76h49V65h-48V0h-39l-2 2c-2 20-11 55-51 69v37h30v80c0 28 18 69 75 68 19 0 41-8 45-15l-12-37c-5 3-14 5-21 5z" fill="#000" fill-rule="evenodd"/></svg>');
    i(this, "color", "#34526f");
    i(this, "exampleURL", "https://germanpostwarmodern.tumblr.com/post/186653088149/cubicus-building-of-twente-university-1969-73-in");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?tumblr\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class je extends m {
  constructor() {
    super(...arguments);
    i(this, "name", "weheartit");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M231 36c-18-16-40-23-64-13-12 5-24 11-34 20l-5 5-5-5c-10-8-20-15-31-20s-22-8-35-6C25 22-2 56 0 89l1 15c5 31 22 55 44 77a364 364 0 0083 59l5-3c23-13 45-28 65-45 21-20 40-41 51-68 13-34 8-66-18-88z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "color", "#ff5464");
    i(this, "exampleURL", "https://weheartit.com/entry/221671573");
    i(this, "validator", (e) => /(https?:\/\/(.+?\.)?weheartit\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/.test(
      e
    ));
  }
}
class Ne extends S {
  constructor({
    aspectRatio: e,
    aspectRatioOptions: a,
    hideAspectRatioSettings: l,
    autoCropArea: r,
    viewMode: n
  } = {}) {
    super();
    i(this, "name", "crop");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M74 0v182h134v-25h-26V74H99V48h96c4 0 7 1 9 4 3 2 4 5 4 9v121h48v26h-48v48h-26v-48H61a13 13 0 01-13-13V74H0V48h48V0h26z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "aspectRatio", NaN);
    i(this, "hideAspectRatioSettings", !1);
    i(this, "aspectRatioOptions", {
      free: NaN,
      square: 1,
      "16:9": 16 / 9
    });
    i(this, "autoCropArea", 1);
    i(this, "viewMode", 1);
    i(this, "originalFile", { blob: new Blob() });
    i(this, "template", ({ file: e, translate: a }) => {
      const l = URL.createObjectURL(e.blob);
      return this.originalFile = e, `
      <div class="uppload-cropping-element">
        <img style="width: 20px; visibility: hidden;" alt="" src="${l}">
      </div>
      ${!this.aspectRatio && !this.hideAspectRatioSettings ? `<div class="uppload-actions">
        ${Object.keys(this.aspectRatioOptions).map(
        (r, n) => `
          <input value="${this.aspectRatioOptions[r]}" data-name="${r}" name="crop-aspect-ratio" type="radio"${n ? "" : " checked"} id="crop-aspect-ratio-${r}">
          <label for="crop-aspect-ratio-${r}">${a(`effects.crop.aspectRatios.${r}`) || r}</label>`
      ).join("")}
      </div>` : ""}
    `;
    });
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(
        ".uppload-cropping-element img"
      ), l = this.originalFile, r = l.type && ["image/jpeg", "image/webp"].indexOf(l.type) !== -1 ? l.type : "image/png";
      a && k(e, a).then(() => {
        const n = new O(a, {
          aspectRatio: this.aspectRatio,
          autoCropArea: this.autoCropArea,
          viewMode: this.viewMode,
          ready() {
            b(n.getCroppedCanvas(), r).then((s) => {
              l.blob = s, e.next(l);
            });
          },
          cropend() {
            b(n.getCroppedCanvas(), r).then((s) => {
              l.blob = s, e.next(l);
            });
          }
        });
        e.uppload.container.querySelectorAll(
          "input[name='crop-aspect-ratio']"
        ).forEach((s) => {
          p(s, "change", () => {
            const d = e.uppload.container.querySelector(
              "input[name='crop-aspect-ratio']:checked"
            );
            d && (n.setAspectRatio(
              this.aspectRatioOptions[d.getAttribute("data-name") || "free"]
            ), b(n.getCroppedCanvas(), r).then((h) => {
              l.blob = h, e.next(l);
            }));
          });
        });
      });
    });
    e && (this.aspectRatio = e), a && (this.aspectRatioOptions = a), r && (this.autoCropArea = r), n && (this.viewMode = n), l && (this.hideAspectRatioSettings = l);
  }
}
class We extends S {
  constructor() {
    super(...arguments);
    i(this, "name", "rotate");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M139 37a110 110 0 014 218v-37a73 73 0 00-4-144v36L66 55l73-55v37zM61 234c15 11 33 18 52 21v-37c-9-2-18-6-25-11l-27 27zm-20-21c-12-15-19-33-22-52h37c2 9 6 18 11 26l-26 26zM40 81c-11 14-19 32-21 51h37c2-11 7-21 13-29L40 81z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "value", 0);
    i(this, "max", 360);
    i(this, "unit", "deg");
    i(this, "originalFile", { blob: new Blob() });
    i(this, "template", ({ file: e, translate: a }) => {
      const l = URL.createObjectURL(e.blob);
      return this.originalFile = e, `
      <div class="uppload-rotating-element">
        <img style="width: 20px" alt="" src="${l}">
      </div>
      <div class="settings">
        <input type="range" value="${this.value}" min="0" max="${this.max}">
        <span class="value"><span>0</span>${a(`units.${this.unit}`) || this.unit}</span>
      </div>
    `;
    });
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(
        ".uppload-rotating-element img"
      ), l = this.originalFile;
      a && k(e, a).then(() => {
        const r = new O(a, {
          autoCropArea: 1,
          viewMode: 1,
          dragMode: "none",
          cropBoxMovable: !1,
          cropBoxResizable: !1,
          toggleDragModeOnDblclick: !1,
          ready() {
            e.uppload.emitter.emit("processing"), b(r.getCroppedCanvas()).then((c) => {
              l.blob = c, e.uppload.emitter.emit("process"), e.next(l);
            });
          }
        }), n = e.uppload.container.querySelector(
          ".settings input[type='range']"
        );
        n && p(n, "change", () => {
          let c = 0;
          const s = e.uppload.container.querySelector(
            ".settings input[type='range']"
          );
          s && (c = parseInt(s.value));
          const d = e.uppload.container.querySelector(
            ".settings .value span"
          );
          d && (d.innerHTML = c.toString()), r.rotate(c - this.value), this.value = c, e.uppload.emitter.emit("processing"), b(r.getCroppedCanvas()).then((h) => {
            l.blob = h, e.uppload.emitter.emit("process"), e.next(l);
          });
        });
      });
    });
  }
}
class Ye extends S {
  constructor() {
    super(...arguments);
    i(this, "name", "flip");
    i(this, "originalfileURL", "");
    i(this, "originalFile", { blob: new Blob() });
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M153 0v256h103L153 0zM0 256h103V0L0 256z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "canvas", document.createElement("canvas"));
    i(this, "template", ({ file: e, translate: a }) => {
      const l = URL.createObjectURL(e.blob);
      return this.originalfileURL = l, this.originalFile = e, `
      <div class="uppload-flip">
        <img style="width: 20px" alt="" src="${l}">
      </div>
      <div class="settings">
        <button class="flip-btn-horizontal">${a(
        "effects.flip.buttons.horizontal"
      )}</button>
        <button class="flip-btn-vertical">${a(
        "effects.flip.buttons.vertical"
      )}</button>
      </div>
    `;
    });
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(
        ".uppload-flip img"
      );
      a && k(e, a).then(() => {
        const l = e.uppload.container.querySelector(
          ".settings button.flip-btn-horizontal"
        );
        l && p(
          l,
          "click",
          this.update.bind(this, e, !0, !1)
        );
        const r = e.uppload.container.querySelector(
          ".settings button.flip-btn-vertical"
        );
        r && p(
          r,
          "click",
          this.update.bind(this, e, !1, !0)
        );
      });
    });
  }
  imageToCanvasBlob(e, a = !1, l = !1) {
    return new Promise((r) => {
      e.uppload.emitter.emit("processing");
      const n = a ? -1 : 1, c = l ? -1 : 1;
      this.canvas = document.createElement("canvas");
      const s = document.createElement("img");
      s.src = this.originalfileURL, s.onload = () => {
        this.canvas.width = s.width, this.canvas.height = s.height;
        const d = a ? s.width * -1 : 0, h = l ? s.height * -1 : 0, u = this.canvas.getContext("2d");
        u && (u.clearRect(0, 0, this.canvas.width, this.canvas.height), u.scale(n, c), u.drawImage(s, d, h), b(this.canvas).then((f) => {
          const g = URL.createObjectURL(f);
          return this.originalfileURL = g, e.uppload.emitter.emit("process"), r(f);
        }));
      };
    });
  }
  update(e, a, l) {
    const r = e.uppload.container.querySelector(
      ".uppload-flip img"
    );
    r && this.imageToCanvasBlob(e, a, l).then((n) => {
      if (!n)
        return;
      let c = this.originalFile;
      c.blob = n, e.next(c);
      const s = URL.createObjectURL(n);
      r.setAttribute("src", s);
    });
  }
}
class Ze extends S {
  constructor() {
    super(...arguments);
    i(this, "name", "preview");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 18)" fill="#000" fill-rule="nonzero"><path d="M244 40h-29V10c0-6-5-10-10-10H10C4 0 0 4 0 10v160c0 5 4 10 10 10h29v30c0 6 4 10 9 10h195c6 0 10-4 10-10V50c0-5-4-10-9-10zm-10 136l-40-45c-4-5-11-5-15 0l-17 19-38-45c-4-5-13-5-17 0l-49 58V60h176v116zM19 160V20h176v20H49c-6 0-10 5-10 10v110H19z"/><ellipse cx="202.5" cy="94" rx="15.5" ry="16"/></g></svg>');
    i(this, "template", ({ file: e }) => e.blob.type.startsWith("image/") ? `
        <div class="uppload-preview-element">
          <img style="width: 20px" alt="" src="${URL.createObjectURL(e.blob)}">
        </div>
      ` : `
      <div class="uppload-preview-element file">
        <div class="uppload-file-icon">
          <svg viewBox="0 0 256 256">
          <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
            <path d="M 77.474 17.28 L 61.526 1.332 C 60.668 0.473 59.525 0 58.311 0 H 15.742 c -2.508 0 -4.548 2.04 -4.548 4.548 v 80.904 c 0 2.508 2.04 4.548 4.548 4.548 h 58.516 c 2.508 0 4.549 -2.04 4.549 -4.548 V 20.496 C 78.807 19.281 78.333 18.138 77.474 17.28 z M 61.073 5.121 l 12.611 12.612 H 62.35 c -0.704 0 -1.276 -0.573 -1.276 -1.277 V 5.121 z M 74.258 87 H 15.742 c -0.854 0 -1.548 -0.694 -1.548 -1.548 V 4.548 C 14.194 3.694 14.888 3 15.742 3 h 42.332 v 13.456 c 0 2.358 1.918 4.277 4.276 4.277 h 13.457 v 64.719 C 75.807 86.306 75.112 87 74.258 87 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.3;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 68.193 33.319 H 41.808 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 26.385 c 0.828 0 1.5 0.671 1.5 1.5 S 69.021 33.319 68.193 33.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 34.456 33.319 H 21.807 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 12.649 c 0.829 0 1.5 0.671 1.5 1.5 S 35.285 33.319 34.456 33.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <linearGradient id="gr1" gradientUnits="userSpaceOnUse" x1="21.8064" y1="19.2332" x2="42.2984" y2="19.2332">
              <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity: 1"/>
              <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity: 1"/>
            </linearGradient>
            <line x1="-10.246" y1="0" x2="10.246" y2="0" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: url(#gr1); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) "/>
            <path d="M 42.298 20.733 H 21.807 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 20.492 c 0.829 0 1.5 0.671 1.5 1.5 S 43.127 20.733 42.298 20.733 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 68.193 44.319 H 21.807 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 46.387 c 0.828 0 1.5 0.671 1.5 1.5 S 69.021 44.319 68.193 44.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 48.191 55.319 H 21.807 c -0.829 0 -1.5 -0.672 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 26.385 c 0.828 0 1.5 0.672 1.5 1.5 S 49.02 55.319 48.191 55.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 68.193 55.319 H 55.544 c -0.828 0 -1.5 -0.672 -1.5 -1.5 s 0.672 -1.5 1.5 -1.5 h 12.649 c 0.828 0 1.5 0.672 1.5 1.5 S 69.021 55.319 68.193 55.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 68.193 66.319 H 21.807 c -0.829 0 -1.5 -0.672 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 46.387 c 0.828 0 1.5 0.672 1.5 1.5 S 69.021 66.319 68.193 66.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
            <path d="M 68.193 77.319 H 55.544 c -0.828 0 -1.5 -0.672 -1.5 -1.5 s 0.672 -1.5 1.5 -1.5 h 12.649 c 0.828 0 1.5 0.672 1.5 1.5 S 69.021 77.319 68.193 77.319 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 0.15;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
          </g>
          </svg>
        </div>
        <div class="uppload-file-info">
          <div class="uppload-file-name">${e.name}</div>
          <div class="uppload-file-size">${C(e.blob.size)}</div>
        </div>
      </div>
    `);
    i(this, "handlers", (e) => {
      var l, r, n;
      if ((n = (r = (l = e.uppload.file) == null ? void 0 : l.blob) == null ? void 0 : r.type) == null ? void 0 : n.startsWith("image/")) {
        const c = e.uppload.container.querySelector(
          ".uppload-preview-element img"
        );
        c && k(e, c);
      } else {
        const c = e.uppload.container.querySelector(
          ".uppload-effect"
        );
        c && (c.style.opacity = "1");
      }
    });
  }
}
class y extends S {
  constructor() {
    super(...arguments);
    i(this, "canvas", document.createElement("canvas"));
    i(this, "originalfileURL", "");
    i(this, "originalFile", { blob: new Blob() });
    i(this, "cssFilter", "");
    i(this, "max", 10);
    i(this, "unit", "px");
    i(this, "value", 0);
    i(this, "supports", () => {
      var e;
      return !!(this.canvas.getContext && this.canvas.getContext("2d") && typeof ((e = this.canvas.getContext("2d")) == null ? void 0 : e.filter) == "string");
    });
    i(this, "template", ({ file: e, translate: a }) => {
      const l = URL.createObjectURL(e.blob);
      return this.originalfileURL = l, this.originalFile = e, `
      <div class="uppload-hue-image">
        <img style="width: 20px" alt="" src="${l}">
      </div>
      <div class="settings">
        <input type="range" value="${this.value}" min="0" max="${this.max}">
        <span class="value"><span>0</span>${a(`units.${this.unit}`) || this.unit}</span>
      </div>
    `;
    });
    i(this, "handlers", (e) => {
      const a = e.uppload.container.querySelector(
        ".uppload-hue-image img"
      );
      a && k(e, a).then(() => {
        const l = e.uppload.container.querySelector(
          ".settings input[type='range']"
        );
        l && p(l, "change", this.update.bind(this, e));
      });
    });
  }
  imageToCanvasBlob(e, a) {
    return e.uppload.emitter.emit("processing"), new Promise((l) => {
      this.canvas = document.createElement("canvas");
      const r = document.createElement("img");
      r.src = this.originalfileURL, r.onload = () => {
        this.canvas.width = r.width, this.canvas.height = r.height;
        const n = this.canvas.getContext("2d");
        n && (n.clearRect(0, 0, this.canvas.width, this.canvas.height), n.filter = a, n.drawImage(r, 0, 0), b(this.canvas).then((c) => (e.uppload.emitter.emit("process"), l(c))));
      };
    });
  }
  update(e) {
    let a = 0;
    const l = e.uppload.container.querySelector(
      ".settings input[type='range']"
    );
    l && (a = parseInt(l.value));
    const r = e.uppload.container.querySelector(
      ".settings .value span"
    );
    r && (r.innerHTML = a.toString());
    const n = e.uppload.container.querySelector(
      ".uppload-hue-image img"
    );
    n && this.imageToCanvasBlob(
      e,
      `${this.cssFilter}(${l.value}${this.unit})`
    ).then((c) => {
      if (!c)
        return;
      this.originalFile.blob = c, e.next(this.originalFile);
      const s = URL.createObjectURL(c);
      n.setAttribute("src", s);
    });
  }
}
class Ke extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "brightness");
    i(this, "icon", '<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M128 0l37 37h54v54l37 37-37 37v54h-54l-37 37-37-37H37v-54L0 128l37-37V37h54l37-37zm0 53a75 75 0 100 150 75 75 0 000-150zm0 21a54 54 0 110 108 54 54 0 010-108z"/></svg>');
    i(this, "cssFilter", "brightness");
    i(this, "unit", "%");
    i(this, "value", 100);
    i(this, "max", 200);
  }
}
class Je extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "blur");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0l-7 7s-21 23-41 54c-21 31-42 70-42 105a90 90 0 00180 0c0-35-22-74-42-105-21-31-42-54-42-54l-6-7zm36 166h18c0 30-25 54-54 54v-18c20 0 36-16 36-36z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "cssFilter", "blur");
    i(this, "unit", "px");
  }
}
class Qe extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "contrast");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 0c35 0 66 13 90 38 25 25 38 55 38 90s-13 66-38 90c-24 25-55 38-90 38s-65-13-90-38c-25-24-38-55-38-90s13-65 38-90S93 0 128 0zm67 62a91 91 0 00-67-28v188c26 0 48-9 67-28 18-18 27-40 27-66s-9-48-27-66z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "cssFilter", "contrast");
    i(this, "unit", "%");
    i(this, "value", 100);
    i(this, "max", 200);
  }
}
class Xe extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "grayscale");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M181 196l30 30c-20 17-44 27-71 30h-1v-43c15-2 30-8 42-17zm-105-1c11 9 25 16 40 18h1v43c-27-2-52-13-71-29l-1-1 31-31zm138-56h42c-2 27-13 52-29 71l-1 1-30-30c9-12 16-27 18-42zm-170 0c1 15 7 29 16 41h1l-31 31c-17-20-28-44-30-71v-1h44zM210 8a27 27 0 0138 38l-38 37 10 10c5 5 5 13 0 18l-1 1c-5 5-13 4-18-1l-10-9-47 47c-5 5-15 9-22 10h-6l-17-2-2-17v-6c0-7 5-17 10-23l47-47-10-9c-5-5-5-14 0-19h1c5-5 13-5 18 0l10 10zm-47 66l-47 47c-3 3-5 9-6 13v1l11 10c4 0 11-3 14-5l47-47-19-19zM30 45l31 31c-9 11-15 25-17 40v1H0c2-27 13-52 30-72zm87-45v43c-15 2-29 8-41 17v1L45 30C65 13 90 2 117 0z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "cssFilter", "grayscale");
    i(this, "unit", "%");
    i(this, "value", 0);
    i(this, "max", 100);
  }
}
class et extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "hue-rotate");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M213 114c-30 0-69 0-76-87-2-17-13-27-30-27-22 0-48 14-68 36C13 65 2 102 6 141c6 62 66 115 129 115 64 0 116-52 116-115 0-26-18-27-38-27zM77 101a24 24 0 110-48 24 24 0 010 48zm-8 28a24 24 0 110 48 24 24 0 010-48zm83 74a24 24 0 11-48 0 24 24 0 0148 0zm68-40a24 24 0 11-47 0 24 24 0 0147 0z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "cssFilter", "hue-rotate");
    i(this, "unit", "deg");
    i(this, "value", 0);
    i(this, "max", 360);
  }
}
class tt extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "invert");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="nonzero"><path d="M214 145a100 100 0 010 10l-7 25 1-2c-3 7-8 15-13 21l2-2c-5 7-11 12-18 18l3-2c-7 5-14 9-22 12l3-1a98 98 0 01-22 7 101 101 0 01-23 0c-9-1-17-3-25-7l3 1c-8-3-15-7-22-12l3 2c-7-6-13-11-18-18l2 2c-5-6-10-14-13-21l1 2a98 98 0 01-6-21 102 102 0 010-24c1-8 3-17 6-25l-1 3c3-8 8-15 13-22l-2 3 15-17a657 657 0 0163-57h-17a1561 1561 0 0175 71c5 7 10 14 13 22l-1-3a100 100 0 017 35c0 7 6 13 12 12 6 0 12-5 12-12a112 112 0 00-38-83 676 676 0 00-50-48L137 3h-1c-2-2-5-3-8-3s-6 1-8 3a1704 1704 0 00-49 43c-9 9-19 18-27 29a118 118 0 00-19 30 109 109 0 005 90 111 111 0 0089 60 110 110 0 00119-110c0-6-6-12-12-12-7 1-12 6-12 12z"/><path d="M226 145c0 55-44 99-98 99V12s58 49 76 71c14 17 22 39 22 62z"/></g></svg>');
    i(this, "cssFilter", "invert");
    i(this, "unit", "%");
    i(this, "value", 0);
    i(this, "max", 100);
  }
}
class it extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "sepia");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M13 0h230c6 0 11 5 12 11v233c0 7-5 12-11 12H13c-7 0-12-5-12-11V12C1 5 6 0 12 0h231zm219 23H24v160h208V23zM110 72l31 42c2 2 5 2 7 1v-1l13-12c2-2 5-2 7 0v1l35 50c3 3 1 7-3 7H55c-4 0-6-4-4-7l51-81c2-2 6-3 8 0zm65-26a18 18 0 110 36 18 18 0 010-36z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "cssFilter", "sepia");
    i(this, "unit", "%");
    i(this, "value", 0);
    i(this, "max", 100);
  }
}
class at extends y {
  constructor() {
    super(...arguments);
    i(this, "name", "saturate");
    i(this, "icon", '<svg aria-hidden="true" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M127 0a82 82 0 00-75 50l-1 2a81 81 0 00-3 10l-1 3-1 7v9a99 99 0 0181 4 99 99 0 0182-4v-8-1l-1-7-1-3a82 82 0 00-3-10l-1-2a82 82 0 00-76-50zM82 92c-12 0-23 3-33 7l-1 1c4 19 14 35 29 46 5-19 17-36 32-49-8-3-17-5-27-5zm91 0c-10 0-19 2-27 5 15 13 26 30 32 49 15-11 25-27 29-46l-1-1c-10-4-21-7-33-7zm-46 14a82 82 0 00-34 50 82 82 0 0069 0c-5-21-17-39-35-50zm-96 4a82 82 0 00-27 39l-1 2-2 9v5a83 83 0 00-1 17c4 39 35 70 74 74h8c9 0 18-2 26-5a100 100 0 01-35-85c-20-13-35-33-42-56zm192 0c-6 23-21 43-41 56v8c0 31-14 58-36 77a70 70 0 0035 5c39-4 69-35 73-74a82 82 0 000-17v-2-3l-2-9-1-2c-5-15-15-29-28-39zM91 175c0 28 14 52 35 66l1-1 2 1c21-14 34-38 35-66a99 99 0 01-73 0z" fill="#000" fill-rule="nonzero"/></svg>');
    i(this, "cssFilter", "saturate");
    i(this, "unit", "%");
    i(this, "value", 100);
    i(this, "max", 200);
  }
}
export {
  Me as ArtStation,
  Je as Blur,
  Ke as Brightness,
  xe as Camera,
  Qe as Contrast,
  Ne as Crop,
  Ie as DeviantArt,
  Se as Facebook,
  Ce as Flickr,
  Ye as Flip,
  Te as Flipboard,
  De as Fotki,
  _e as GIPHY,
  Xe as Grayscale,
  et as HueRotate,
  ze as Instagram,
  tt as Invert,
  Ve as LinkedIn,
  Re as Local,
  m as MicrolinkBaseClass,
  qe as NineGag,
  Fe as Pexels,
  Ee as Pinterest,
  Le as Pixabay,
  Ze as Preview,
  Ge as Reddit,
  We as Rotate,
  at as Saturate,
  He as Screenshot,
  U as SearchBaseClass,
  it as Sepia,
  Oe as Tumblr,
  Pe as Twitter,
  Be as URL,
  Ue as Unsplash,
  oe as Uppload,
  S as UpploadEffect,
  $ as UpploadService,
  je as WeHeartIt,
  H as cachedFetch,
  b as canvasToBlob,
  J as compressImage,
  ne as de,
  se as en,
  ce as es,
  de as fa,
  ke as fetchUploader,
  k as fitImageToContainer,
  j as flattenObject,
  pe as fr,
  T as getElements,
  he as hi,
  _ as imageUrlToBlob,
  ue as it,
  fe as nl,
  ge as pt,
  me as ro,
  ve as ru,
  p as safeListen,
  K as setI18N,
  be as tr,
  v as translate,
  ye as uk,
  $e as xhrUploader,
  we as zhTW
};
