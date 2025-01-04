// Track the creation of the offscreen document
let offscreenDocumentCreation = null;

/**
 * Creates and manages an offscreen document for clipboard operations
 * @param {string} textToCopy - The text to be copied to clipboard
 */
async function setupOffscreenDocument(textToCopy) {
  // Create offscreen document if it doesn't exist
  if (!(await chrome.offscreen.hasDocument())) {
    offscreenDocumentCreation = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Write URLs to clipboard'
    });
    await offscreenDocumentCreation;
  }
  
  // Send the text to be copied to the offscreen document
  await chrome.runtime.sendMessage({
    type: 'copy-to-clipboard',
    text: textToCopy
  });
}

/**
 * Updates the extension icon
 * @param {boolean} isSuccess - Whether to show success state
 */
async function updateIcon(isSuccess) {
  try {
    const iconState = isSuccess ? '-success' : '';
    await chrome.action.setIcon({
      path: {
        "16": `icon16${iconState}.png`,
        "48": `icon48${iconState}.png`,
        "128": `icon128${iconState}.png`
      }
    });
  } catch (error) {
    console.error('Error updating icon:', error);
  }
}

// Handle messages from the offscreen document
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'copy-success') {
    // Show success icon briefly
    updateIcon(true).then(() => {
      setTimeout(() => updateIcon(false), 1000);
    });
  }
  sendResponse({}); // Always respond to keep message channel open
  return true;      // Required for async response
});

// Handle extension icon clicks
chrome.action.onClicked.addListener(async () => {
  try {
    // Get all tabs in current window
    const currentTabs = await chrome.tabs.query({ currentWindow: true });
    const tabUrls = currentTabs.map(tab => tab.url).join('\n');
    
    // Copy URLs to clipboard via offscreen document
    await setupOffscreenDocument(tabUrls);
    
    // Clean up offscreen document after delay
    setTimeout(async () => {
      if (await chrome.offscreen.hasDocument()) {
        await chrome.offscreen.closeDocument();
      }
    }, 2000);
  } catch (error) {
    console.error('Error copying tabs:', error);
  }
});
