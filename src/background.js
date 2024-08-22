import { scrapeQuestionAndOptions } from "./scraper.js";
import { addQuizToPlaylist, createPlaylist } from "./firebase/firestore.js";

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

			// Get or create playlist
			let playlistId;
			try {
				// You might want to implement a way for users to select an existing playlist
				// or create a new one. For now, we'll create a new playlist for each quiz.
				playlistId = await createPlaylist(
					"New Playlist " + new Date().toISOString()
				);
			} catch (playlistError) {
				console.error("Error creating playlist:", playlistError);
				alert("Error creating playlist: " + playlistError.message);
				return;
			}

			// Upload to Firestore
			try {
				const quizId = await addQuizToPlaylist(
					playlistId,
					result.result.parsedContent
				);
				console.log("Quiz uploaded to Firestore. Quiz ID:", quizId);
				alert(
					"Quiz scraped and uploaded to Firestore successfully!\n" +
						"Playlist ID: " +
						playlistId +
						"\n" +
						"Quiz ID: " +
						quizId
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
