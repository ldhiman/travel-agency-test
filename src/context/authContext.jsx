'use client'

// authContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {auth} from "../app/firebase" // Adjust the import path as needed

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      console.log("this is the user uid", user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
