import React, { useState, useEffect } from "react";
import PlaylistManager from "./PlaylistManager";
import {
	signUpWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOutUser,
	getCurrentUser,
} from "../firebase/auth";
import { createUserDocument } from "../firebase/firestore";

export default function Popup() {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);

	useEffect(() => {
		const currentUser = getCurrentUser();
		setUser(currentUser);
	}, []);

	const handleAuth = async (e) => {
		e.preventDefault();
		try {
			setError(null);
			let authenticatedUser;
			if (isSignUp) {
				authenticatedUser = await signUpWithEmailAndPassword(
					email,
					password
				);
			} else {
				authenticatedUser = await signInWithEmailAndPassword(
					email,
					password
				);
				// Check if user document exists and create if it doesn't
				await createUserDocument(authenticatedUser.uid, authenticatedUser.email);
			}
			console.log("User authenticated:", authenticatedUser);
			setUser(authenticatedUser);
			setEmail("");
			setPassword("");
		} catch (error) {
			console.error("Error authenticating:", error);
			setError(error.message);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOutUser();
			setUser(null);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<div className="p-4 min-w-[300px]">
			<h1 className="text-2xl font-bold mb-4">Punu Book</h1>
			{user ? (
				<>
					<div className="flex justify-between items-center mb-4">
						<p>Welcome, {user.email}!</p>
						<button
							className="bg-red-500 text-white px-4 py-2 rounded"
							onClick={handleSignOut}
						>
							Sign Out
						</button>
					</div>
					<PlaylistManager />
				</>
			) : (
				<>
					<form onSubmit={handleAuth} className="mb-4">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							className="w-full p-2 mb-2 border rounded"
							required
						/>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							className="w-full p-2 mb-2 border rounded"
							required
						/>
						<button
							type="submit"
							className="bg-blue-500 text-white px-4 py-2 rounded w-full"
						>
							{isSignUp ? "Sign Up" : "Sign In"}
						</button>
					</form>
					<button
						onClick={() => setIsSignUp(!isSignUp)}
						className="text-blue-500 underline"
					>
						{isSignUp
							? "Already have an account? Sign In"
							: "Need an account? Sign Up"}
					</button>
					{error && <p className="text-red-500 mt-2">{error}</p>}
				</>
			)}
		</div>
	);
}
