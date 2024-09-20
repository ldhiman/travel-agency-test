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
import { ref, set, update } from "firebase/database";
import { Phone, Lock, ArrowRight } from "lucide-react";

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
          "expired-callback": () => {
            console.log("reCAPTCHA expired.");
          },
        }
      );
      window.recaptchaVerifier = recaptchaVerifier;

      // Render the reCAPTCHA widget
      recaptchaVerifier.render().catch((error) => {
        console.error("Error rendering reCAPTCHA:", error);
        toast.error("Failed to initialize reCAPTCHA.");
      });
    }
  }, [recaptchaContainerRef]);

  const requestOtp = async () => {
    const appVerifier = window.recaptchaVerifier;
    try {
      let toastId = toast.loading("Sending OTP..");
      signInWithPhoneNumber(auth, "+91" + phoneNumber, appVerifier)
        .then((confirmationResult) => {
          toast.dismiss(toastId);
          toast.success("OTP sent successfully!");

          if (confirmationResult && confirmationResult.verificationId) {
            setVerificationId(confirmationResult.verificationId);
            setOtpSent(true);
          } else {
            console.error("No verification ID found in confirmationResult.");
            toast.error("Failed to retrieve verification ID.");
          }
        })
        .catch((error) => {
          toast.dismiss(toastId);
          if (error.code === "auth/too-many-requests") {
            toast.error(
              "Too many requests. Please wait a few minutes before trying again."
            );
          } else {
            toast.error("An error occurred. Please try again.");
          }
          console.log(error);
        });
    } catch (error) {
      console.error("Error during signInWithPhoneNumber:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (verificationId == null) {
      toast.error("Something went wrong!!");
      return;
    }
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    let toastId = toast.loading("Verifying OTP..");
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      await update(ref(db, "user/" + user.uid), {
        type: "customer",
        customer: true,
      });
      toast.success("User logged in successfully.");
      router.push("/register");
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP!!");
      } else {
        toast.error("Error during OTP verification: " + error.message);
      }
      console.error("Error during OTP verification:", error);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Travelindia.tours
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in or create an account to start your journey
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="phone-number" className="sr-only">
                Phone number
              </label>
              <div className="flex items-center border rounded-t-md">
                <span className="px-3 py-3 text-gray-500 bg-gray-50 border-r">
                  +91
                </span>
                <div className="relative flex-grow">
                  <Phone className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                  <input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    disabled={otpSent}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            </div>
            {otpSent && (
              <div>
                <label htmlFor="otp" className="sr-only">
                  OTP
                </label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter OTP"
                  />
                </div>
              </div>
            )}
          </div>

          <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

          <div>
            {!otpSent ? (
              <button
                onClick={requestOtp}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <ArrowRight
                    className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                    aria-hidden="true"
                  />
                </span>
                Send OTP
              </button>
            ) : (
              <button
                onClick={verifyOtp}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock
                    className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                    aria-hidden="true"
                  />
                </span>
                Verify OTP
              </button>
            )}
          </div>
        </form>
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
