// lib/auth.js
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

/**
 * Google Login
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create or update user in Firestore
    await createOrUpdateUserDocument(user);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
};


/**
 * Email Login
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || "",
        photoURL: result.user.photoURL || "",
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};


/**
 * Email Signup
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await createOrUpdateUserDocument(user, { displayName });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};


/**
 * Logout
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error: error.message };
  }
};


/**
 * Firestore Create/Update User
 */
export const createOrUpdateUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;

      await setDoc(userRef, {
        email,
        displayName: displayName || additionalData.displayName || "",
        photoURL: photoURL || "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        ...additionalData,
      });
    } else {
      await setDoc(
        userRef,
        { lastLogin: serverTimestamp() },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
  }
};


/**
 * Fetch Firestore User Data
 */
export const getUserData = async (uid) => {
  try {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return { success: true, data: snapshot.data() };
    }
    return { success: false, error: "User not found" };

  } catch (error) {
    return { success: false, error: error.message };
  }
};


/**
 * Firebase Auth Observer
 */
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};


/**
 * Friendly Error Messages
 */
const getErrorMessage = (errorCode) => {
  const errors = {
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account matches this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "Email already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/popup-closed-by-user": "Popup closed before sign-in.",
  };

  return errors[errorCode] || "Something went wrong.";
};
