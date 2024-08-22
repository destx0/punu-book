// src/firebase/firestore.js

import { db } from "./config";
import {
	collection,
	addDoc,
	doc,
	setDoc,
	getDoc,
	getDocs,
	updateDoc,
	arrayUnion,
} from "firebase/firestore";

export async function createPlaylist(name) {
	try {
		const docRef = await addDoc(collection(db, "playlists"), { name });
		await setDoc(doc(db, "questionlists", docRef.id), { quizIds: [] });
		console.log("Playlist created with ID: ", docRef.id);
		return docRef.id;
	} catch (e) {
		console.error("Error creating playlist: ", e);
		throw e;
	}
}

export async function addQuizToPlaylist(playlistId, quizData) {
	try {
		const quizRef = await addDoc(collection(db, "quizzes"), quizData);
		await updateDoc(doc(db, "questionlists", playlistId), {
			quizIds: arrayUnion(quizRef.id),
		});
		console.log("Quiz added to playlist");
		return quizRef.id;
	} catch (e) {
		console.error("Error adding quiz to playlist: ", e);
		throw e;
	}
}

export async function getPlaylistNames() {
	try {
		const snapshot = await getDocs(collection(db, "playlists"));
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			name: doc.data().name,
		}));
	} catch (e) {
		console.error("Error getting playlist names: ", e);
		throw e;
	}
}

export async function updatePlaylistName(playlistId, newName) {
	try {
		await updateDoc(doc(db, "playlists", playlistId), { name: newName });
		console.log("Playlist name updated");
	} catch (e) {
		console.error("Error updating playlist name: ", e);
		throw e;
	}
}

export async function getQuizzesForPlaylist(playlistId) {
	try {
		const questionlistDoc = await getDoc(
			doc(db, "questionlists", playlistId)
		);
		const quizIds = questionlistDoc.data().quizIds || [];

		const quizzes = await Promise.all(
			quizIds.map(async (quizId) => {
				const quizDoc = await getDoc(doc(db, "quizzes", quizId));
				return { id: quizId, ...quizDoc.data() };
			})
		);

		return quizzes;
	} catch (e) {
		console.error("Error getting quizzes for playlist: ", e);
		throw e;
	}
}
