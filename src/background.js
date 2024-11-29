chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "rem_map") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
						if (document.body.contains(document.getElementById('dom-minimap-container'))) {
							document.getElementById('dom-minimap-container').remove();
							document.getElementById('languette').remove();
						}
          },
        });
      }
    });
  }
  else if (message.action === "add_map") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
						if (!document.body.contains(document.getElementById('dom-minimap-container'))) {
							init();
						}
          },
        });
      }
    });
  }
});
