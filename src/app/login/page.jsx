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
import { ref, update } from "firebase/database";
import { Phone, Lock, ArrowRight, Loader2, Edit3, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const router = useRouter();
  const recaptchaContainerRef = useRef(null);

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (recaptchaContainerRef.current) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: "invisible",
          callback: () => console.log("reCAPTCHA resolved."),
          "expired-callback": () => {
            console.log("reCAPTCHA expired.");
            toast.error("reCAPTCHA expired. Please try sending OTP again.");
          },
        }
      );
      window.recaptchaVerifier = recaptchaVerifier;

      recaptchaVerifier.render().catch((error) => {
        console.error("Error rendering reCAPTCHA:", error);
        toast.error("Could not initialize reCAPTCHA. Please refresh the page.");
      });
    }
  }, []);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (otpSent && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendCooldown]);

  const requestOtp = async () => {
    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        "+91" + phoneNumber,
        window.recaptchaVerifier
      );
      toast.success("OTP sent successfully!");
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
      setResendCooldown(30); // Reset cooldown on new request
    } catch (error) {
      console.error("Error during signInWithPhoneNumber:", error);
      const errorMessage =
        error.code === "auth/too-many-requests"
          ? "Too many requests. Please try again later."
          : "Failed to send OTP. Please check the number and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    if (!verificationId) {
      toast.error("Verification ID not found. Please request a new OTP.");
      return;
    }
    setLoading(true);
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Update user data in Firebase Realtime Database
      await update(ref(db, `user/${user.uid}`), {
        customer: true,
        lastLogin: new Date().toISOString(),
      });

      toast.success("Logged in successfully!");
      router.push("/register"); // Or to the user dashboard
    } catch (error) {
      console.error("Error during OTP verification:", error);
      const errorMessage =
        error.code === "auth/invalid-verification-code"
          ? "Invalid OTP. Please check and try again."
          : "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to go back and change the phone number
  const changePhoneNumber = () => {
    setOtpSent(false);
    setOtp("");
    setVerificationId(null);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div id="recaptcha-container" ref={recaptchaContainerRef} />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200">
        {/* Header */}
        <div className="text-center">
          {/* You can replace this with your actual logo */}
          <div className="inline-block bg-indigo-100 text-indigo-600 p-3 rounded-full mb-4"></div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            {otpSent
              ? `Enter the OTP sent to +91 ${phoneNumber}`
              : "Sign in to continue your journey with us"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="phone-input"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label htmlFor="phone-number" className="sr-only">
                  Phone Number
                </label>
                <div className="group flex justify-normal items-stretch">
                  <span className="flex pl-3 pr-2 py-3 bg-gray-100 text-gray-600 border border-r-0 border-gray-300 rounded-l-lg group-focus-within:border-indigo-500 group-focus-within:ring-1 group-focus-within:ring-indigo-500 transition">
                    <Phone className="h-full w-5" />{" "}
                    <span className="ml-2 font-medium">+91</span>
                  </span>
                  <input
                    id="phone-number"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-r-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="98765 43210"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-input"
                className="space-y-4"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="sr-only">
                    OTP
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      required
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full tracking-[0.3em] text-center pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="_ _ _ _ _ _"
                    />
                  </div>
                </div>
                {/* Helper links */}
                <div className="flex justify-between items-center text-sm">
                  <button
                    onClick={changePhoneNumber}
                    className="flex items-center text-gray-600 hover:text-indigo-600 font-medium transition"
                  >
                    <Edit3 className="w-4 h-4 mr-1" /> Change Number
                  </button>
                  {resendCooldown > 0 ? (
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" /> Resend in{" "}
                      {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      onClick={requestOtp}
                      className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            onClick={otpSent ? verifyOtp : requestOtp}
            disabled={
              loading ||
              (otpSent && otp.length < 6) ||
              (!otpSent && phoneNumber.length < 10)
            }
            className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className="flex items-center">
                {otpSent ? "Verify & Continue" : "Send OTP"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <a
            href="/policy"
            className="text-indigo-600 hover:underline font-medium"
          >
            Terms
          </a>{" "}
          &{" "}
          <a
            href="/policy"
            className="text-indigo-600 hover:underline font-medium"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
