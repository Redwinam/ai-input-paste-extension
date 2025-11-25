export class PasteControls {
  constructor(options) {
    this.onPaste = options.onPaste;
    this.onEditPrefix = options.onEditPrefix;
    this.isDarkMode = options.isDarkMode || false;
    this.autoSend = options.autoSend !== undefined ? options.autoSend : true;
    this.prefixEnabled = options.prefixEnabled || false;
    this.prefixText = options.prefixText || '';

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
    prefixLabel.textContent = "有前置文本";
    prefixLabel.style.fontSize = "11px";
    prefixLabel.style.margin = "0";
    prefixLabel.style.cursor = "pointer";
    prefixLabel.style.color = this.isDarkMode ? "#e0e0e0" : "#333";

    const editPrefixBtn = document.createElement("button");
    editPrefixBtn.textContent = "编辑收藏";
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
    label.textContent = "自动发送";
    label.style.fontSize = "11px";
    label.style.margin = "0";
    label.style.cursor = "pointer";
    label.style.color = this.isDarkMode ? "#e0e0e0" : "#333";

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);
    this.autoSendCheckbox = checkbox;


    const pasteBtn = document.createElement("button");
    pasteBtn.textContent = "粘贴";
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
    return this.prefixText || '';
  }

  setPrefixText(text) {
    this.prefixText = text || '';
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
    } catch (_) {}
  }

  getFavorites() {
    return Array.isArray(this.favorites) ? this.favorites.slice() : [];
  }

  setFavorites(arr) {
    this.favorites = Array.isArray(arr) ? arr.slice() : [];
    this.saveFavorites();
  }
}
