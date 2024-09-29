import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import {
	createPlaylist,
	addQuizToPlaylist,
	getPlaylistNames,
	updatePlaylistName,
	deletePlaylist,
} from "../firebase/firestore";
import { scrapeQuestionAndOptions } from "../scraper";
import { getCurrentUser } from "../firebase/auth";
import { createUserDocument } from "../firebase/firestore";

export default function PlaylistManager() {
	const user = getCurrentUser();
	const [playlists, setPlaylists] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		console.log("Current user in PlaylistManager:", user);
		if (user) {
			loadPlaylists();
		}
	}, [user]);

	const loadPlaylists = async () => {
		if (user && user.uid) {
			try {
				console.log("Loading playlists for user:", user.uid);
				const playlistNames = await getPlaylistNames(user.uid);
				console.log("Playlists loaded:", playlistNames);
				setPlaylists(playlistNames);
			} catch (error) {
				console.error("Error loading playlists:", error);
				setError(`Failed to load playlists. Error: ${error.message}`);
			}
		} else {
			console.log("No user found, cannot load playlists");
		}
	};

	const addPlaylist = async () => {
		if (inputValue.trim() !== "" && user && user.uid) {
			try {
				setError(null);
				console.log(
					"Adding playlist:",
					inputValue,
					"for user:",
					user.uid
				);

				// Check if user document exists and create if it doesn't
				await createUserDocument(user.uid, user.email);

				const playlistId = await createPlaylist(user.uid, inputValue);
				console.log("Playlist added successfully, ID:", playlistId);
				setPlaylists([
					...playlists,
					{ id: playlistId, name: inputValue },
				]);
				setInputValue("");
			} catch (error) {
				console.error("Error adding playlist:", error);
				setError(`Failed to add playlist. Error: ${error.message}`);
			}
		} else {
			console.log("Cannot add playlist: empty input or no user");
			setError(
				"Please enter a playlist name and ensure you're logged in."
			);
		}
	};

	const startEditing = (id, name) => {
		setEditingId(id);
		setInputValue(name);
	};

	const saveEdit = async () => {
		if (inputValue.trim() !== "" && editingId && user && user.uid) {
			await updatePlaylistName(user.uid, editingId, inputValue);
			setPlaylists(
				playlists.map((playlist) =>
					playlist.id === editingId
						? { ...playlist, name: inputValue }
						: playlist
				)
			);
			setEditingId(null);
			setInputValue("");
		}
	};

	const handleDeletePlaylist = async (id) => {
		try {
			if (user && user.uid) {
				await deletePlaylist(user.uid, id);
				setPlaylists(
					playlists.filter((playlist) => playlist.id !== id)
				);
				alert("Playlist deleted successfully!");
			}
		} catch (error) {
			console.error("Error deleting playlist:", error);
			alert("Error deleting playlist: " + error.message);
		}
	};

	const addScrapedDataToPlaylist = async (playlistId) => {
		try {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});
			const [result] = await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: scrapeQuestionAndOptions,
			});

			if (result.result.error) {
				console.error("Error during scraping:", result.result.error);
				alert("Error during scraping: " + result.result.error);
			} else if (user && user.uid) {
				const quizId = await addQuizToPlaylist(
					user.uid,
					playlistId,
					result.result.parsedContent
				);
				console.log("Quiz added to playlist. Quiz ID:", quizId);
				alert("Quiz added to playlist successfully!");
			}
		} catch (error) {
			console.error("Error adding scraped data to playlist:", error);
			alert("Error adding scraped data to playlist: " + error.message);
		}
	};

	return (
		<div>
			{user ? (
				<>
					<div className="flex mb-4">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="flex-grow px-2 py-1 border rounded-l"
							placeholder={
								editingId
									? "Edit playlist name"
									: "Enter playlist name"
							}
						/>
						<button
							onClick={editingId ? saveEdit : addPlaylist}
							className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
						>
							{editingId ? "Save" : "Add Playlist"}
						</button>
					</div>
					{error && <p className="text-red-500 mb-2">{error}</p>}
					<div>
						{playlists.map((playlist) => (
							<div
								key={playlist.id}
								className="flex items-center mb-2 bg-white rounded shadow p-2"
							>
								<span className="flex-grow">
									{playlist.name}
								</span>
								<button
									onClick={() =>
										addScrapedDataToPlaylist(playlist.id)
									}
									className="p-1 mr-1 text-gray-600 hover:text-blue-600"
									title="Add scraped data to playlist"
								>
									<PlusCircle size={16} />
								</button>
								<button
									onClick={() =>
										startEditing(playlist.id, playlist.name)
									}
									className="p-1 mr-1 text-gray-600 hover:text-green-600"
								>
									<Edit2 size={16} />
								</button>
								<button
									onClick={() =>
										handleDeletePlaylist(playlist.id)
									}
									className="p-1 text-gray-600 hover:text-red-600"
								>
									<Trash2 size={16} />
								</button>
							</div>
						))}
					</div>
				</>
			) : (
				<p>Please log in to manage playlists.</p>
			)}
		</div>
	);
}
