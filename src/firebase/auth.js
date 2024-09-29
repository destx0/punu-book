import { auth } from "./config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, signOut } from "firebase/auth";
import { createUserDocument } from "./firestore";

const saveUserToLocalStorage = (user) => {
  localStorage.setItem('user', JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }));
};

export const getUserFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const signUpWithEmailAndPassword = async (email, password) => {
  try {
    console.log("Attempting to sign up with email and password...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Sign-up successful:", userCredential.user);
    
    // Create user document in Firestore
    await createUserDocument(userCredential.user.uid, email);
    console.log("User document created in Firestore");
    
    saveUserToLocalStorage(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

export const signInWithEmailAndPassword = async (email, password) => {
  try {
    console.log("Attempting to sign in with email and password...");
    const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
    console.log("Sign-in successful:", userCredential.user);
    saveUserToLocalStorage(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return getUserFromLocalStorage() || auth.currentUser;
};