"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ref, push, set } from "firebase/database";
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
} from "lucide-react";

const ConfirmCab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cabData, setCabData] = useState(null);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setError("User not authenticated.");
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

  const saveTripData = () => {
    if (!cabData) {
      toast.error("No Trip Data Available!");
      return;
    }
    if (!uid) {
      toast.error("Please Login to Confirm Your Trip!");
      return;
    }

    setLoading(true);

    const updatedCabData = {
      ...cabData,
      uid: uid,
      status: 101,
      bookedTime: new Date().getTime(),
    };

    const tripsRef = ref(db, "trips");
    const newTripRef = push(tripsRef);

    set(newTripRef, updatedCabData)
      .then(() => {
        console.log("Trip data saved successfully with ID:", newTripRef.key);
        const customerTripsRef = ref(
          db,
          `customers/${uid}/trips/${newTripRef.key}`
        );

        set(customerTripsRef, new Date().getTime())
          .then(() => {
            console.log("Trip ID saved under customer trips.");
            toast.success("Your trip has been confirmed successfully!");
            router.replace("/profile");
          })
          .catch((error) => {
            console.error("Failed to save trip ID under customer trips", error);
            toast.error("Failed to save trip details. Please try again.");
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error("Failed to save trip data", error);
        toast.error("Failed to confirm trip. Please try again later.");
        setLoading(false);
      });
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="bg-indigo-600 text-white py-6 px-8">
            <h1 className="text-3xl font-bold">Confirm Your Cab Booking</h1>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : cabData ? (
            <div className="p-8">
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Trip Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <TrendingUp className="text-indigo-500 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Trip Type</p>
                      <p className="font-medium">{cabData.tripType}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="text-indigo-500 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">
                        Pickup Date and Time
                      </p>
                      <p className="font-medium">
                        {cabData.pickupDatetime
                          ? new Date(cabData.pickupDatetime).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="text-indigo-500 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Pickup Location</p>
                      <p className="font-medium">{cabData.source}</p>
                    </div>
                  </div>
                  {cabData.destination && (
                    <div className="flex items-center">
                      <MapPin className="text-indigo-500 mr-3" size={24} />
                      <div>
                        <p className="text-sm text-gray-500">
                          Drop-off Location
                        </p>
                        <p className="font-medium">{cabData.destination}</p>
                      </div>
                    </div>
                  )}
                  {cabData.distanceData.distance && (
                    <div className="flex items-center">
                      <CarTaxiFront
                        className="text-indigo-500 mr-3"
                        size={24}
                      />
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="font-medium">
                          {cabData.distanceData.distance}
                        </p>
                      </div>
                    </div>
                  )}
                  {cabData.distanceData.duration && (
                    <div className="flex items-center">
                      <Clock className="text-indigo-500 mr-3" size={24} />
                      <div>
                        <p className="text-sm text-gray-500">
                          Estimated Duration
                        </p>
                        <p className="font-medium">
                          {cabData.distanceData.duration}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Cab and Fare Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Truck className="text-indigo-500 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="font-medium capitalize">
                        {cabData.vehicleType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="text-indigo-500 mr-3" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Total Cost</p>
                      <p className="font-medium text-xl">
                        ₹ {parseFloat(cabData.totalCost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                {cabData.distanceData.info && (
                  <div className="mt-4 flex items-start">
                    <Info
                      className="text-indigo-500 mr-3 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <p className="text-sm text-gray-500">Note</p>
                      <p className="font-medium">{cabData.distanceData.info}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300"
                  onClick={saveTripData}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600">
              <p className="text-xl">
                No trip data available. Please try booking again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmCab;
