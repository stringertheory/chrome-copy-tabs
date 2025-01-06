# Copy Tab URLs - Chrome Extension

A simple Chrome extension that copies all URLs from your current
window's tabs to the clipboard, one URL per line.

I made this because all I found on an initial search was extensions
to copy all tabs, not just the current window, and I wanted to
experiment with using LLM's to help write a type of program
I'm not very familiar with (a Chrome extension). Since, I found
other more feature-complete extensions that do let you copy the
current window's tabs. [Tab Copy](https://tabcopy.com/),
[github](https://github.com/hansifer/tab-copy) looks good to me
so far. If you're reading this, you might be better off with that :)

## How to use
1. Pin the extension so the icon shows up in the extension toolbar
2. Click the button. The tabs are now copied to your clipboard.
3. Paste wherever you want.
   
## Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar. Click the button to
   copy tab URLs.

## Developing / Testing
Set up with `npm install`. Run tests with `npm test`.

## Thoughts on ways to improve maybe in the future
- Improve the icon
- Maybe it would be useful to be able to configure to add e.g. a '-' at
  the beginning of each url, to make easier copy-paste into markdown?
- Similarly, copy with markdown formatting using the title as the link
  anchor text?
  e.g. [Example Domain](https://example.com) (`[Example Domain](https://example.com)`)
- Option to copy from more than one window?
- Publish on the Chrome Web Store?
