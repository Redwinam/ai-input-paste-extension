import { PasteControls } from '../ui/controls.js';
import { EditModal } from '../ui/modal.js';

export class YuanbaoAdapter {
    constructor() {
        this.targetSelector = 'div.ql-editor[contenteditable="true"]';
        this.sendButtonSelector = "a.style__send-btn___ZsLmU"; // Based on previous script
        // Fallback selectors if class names change (common in React apps)
        this.sendButtonFallback = 'button[aria-label="发送"], div[role="button"][aria-label="发送"]';

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
        let parent = target.closest(".style__text-area__wrapper___VV9fW") ||
            target.closest(".style__text-area__edit___d1yNy") ||
            target.closest(".style__text-area___YjBev");
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

        // Yuanbao uses Quill editor (ql-editor class)
        // Direct manipulation of innerText works, but dispatching input event is key.

        // Clear existing if needed? Or append? 
        // Usually paste appends or replaces selection.
        // Let's use execCommand for best compatibility with Quill's internal state

        document.execCommand('insertText', false, text);

        // Dispatch input event just in case
        target.dispatchEvent(new Event('input', { bubbles: true }));

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
}
