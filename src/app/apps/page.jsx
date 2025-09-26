import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Download, Clock } from "lucide-react";

export default function AppsPage() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <section className="text-gray-700 body-font">
        <div className="container px-5 py-24 mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Experience Seamless Transportation
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-12 md:space-y-0 md:space-x-16">
            {/* Ride Booking App */}
            <div className="flex flex-col items-center justify-center space-y-6 bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="w-64 h-64 relative rounded-full">
                <Image
                  className="rounded-full"
                  alt="Ride Booking App"
                  src="/userApp.png"
                  layout="fill"
                  objectFit="fill"
                />
              </div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Ride Booking App
              </h2>
              <p className="text-center text-gray-600 max-w-sm">
                Book your rides with ease, track in real-time, and enjoy a
                comfortable journey.
              </p>
              <Link
                href="/"
                className="flex items-center rounded-xl text-white bg-gray-500 border-0 py-3 px-8 focus:outline-none hover:bg-gray-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <Clock className="mr-2" size={20} />
                Coming Soon
              </Link>
            </div>

            {/* Vendor & Driver Partner App */}
            <div className="flex flex-col items-center justify-center space-y-6 bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="w-64 h-64 relative rounded-full">
                <Image
                  className="rounded-full"
                  alt="Vendor & Driver Partner App"
                  src="/vendorDriverApp.png"
                  layout="fill"
                  objectFit="fill"
                />
              </div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Partner App
              </h2>
              <p className="text-center text-gray-600 max-w-sm">
                Join our network of vendors and drivers. Manage bookings, track
                earnings, and grow your business.
              </p>
              <Link
                href="https://play.google.com/store/apps/details?id=com.travel.india"
                className="flex items-center rounded-xl text-white bg-indigo-500 border-0 py-3 px-8 focus:outline-none hover:bg-indigo-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <Download className="mr-2" size={20} />
                Download Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
