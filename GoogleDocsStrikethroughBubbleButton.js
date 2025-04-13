// ==UserScript==
// @name         Google Docs Strikethrough Bubble Button
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Adds a floating button to Google Docs to toggle strikethrough (Alt+Shift+5). Handles TrustedHTML. Attempts focus and keyup.
// @author       Your Name Here (or Gemini)
// @match        https://docs.google.com/document/d/*
// @grant        GM_addStyle
// @grant        GM_log
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXN0cmlrZXRocm91Z2giPjxwYXRoIGQ9Ik0xNiA0SDlhMyAzIDAgMCAwLTIuODMgNCIvPjxwYXRoIGQ9Ik0xNCAxMmE0IDQgMCAwIDEgMCA4SDYiLz48bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iMTIiIHkyPSIxMiIvPjwvc3ZnPg==
// ==/UserScript==

(function() {
    'use strict';

    // --- Configuration ---
    const BUTTON_POSITION = { bottom: '20px', right: '20px' }; // Adjust position as needed
    const BUTTON_SIZE = '45px';
    const BUTTON_BACKGROUND = '#4285F4'; // Google Blue
    const BUTTON_ICON_COLOR = '#ffffff'; // White icon
    const Z_INDEX = '9999'; // Ensure it's above most elements

    // --- Styling for the button ---
    GM_addStyle(`
        #strikethrough-bubble-button {
            position: fixed;
            bottom: ${BUTTON_POSITION.bottom};
            right: ${BUTTON_POSITION.right};
            width: ${BUTTON_SIZE};
            height: ${BUTTON_SIZE};
            background-color: ${BUTTON_BACKGROUND};
            color: ${BUTTON_ICON_COLOR}; /* Fallback color */
            border: none;
            border-radius: 50%; /* Makes it round */
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            z-index: ${Z_INDEX};
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px; /* Base size reference */
            transition: background-color 0.2s ease, transform 0.1s ease;
            padding: 0; /* Remove default padding */
            line-height: 1; /* Ensure icon is centered vertically */
        }

        #strikethrough-bubble-button:hover {
            background-color: #357ABD; /* Darker blue on hover */
        }

        #strikethrough-bubble-button:active {
            transform: scale(0.95); /* Slight shrink effect on click */
        }

        /* SVG Icon Styling */
        #strikethrough-bubble-button svg {
            width: 60%; /* Adjust icon size within the button */
            height: 60%;
            stroke: ${BUTTON_ICON_COLOR}; /* Use stroke for the icon color */
            fill: none; /* Ensure SVG is not filled if not intended */
        }
    `);

    // --- Function to simulate the keypress ---
    function simulateStrikethroughKeypress(targetDocument) {
        if (!targetDocument || !targetDocument.body) {
            GM_log("Strikethrough Button: Target document or body not found.");
            return;
        }

        // Determine the best target element within the iframe
        let targetElement = targetDocument.body;
        // If there's an active element within the iframe, and it's not the body itself, prefer that.
        // This often targets the specific editable paragraph or element.
        if (targetDocument.activeElement && targetDocument.activeElement !== targetDocument.body) {
            targetElement = targetDocument.activeElement;
            GM_log("Strikethrough Button: Targeting activeElement within iframe.");
        } else {
            GM_log("Strikethrough Button: Targeting iframe body.");
        }

        // Try focusing the target element first (might be necessary for event listeners)
        // Use try-catch in case focus fails or causes unexpected side effects (like scrolling)
        try {
            // Check if the target is focusable and not already focused
            if (typeof targetElement.focus === 'function' && document.activeElement !== targetElement) {
                 targetElement.focus();
                 GM_log("Strikethrough Button: Focused target element.");
            } else if (document.activeElement === targetElement) {
                 GM_log("Strikethrough Button: Target element already focused.");
            } else {
                 GM_log("Strikethrough Button: Target element might not be focusable.");
            }
        } catch (e) {
            GM_log(`Strikethrough Button: Focusing target element failed: ${e}`);
            // Proceed even if focus fails, maybe it's not strictly required
        }

        GM_log("Strikethrough Button: Simulating Alt+Shift+5 keydown/keyup");

        const eventOptions = {
            key: '5',
            code: 'Digit5',
            keyCode: 53, // Deprecated but sometimes needed
            which: 53,   // Deprecated but sometimes needed
            altKey: true,
            shiftKey: true,
            ctrlKey: false,
            metaKey: false,
            bubbles: true,  // Allow event to bubble up
            cancelable: true // Allow event to be cancelled
        };

        // Create and dispatch the keydown event
        const keydownEvent = new KeyboardEvent('keydown', eventOptions);
        const dispatchResultDown = targetElement.dispatchEvent(keydownEvent);
        GM_log(`Strikethrough Button: keydown dispatched to ${targetElement.tagName}. Result: ${dispatchResultDown}`);

        // Create and dispatch the keyup event (often necessary to complete the shortcut)
        const keyupEvent = new KeyboardEvent('keyup', eventOptions);
        const dispatchResultUp = targetElement.dispatchEvent(keyupEvent);
        GM_log(`Strikethrough Button: keyup dispatched to ${targetElement.tagName}. Result: ${dispatchResultUp}`);

        // Check if the event was cancelled (preventDefault was called), which often indicates it was processed.
        if (!dispatchResultDown || !keydownEvent.defaultPrevented) {
             GM_log("Strikethrough Button: WARNING - keydown event was not cancelled by the page. Shortcut might not have been processed.");
        } else {
             GM_log("Strikethrough Button: keydown event was cancelled (likely processed).");
        }
         if (!dispatchResultUp || !keyupEvent.defaultPrevented) {
             // Keyup cancellation is less common to check, but log anyway
             GM_log("Strikethrough Button: keyup event was not cancelled by the page.");
         }
    }


    // --- Create and add the button ---
    function addButton() {
        // Check if button already exists
        if (document.getElementById('strikethrough-bubble-button')) {
            return;
        }

        // Find the Google Docs editing iframe
        const editorIframe = document.querySelector('iframe.docs-texteventtarget-iframe');

        if (!editorIframe || !editorIframe.contentDocument) {
            // If the iframe isn't ready yet, wait a bit and try again.
            setTimeout(addButton, 500); // Retry after 500ms
            return;
        }

        GM_log("Strikethrough Button: Editor iframe found. Adding button.");
        const targetDoc = editorIframe.contentDocument;

        // Create the button element
        const button = document.createElement('button');
        button.id = 'strikethrough-bubble-button';
        button.title = 'Toggle Strikethrough (Alt+Shift+5)'; // Tooltip

        // --- Create SVG Icon using DOM methods (avoids TrustedHTML issues) ---
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        // Set attributes using setAttribute
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.classList.add("strikethrough-icon");

        const path1 = document.createElementNS(svgNS, "path");
        path1.setAttribute("d", "M16 4H9a3 3 0 0 0-2.83 4");
        svg.appendChild(path1);
        const path2 = document.createElementNS(svgNS, "path");
        path2.setAttribute("d", "M14 12a4 4 0 0 1 0 8H6");
        svg.appendChild(path2);
        const line1 = document.createElementNS(svgNS, "line");
        line1.setAttribute("x1", "4");
        line1.setAttribute("x2", "20");
        line1.setAttribute("y1", "12");
        line1.setAttribute("y2", "12");
        svg.appendChild(line1);

        button.appendChild(svg);
        // --- End SVG Icon Creation ---


        // Add click event listener
        button.addEventListener('click', () => {
            // Pass the iframe's document to the simulation function
            simulateStrikethroughKeypress(targetDoc);
        });

        // Append the button to the main document's body (so it floats above the iframe)
        document.body.appendChild(button);
        GM_log("Strikethrough Button: Button added to the page.");
    }

    // --- Initialization ---
    // Use window.onload for initial page load, then addButton handles iframe check/retry.
    window.addEventListener('load', addButton);

})();
