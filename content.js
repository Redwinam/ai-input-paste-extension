import { ChatGPTAdapter } from './adapters/chatgpt.js';
import { YuanbaoAdapter } from './adapters/yuanbao.js';
import { GeminiAdapter } from './adapters/gemini.js';
import { injectStyles } from './ui/styles.js';

function generateColorFromHost(hostname) {
    if (hostname.includes("gemini.google.com")) {
        return { primary: "#4D69EA", hover: "#3B55D0" };
    } else if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
        return { primary: "#343541", hover: "#2A2B32" }; // Deep gray
    } else if (hostname.includes("yuanbao.tencent.com")) {
        return { primary: "#7AC581", hover: "#68B06F" };
    }

    // Fallback to hash generation for others
    let hash = 0;
    for (let i = 0; i < hostname.length; i++) {
        hash = hostname.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate HSL color
    // Hue: 0-360 based on hash
    // Saturation: 60-80% for vibrancy
    // Lightness: 40-50% for readability/contrast
    const h = Math.abs(hash % 360);
    const s = 70;
    const l = 45;
    return {
        primary: `hsl(${h}, ${s}%, ${l}%)`,
        hover: `hsl(${h}, ${s}%, ${l - 5}%)` // Slightly darker for hover
    };
}

async function getStoredState(host) {
    const key = `aiPaste_state_${host}`;
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const res = await new Promise(resolve => chrome.storage.local.get([key], resolve));
            return res[key] || null; // Return null if not found to distinguish from empty object
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
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await new Promise(resolve => chrome.storage.local.set({ [key]: state }, resolve));
        } else {
            localStorage.setItem(key, JSON.stringify(state));
        }
    } catch (e) {
        console.warn("AI Paste Helper: Failed to save state", e);
    }
}

async function main() {
    const host = window.location.hostname;

    // Dynamic Coloring
    const colors = generateColorFromHost(host);
    document.documentElement.style.setProperty('--ai-paste-primary', colors.primary);
    document.documentElement.style.setProperty('--ai-paste-primary-hover', colors.hover);

    injectStyles();

    // Load persisted state
    const savedState = await getStoredState(host);

    let adapter = null;
    const adapterOptions = {
        initialPrefixText: savedState?.prefixText || '',
        // Default to true if no state saved, otherwise use saved state
        initialPrefixEnabled: savedState ? (savedState.prefixEnabled !== undefined ? savedState.prefixEnabled : true) : true,
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
