chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "rem_map") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
						desinit();
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
						init();
          },
        });
      }
    });
  }
});
