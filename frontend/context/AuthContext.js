// context/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  getUserData,
} from '../lib/auth';

/* --------------------------------------------------
   Context Creation
-------------------------------------------------- */
const AuthContext = createContext(null);

/* --------------------------------------------------
   Hook
-------------------------------------------------- */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/* --------------------------------------------------
   Provider
-------------------------------------------------- */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------
     Firebase Auth Listener
  -------------------------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* --------------------------------------------------
     Update Profile (Display Name + Photo)
  -------------------------------------------------- */
  const updateUserProfile = async ({ displayName, photoURL }) => {
    if (!auth.currentUser) return;

    await updateProfile(auth.currentUser, {
      displayName,
      photoURL,
    });

    // Update local state so UI updates instantly
    setUser((prev) => ({
      ...prev,
      displayName,
      photoURL,
    }));
  };

  /* --------------------------------------------------
     Context Value
  -------------------------------------------------- */
  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
    getUserData,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
