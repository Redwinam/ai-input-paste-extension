import { ChatGPTAdapter } from './adapters/chatgpt.js';
import { YuanbaoAdapter } from './adapters/yuanbao.js';
import { GeminiAdapter } from './adapters/gemini.js';

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
