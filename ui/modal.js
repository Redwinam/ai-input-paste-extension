export class EditModal {
    constructor(options) {
        this.onConfirm = options.onConfirm;
        this.onCancel = options.onCancel;
        // isDarkMode is no longer needed for inline styles
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
        overlay.className = "ai-paste-modal-overlay";

        const content = document.createElement("div");
        content.className = "ai-paste-modal-content";

        const header = document.createElement("div");
        header.className = "ai-paste-modal-header";

        const title = document.createElement("h3");
        title.className = "ai-paste-modal-title";
        title.textContent = "编辑前置收藏";
        header.appendChild(title);

        const currentLabel = document.createElement("div");
        currentLabel.className = "ai-paste-section-title";
        currentLabel.textContent = "当前前置文本";

        const textarea = document.createElement("textarea");
        textarea.className = "ai-paste-textarea";
        textarea.value = this.currentText;
        this.textarea = textarea;

        const favHeader = document.createElement("div");
        favHeader.className = "ai-paste-section-title";
        favHeader.textContent = "收藏列表";
        favHeader.style.marginTop = "12px"; // Add a little spacing before this section

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
        addBtn.textContent = "添加收藏";
        addBtn.addEventListener("click", () => {
            this.favorites.push({ id: this._genId(), text: this.textarea.value || '' });
            this._renderFavorites();
        });

        leftActions.appendChild(addBtn);

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "ai-paste-btn";
        cancelBtn.textContent = "取消";
        cancelBtn.addEventListener("click", () => {
            this.close();
            if (this.onCancel) this.onCancel();
        });

        const confirmBtn = document.createElement("button");
        confirmBtn.className = "ai-paste-btn ai-paste-btn-primary";
        confirmBtn.textContent = "保存并关闭";
        confirmBtn.addEventListener("click", () => {
            this.currentText = this.textarea.value || '';
            const payload = { favorites: this.favorites.slice(), currentText: this.currentText };
            this.close();
            if (this.onConfirm) this.onConfirm(payload);
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
        this.favListEl.innerHTML = '';
        this.favorites.forEach((fav, idx) => {
            const row = document.createElement('div');
            row.className = "ai-paste-list-item";

            const textDiv = document.createElement('div');
            textDiv.className = "ai-paste-list-item-text";
            textDiv.textContent = fav.text || '(空)';
            textDiv.title = fav.text; // Tooltip for full text

            const actionCol = document.createElement('div');
            actionCol.className = "ai-paste-list-item-actions";

            const useBtn = document.createElement('button');
            useBtn.className = "ai-paste-btn ai-paste-btn-sm";
            useBtn.textContent = '使用';
            useBtn.addEventListener('click', () => {
                this.textarea.value = fav.text || '';
            });

            const delBtn = document.createElement('button');
            delBtn.className = "ai-paste-icon-btn ai-paste-btn-danger";
            delBtn.innerHTML = '&times;'; // Simple X icon
            delBtn.title = "删除";
            delBtn.addEventListener('click', () => {
                this.favorites = this.favorites.filter(f => f.id !== fav.id);
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
}
