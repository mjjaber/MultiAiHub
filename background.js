chrome.action.onClicked.addListener((tab) => {
  // Open the side panel
  chrome.sidePanel.open({
    windowId: tab.windowId
  });
});

// First, remove all existing rules
chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: Array.from({length: 100}, (_, i) => i + 1) // Remove rules 1-100
});

// Then add new rule only for frame headers
chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    id: 1,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'X-Frame-Options',
          operation: 'remove'
        },
        {
          header: 'Frame-Options',
          operation: 'remove'
        },
        {
          header: 'Content-Security-Policy',
          operation: 'remove'
        }
      ]
    },
    condition: {
      urlFilter: '*',
      resourceTypes: ['sub_frame']
    }
  }]
}); 