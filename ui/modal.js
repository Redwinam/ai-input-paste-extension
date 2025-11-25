export class EditModal {
    constructor(options) {
        this.onConfirm = options.onConfirm;
        this.onCancel = options.onCancel;
        this.isDarkMode = options.isDarkMode || false;
        this.modal = null;
        this.textarea = null;
        this.favListEl = null;
        this.favorites = [];
        this.currentText = '';
    }

    show(payload) {
        if (this.modal) {
            this.modal.remove();
        }

        const initialText = typeof payload === 'string' ? payload : (payload && payload.initialText) || '';
        const favorites = (payload && payload.favorites) || [];
        this.favorites = Array.isArray(favorites) ? favorites.map(f => ({ id: f.id || this._genId(), text: f.text || '' })) : [];
        this.currentText = initialText || '';

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
        header.textContent = "编辑前置收藏";
        header.style.margin = "0";
        header.style.color = this.isDarkMode ? "#fff" : "#333";

        const currentLabel = document.createElement("div");
        currentLabel.textContent = "当前前置文本";
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
        favHeader.textContent = "收藏列表";
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
        addBtn.textContent = "添加收藏";
        addBtn.style.padding = "6px 10px";
        addBtn.style.borderRadius = "4px";
        addBtn.style.border = "1px solid #ccc";
        addBtn.style.cursor = "pointer";
        addBtn.style.backgroundColor = this.isDarkMode ? "#606060" : "#fff";
        addBtn.style.color = this.isDarkMode ? "#fff" : "#333";
        addBtn.addEventListener("click", () => {
            this.favorites.push({ id: this._genId(), text: this.textarea.value || '' });
            this._renderFavorites();
        });

        leftActions.appendChild(addBtn);

        const rightActions = document.createElement("div");
        rightActions.style.display = "flex";
        rightActions.style.gap = "8px";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "取消";
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
        confirmBtn.textContent = "保存并关闭";
        confirmBtn.style.padding = "6px 12px";
        confirmBtn.style.borderRadius = "4px";
        confirmBtn.style.border = "none";
        confirmBtn.style.cursor = "pointer";
        confirmBtn.style.backgroundColor = "#10a37f";
        confirmBtn.style.color = "#fff";
        confirmBtn.style.fontWeight = "bold";
        confirmBtn.addEventListener("click", () => {
            this.currentText = this.textarea.value || '';
            const payload = { favorites: this.favorites.slice(), currentText: this.currentText };
            this.close();
            if (this.onConfirm) this.onConfirm(payload);
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
        this.favListEl.innerHTML = '';
        this.favorites.forEach((fav, idx) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.gap = '8px';
            row.style.alignItems = 'flex-start';

            const ta = document.createElement('textarea');
            ta.value = fav.text || '';
            ta.style.flex = '1';
            ta.style.minHeight = '80px';
            ta.style.padding = '6px';
            ta.style.borderRadius = '4px';
            ta.style.border = '1px solid #ccc';
            ta.style.resize = 'vertical';
            ta.style.fontFamily = 'monospace';
            ta.style.fontSize = '12px';
            ta.style.backgroundColor = this.isDarkMode ? '#1e1e1e' : '#fff';
            ta.style.color = this.isDarkMode ? '#e0e0e0' : '#333';
            ta.addEventListener('input', () => {
                fav.text = ta.value;
            });

            const useBtn = document.createElement('button');
            useBtn.textContent = '设为当前';
            useBtn.style.padding = '4px 8px';
            useBtn.style.borderRadius = '4px';
            useBtn.style.border = '1px solid #ccc';
            useBtn.style.cursor = 'pointer';
            useBtn.style.backgroundColor = this.isDarkMode ? '#606060' : '#fff';
            useBtn.style.color = this.isDarkMode ? '#fff' : '#333';
            useBtn.addEventListener('click', () => {
                this.textarea.value = fav.text || '';
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = '删除';
            delBtn.style.padding = '4px 8px';
            delBtn.style.borderRadius = '4px';
            delBtn.style.border = '1px solid #ccc';
            delBtn.style.cursor = 'pointer';
            delBtn.style.backgroundColor = this.isDarkMode ? '#606060' : '#fff';
            delBtn.style.color = this.isDarkMode ? '#fff' : '#333';
            delBtn.addEventListener('click', () => {
                this.favorites = this.favorites.filter(f => f.id !== fav.id);
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
}
