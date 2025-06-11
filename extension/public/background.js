let autoScanEnabled = false;
let authToken = null;
let intervalIdMap = {}; // Map of tabId to interval IDs

// On extension install, set default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    token: null,
    username: null,
    autoScanEnabled: false,
  });
});

// Fetch current stored values
chrome.storage.local.get(["autoScanEnabled", "token"], (result) => {
  autoScanEnabled = result.autoScanEnabled || false;
  authToken = result.token || null;
});

// Listen to storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoScanEnabled) autoScanEnabled = changes.autoScanEnabled.newValue;
  if (changes.token) authToken = changes.token.newValue;
});

// Core scan function
async function checkUrl(url, tabId) {
  if (!authToken || !url) return;

  try {
    const res = await fetch("http://localhost:5000/api/v1/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken,
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    chrome.storage.local.set({ lastScan: data });

    if (data.is_blocked) {
      chrome.tabs.update(tabId, { url: "https://www.google.com" });
    }
  } catch (err) {
    console.error("Scan error:", err.message);
    clearInterval(intervalIdMap[tabId]);
    delete intervalIdMap[tabId];

    chrome.storage.local.set({
      autoScanEnabled: false,
      lastScan: { error: "Auto scan stopped due to server error." },
    });
  }
}

// Start periodic scanning
function startAutoScan(tabId, url) {
  if (intervalIdMap[tabId]) return; // already scanning

  checkUrl(url, tabId); // immediate scan
  intervalIdMap[tabId] = setInterval(() => checkUrl(url, tabId), 5000);
}

// Stop scanning for a tab
function stopAutoScan(tabId) {
  if (intervalIdMap[tabId]) {
    clearInterval(intervalIdMap[tabId]);
    delete intervalIdMap[tabId];
  }
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (!autoScanEnabled) return;

  chrome.tabs.get(tabId, (tab) => {
    if (tab.url?.startsWith("http")) {
      startAutoScan(tabId, tab.url);
    }
  });
});

// Listen for tab updates (e.g., reload, redirect, navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!autoScanEnabled || !tab.url?.startsWith("http")) return;

  if (changeInfo.status === "complete") {
    stopAutoScan(tabId); // in case there's a duplicate
    startAutoScan(tabId, tab.url);
  }
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  stopAutoScan(tabId);
});
