export function injectStyles() {
    const styleId = 'ai-paste-helper-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
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
