"use client";

<<<<<<< HEAD
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast, Toaster } from "react-hot-toast";

import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import {RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
=======
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
>>>>>>> origin/main


const LoginPage = () => {
  const [otp, setOtp] = useState("");
<<<<<<< HEAD
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);
=======
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
>>>>>>> origin/main
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

<<<<<<< HEAD
function onCaptchVerify() {
  // Check if the reCAPTCHA verifier has already been initialized
  if (!window.recaptchaVerifier) {
    // Create a new instance of RecaptchaVerifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container", // ID of the container element for reCAPTCHA
      {
        size: "invisible", // Use an invisible reCAPTCHA
        callback: (response) => {
          // Callback for successful reCAPTCHA completion
          onSignup();
        },
        "expired-callback": () => {
          // Handle reCAPTCHA expiration
          console.log("reCAPTCHA expired. Please try again.");
        },
      },
      auth // Pass the correctly initialized Firebase Auth instance
    );
  }
}
=======
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
>>>>>>> origin/main


  function onSignup() {
    setLoading(true);
    onCaptchVerify();

    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+" + ph;

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sended successfully!");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }

<<<<<<< HEAD
  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        console.log(res);
        setUser(res.user);
        setLoading(false);
        router.push("/register");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  return (
    <section className=" flex items-center justify-center h-screen">
      <div>
        <Toaster toastOptions={{ duration: 4000 }} />
        <div id="recaptcha-container"></div>
        {user ? (
          <h2 className="text-center text-white font-medium text-2xl">
            👍Login Success
          </h2>
        ) : (
          <div className="w-80 flex flex-col gap-4 rounded-lg p-4">
            <h1 className="text-center leading-normal text-white font-medium text-3xl mb-6"></h1>
            {showOTP ? (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                  <BsFillShieldLockFill size={30} />
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-xl text-white text-center"
                >
                  Enter your OTP
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={false}
                  autoFocus
                  className="opt-container "
                ></OtpInput>
                <button
                  onClick={onOTPVerify}
                  className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Verify OTP</span>
                </button>
              </>
            ) : (
              <>
                <div className="bg-black text-white w-fit mx-auto p-4 rounded-full">
                  <BsTelephoneFill size={30} />
                </div>
                <label
                  htmlFor=""
                  className="font-bold text-xl text-black text-center"
                >
                  Verify your phone number
                </label>
                <PhoneInput country={"in"} value={ph} onChange={setPh} />
                <button
                  onClick={onSignup}
                  className="bg-indigo-500 text-white w-full flex gap-1 items-center justify-center py-2.5  rounded"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Send code via SMS</span>
=======
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
>>>>>>> origin/main
                </button>
              </>
            )}
          </div>
        )}
      </div>
<<<<<<< HEAD
    </section>
=======
      <div id="toast-container" />
    </div>
>>>>>>> origin/main
  );
};

export default LoginPage;