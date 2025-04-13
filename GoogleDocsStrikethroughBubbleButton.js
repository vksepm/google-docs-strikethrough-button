// ==UserScript==
// @name         Google Docs Formatting Toolbar
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds a floating toolbar to Google Docs for text formatting options like Bold, Italic, Underline, and Strikethrough. Handles TrustedHTML. Attempts focus and keyup.
// @author       Gemini
// @match        https://docs.google.com/document/d/*
// @grant        GM_addStyle
// @grant        GM_log
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXN0cmlrZXRocm91Z2giPjxwYXRoIGQ9Ik0xNiA0SDlhMyAzIDAgMCAwLTIuODMgNCIvPjxwYXRoIGQ9Ik0xNCAxMmE0IDQgMCAwIDEgMCA4SDYiLz48bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iMTIiIHkyPSIxMiIvPjwvc3ZnPg==
// ==/UserScript==

(function() {
    'use strict';

    // Configuration constants
    const CONFIG = {
        BUTTON_POSITION: { bottom: '20px', right: '20px' },
        BUTTON_SIZE: '45px',
        BUTTON_BACKGROUND: '#4285F4',
        BUTTON_ICON_COLOR: '#ffffff',
        Z_INDEX: '9999',
        MAX_RETRIES: 10,
        RETRY_DELAY: 500
    };

    // Utility function to log messages
    function logMessage(message) {
        GM_log(`Formatting Toolbar: ${message}`);
    }

    // Helper function to create SVG icons
    function createSVGIcon(iconPaths) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");

        iconPaths.forEach(pathData => {
            const path = document.createElementNS(svgNS, pathData.type);
            Object.entries(pathData.attributes).forEach(([key, value]) => {
                path.setAttribute(key, value);
            });
            svg.appendChild(path);
        });

        return svg;
    }

    // Utility function to create a button
    function createButton(title, shortcut, iconPaths, onClick) {
        const button = document.createElement('button');
        button.title = `${title} (${shortcut})`;
        button.style = `
            width: ${CONFIG.BUTTON_SIZE};
            height: ${CONFIG.BUTTON_SIZE};
            background-color: ${CONFIG.BUTTON_BACKGROUND};
            color: ${CONFIG.BUTTON_ICON_COLOR};
            border: none;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            font-family: Arial, sans-serif;
            transition: background-color 0.2s ease, transform 0.1s ease;
        `;

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#357ABD';
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = CONFIG.BUTTON_BACKGROUND;
        });
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        button.addEventListener('click', onClick);

        // Add SVG icon to the button
        const svgIcon = createSVGIcon(iconPaths);
        button.appendChild(svgIcon);

        return button;
    }

    // Utility function to simulate keypress
    function simulateKeypress(targetDocument, key, ctrlKey = false, altKey = false, shiftKey = false) {
        const eventOptions = {
            key: key,
            code: `Key${key.toUpperCase()}`,
            keyCode: key.toUpperCase().charCodeAt(0),
            which: key.toUpperCase().charCodeAt(0),
            ctrlKey: ctrlKey,
            altKey: altKey,
            shiftKey: shiftKey,
            bubbles: true,
            cancelable: true
        };

        const keydownEvent = new KeyboardEvent('keydown', eventOptions);
        targetDocument.dispatchEvent(keydownEvent);

        const keyupEvent = new KeyboardEvent('keyup', eventOptions);
        targetDocument.dispatchEvent(keyupEvent);
    }

    // Function to add the toolbar
    function addToolbar(targetDoc) {
        const toolbar = document.createElement('div');
        toolbar.id = 'formatting-toolbar';
        toolbar.style = `
            position: fixed;
            bottom: ${CONFIG.BUTTON_POSITION.bottom};
            right: ${CONFIG.BUTTON_POSITION.right};
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: ${CONFIG.Z_INDEX};
        `;

        // Define SVG paths for each button
        const ICON_PATHS = {
            bold: [
                { type: 'path', attributes: { d: 'M6 4h8a4 4 0 0 1 0 8H6z' } },
                { type: 'path', attributes: { d: 'M6 12h8a4 4 0 0 1 0 8H6z' } }
            ],
            italic: [
                { type: 'line', attributes: { x1: '19', y1: '4', x2: '10', y2: '4' } },
                { type: 'line', attributes: { x1: '14', y1: '20', x2: '5', y2: '20' } },
                { type: 'line', attributes: { x1: '15', y1: '4', x2: '9', y2: '20' } }
            ],
            underline: [
                { type: 'path', attributes: { d: 'M6 4v6a6 6 0 0 0 12 0V4' } },
                { type: 'line', attributes: { x1: '4', y1: '20', x2: '20', y2: '20' } }
            ],
            strikethrough: [
                { type: 'path', attributes: { d: 'M16 4H9a3 3 0 0 0-2.83 4' } },
                { type: 'path', attributes: { d: 'M14 12a4 4 0 0 1 0 8H6' } },
                { type: 'line', attributes: { x1: '4', y1: '12', x2: '20', y2: '12' } }
            ]
        };

        // Add buttons to the toolbar with SVG icons
        toolbar.appendChild(createButton('Bold', 'Ctrl+B', ICON_PATHS.bold, () => simulateKeypress(targetDoc, 'b', true)));
        toolbar.appendChild(createButton('Italic', 'Ctrl+I', ICON_PATHS.italic, () => simulateKeypress(targetDoc, 'i', true)));
        toolbar.appendChild(createButton('Underline', 'Ctrl+U', ICON_PATHS.underline, () => simulateKeypress(targetDoc, 'u', true)));
        toolbar.appendChild(createButton('Strikethrough', 'Alt+Shift+5', ICON_PATHS.strikethrough, () => simulateKeypress(targetDoc, '5', false, true, true)));

        document.body.appendChild(toolbar);

        toolbar.addEventListener('mousedown', (event) => {
            event.preventDefault();

            let shiftX = event.clientX - toolbar.getBoundingClientRect().left;
            let shiftY = event.clientY - toolbar.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                toolbar.style.left = pageX - shiftX + 'px';
                toolbar.style.top = pageY - shiftY + 'px';
                toolbar.style.bottom = 'auto';
                toolbar.style.right = 'auto';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            toolbar.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        toolbar.addEventListener('dragstart', () => false);
    }

    // Function to initialize the script
    function initialize() {
        let retryCount = 0;

        function tryAddToolbar() {
            const editorIframe = document.querySelector('iframe.docs-texteventtarget-iframe');

            if (!editorIframe || !editorIframe.contentDocument) {
                retryCount++;
                if (retryCount > CONFIG.MAX_RETRIES) {
                    logMessage("Failed to find the editor iframe after maximum retries.");
                    return;
                }
                logMessage(`Editor iframe not found. Retrying... (${retryCount}/${CONFIG.MAX_RETRIES})`);
                setTimeout(tryAddToolbar, CONFIG.RETRY_DELAY);
                return;
            }

            logMessage("Editor iframe found. Adding toolbar.");
            addToolbar(editorIframe.contentDocument);
        }

        tryAddToolbar();
    }

    // Initialize the script on page load
    window.addEventListener('load', initialize);

})();
