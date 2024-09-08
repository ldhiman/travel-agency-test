"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareFromSquare } from "@fortawesome/free-regular-svg-icons";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faPlugCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";



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
    <header className="">
      <div className="container flex flex-1 justify-items-center mx-auto  content justify-evenly flex-wrap p-5 flex-col md:flex-row items-center">
        <Link
          href="/"
          className="flex flex-row  items-center text-customPink mb-4 md:mb-0"
        >
          <span className="text-custom-pink font-sans font-extrabold  text-xl">
            TravelIndia
          </span>
          <span className="text-custom-pink font-sans font-bold text-sm">
            .tours
          </span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <Link
            href="/apps"
            className="mr-5 flex flex-col hover:text-customPink"
          >
            <FontAwesomeIcon
              className="text-custom-dark font-barlow-condensed font-bold text-xl"
              icon={faShareFromSquare}
            />
            <span className="text-custom-dark font-barlow-condensed font-semibold text-sm">
              Apps
            </span>
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                className="mr-5 flex flex-col hover:text-customPink"
              >
                <FontAwesomeIcon
                  className="text-custom-dark font-barlow-condensed font-bold text-xl"
                  icon={faUserCheck}
                />
                <span className="text-custom-dark font-barlow-condensed font-semibold text-sm">
                  Profile
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="mr-5 hover:text-customPink flex flex-col items-center"
              >
                <FontAwesomeIcon
                  className="text-custom-dark font-barlow-condensed font-bold text-xl"
                  icon={faPlugCircleXmark}
                />
                <span className="text-custom-dark font-barlow-condensed font-semibold text-sm">
                  signOut
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="mr-5 flex flex-col hover:text-customPink"
            >
              <FontAwesomeIcon
                className="text-custom-dark font-barlow-condensed font-bold text-xl"
                icon={faRightToBracket}
              />
              <span className="text-custom-dark font-barlow-condensed font-semibold text-sm">
                signIn
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
