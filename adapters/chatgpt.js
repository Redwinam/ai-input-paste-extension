import { PasteControls } from '../ui/controls.js';
import { EditModal } from '../ui/modal.js';

export class ChatGPTAdapter {
    constructor(options = {}) {
        this.options = options;
        this.targetSelector = "#prompt-textarea";
        this.sendButtonSelector = '[data-testid="send-button"]';
        this.controlsParentSelector = "div.relative.flex.w-full.items-end.px-3.py-3"; // Fallback parent
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
                if (payload && typeof payload.currentText === 'string') {
                    this.controls.setPrefixText(payload.currentText);
                }
            },
            onCancel: () => { }
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
            alert("无法读取剪贴板，请确保已授予权限。");
        }
    }

    handlePaste(text, autoSend) {
        const target = document.querySelector(this.targetSelector);
        if (!target) return;

        target.focus();

        // ChatGPT uses ProseMirror/contenteditable
        // Best way is often to simulate paste event or direct insertion

        // Method 1: DataTransfer + Paste Event (Most robust for rich editors)
        const dataTransfer = new DataTransfer();
        dataTransfer.setData("text/plain", text);

        const pasteEvent = new ClipboardEvent("paste", {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true
        });

        target.dispatchEvent(pasteEvent);

        // If paste event doesn't work (prevented or handled weirdly), fallback to text insertion
        // But for ChatGPT, paste event usually works well and handles formatting/newlines.

        if (autoSend) {
            setTimeout(() => {
                const sendBtn = document.querySelector(this.sendButtonSelector);
                if (sendBtn && !sendBtn.disabled) {
                    sendBtn.click();
                }
            }, 300); // Wait for paste processing
        }
    }
}
