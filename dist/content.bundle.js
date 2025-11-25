(() => {
  // ui/controls.js
  var PasteControls = class {
    constructor(options) {
      this.onPaste = options.onPaste;
      this.onEditPrefix = options.onEditPrefix;
      this.isDarkMode = options.isDarkMode || false;
      this.autoSend = options.autoSend !== void 0 ? options.autoSend : true;
      this.prefixEnabled = options.prefixEnabled || false;
      this.prefixText = options.prefixText || "";
      this.element = null;
      this.autoSendCheckbox = null;
      this.prefixCheckbox = null;
    }
    create() {
      const wrapper = document.createElement("div");
      wrapper.style.position = "static";
      wrapper.style.zIndex = "2";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "8px";
      wrapper.style.flexWrap = "wrap";
      wrapper.style.padding = "0";
      wrapper.style.margin = "0";
      wrapper.style.width = "100%";
      wrapper.style.boxSizing = "border-box";
      wrapper.style.backgroundColor = "transparent";
      wrapper.style.pointerEvents = "auto";
      const prefixWrapper = document.createElement("div");
      prefixWrapper.style.display = "flex";
      prefixWrapper.style.alignItems = "center";
      const prefixCheckbox = document.createElement("input");
      prefixCheckbox.type = "checkbox";
      prefixCheckbox.id = "ai-paste-prefix";
      prefixCheckbox.checked = this.prefixEnabled;
      prefixCheckbox.style.cursor = "pointer";
      const prefixLabel = document.createElement("label");
      prefixLabel.htmlFor = "ai-paste-prefix";
      prefixLabel.textContent = "\u6709\u524D\u7F6E\u6587\u672C";
      prefixLabel.style.fontSize = "11px";
      prefixLabel.style.margin = "0";
      prefixLabel.style.cursor = "pointer";
      prefixLabel.style.color = this.isDarkMode ? "#e0e0e0" : "#333";
      const editPrefixBtn = document.createElement("button");
      editPrefixBtn.textContent = "\u7F16\u8F91\u6536\u85CF";
      editPrefixBtn.style.fontSize = "11px";
      editPrefixBtn.style.padding = "0";
      editPrefixBtn.style.borderRadius = "4px";
      editPrefixBtn.style.border = "1px solid #ccc";
      editPrefixBtn.style.cursor = "pointer";
      editPrefixBtn.style.backgroundColor = this.isDarkMode ? "#3f3f46" : "#f4f4f5";
      editPrefixBtn.style.color = this.isDarkMode ? "#e5e7eb" : "#111827";
      editPrefixBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.onEditPrefix) this.onEditPrefix(this.prefixText);
      });
      prefixWrapper.appendChild(prefixCheckbox);
      prefixWrapper.appendChild(prefixLabel);
      prefixWrapper.appendChild(editPrefixBtn);
      this.prefixCheckbox = prefixCheckbox;
      const checkboxWrapper = document.createElement("div");
      checkboxWrapper.style.display = "flex";
      checkboxWrapper.style.alignItems = "center";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "ai-paste-autosend";
      checkbox.checked = this.autoSend;
      checkbox.style.cursor = "pointer";
      const label = document.createElement("label");
      label.htmlFor = "ai-paste-autosend";
      label.textContent = "\u81EA\u52A8\u53D1\u9001";
      label.style.fontSize = "11px";
      label.style.margin = "0";
      label.style.cursor = "pointer";
      label.style.color = this.isDarkMode ? "#e0e0e0" : "#333";
      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(label);
      this.autoSendCheckbox = checkbox;
      const pasteBtn = document.createElement("button");
      pasteBtn.textContent = "\u7C98\u8D34";
      pasteBtn.style.fontSize = "12px";
      pasteBtn.style.padding = "0";
      pasteBtn.style.borderRadius = "4px";
      pasteBtn.style.border = "1px solid #ccc";
      pasteBtn.style.cursor = "pointer";
      pasteBtn.style.backgroundColor = this.isDarkMode ? "#10a37f" : "#10a37f";
      pasteBtn.style.color = "#fff";
      pasteBtn.style.fontWeight = "600";
      pasteBtn.style.boxShadow = "0 1px 0 rgba(0,0,0,0.05)";
      pasteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.onPaste) this.onPaste();
      });
      wrapper.appendChild(prefixWrapper);
      wrapper.appendChild(checkboxWrapper);
      wrapper.appendChild(pasteBtn);
      this.element = wrapper;
      this.favorites = [];
      this.loadFavorites();
      return wrapper;
    }
    isAutoSend() {
      return this.autoSendCheckbox ? this.autoSendCheckbox.checked : false;
    }
    isPrefixEnabled() {
      return this.prefixCheckbox ? this.prefixCheckbox.checked : false;
    }
    getPrefixText() {
      return this.prefixText || "";
    }
    setPrefixText(text) {
      this.prefixText = text || "";
    }
    async loadFavorites() {
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          const res = await new Promise((resolve) => chrome.storage.local.get(["aiPasteFavorites"], resolve));
          const arr = res && res.aiPasteFavorites ? res.aiPasteFavorites : [];
          this.favorites = Array.isArray(arr) ? arr : [];
        } else {
          const raw = localStorage.getItem("aiPasteFavorites");
          this.favorites = raw ? JSON.parse(raw) : [];
        }
      } catch (_) {
        this.favorites = [];
      }
    }
    async saveFavorites() {
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          await new Promise((resolve) => chrome.storage.local.set({ aiPasteFavorites: this.favorites }, resolve));
        } else {
          localStorage.setItem("aiPasteFavorites", JSON.stringify(this.favorites));
        }
      } catch (_) {
      }
    }
    getFavorites() {
      return Array.isArray(this.favorites) ? this.favorites.slice() : [];
    }
    setFavorites(arr) {
      this.favorites = Array.isArray(arr) ? arr.slice() : [];
      this.saveFavorites();
    }
  };

  // ui/modal.js
  var EditModal = class {
    constructor(options) {
      this.onConfirm = options.onConfirm;
      this.onCancel = options.onCancel;
      this.isDarkMode = options.isDarkMode || false;
      this.modal = null;
      this.textarea = null;
      this.favListEl = null;
      this.favorites = [];
      this.currentText = "";
    }
    show(payload) {
      if (this.modal) {
        this.modal.remove();
      }
      const initialText = typeof payload === "string" ? payload : payload && payload.initialText || "";
      const favorites = payload && payload.favorites || [];
      this.favorites = Array.isArray(favorites) ? favorites.map((f) => ({ id: f.id || this._genId(), text: f.text || "" })) : [];
      this.currentText = initialText || "";
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "10001";
      overlay.style.display = "flex";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      const content = document.createElement("div");
      content.style.width = "720px";
      content.style.maxWidth = "90%";
      content.style.backgroundColor = this.isDarkMode ? "#2d2d2d" : "#fff";
      content.style.borderRadius = "8px";
      content.style.padding = "16px";
      content.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      content.style.display = "flex";
      content.style.flexDirection = "column";
      content.style.gap = "12px";
      const header = document.createElement("h3");
      header.textContent = "\u7F16\u8F91\u524D\u7F6E\u6536\u85CF";
      header.style.margin = "0";
      header.style.color = this.isDarkMode ? "#fff" : "#333";
      const currentLabel = document.createElement("div");
      currentLabel.textContent = "\u5F53\u524D\u524D\u7F6E\u6587\u672C";
      currentLabel.style.fontSize = "12px";
      currentLabel.style.color = this.isDarkMode ? "#ddd" : "#555";
      const textarea = document.createElement("textarea");
      textarea.value = this.currentText;
      textarea.style.width = "100%";
      textarea.style.height = "120px";
      textarea.style.padding = "8px";
      textarea.style.borderRadius = "4px";
      textarea.style.border = "1px solid #ccc";
      textarea.style.resize = "vertical";
      textarea.style.fontFamily = "monospace";
      textarea.style.fontSize = "13px";
      textarea.style.backgroundColor = this.isDarkMode ? "#1e1e1e" : "#fff";
      textarea.style.color = this.isDarkMode ? "#e0e0e0" : "#333";
      this.textarea = textarea;
      const favHeader = document.createElement("div");
      favHeader.textContent = "\u6536\u85CF\u5217\u8868";
      favHeader.style.fontSize = "12px";
      favHeader.style.color = this.isDarkMode ? "#ddd" : "#555";
      const favList = document.createElement("div");
      favList.style.display = "flex";
      favList.style.flexDirection = "column";
      favList.style.gap = "8px";
      favList.style.maxHeight = "300px";
      favList.style.overflow = "auto";
      this.favListEl = favList;
      this._renderFavorites();
      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.justifyContent = "space-between";
      const leftActions = document.createElement("div");
      leftActions.style.display = "flex";
      leftActions.style.gap = "8px";
      const addBtn = document.createElement("button");
      addBtn.textContent = "\u6DFB\u52A0\u6536\u85CF";
      addBtn.style.padding = "6px 10px";
      addBtn.style.borderRadius = "4px";
      addBtn.style.border = "1px solid #ccc";
      addBtn.style.cursor = "pointer";
      addBtn.style.backgroundColor = this.isDarkMode ? "#606060" : "#fff";
      addBtn.style.color = this.isDarkMode ? "#fff" : "#333";
      addBtn.addEventListener("click", () => {
        this.favorites.push({ id: this._genId(), text: this.textarea.value || "" });
        this._renderFavorites();
      });
      leftActions.appendChild(addBtn);
      const rightActions = document.createElement("div");
      rightActions.style.display = "flex";
      rightActions.style.gap = "8px";
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "\u53D6\u6D88";
      cancelBtn.style.padding = "6px 12px";
      cancelBtn.style.borderRadius = "4px";
      cancelBtn.style.border = "1px solid #ccc";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.style.backgroundColor = "transparent";
      cancelBtn.style.color = this.isDarkMode ? "#e0e0e0" : "#333";
      cancelBtn.addEventListener("click", () => {
        this.close();
        if (this.onCancel) this.onCancel();
      });
      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "\u4FDD\u5B58\u5E76\u5173\u95ED";
      confirmBtn.style.padding = "6px 12px";
      confirmBtn.style.borderRadius = "4px";
      confirmBtn.style.border = "none";
      confirmBtn.style.cursor = "pointer";
      confirmBtn.style.backgroundColor = "#10a37f";
      confirmBtn.style.color = "#fff";
      confirmBtn.style.fontWeight = "bold";
      confirmBtn.addEventListener("click", () => {
        this.currentText = this.textarea.value || "";
        const payload2 = { favorites: this.favorites.slice(), currentText: this.currentText };
        this.close();
        if (this.onConfirm) this.onConfirm(payload2);
      });
      rightActions.appendChild(cancelBtn);
      rightActions.appendChild(confirmBtn);
      actions.appendChild(leftActions);
      actions.appendChild(rightActions);
      content.appendChild(header);
      content.appendChild(currentLabel);
      content.appendChild(textarea);
      content.appendChild(favHeader);
      content.appendChild(favList);
      content.appendChild(actions);
      overlay.appendChild(content);
      document.body.appendChild(overlay);
      this.modal = overlay;
      setTimeout(() => textarea.focus(), 50);
    }
    _renderFavorites() {
      if (!this.favListEl) return;
      this.favListEl.innerHTML = "";
      this.favorites.forEach((fav, idx) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "flex-start";
        const ta = document.createElement("textarea");
        ta.value = fav.text || "";
        ta.style.flex = "1";
        ta.style.minHeight = "80px";
        ta.style.padding = "6px";
        ta.style.borderRadius = "4px";
        ta.style.border = "1px solid #ccc";
        ta.style.resize = "vertical";
        ta.style.fontFamily = "monospace";
        ta.style.fontSize = "12px";
        ta.style.backgroundColor = this.isDarkMode ? "#1e1e1e" : "#fff";
        ta.style.color = this.isDarkMode ? "#e0e0e0" : "#333";
        ta.addEventListener("input", () => {
          fav.text = ta.value;
        });
        const useBtn = document.createElement("button");
        useBtn.textContent = "\u8BBE\u4E3A\u5F53\u524D";
        useBtn.style.padding = "4px 8px";
        useBtn.style.borderRadius = "4px";
        useBtn.style.border = "1px solid #ccc";
        useBtn.style.cursor = "pointer";
        useBtn.style.backgroundColor = this.isDarkMode ? "#606060" : "#fff";
        useBtn.style.color = this.isDarkMode ? "#fff" : "#333";
        useBtn.addEventListener("click", () => {
          this.textarea.value = fav.text || "";
        });
        const delBtn = document.createElement("button");
        delBtn.textContent = "\u5220\u9664";
        delBtn.style.padding = "4px 8px";
        delBtn.style.borderRadius = "4px";
        delBtn.style.border = "1px solid #ccc";
        delBtn.style.cursor = "pointer";
        delBtn.style.backgroundColor = this.isDarkMode ? "#606060" : "#fff";
        delBtn.style.color = this.isDarkMode ? "#fff" : "#333";
        delBtn.addEventListener("click", () => {
          this.favorites = this.favorites.filter((f) => f.id !== fav.id);
          this._renderFavorites();
        });
        row.appendChild(ta);
        row.appendChild(useBtn);
        row.appendChild(delBtn);
        this.favListEl.appendChild(row);
      });
    }
    _genId() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    close() {
      if (this.modal) {
        this.modal.remove();
        this.modal = null;
      }
    }
  };

  // adapters/chatgpt.js
  var ChatGPTAdapter = class {
    constructor() {
      this.targetSelector = "#prompt-textarea";
      this.sendButtonSelector = '[data-testid="send-button"]';
      this.controlsParentSelector = "div.relative.flex.w-full.items-end.px-3.py-3";
      this.controls = null;
      this.modal = null;
    }
    init() {
      this.modal = new EditModal({
        isDarkMode: document.documentElement.classList.contains("dark"),
        onConfirm: (payload) => {
          if (payload && Array.isArray(payload.favorites)) {
            this.controls.setFavorites(payload.favorites);
          }
          if (payload && typeof payload.currentText === "string") {
            this.controls.setPrefixText(payload.currentText);
          }
        },
        onCancel: () => {
        }
      });
      this.controls = new PasteControls({
        isDarkMode: document.documentElement.classList.contains("dark"),
        onPaste: () => this.onPasteClick(),
        onEditPrefix: () => this.modal.show({ initialText: this.controls.getPrefixText(), favorites: this.controls.getFavorites() })
      });
      this.observe();
    }
    observe() {
      const observer = new MutationObserver(() => {
        const target = document.querySelector(this.targetSelector);
        if (target && !this.controls.element?.isConnected) {
          this.injectControls(target);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    injectControls(target) {
      const wrapper = this.controls.create();
      let parent = target.closest(this.controlsParentSelector);
      if (!parent) parent = target.parentElement;
      if (parent && parent.before) parent.before(wrapper);
    }
    async onPasteClick() {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const usePrefix = this.controls.isPrefixEnabled();
        const prefix = this.controls.getPrefixText();
        const finalText = usePrefix && prefix ? prefix + "\n\n" + text : text;
        this.handlePaste(finalText, this.controls.isAutoSend());
      } catch (err) {
        console.error("Paste failed:", err);
        alert("\u65E0\u6CD5\u8BFB\u53D6\u526A\u8D34\u677F\uFF0C\u8BF7\u786E\u4FDD\u5DF2\u6388\u4E88\u6743\u9650\u3002");
      }
    }
    handlePaste(text, autoSend) {
      const target = document.querySelector(this.targetSelector);
      if (!target) return;
      target.focus();
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", text);
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(pasteEvent);
      if (autoSend) {
        setTimeout(() => {
          const sendBtn = document.querySelector(this.sendButtonSelector);
          if (sendBtn && !sendBtn.disabled) {
            sendBtn.click();
          }
        }, 300);
      }
    }
  };

  // adapters/yuanbao.js
  var YuanbaoAdapter = class {
    constructor() {
      this.targetSelector = 'div.ql-editor[contenteditable="true"]';
      this.sendButtonSelector = "a.style__send-btn___ZsLmU";
      this.sendButtonFallback = 'button[aria-label="\u53D1\u9001"], div[role="button"][aria-label="\u53D1\u9001"]';
      this.controls = null;
      this.modal = null;
    }
    init() {
      this.modal = new EditModal({
        isDarkMode: false,
        onConfirm: (payload) => {
          if (payload && Array.isArray(payload.favorites)) {
            this.controls.setFavorites(payload.favorites);
          }
          if (payload && typeof payload.currentText === "string") {
            this.controls.setPrefixText(payload.currentText);
          }
        },
        onCancel: () => {
        }
      });
      this.controls = new PasteControls({
        isDarkMode: false,
        onPaste: () => this.onPasteClick(),
        onEditPrefix: () => this.modal.show({ initialText: this.controls.getPrefixText(), favorites: this.controls.getFavorites() })
      });
      this.observe();
    }
    observe() {
      const observer = new MutationObserver(() => {
        const target = document.querySelector(this.targetSelector);
        if (target && !this.controls.element?.isConnected) {
          this.injectControls(target);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    injectControls(target) {
      const wrapper = this.controls.create();
      let parent = target.closest(".style__text-area__wrapper___VV9fW") || target.closest(".style__text-area__edit___d1yNy") || target.closest(".style__text-area___YjBev");
      if (!parent) parent = target.parentElement;
      if (parent && parent.before) parent.before(wrapper);
    }
    async onPasteClick() {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const usePrefix = this.controls.isPrefixEnabled();
        const prefix = this.controls.getPrefixText();
        const finalText = usePrefix && prefix ? prefix + "\n\n" + text : text;
        this.handlePaste(finalText, this.controls.isAutoSend());
      } catch (err) {
        console.error("Paste failed:", err);
        alert("\u65E0\u6CD5\u8BFB\u53D6\u526A\u8D34\u677F\uFF0C\u8BF7\u786E\u4FDD\u5DF2\u6388\u4E88\u6743\u9650\u3002");
      }
    }
    handlePaste(text, autoSend) {
      const target = document.querySelector(this.targetSelector);
      if (!target) return;
      target.focus();
      document.execCommand("insertText", false, text);
      target.dispatchEvent(new Event("input", { bubbles: true }));
      if (autoSend) {
        setTimeout(() => {
          let sendBtn = document.querySelector(this.sendButtonSelector);
          if (!sendBtn) sendBtn = document.querySelector(this.sendButtonFallback);
          if (sendBtn) {
            sendBtn.click();
          } else {
            console.warn("Yuanbao send button not found");
          }
        }, 300);
      }
    }
  };

  // adapters/gemini.js
  var GeminiAdapter = class {
    constructor() {
      this.targetSelector = "div.ql-editor.textarea";
      this.sendButtonSelector = 'button[aria-label="\u53D1\u9001"]';
      this.controlsParentSelector = ".text-input-field_textarea-wrapper";
      this.controls = null;
      this.modal = null;
    }
    init() {
      this.modal = new EditModal({
        isDarkMode: document.body.classList.contains("dark-theme"),
        onConfirm: (payload) => {
          if (payload && Array.isArray(payload.favorites)) {
            this.controls.setFavorites(payload.favorites);
          }
          if (payload && typeof payload.currentText === "string") {
            this.controls.setPrefixText(payload.currentText);
          }
        },
        onCancel: () => {
        }
      });
      this.controls = new PasteControls({
        isDarkMode: false,
        onPaste: () => this.onPasteClick(),
        onEditPrefix: () => this.modal.show({ initialText: this.controls.getPrefixText(), favorites: this.controls.getFavorites() })
      });
      this.observe();
    }
    observe() {
      const observer = new MutationObserver(() => {
        const target = document.querySelector(this.targetSelector);
        if (target && !this.controls.element?.isConnected) {
          this.injectControls(target);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    injectControls(target) {
      const wrapper = this.controls.create();
      let parent = target.closest(this.controlsParentSelector);
      if (!parent) parent = target.parentElement;
      if (parent && parent.before) parent.before(wrapper);
    }
    async onPasteClick() {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const usePrefix = this.controls.isPrefixEnabled();
        const prefix = this.controls.getPrefixText();
        const finalText = usePrefix && prefix ? prefix + "\n\n" + text : text;
        this.handlePaste(finalText, this.controls.isAutoSend());
      } catch (err) {
        console.error("Paste failed:", err);
        alert("\u65E0\u6CD5\u8BFB\u53D6\u526A\u8D34\u677F\uFF0C\u8BF7\u786E\u4FDD\u5DF2\u6388\u4E88\u6743\u9650\u3002");
      }
    }
    handlePaste(text, autoSend) {
      const target = document.querySelector(this.targetSelector);
      if (!target) return;
      target.focus();
      document.execCommand("insertText", false, text);
      target.dispatchEvent(new Event("input", { bubbles: true }));
      if (autoSend) {
        setTimeout(() => {
          const sendBtn = document.querySelector(this.sendButtonSelector);
          if (sendBtn && !sendBtn.disabled) {
            sendBtn.click();
          } else {
            const iconSend = document.querySelector('mat-icon[data-mat-icon-name="send"]');
            if (iconSend) {
              const btn = iconSend.closest("button");
              if (btn) btn.click();
            }
          }
        }, 300);
      }
    }
  };

  // content.js
  function main() {
    const host = window.location.hostname;
    let adapter = null;
    if (host.includes("chatgpt.com") || host.includes("openai.com")) {
      console.log("AI Paste Helper: Detected ChatGPT");
      adapter = new ChatGPTAdapter();
    } else if (host.includes("yuanbao.tencent.com")) {
      console.log("AI Paste Helper: Detected Yuanbao");
      adapter = new YuanbaoAdapter();
    } else if (host.includes("gemini.google.com")) {
      console.log("AI Paste Helper: Detected Gemini");
      adapter = new GeminiAdapter();
    }
    if (adapter) {
      adapter.init();
    } else {
      console.warn("AI Paste Helper: Unknown host", host);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
