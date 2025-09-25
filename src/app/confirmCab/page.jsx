"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ref, push, set, get } from "firebase/database";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import {
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Truck,
  IndianRupee,
  Info,
  CarTaxiFront,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";

const ConfirmCab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cabData, setCabData] = useState(null);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setError("User not authenticated.");
        toast.error("Please login to continue with your booking.");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCabData = async () => {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        try {
          const decodedData = JSON.parse(atob(dataParam));
          setCabData(decodedData);
          console.log("Here is the data", decodedData);
        } catch (error) {
          console.error("Failed to parse trip data:", error);
          setError("Failed to parse trip data.");
        }
      } else {
        setError("No data parameter found in URL.");
      }
    };

    fetchCabData();
  }, [searchParams]);

  // Trip type prefixes
  const TRIP_TYPE_PREFIXES = {
    "ONE WAY": "OW",
    "ROUND TRIP": "RT",
    "HOURLY RENTAL": "HR",
  };

  const generateTripID = (tripType) => {
    const prefix = TRIP_TYPE_PREFIXES[tripType.toUpperCase()];
    if (!prefix) {
      throw new Error(`Invalid trip type: ${tripType}`);
    }

    // Get current date in YYYYMMDD format
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}${month}${day}`;
    const randomStr = Array(4)
      .fill(0)
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("")
      .toUpperCase();
    return `${prefix}-${dateStr}-${randomStr}`;
  };

  const getUniqueTripID = async (tripType) => {
    let tripID;
    let isUnique = false;

    while (!isUnique) {
      tripID = generateTripID(tripType.toUpperCase());
      const tripRef = ref(db, `trips/${tripID}`);

      try {
        const snapshot = await get(tripRef);
        if (!snapshot.exists()) {
          isUnique = true;
        }
      } catch (error) {
        console.error("Error checking trip ID uniqueness:", error);
      }
    }

    return tripID;
  };

  const saveTripData = async () => {
    if (!cabData) {
      toast.error("No Trip Data Available!");
      return;
    }
    if (!uid) {
      toast.error("Please Login to Confirm Your Trip!");
      return;
    }

    setLoading(true);
    setIsConfirming(true);

    const tripID = await getUniqueTripID(cabData.tripType);

    const updatedCabData = {
      ...cabData,
      uid: uid,
      status: 101,
      totalCost: Number(parseFloat(cabData.totalCost).toFixed(2)),
      fare: {
        ...cabData.fare,
        baseFare: cabData.fare.baseFare
          ? Number(parseFloat(cabData.fare.baseFare).toFixed(2))
          : -1,
        gst: cabData.fare.gst
          ? Number(parseFloat(cabData.fare.gst).toFixed(2))
          : -1,
        tollTax: cabData.includeToll ? cabData.fare.tollTax : -1,
        totalFare: Number(parseFloat(cabData.totalCost).toFixed(2)),
      },
      bookedTime: new Date().getTime(),
      tripID: tripID,
    };

    const tripsRef = ref(db, `trips/${tripID}`);

    set(tripsRef, updatedCabData)
      .then(() => {
        console.log("Trip data saved successfully with ID:", tripID);
        const customerTripsRef = ref(db, `customers/${uid}/trips/${tripID}`);

        set(customerTripsRef, new Date().getTime())
          .then(() => {
            console.log("Trip ID saved under customer trips.");
            toast.success("Your trip has been confirmed successfully!");
            setTimeout(() => {
              router.replace("/profile");
            }, 1500);
          })
          .catch((error) => {
            console.error("Failed to save trip ID under customer trips", error);
            toast.error("Failed to save trip details. Please try again.");
          })
          .finally(() => {
            setLoading(false);
            setIsConfirming(false);
          });
      })
      .catch((error) => {
        console.error("Failed to save trip data", error);
        toast.error("Failed to confirm trip. Please try again later.");
        setLoading(false);
        setIsConfirming(false);
      });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to search</span>
        </button>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-8 px-8">
            <h1 className="text-3xl font-bold flex items-center">
              <CheckCircle className="mr-3" size={28} />
              Confirm Your Booking
            </h1>
            <p className="mt-2 opacity-90">
              Review your trip details before confirming
            </p>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
              <AlertCircle className="mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium">Unable to load booking details</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded transition-colors"
                >
                  Return to home
                </button>
              </div>
            </div>
          )}

          {loading && !isConfirming ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-600">
                Loading your booking details...
              </p>
            </div>
          ) : isConfirming ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-600">Confirming your booking...</p>
              <p className="text-sm text-gray-500 mt-2">
                Please don&apos;t close this window
              </p>
            </div>
          ) : cabData ? (
            <div className="p-8">
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Trip Details
                  </h2>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {cabData.tripType}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mt-6">
                  <div className="flex items-start">
                    <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                      <Calendar className="text-indigo-600" size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pickup Date & Time
                      </p>
                      <p className="font-medium text-gray-800">
                        {cabData.pickupDatetime
                          ? new Date(cabData.pickupDatetime).toLocaleString(
                              "en-IN",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                      <TrendingUp className="text-indigo-600" size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Booking Type
                      </p>
                      <p className="font-medium text-gray-800">
                        {cabData.tripType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                      <MapPin className="text-indigo-600" size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pickup Location
                      </p>
                      <p className="font-medium text-gray-800">
                        {cabData.source}
                      </p>
                    </div>
                  </div>

                  {cabData.destination && (
                    <div className="flex items-start">
                      <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                        <MapPin className="text-indigo-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Drop-off Location
                        </p>
                        <p className="font-medium text-gray-800">
                          {cabData.destination}
                        </p>
                      </div>
                    </div>
                  )}

                  {cabData.tripType !== "HOURLY RENTAL" &&
                    cabData.distanceData.distance && (
                      <div className="flex items-start">
                        <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                          <CarTaxiFront className="text-indigo-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Distance
                          </p>
                          <p className="font-medium text-gray-800">
                            {cabData.distanceData.distance}
                          </p>
                        </div>
                      </div>
                    )}
                  {cabData.tripType === "HOURLY RENTAL" && (
                    <div className="flex items-start">
                      <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                        <Clock className="text-indigo-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Rental Duration
                        </p>
                        <p className="font-medium text-gray-800">
                          {cabData.hours} hours
                        </p>
                      </div>
                    </div>
                  )}
                  {cabData.tripType !== "HOURLY RENTAL" &&
                    cabData.distanceData.duration && (
                      <div className="flex items-start">
                        <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                          <Clock className="text-indigo-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Estimated Duration
                          </p>
                          <p className="font-medium text-gray-800">
                            {cabData.distanceData.duration}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Truck className="text-indigo-600 mr-3" size={22} />
                  Cab & Fare Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                      Vehicle Type
                    </p>
                    <p className="font-medium text-gray-800 capitalize text-lg">
                      {cabData.vehicleType}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                      Total Cost
                    </p>
                    <p className="font-bold text-gray-800 text-xl flex items-center">
                      <IndianRupee size={18} className="mr-1" />
                      {parseFloat(cabData.totalCost).toFixed(2)}
                    </p>
                  </div>
                </div>

                {cabData.fare && cabData.fare.baseFare > 0 && (
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Fare Breakdown
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Fare</span>
                        <span>
                          ₹ {parseFloat(cabData.fare.baseFare).toFixed(2)}
                        </span>
                      </div>

                      {Object.entries(cabData.fare)
                        .filter(
                          ([key, value]) =>
                            key !== "totalFare" &&
                            key !== "baseFare" &&
                            (key !== "tollTax" || cabData.includeToll) && // Include tollTax only if applicable
                            value > 0
                        ) // Exclude total & base fare
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span>₹ {parseFloat(value).toFixed(2)}</span>
                          </div>
                        ))}

                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total</span>
                        <span>
                          ₹ {parseFloat(cabData.totalCost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {cabData.distanceData.info && (
                  <div className="mt-4 bg-white p-4 rounded-lg flex items-start">
                    <Info
                      className="text-indigo-500 mr-3 flex-shrink-0 mt-1"
                      size={18}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Additional Information
                      </p>
                      <p className="text-gray-600 mt-1">
                        {cabData.distanceData.info}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-start">
                  <Shield
                    className="text-green-600 mr-3 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div>
                    <p className="font-medium text-green-800">Secure Booking</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your booking details are securely processed. Our drivers
                      are verified for your safety.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => router.back()}
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Change Details
                  </button>

                  <button
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 flex items-center"
                    onClick={saveTripData}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2" size={20} />
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="bg-red-50 p-6 rounded-lg">
                <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                <p className="text-xl font-medium text-gray-800 mb-2">
                  No trip data available
                </p>
                <p className="text-gray-600 mb-4">
                  We couldn&apos;t find the details for your booking. Please try
                  booking again.
                </p>
                <button
                  className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                  onClick={() => router.replace("/")}
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmCab;
