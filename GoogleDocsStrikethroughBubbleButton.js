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
    let retryCount = 0;
    const MAX_RETRIES = 10; // Limit retries to avoid infinite loops

    function addButton() {
        // Check if button already exists
        if (document.getElementById('strikethrough-bubble-button')) {
            return;
        }

        // Find the Google Docs editing iframe
        const editorIframe = document.querySelector('iframe.docs-texteventtarget-iframe');

        if (!editorIframe || !editorIframe.contentDocument) {
            retryCount++;
            if (retryCount > MAX_RETRIES) {
                GM_log("Strikethrough Button: Failed to find the editor iframe after maximum retries.");
                return;
            }
            GM_log(`Strikethrough Button: Editor iframe not found. Retrying... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(addButton, 500); // Retry after 500ms
            return;
        }

        GM_log("Strikethrough Button: Editor iframe found. Adding button.");
        const targetDoc = editorIframe.contentDocument;

        // Create a toolbar container
        const toolbar = document.createElement('div');
        toolbar.id = 'formatting-toolbar';
        toolbar.style.position = 'fixed';
        toolbar.style.bottom = '20px';
        toolbar.style.right = '20px';
        toolbar.style.display = 'flex';
        toolbar.style.flexDirection = 'column'; // Update toolbar styling for vertical alignment
        toolbar.style.gap = '10px';
        toolbar.style.zIndex = Z_INDEX;

        // Helper function to create a button
        function createButton(title, shortcut, iconPath, onClick) {
            const button = document.createElement('button');
            button.title = `${title} (${shortcut})`;
            button.style.width = BUTTON_SIZE;
            button.style.height = BUTTON_SIZE;
            button.style.backgroundColor = BUTTON_BACKGROUND;
            button.style.color = BUTTON_ICON_COLOR;
            button.style.border = 'none';
            button.style.borderRadius = '50%';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            button.style.cursor = 'pointer';
            button.style.display = 'flex';
            button.style.justifyContent = 'center';
            button.style.alignItems = 'center';
            button.style.fontSize = '20px';
            button.style.fontFamily = 'Arial, sans-serif'; // Ensure consistent font
            button.style.transition = 'background-color 0.2s ease, transform 0.1s ease';

            // Add hover and active effects
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#357ABD';
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = BUTTON_BACKGROUND;
            });
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.95)';
            });
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });

            // Add click event
            button.addEventListener('click', onClick);

            // Add text label for the button
            const label = document.createElement('span');
            label.textContent = title.charAt(0); // Use the first letter of the title as the label
            label.style.color = BUTTON_ICON_COLOR;
            label.style.fontSize = '16px';
            label.style.fontFamily = 'Arial, sans-serif';
            button.appendChild(label);

            return button;
        }

        // Add buttons to the toolbar
        toolbar.appendChild(createButton('Bold', 'Ctrl+B', null, () => simulateKeypress(targetDoc, 'b', true, false)));
        toolbar.appendChild(createButton('Italic', 'Ctrl+I', null, () => simulateKeypress(targetDoc, 'i', true, false)));
        toolbar.appendChild(createButton('Underline', 'Ctrl+U', null, () => simulateKeypress(targetDoc, 'u', true, false)));
        toolbar.appendChild(createButton('Strikethrough', 'Alt+Shift+5', null, () => simulateKeypress(targetDoc, '5', false, true, true)));

        // Append the toolbar to the document
        document.body.appendChild(toolbar);

        // Function to simulate keypress for formatting actions
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

        // Add drag functionality to the button
        toolbar.addEventListener('mousedown', (event) => {
            event.preventDefault();

            let shiftX = event.clientX - toolbar.getBoundingClientRect().left;
            let shiftY = event.clientY - toolbar.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                toolbar.style.left = pageX - shiftX + 'px';
                toolbar.style.top = pageY - shiftY + 'px';
                toolbar.style.bottom = 'auto'; // Reset bottom to auto for dynamic positioning
                toolbar.style.right = 'auto'; // Reset right to auto for dynamic positioning
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            toolbar.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        toolbar.addEventListener('dragstart', () => false); // Disable default drag behavior

        // Append the button to the main document's body (so it floats above the iframe)
        document.body.appendChild(toolbar);
        GM_log("Strikethrough Button: Button added to the page.");
    }

    // --- Initialization ---
    // Use window.onload for initial page load, then addButton handles iframe check/retry.
    window.addEventListener('load', addButton);

})();
