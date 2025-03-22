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
import { Phone, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
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
          callback: () => console.log("reCAPTCHA resolved."),
          "expired-callback": () => console.log("reCAPTCHA expired."),
        }
      );
      window.recaptchaVerifier = recaptchaVerifier;

      recaptchaVerifier.render().catch((error) => {
        console.error("Error rendering reCAPTCHA:", error);
        toast.error("Failed to initialize reCAPTCHA.");
      });
    }
  }, [recaptchaContainerRef]);

  const requestOtp = async () => {
    const appVerifier = window.recaptchaVerifier;
    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        "+91" + phoneNumber,
        appVerifier
      );
      toast.success("OTP sent successfully!", { duration: 3000 });
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait before retrying.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
      console.error("Error during signInWithPhoneNumber:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!verificationId) {
      toast.error("Something went wrong!");
      return;
    }
    setLoading(true);
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      await update(ref(db, "user/" + user.uid), {
        type: "customer",
        customer: true,
      });
      toast.success("Logged in successfully!");
      router.push("/register");
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP!");
      } else {
        toast.error("Verification failed. Try again.");
      }
      console.error("Error during OTP verification:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome to{" "}
            <span className="text-indigo-600">Travelindia.tours</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in or create an account to begin your journey
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone-number" className="sr-only">
              Phone Number
            </label>
            <div className="relative">
              <div className="flex items-center">
                <span className="inline-block px-3 py-3 bg-gray-100 text-gray-600 border border-r-0 rounded-l-lg">
                  +91
                </span>
                <input
                  id="phone-number"
                  name="phone"
                  type="tel"
                  disabled={otpSent || loading}
                  required
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  className="w-full pl-2 pr-4 py-3 border border-gray-300 rounded-r-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* OTP Input */}
          {otpSent && (
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            </div>
          )}

          {/* reCAPTCHA Container */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} />

          {/* Button */}
          <button
            onClick={otpSent ? verifyOtp : requestOtp}
            disabled={
              loading ||
              (otpSent && otp.length < 6) ||
              (!otpSent && phoneNumber.length < 10)
            }
            className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : otpSent ? (
              <Lock className="w-5 h-5 mr-2" />
            ) : (
              <ArrowRight className="w-5 h-5 mr-2" />
            )}
            {otpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          By signing in, you agree to our{" "}
          <a
            href="/policy"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/policy"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
