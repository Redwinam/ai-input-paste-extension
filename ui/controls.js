export class PasteControls {
  constructor(options) {
    this.onPaste = options.onPaste;
    this.onEditPrefix = options.onEditPrefix;
    this.onStateChange = options.onStateChange;

    this.autoSend = options.autoSend !== undefined ? options.autoSend : true;
    this.prefixEnabled = options.initialPrefixEnabled !== undefined ? options.initialPrefixEnabled : (options.prefixEnabled || false);
    this.prefixText = options.initialPrefixText !== undefined ? options.initialPrefixText : (options.prefixText || '');

    this.element = null;
    this.autoSendCheckbox = null;
    this.prefixCheckbox = null;
  }

  create() {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-paste-toolbar";

    // Prefix Group
    const prefixGroup = document.createElement("div");
    prefixGroup.className = "ai-paste-group";

    const prefixWrapper = document.createElement("label");
    prefixWrapper.className = "ai-paste-checkbox-wrapper";

    const prefixCheckbox = document.createElement("input");
    prefixCheckbox.type = "checkbox";
    prefixCheckbox.className = "ai-paste-checkbox";
    prefixCheckbox.checked = this.prefixEnabled;
    prefixCheckbox.addEventListener('change', () => {
      this.prefixEnabled = prefixCheckbox.checked;
      this.notifyStateChange();
    });

    const prefixLabel = document.createElement("span");
    prefixLabel.className = "ai-paste-label ai-paste-label-clickable";
    prefixLabel.textContent = "有前置文本";
    prefixLabel.title = "点击编辑前置文本";
    prefixLabel.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent toggling checkbox
      e.stopPropagation();
      if (this.onEditPrefix) this.onEditPrefix(this.prefixText);
    });

    prefixWrapper.appendChild(prefixCheckbox);
    prefixWrapper.appendChild(prefixLabel);
    this.prefixCheckbox = prefixCheckbox;

    prefixGroup.appendChild(prefixWrapper);

    // Auto Send Group
    const autoSendWrapper = document.createElement("label");
    autoSendWrapper.className = "ai-paste-checkbox-wrapper";

    const autoSendCheckbox = document.createElement("input");
    autoSendCheckbox.type = "checkbox";
    autoSendCheckbox.className = "ai-paste-checkbox";
    autoSendCheckbox.checked = this.autoSend;

    const autoSendLabel = document.createElement("span");
    autoSendLabel.className = "ai-paste-label";
    autoSendLabel.textContent = "发送"; // Renamed from "自动发送"

    autoSendWrapper.appendChild(autoSendCheckbox);
    autoSendWrapper.appendChild(autoSendLabel);
    this.autoSendCheckbox = autoSendCheckbox;

    // Paste Button
    const pasteBtn = document.createElement("button");
    pasteBtn.className = "ai-paste-btn ai-paste-btn-primary";
    pasteBtn.textContent = "粘贴";

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
    return this.prefixText || '';
  }

  setPrefixText(text) {
    this.prefixText = text || '';
    this.notifyStateChange();
  }

  async loadFavorites() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const res = await new Promise((resolve) => chrome.storage.local.get(['aiPasteFavorites'], resolve));
        const arr = res && res.aiPasteFavorites ? res.aiPasteFavorites : [];
        this.favorites = Array.isArray(arr) ? arr : [];
      } else {
        const raw = localStorage.getItem('aiPasteFavorites');
        this.favorites = raw ? JSON.parse(raw) : [];
      }
    } catch (_) {
      this.favorites = [];
    }
  }

  async saveFavorites() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise((resolve) => chrome.storage.local.set({ aiPasteFavorites: this.favorites }, resolve));
      } else {
        localStorage.setItem('aiPasteFavorites', JSON.stringify(this.favorites));
      }
    } catch (_) { }
  }

  getFavorites() {
    return Array.isArray(this.favorites) ? this.favorites.slice() : [];
  }

  setFavorites(arr) {
    this.favorites = Array.isArray(arr) ? arr.slice() : [];
    this.saveFavorites();
  }
}
