import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAuaI2onubg7w6vP7A0eddXTaqgZOK_LYw",
	authDomain: "punu-book.firebaseapp.com",
	projectId: "punu-book",
	storageBucket: "punu-book.appspot.com",
	messagingSenderId: "1028742049263",
	appId: "1:1028742049263:web:c1dfd042bc5ba70ef65a1a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function uploadToFirestore(data) {
	try {
		const docRef = await addDoc(collection(db, "scraped_data"), data);
		console.log("Document written with ID: ", docRef.id);
		return docRef.id;
	} catch (e) {
		console.error("Error adding document: ", e);
		throw e;
	}
}
