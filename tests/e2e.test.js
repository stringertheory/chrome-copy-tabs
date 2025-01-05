const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

describe('Tab URL Copier Extension', () => {
  let browser;
  let extensionPage;
  let extensionId;

  // Create a test HTML file
  const TEST_HTML = `
    <!DOCTYPE html>
    <html>
      <head><title>Test Page</title></head>
      <body><div id="content">Test Page for Extension</div></body>
    </html>
  `;

  // Helper function to wait for service worker
  async function getExtensionId() {
    const targets = await browser.targets();
    const target = targets.find((t) => 
      t.type() === 'service_worker' && 
      t.url().includes('chrome-extension://')
    );
    if (!target) {
      throw new Error('Could not find extension service worker');
    }
    const url = target.url();
    const matches = url.match(/chrome-extension:\/\/([^/]+)/);
    return matches[1];
  }

  // Helper function to trigger extension and wait for copy success
  async function triggerExtensionAndWaitForSuccess() {
    const targets = await browser.targets();
    const serviceWorkerTarget = targets.find(
      target => target.type() === 'service_worker' && target.url().includes(extensionId)
    );
    
    if (!serviceWorkerTarget) {
      throw new Error('Could not find extension service worker');
    }

    const worker = await serviceWorkerTarget.worker();
    
    // Set up listener for copy success message before triggering action
    const copySuccessPromise = new Promise((resolve) => {
      worker.evaluate(() => {
        return new Promise((resolve) => {
          chrome.runtime.onMessage.addListener(function listener(message) {
            if (message.type === 'copy-success') {
              chrome.runtime.onMessage.removeListener(listener);
              resolve(true);
            }
          });
        });
      }).then(resolve);
    });

    // Trigger the extension action
    await worker.evaluate(() => {
      chrome.action.onClicked.dispatch({});
    });

    // Wait for success message with timeout
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout waiting for copy success')), 5000)
    );

    return Promise.race([copySuccessPromise, timeout]);
  }

  beforeAll(async () => {
    // Write test HTML file
    fs.writeFileSync(path.join(process.cwd(), 'test.html'), TEST_HTML);

    // Check if required extension files exist
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'offscreen.html',
      'offscreen.js',
      'icon16.png',
      'icon48.png',
      'icon128.png',
      'icon16-success.png',
      'icon48-success.png',
      'icon128-success.png'
    ];

    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );

    if (missingFiles.length > 0) {
      throw new Error(`Missing required extension files: ${missingFiles.join(', ')}`);
    }

    // Launch browser with extension
    const pathToExtension = path.join(process.cwd());
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--enable-features=NetworkService'
      ]
    });

    // Wait for extension to load and get its ID
    await new Promise(r => setTimeout(r, 2000));
    extensionId = await getExtensionId();
  }, 30000);

  afterAll(async () => {
    try {
      // Close all pages first
      const pages = await browser.pages();
      await Promise.all(pages.map(page => page.close().catch(() => {})));
      
      // Disconnect from Chrome DevTools Protocol
      if (browser && browser.disconnect) {
        browser.disconnect();
      }
      
      // Close browser
      if (browser) {
        await browser.close();
      }
      
      // Clean up test file
      try {
        fs.unlinkSync(path.join(process.cwd(), 'test.html'));
      } catch (error) {
        console.error('Failed to clean up test file:', error);
      }
    } catch (error) {
      console.error('Error in afterAll cleanup:', error);
    }
  });

  beforeEach(async () => {
    extensionPage = await browser.newPage();
    await extensionPage.goto(`file://${path.join(process.cwd(), 'test.html')}`);
  });

  afterEach(async () => {
    if (extensionPage) {
      await extensionPage.close().catch(() => {});
    }
  });

  test('extension should copy URLs from all tabs', async () => {
    const urls = [
      'https://example.com',
      'https://example.org',
      'https://example.net'
    ];

    const pages = [];
    try {
      // Create tabs and navigate to URLs
      for (const url of urls) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        pages.push(page);
      }

      // Trigger extension and wait for success
      const success = await triggerExtensionAndWaitForSuccess();
      expect(success).toBe(true);

    } finally {
      // Clean up tabs
      await Promise.all(pages.map(page => page.close().catch(() => {})));
    }
  }, 30000);

  test('extension should handle empty tab list', async () => {
    try {
      // Close all other tabs
      const pages = await browser.pages();
      await Promise.all(
        pages
          .filter(page => page !== extensionPage)
          .map(page => page.close().catch(() => {}))
      );

      // Trigger extension and wait for success
      const success = await triggerExtensionAndWaitForSuccess();
      expect(success).toBe(true);
    } catch (error) {
      throw error;
    }
  }, 20000);

  test('extension should handle special characters in URLs', async () => {
    const specialUrl = 'https://example.com/?q=test&param=value#fragment';
    let testPage;
    
    try {
      testPage = await browser.newPage();
      await testPage.goto(specialUrl, { waitUntil: 'networkidle0' });

      // Trigger extension and wait for success
      const success = await triggerExtensionAndWaitForSuccess();
      expect(success).toBe(true);
    } finally {
      if (testPage) {
        await testPage.close().catch(() => {});
      }
    }
  }, 20000);
});
