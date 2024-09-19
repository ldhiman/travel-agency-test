"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Square3Stack3DIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

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
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="bg-white shadow-md mb-5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-baseline space-x-0">
            <span className="text-2xl font-bold  text-custom-pink">Travel</span>
            <span className="text-2xl font-bold  text-custom-pink">India</span>
            <span className="text-sm font-semibold  text-customPink">
              .tours
            </span>
          </Link>
          <nav className="flex items-center space-x-6">
            <NavLink
              href="/apps"
              icon={<Square3Stack3DIcon className="w-6 h-6" />}
              text="Apps"
            />
            {user ? (
              <>
                <NavLink
                  href="/profile"
                  icon={<UserCircleIcon className="w-6 h-6" />}
                  text="Profile"
                />
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                  <span className="text-xs mt-1">Sign Out</span>
                </button>
              </>
            ) : (
              <NavLink
                href="/login"
                icon={<ArrowLeftOnRectangleIcon className="w-6 h-6" />}
                text="Sign In"
              />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, text }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
    >
      {icon}
      <span className="text-xs mt-1">{text}</span>
    </Link>
  );
}
