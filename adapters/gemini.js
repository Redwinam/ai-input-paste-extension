import { PasteControls } from '../ui/controls.js';
import { EditModal } from '../ui/modal.js';

export class GeminiAdapter {
    constructor() {
        // Based on user provided HTML
        this.targetSelector = 'div.ql-editor.textarea';
        this.sendButtonSelector = 'button[aria-label="发送"]'; // "发送" from HTML
        this.controlsParentSelector = '.text-input-field_textarea-wrapper'; // A good wrapper

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
                if (payload && typeof payload.currentText === 'string') {
                    this.controls.setPrefixText(payload.currentText);
                }
            },
            onCancel: () => { }
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
            alert("无法读取剪贴板，请确保已授予权限。");
        }
    }

    handlePaste(text, autoSend) {
        const target = document.querySelector(this.targetSelector);
        if (!target) return;

        target.focus();

        // Gemini also uses Quill (ql-editor class seen in HTML)
        document.execCommand('insertText', false, text);
        target.dispatchEvent(new Event('input', { bubbles: true }));

        if (autoSend) {
            setTimeout(() => {
                const sendBtn = document.querySelector(this.sendButtonSelector);
                if (sendBtn && !sendBtn.disabled) {
                    sendBtn.click();
                } else {
                    // Try finding by icon if aria-label fails or changes language
                    const iconSend = document.querySelector('mat-icon[data-mat-icon-name="send"]');
                    if (iconSend) {
                        const btn = iconSend.closest('button');
                        if (btn) btn.click();
                    }
                }
            }, 300);
        }
    }
}
