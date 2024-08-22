// src/pages/Popup.jsx

import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import {
	createPlaylist,
	addQuizToPlaylist,
	getPlaylistNames,
	updatePlaylistName,
} from "../firebase/firestore";
import { scrapeQuestionAndOptions } from "../scraper";

export default function Popup() {
	const [playlists, setPlaylists] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		loadPlaylists();
	}, []);

	const loadPlaylists = async () => {
		const playlistNames = await getPlaylistNames();
		setPlaylists(playlistNames);
	};

	const addPlaylist = async () => {
		if (inputValue.trim() !== "") {
			const playlistId = await createPlaylist(inputValue);
			setPlaylists([...playlists, { id: playlistId, name: inputValue }]);
			setInputValue("");
		}
	};

	const startEditing = (id, name) => {
		setEditingId(id);
		setInputValue(name);
	};

	const saveEdit = async () => {
		if (inputValue.trim() !== "" && editingId) {
			await updatePlaylistName(editingId, inputValue);
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

	const deletePlaylist = async (id) => {
		// Implement delete functionality
		// You might want to add a function in firestore.js to delete a playlist
		setPlaylists(playlists.filter((playlist) => playlist.id !== id));
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
			} else {
				const quizId = await addQuizToPlaylist(
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
		<div className="p-4 min-w-[300px]">
			<h1 className="text-2xl font-bold mb-4">Playlist Manager</h1>
			<div className="flex mb-4">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="flex-grow px-2 py-1 border rounded-l"
					placeholder={
						editingId ? "Edit playlist name" : "Enter playlist name"
					}
				/>
				<button
					onClick={editingId ? saveEdit : addPlaylist}
					className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
				>
					{editingId ? "Save" : "Add Playlist"}
				</button>
			</div>
			<div>
				{playlists.map((playlist) => (
					<div
						key={playlist.id}
						className="flex items-center mb-2 bg-white rounded shadow p-2"
					>
						<span className="flex-grow">{playlist.name}</span>
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
							onClick={() => deletePlaylist(playlist.id)}
							className="p-1 text-gray-600 hover:text-red-600"
						>
							<Trash2 size={16} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
