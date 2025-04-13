| Install | Script Name | Purpose |
| ----- | ----- | ----- |
| <a href="https://www.tampermonkey.net/script_installation.php#https://github.com/vksepm/google-docs-strikethrough-button/raw/main/GoogleDocsStrikethroughBubbleButton.js"><img src="https://user-images.githubusercontent.com/88981/169986095-a54f32bd-55a6-4de8-bad6-aa3b1874ce07.png" width="32"/></a> | Google Docs Strikethrough Bubble Button | This script adds a floating button to Google Docs that allows users to toggle strikethrough formatting (Alt+Shift+5) with a single click. |

## Features
- Adds a floating, draggable toolbar to Google Docs for text formatting.
- Includes buttons for Bold, Italic, Underline, and Strikethrough.
- Uses SVG icons for visually appealing buttons.
- Simulates keyboard shortcuts for formatting actions.
- Automatically detects the Google Docs editing iframe and targets the active element.

## Installation
1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/).
2. Copy the script from `GoogleDocsStrikethroughBubbleButton.js`.
3. Create a new userscript in your userscript manager and paste the script.
4. Save and enable the script.

## Usage
1. Open a Google Docs document.
2. A floating toolbar will appear in the bottom-right corner of the page.
3. Use the buttons to apply Bold, Italic, Underline, or Strikethrough formatting to the selected text or active element.
4. Drag the toolbar to reposition it anywhere on the screen.

## Notes
- The toolbar is styled to match Google's design language, with a blue background and white icons.
- If the Google Docs editing iframe is not immediately available, the script will retry until it is ready.
- The script includes error handling to log messages if the iframe cannot be found after multiple retries.
