"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  auth,
  db,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "../firebase";
import { ref, set } from "firebase/database";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const recaptchaContainerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && recaptchaContainerRef.current) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA resolved.");
          },
        }
      );
      window.recaptchaVerifier = recaptchaVerifier;
    }
  }, [recaptchaContainerRef]);

  const requestOtp = async () => {
    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmationResult = signInWithPhoneNumber(
        auth,
        "+91" + phoneNumber,
        appVerifier
      );

      toast.promise(confirmationResult, {
        loading: "Sending OTP...",
        success: () => {
          setVerificationId(confirmationResult.verificationId);
          console.log(confirmationResult.verificationId);
          console.log(verificationId);
          setOtpSent(true);
          return "OTP sent successfully!";
        },
        error: (error) => {
          if (error.code === "auth/too-many-requests") {
            return "Too many requests. Please wait a few minutes before trying again.";
          }
          console.log(error);
          return "An error occurred. Please try again.";
        },
      });
    } catch (error) {
      console.error("Error during signInWithPhoneNumber:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (!verificationId) {
      toast.error("Verification ID is missing.");
      console.error("Verification ID is missing");
      return;
    }

    const credential = PhoneAuthProvider.credential(verificationId, otp);
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      await set(ref(db, "users/" + user.uid), {
        phoneNumber: user.phoneNumber,
        type: "customer",
      });

      toast.success("User logged in successfully.");
      router.push("/register");
    } catch (error) {
      toast.error("Error during OTP verification: " + error.message);
      console.error("Error during OTP verification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">
          Travelindia.tours
        </h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
          <div className="px-5 py-7">
            <label className="font-semibold text-sm text-gray-600 pb-1 block">
              Mobile Number
            </label>
            <div className="flex items-center border rounded-lg mb-5">
              <span className="px-3 py-2 text-gray-600 bg-gray-200 border-r">
                +91
              </span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder="Phone number"
              />
            </div>
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
            <button
              onClick={requestOtp}
              className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
            >
              Send OTP
            </button>

            {otpSent && (
              <>
                <label className="font-semibold text-sm text-gray-600 pb-1 block">
                  Verify OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
                  placeholder="OTP"
                />
                <button
                  onClick={verifyOtp}
                  className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
                >
                  Submit OTP
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div id="toast-container" />
    </div>
  );
}
