// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAuaI2onubg7w6vP7A0eddXTaqgZOK_LYw",
	authDomain: "punu-book.firebaseapp.com",
	projectId: "punu-book",
	storageBucket: "punu-book.appspot.com",
	messagingSenderId: "1028742049263",
	appId: "1:1028742049263:web:39f572f81c10eb90f65a1a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
