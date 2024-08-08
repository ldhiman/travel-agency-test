"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ref, push, set } from "firebase/database";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const ConfirmCab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cabData, setCabData] = useState(null);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    // Fetch user UID from Firebase Auth
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
      toast.error("No Trip Data!!");
      console.error("No trip data to save");
      return;
    }
    if (!uid) {
      toast.error("Please Login First!!");
      console.error("No user UID to save");
      return;
    }

    setLoading(true); // Start loading spinner

    const updatedCabData = {
      ...cabData,
      uid: uid,
      status: "booked",
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
            toast.success("Trip confirmed successfully!");
            router.push("/history");
          })
          .catch((error) => {
            console.error("Failed to save trip ID under customer trips", error);
            toast.error("Failed to save trip ID.");
          })
          .finally(() => {
            setLoading(false); // Stop loading spinner
          });
      })
      .catch((error) => {
        console.error("Failed to save trip data", error);
        toast.error("Failed to save trip data.");
        setLoading(false); // Stop loading spinner
      });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Cab Confirmation
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : cabData ? (
          <>
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Trip Details
              </h2>
              <p>
                <strong>Trip Type:</strong> {cabData.tripType}
              </p>
              <p>
                <strong>Source:</strong> {cabData.source}
              </p>
              <p>
                <strong>Destination:</strong> {cabData.destination}
              </p>
              <p>
                <strong>Pickup Date and Time:</strong>{" "}
                {cabData.pickupDatetime
                  ? new Date(cabData.pickupDatetime).toLocaleString()
                  : "N/A"}
              </p>
              {cabData.returnDatetime ? (
                <p>
                  <strong>Return Date and Time:</strong>{" "}
                  {new Date(cabData.returnDatetime).toLocaleString()}
                </p>
              ) : (
                <></>
              )}
              <p>
                <strong>Duration:</strong> {cabData.duration}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Cab Details
              </h2>
              <p>
                <strong>Vehicle Tag:</strong> {cabData.vehicleTag}
              </p>
              <p>
                <strong>Vehicle Type:</strong> {cabData.vehicleType}
              </p>
              <p>
                <strong>Total Cost:</strong> ₹ {cabData.totalCost}
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={saveTripData}
              >
                Confirm Trip
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No trip data available.</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmCab;
