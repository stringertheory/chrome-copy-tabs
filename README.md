# Tab URL Copier - Chrome Extension

A simple Chrome extension that copies all URLs from your current
window's tabs to the clipboard with a single click. When clicked, the
extension's icon briefly turns to a green checkmark to confirm
successful copying.

## How it works
The extension uses Chrome's Manifest V3 with an offscreen document to
handle clipboard operations. When you click the extension icon, it
gathers URLs from all tabs in your current window, copies them to your
clipboard (one URL per line), and shows a quick visual
confirmation. This makes it easy to share multiple tabs, save them for
later, or use them in any other application.

## Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar - click it to copy tab URLs!
