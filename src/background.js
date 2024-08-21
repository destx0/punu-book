import { scrapeQuestionAndOptions } from "./scraper.js";
import { uploadToFirestore } from "./firebase-utils.js";

console.log("Background script loaded");

async function handleIconClick(tab) {
	console.log("Extension icon clicked!");
	console.log("Current tab URL:", tab.url);

	try {
		const [result] = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: scrapeQuestionAndOptions,
		});

		if (result.result.error) {
			console.error("Error during scraping:", result.result.error);
			alert("Error during scraping: " + result.result.error);
		} else {
			console.log("Scraped data:", result.result.parsedContent);

			// Upload to Firestore
			try {
				const docId = await uploadToFirestore(
					result.result.parsedContent
				);
				console.log("Data uploaded to Firestore. Document ID:", docId);
				alert(
					"Data scraped and uploaded to Firestore successfully! Document ID: " +
						docId
				);
			} catch (uploadError) {
				console.error("Error uploading to Firestore:", uploadError);
				alert("Error uploading to Firestore: " + uploadError.message);
			}
		}
	} catch (error) {
		console.error("Error executing script:", error);
		alert("Error executing script: " + error.message);
	}
}

if (typeof chrome !== "undefined" && chrome.action) {
	// Chrome - Manifest V3
	chrome.action.onClicked.addListener(handleIconClick);
} else if (typeof browser !== "undefined" && browser.browserAction) {
	// Firefox - Manifest V2
	browser.browserAction.onClicked.addListener(handleIconClick);
} else {
	console.error("Unsupported browser or incorrect extension configuration");
}
