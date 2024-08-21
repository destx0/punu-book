console.log("Background script loaded");

if (typeof chrome !== "undefined" && chrome.action) {
	// Chrome - Manifest V3
	chrome.action.onClicked.addListener((tab) => {
		console.log("Extension icon clicked!");
		console.log("Current tab URL:", tab.url);
		// Perform your task here
	});
} else if (typeof browser !== "undefined" && browser.browserAction) {
	// Firefox - Manifest V2
	browser.browserAction.onClicked.addListener((tab) => {
		console.log("Extension icon clicked!");
		console.log("Current tab URL:", tab.url);
		// Perform your task here
	});
} else {
	console.error("Unsupported browser or incorrect extension configuration");
}
