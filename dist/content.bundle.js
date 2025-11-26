(() => {
  // ui/controls.js
  var PasteControls = class {
    constructor(options) {
      this.onPaste = options.onPaste;
      this.onEditPrefix = options.onEditPrefix;
      this.onStateChange = options.onStateChange;
      this.autoSend = options.autoSend !== void 0 ? options.autoSend : true;
      this.prefixEnabled = options.initialPrefixEnabled !== void 0 ? options.initialPrefixEnabled : options.prefixEnabled || false;
      this.prefixText = options.initialPrefixText !== void 0 ? options.initialPrefixText : options.prefixText || "";
      this.element = null;
      this.autoSendCheckbox = null;
      this.prefixCheckbox = null;
    }
    create() {
      const wrapper = document.createElement("div");
      wrapper.className = "ai-paste-toolbar";
      const prefixGroup = document.createElement("div");
      prefixGroup.className = "ai-paste-group";
      const prefixWrapper = document.createElement("label");
      prefixWrapper.className = "ai-paste-checkbox-wrapper";
      const prefixCheckbox = document.createElement("input");
      prefixCheckbox.type = "checkbox";
      prefixCheckbox.className = "ai-paste-checkbox";
      prefixCheckbox.checked = this.prefixEnabled;
      prefixCheckbox.addEventListener("change", () => {
        this.prefixEnabled = prefixCheckbox.checked;
        this.notifyStateChange();
      });
      const prefixLabel = document.createElement("span");
      prefixLabel.className = "ai-paste-label ai-paste-label-clickable";
      prefixLabel.textContent = "\u6709\u524D\u7F6E\u6587\u672C";
      prefixLabel.title = "\u70B9\u51FB\u7F16\u8F91\u524D\u7F6E\u6587\u672C";
      prefixLabel.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onEditPrefix) this.onEditPrefix(this.prefixText);
      });
      prefixWrapper.appendChild(prefixCheckbox);
      prefixWrapper.appendChild(prefixLabel);
      this.prefixCheckbox = prefixCheckbox;
      prefixGroup.appendChild(prefixWrapper);
      const autoSendWrapper = document.createElement("label");
      autoSendWrapper.className = "ai-paste-checkbox-wrapper";
      const autoSendCheckbox = document.createElement("input");
      autoSendCheckbox.type = "checkbox";
      autoSendCheckbox.className = "ai-paste-checkbox";
      autoSendCheckbox.checked = this.autoSend;
      const autoSendLabel = document.createElement("span");
      autoSendLabel.className = "ai-paste-label";
      autoSendLabel.textContent = "\u53D1\u9001";
      autoSendWrapper.appendChild(autoSendCheckbox);
      autoSendWrapper.appendChild(autoSendLabel);
      this.autoSendCheckbox = autoSendCheckbox;
      const pasteBtn = document.createElement("button");
      pasteBtn.className = "ai-paste-btn ai-paste-btn-primary";
      pasteBtn.textContent = "\u7C98\u8D34";
      pasteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.onPaste) this.onPaste();
      });
      wrapper.appendChild(prefixGroup);
      wrapper.appendChild(autoSendWrapper);
      wrapper.appendChild(pasteBtn);
      this.element = wrapper;
      this.favorites = [];
      this.loadFavorites();
      return wrapper;
    }
    notifyStateChange() {
      if (this.onStateChange) {
        this.onStateChange({
          prefixEnabled: this.prefixEnabled,
          prefixText: this.prefixText
        });
      }
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
      this.notifyStateChange();
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
      overlay.className = "ai-paste-modal-overlay";
      const content = document.createElement("div");
      content.className = "ai-paste-modal-content";
      const header = document.createElement("div");
      header.className = "ai-paste-modal-header";
      const title = document.createElement("h3");
      title.className = "ai-paste-modal-title";
      title.textContent = "\u7F16\u8F91\u524D\u7F6E\u6536\u85CF";
      header.appendChild(title);
      const currentLabel = document.createElement("div");
      currentLabel.className = "ai-paste-section-title";
      currentLabel.textContent = "\u5F53\u524D\u524D\u7F6E\u6587\u672C";
      const textarea = document.createElement("textarea");
      textarea.className = "ai-paste-textarea";
      textarea.value = this.currentText;
      this.textarea = textarea;
      const favHeader = document.createElement("div");
      favHeader.className = "ai-paste-section-title";
      favHeader.textContent = "\u6536\u85CF\u5217\u8868";
      favHeader.style.marginTop = "12px";
      const favList = document.createElement("div");
      favList.className = "ai-paste-list";
      this.favListEl = favList;
      this._renderFavorites();
      const actions = document.createElement("div");
      actions.className = "ai-paste-modal-actions";
      const leftActions = document.createElement("div");
      leftActions.className = "ai-paste-modal-actions-left";
      const addBtn = document.createElement("button");
      addBtn.className = "ai-paste-btn";
      addBtn.textContent = "\u6DFB\u52A0\u6536\u85CF";
      addBtn.addEventListener("click", () => {
        this.favorites.push({ id: this._genId(), text: this.textarea.value || "" });
        this._renderFavorites();
      });
      leftActions.appendChild(addBtn);
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "ai-paste-btn";
      cancelBtn.textContent = "\u53D6\u6D88";
      cancelBtn.addEventListener("click", () => {
        this.close();
        if (this.onCancel) this.onCancel();
      });
      const confirmBtn = document.createElement("button");
      confirmBtn.className = "ai-paste-btn ai-paste-btn-primary";
      confirmBtn.textContent = "\u4FDD\u5B58\u5E76\u5173\u95ED";
      confirmBtn.addEventListener("click", () => {
        this.currentText = this.textarea.value || "";
        const payload2 = { favorites: this.favorites.slice(), currentText: this.currentText };
        this.close();
        if (this.onConfirm) this.onConfirm(payload2);
      });
      actions.appendChild(leftActions);
      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
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
        row.className = "ai-paste-list-item";
        const textDiv = document.createElement("div");
        textDiv.className = "ai-paste-list-item-text";
        textDiv.textContent = fav.text || "(\u7A7A)";
        textDiv.title = fav.text;
        const actionCol = document.createElement("div");
        actionCol.className = "ai-paste-list-item-actions";
        const useBtn = document.createElement("button");
        useBtn.className = "ai-paste-btn ai-paste-btn-sm";
        useBtn.textContent = "\u4F7F\u7528";
        useBtn.addEventListener("click", () => {
          this.textarea.value = fav.text || "";
        });
        const delBtn = document.createElement("button");
        delBtn.className = "ai-paste-icon-btn ai-paste-btn-danger";
        delBtn.innerHTML = "&times;";
        delBtn.title = "\u5220\u9664";
        delBtn.addEventListener("click", () => {
          this.favorites = this.favorites.filter((f) => f.id !== fav.id);
          this._renderFavorites();
        });
        actionCol.appendChild(useBtn);
        actionCol.appendChild(delBtn);
        row.appendChild(textDiv);
        row.appendChild(actionCol);
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
    constructor(options = {}) {
      this.options = options;
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
        ...this.options,
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
    constructor(options = {}) {
      this.options = options;
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
        ...this.options,
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
    constructor(options = {}) {
      this.options = options;
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
        ...this.options,
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

  // ui/styles.js
  function injectStyles() {
    const styleId = "ai-paste-helper-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        :root {
            --ai-paste-bg: #ffffff;
            --ai-paste-text: #333333;
            --ai-paste-text-secondary: #666666;
            --ai-paste-border: #e5e7eb;
            --ai-paste-primary: #10a37f;
            --ai-paste-primary-hover: #0d8a6c;
            --ai-paste-primary-text: #ffffff;
            --ai-paste-surface: #f9fafb;
            --ai-paste-surface-hover: #f3f4f6;
            --ai-paste-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --ai-paste-overlay: rgba(0, 0, 0, 0.5);
            --ai-paste-radius: 8px;
            --ai-paste-radius-sm: 6px;
            --ai-paste-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --ai-paste-bg: #1e1e1e;
                --ai-paste-text: #e5e7eb;
                --ai-paste-text-secondary: #9ca3af;
                --ai-paste-border: #3f3f46;
                --ai-paste-primary: #10a37f;
                --ai-paste-primary-hover: #0d8a6c;
                --ai-paste-primary-text: #ffffff;
                --ai-paste-surface: #27272a;
                --ai-paste-surface-hover: #3f3f46;
                --ai-paste-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
                --ai-paste-overlay: rgba(0, 0, 0, 0.7);
            }
        }

        /* Force dark mode if host has dark-theme class or similar */
        body.dark-theme, body.dark, [data-theme='dark'], html.dark, :root.dark {
            --ai-paste-bg: #1e1e1e;
            --ai-paste-text: #e5e7eb;
            --ai-paste-text-secondary: #9ca3af;
            --ai-paste-border: #3f3f46;
            --ai-paste-primary: #10a37f;
            --ai-paste-primary-hover: #0d8a6c;
            --ai-paste-primary-text: #ffffff;
            --ai-paste-surface: #27272a;
            --ai-paste-surface-hover: #3f3f46;
            --ai-paste-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
            --ai-paste-overlay: rgba(0, 0, 0, 0.7);
        }

        .ai-paste-toolbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0; /* Removed padding */
            background-color: transparent;
            font-family: var(--ai-paste-font);
            font-size: 13px;
            color: var(--ai-paste-text);
            flex-wrap: wrap;
        }

        .ai-paste-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ai-paste-checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            user-select: none;
        }

        .ai-paste-checkbox {
            appearance: none;
            width: 16px;
            height: 16px;
            border: 1.5px solid var(--ai-paste-border);
            border-radius: 4px;
            background-color: transparent;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
        }

        .ai-paste-checkbox:checked {
            background-color: var(--ai-paste-primary);
            border-color: var(--ai-paste-primary);
        }

        .ai-paste-checkbox:checked::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }

        .ai-paste-label {
            color: var(--ai-paste-text);
            font-size: 13px;
            font-weight: 500;
        }

        .ai-paste-label-clickable {
            cursor: pointer;
            border-bottom: 1px dashed var(--ai-paste-text-secondary);
            transition: color 0.2s, border-color 0.2s;
        }

        .ai-paste-label-clickable:hover {
            color: var(--ai-paste-primary);
            border-color: var(--ai-paste-primary);
        }

        .ai-paste-btn {
            padding: 6px 12px;
            border-radius: var(--ai-paste-radius-sm);
            border: 1px solid var(--ai-paste-border);
            background-color: var(--ai-paste-surface);
            color: var(--ai-paste-text);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

        .ai-paste-btn:hover {
            background-color: var(--ai-paste-surface-hover);
            border-color: var(--ai-paste-text-secondary);
        }

        .ai-paste-btn-primary {
            background-color: var(--ai-paste-primary);
            color: var(--ai-paste-primary-text);
            border: 1px solid transparent;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .ai-paste-btn-primary:hover {
            background-color: var(--ai-paste-primary-hover);
        }

        .ai-paste-btn-sm {
            padding: 4px 8px;
            font-size: 11px;
        }

        .ai-paste-icon-btn {
            padding: 4px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: none;
            background-color: transparent;
            color: var(--ai-paste-text-secondary);
            font-size: 16px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: all 0.2s ease;
        }

        .ai-paste-icon-btn:hover {
            background-color: var(--ai-paste-surface-hover);
            color: var(--ai-paste-text);
        }

        .ai-paste-btn-danger {
            color: #ef4444;
        }
        
        .ai-paste-btn-danger:hover {
            color: #dc2626;
        }
        
        body.dark-theme .ai-paste-btn-danger,
        body.dark .ai-paste-btn-danger,
        [data-theme='dark'] .ai-paste-btn-danger,
        @media (prefers-color-scheme: dark) {
             .ai-paste-btn-danger:hover {
                background-color: rgba(239, 68, 68, 0.2);
             }
        }


        /* Modal Styles */
        .ai-paste-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--ai-paste-overlay);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(2px);
            animation: aiPasteFadeIn 0.2s ease-out;
        }

        .ai-paste-modal-content {
            width: 600px;
            max-width: 90%;
            background-color: var(--ai-paste-bg);
            border-radius: var(--ai-paste-radius);
            padding: 16px; /* Reduced padding */
            box-shadow: var(--ai-paste-shadow);
            display: flex;
            flex-direction: column;
            gap: 12px; /* Reduced gap */
            border: 1px solid var(--ai-paste-border);
            animation: aiPasteSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-paste-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0; /* Reduced margin */
        }

        .ai-paste-modal-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--ai-paste-text);
            margin: 0;
        }

        .ai-paste-section-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--ai-paste-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .ai-paste-textarea {
            width: 100%;
            height: 120px;
            padding: 12px;
            border-radius: var(--ai-paste-radius-sm);
            border: 1px solid var(--ai-paste-border);
            background-color: var(--ai-paste-surface);
            color: var(--ai-paste-text);
            font-family: monospace;
            font-size: 13px;
            resize: vertical;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }

        .ai-paste-textarea:focus {
            outline: none;
            border-color: var(--ai-paste-primary);
            box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
        }

        .ai-paste-list {
            display: flex;
            flex-direction: column;
            gap: 4px; /* Reduced gap */
            max-height: 300px;
            overflow-y: auto;
            padding-right: 4px;
        }

        .ai-paste-list-item {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 8px 12px;
            background-color: transparent; /* Removed background */
            border-radius: var(--ai-paste-radius-sm);
            border-bottom: 1px solid var(--ai-paste-border); /* Separator */
        }

        .ai-paste-list-item:last-child {
            border-bottom: none;
        }
        
        .ai-paste-list-item:hover {
            background-color: var(--ai-paste-surface);
        }

        .ai-paste-list-item-text {
            flex: 1;
            font-family: monospace;
            font-size: 13px;
            color: var(--ai-paste-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .ai-paste-list-item-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ai-paste-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding-top: 16px;
            border-top: 1px solid var(--ai-paste-border);
        }

        .ai-paste-modal-actions-left {
            margin-right: auto;
        }

        @keyframes aiPasteFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes aiPasteSlideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        /* Scrollbar styling */
        .ai-paste-list::-webkit-scrollbar {
            width: 6px;
        }
        .ai-paste-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .ai-paste-list::-webkit-scrollbar-thumb {
            background-color: var(--ai-paste-border);
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
  }

  // content.js
  function generateColorFromHost(hostname) {
    if (hostname.includes("gemini.google.com")) {
      return { primary: "#4D69EA", hover: "#3B55D0" };
    } else if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
      return { primary: "#343541", hover: "#2A2B32" };
    } else if (hostname.includes("yuanbao.tencent.com")) {
      return { primary: "#7AC581", hover: "#68B06F" };
    }
    let hash = 0;
    for (let i = 0; i < hostname.length; i++) {
      hash = hostname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    const s = 70;
    const l = 45;
    return {
      primary: `hsl(${h}, ${s}%, ${l}%)`,
      hover: `hsl(${h}, ${s}%, ${l - 5}%)`
      // Slightly darker for hover
    };
  }
  async function getStoredState(host) {
    const key = `aiPaste_state_${host}`;
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        const res = await new Promise((resolve) => chrome.storage.local.get([key], resolve));
        return res[key] || null;
      } else {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }
    } catch (e) {
      console.warn("AI Paste Helper: Failed to load state", e);
      return null;
    }
  }
  async function saveStoredState(host, state) {
    const key = `aiPaste_state_${host}`;
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await new Promise((resolve) => chrome.storage.local.set({ [key]: state }, resolve));
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.warn("AI Paste Helper: Failed to save state", e);
    }
  }
  async function main() {
    const host = window.location.hostname;
    const colors = generateColorFromHost(host);
    document.documentElement.style.setProperty("--ai-paste-primary", colors.primary);
    document.documentElement.style.setProperty("--ai-paste-primary-hover", colors.hover);
    injectStyles();
    const savedState = await getStoredState(host);
    let adapter = null;
    const adapterOptions = {
      initialPrefixText: savedState?.prefixText || "",
      // Default to true if no state saved, otherwise use saved state
      initialPrefixEnabled: savedState ? savedState.prefixEnabled !== void 0 ? savedState.prefixEnabled : true : true,
      onStateChange: (newState) => {
        saveStoredState(host, newState);
      }
    };
    if (host.includes("chatgpt.com") || host.includes("openai.com")) {
      console.log("AI Paste Helper: Detected ChatGPT");
      adapter = new ChatGPTAdapter(adapterOptions);
    } else if (host.includes("yuanbao.tencent.com")) {
      console.log("AI Paste Helper: Detected Yuanbao");
      adapter = new YuanbaoAdapter(adapterOptions);
    } else if (host.includes("gemini.google.com")) {
      console.log("AI Paste Helper: Detected Gemini");
      adapter = new GeminiAdapter(adapterOptions);
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
