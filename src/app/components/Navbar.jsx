"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast("Sign Out!!");
      router.push("/login"); // Redirect to login page after sign-out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex content justify-evenly flex-wrap p-5 flex-col md:flex-row items-center">
        <Link
          href="/"
          className="flex font-ubantu font-bold items-center text-customPink mb-4 md:mb-0"
        >
          <span className="ml-3 text-xl">TravelIndia</span>
          <span className="text-medium">.tours</span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <Link href="/apps" className="mr-5 hover:text-customPink">
            Apps
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="mr-5 hover:text-customPink"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/login" className="mr-5 hover:text-customPink">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
