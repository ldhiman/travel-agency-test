"use client";
import React from "react";
import Head from "next/head";
import { Check, Map, ArrowRight } from "lucide-react";

const TripConfirmation = () => {
  return (
    <body>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
        <Head>
          <title>Trip Confirmed | Your Adventure Awaits</title>
          <meta
            name="description"
            content="Your incredible journey is about to begin!"
          />
        </Head>

        <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 max-w-lg w-full text-center space-y-6">
          {/* Animated Checkmark */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 text-white p-4 rounded-full">
                <Check size={48} strokeWidth={3} />
              </div>
            </div>
          </div>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Trip Confirmed!
            </h1>
            <p className="text-gray-600 text-lg">
              Get ready for an incredible trip
            </p>
          </div>
          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-gray-700 leading-relaxed">
              Your journey is all set! We&apos;ve processed your booking and
              can&apos;t wait to serve you with the best ride.
            </p>
          </div>

          {/* Action Button */}
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
          py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 
          transition duration-300 ease-in-out transform hover:scale-105 
          flex items-center justify-center space-x-2"
            onClick={() => window.open("/profile", "_self")}
          >
            <span>View Dashboard</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-gray-500 text-sm text-center">
          Need help? Contact our support team
        </p>
      </div>
    </body>
  );
};

export default TripConfirmation;
