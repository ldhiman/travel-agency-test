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
  Bars3Icon,
  XMarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-pink-50 to-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-baseline gap-0.5 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
                Travel
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
                India
              </span>
              <span className="text-xs font-semibold text-pink-400 self-start mt-1">
                .tours
              </span>
            </Link>

            {/* WhatsApp Button */}
            <Link
              href="https://wa.me/9266332196?text=Hi%20Travel%20India"
              legacyBehavior
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-base font-semibold px-4 py-2 rounded-full transition-colors duration-200 shadow-lg"
              >
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                <span>Chat on WhatsApp</span>
              </a>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-full p-2 text-pink-600 hover:bg-pink-100 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/apps" text="Apps" icon={Square3Stack3DIcon} />

            {user ? (
              <>
                <NavLink href="/profile" text="Profile" icon={UserCircleIcon} />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-pink-500 hover:bg-pink-600 transition-all duration-200 text-sm font-medium"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-pink-500 hover:bg-pink-600 transition-all duration-200 text-sm font-medium"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-64 py-4" : "max-h-0 py-0"
          }`}
        >
          <div className="flex flex-col gap-3 border-t border-pink-100 pt-2">
            <MobileNavLink
              href="/apps"
              text="Apps"
              icon={Square3Stack3DIcon}
              onClick={() => setIsMenuOpen(false)}
            />

            {user ? (
              <>
                <MobileNavLink
                  href="/profile"
                  text="Profile"
                  icon={UserCircleIcon}
                  onClick={() => setIsMenuOpen(false)}
                />
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 p-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, text, icon: Icon }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-gray-700 hover:text-pink-600 transition-colors duration-200 text-sm font-medium"
    >
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </Link>
  );
}

function MobileNavLink({ href, text, icon: Icon, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 p-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{text}</span>
    </Link>
  );
}
