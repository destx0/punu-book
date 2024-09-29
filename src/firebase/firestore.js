import { db } from "./config";
import {
	collection,
	doc,
	setDoc,
	getDoc,
	updateDoc,
	arrayUnion,
	arrayRemove,
	deleteField,
	addDoc,
} from "firebase/firestore";

export async function createUserDocument(userId, email) {
	try {
		console.log("Attempting to create user document for ID:", userId);
		const userRef = doc(db, "users", userId);
		const userDoc = await getDoc(userRef);
		
		if (userDoc.exists()) {
			console.log("User document already exists, skipping creation");
			return;
		}
		
		await setDoc(userRef, {
			email,
			playlists: {},
		});
		console.log("User document created successfully for ID:", userId);
	} catch (e) {
		console.error("Error creating user document: ", e);
		throw e;
	}
}

export async function createPlaylist(userId, name) {
	try {
		console.log(`Attempting to create playlist "${name}" for user:`, userId);
		const userRef = doc(db, "users", userId);
		const userDoc = await getDoc(userRef);

		console.log("User document exists:", userDoc.exists());
		if (!userDoc.exists()) {
			console.error("User document does not exist");
			throw new Error("User document does not exist");
		}

		const playlistId = Date.now().toString(); // Simple unique ID generation
		console.log("Generated playlist ID:", playlistId);

		const updateData = {
			[`playlists.${playlistId}`]: { name, quizIds: [] },
		};
		console.log("Update data:", updateData);

		await updateDoc(userRef, updateData);
		console.log("Playlist created successfully with ID:", playlistId);
		return playlistId;
	} catch (e) {
		console.error("Error creating playlist: ", e);
		throw e;
	}
}

export async function addQuizToPlaylist(userId, playlistId, quizData) {
	try {
		const quizzesRef = collection(db, "quizzes");
		const quizDocRef = await addDoc(quizzesRef, quizData);
		const quizId = quizDocRef.id;

		const userRef = doc(db, "users", userId);
		await updateDoc(userRef, {
			[`playlists.${playlistId}.quizIds`]: arrayUnion(quizId),
		});
		console.log("Quiz added to playlist");
		return quizId;
	} catch (e) {
		console.error("Error adding quiz to playlist: ", e);
		throw e;
	}
}

export async function getPlaylistNames(userId) {
	try {
		console.log("Attempting to get playlists for user:", userId);
		const userDoc = await getDoc(doc(db, "users", userId));
		console.log("User document retrieved:", userDoc.exists());
		if (!userDoc.exists()) {
			console.log("User document does not exist");
			return [];
		}
		const userData = userDoc.data();
		console.log("User data:", userData);
		const playlists = userData.playlists || {};
		console.log("Playlists:", playlists);
		const playlistArray = Object.entries(playlists).map(([id, playlist]) => ({
			id,
			name: playlist.name,
		}));
		console.log("Playlist array:", playlistArray);
		return playlistArray;
	} catch (e) {
		console.error("Error getting playlist names: ", e);
		throw e;
	}
}

export async function updatePlaylistName(userId, playlistId, newName) {
	try {
		const userRef = doc(db, "users", userId);
		await updateDoc(userRef, {
			[`playlists.${playlistId}.name`]: newName,
		});
		console.log("Playlist name updated");
	} catch (e) {
		console.error("Error updating playlist name: ", e);
		throw e;
	}
}

export async function getQuizzesForPlaylist(userId, playlistId) {
	try {
		const userDoc = await getDoc(doc(db, "users", userId));
		const playlist = userDoc.data().playlists[playlistId];
		if (!playlist) return [];

		const quizPromises = playlist.quizIds.map(quizId => 
			getDoc(doc(db, "quizzes", quizId))
		);
		const quizDocs = await Promise.all(quizPromises);
		return quizDocs.map(doc => ({ id: doc.id, ...doc.data() }));
	} catch (e) {
		console.error("Error getting quizzes for playlist: ", e);
		throw e;
	}
}

export async function deletePlaylist(userId, playlistId) {
	try {
		const userRef = doc(db, "users", userId);
		await updateDoc(userRef, {
			[`playlists.${playlistId}`]: deleteField(),
		});
		console.log("Playlist deleted");
	} catch (e) {
		console.error("Error deleting playlist: ", e);
		throw e;
	}
}
