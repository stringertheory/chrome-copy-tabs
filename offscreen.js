// Listen for copy requests from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'copy-to-clipboard') {
    copyToClipboard(message.text).then(() => sendResponse({}));
    return true; // Keep message channel open for async response
  }
});

/**
 * Attempts to copy text to clipboard using modern API with fallback
 * @param {string} text - The text to copy
 */
async function copyToClipboard(text) {
  try {
    // Try modern clipboard API first
    try {
      await navigator.clipboard.writeText(text);
      chrome.runtime.sendMessage({ type: 'copy-success' });
    } catch (clipboardError) {
      // Fallback to execCommand for older browsers
      const textarea = document.createElement('textarea');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        chrome.runtime.sendMessage({ type: 'copy-success' });
      } else {
        throw new Error('Clipboard copy failed');
      }
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    chrome.runtime.sendMessage({ 
      type: 'copy-error', 
      error: error.message 
    });
  }
}
