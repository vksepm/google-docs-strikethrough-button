| Install | Script Name | Purpose |
| ----- | ----- | ----- |
| <a href="https://www.tampermonkey.net/script_installation.php#https://www.tampermonkey.net/script_installation.php#https://github.com/vksepm/google-docs-strikethrough-button/raw/main/GoogleDocsStrikethroughBubbleButton.js"><img src="https://user-images.githubusercontent.com/88981/169986095-a54f32bd-55a6-4de8-bad6-aa3b1874ce07.png" width="32"/></a> | Google Docs Strikethrough Bubble Button | This script adds a floating button to Google Docs that allows users to toggle strikethrough formatting (Alt+Shift+5) with a single click. |

## Features
- Adds a floating, circular button to Google Docs for toggling strikethrough formatting.
- Simulates the keyboard shortcut (Alt+Shift+5) for strikethrough.
- Automatically detects the Google Docs editing iframe and targets the active element for the shortcut.
- Includes a visually appealing button with hover and click effects.

## Installation
1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/).
2. Copy the script from `GoogleDocsStrikethroughBubbleButton.js`.
3. Create a new userscript in your userscript manager and paste the script.
4. Save and enable the script.

## Usage
1. Open a Google Docs document.
2. A floating button will appear in the bottom-right corner of the page.
3. Click the button to toggle strikethrough formatting on the selected text or active element.

## Notes
- The button is styled to match Google's design language, with a blue background and white icon.
- If the Google Docs editing iframe is not immediately available, the script will retry until it is ready.
