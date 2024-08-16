"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VehicleCard from "../components/vehicleCard";

const CabSelection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullTripData, setFullTripData] = useState(null);
  const [passengers, setPassengers] = useState("");
  const [luggage, setLuggage] = useState("");

  useEffect(() => {
    const fetchTripData = async () => {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        try {
          const decodedData = JSON.parse(atob(dataParam));
          setFullTripData(decodedData);
          console.log("Trip data:", decodedData);
        } catch (error) {
          console.error("Failed to parse trip data:", error);
        }
      } else {
        console.error("No data parameter found in URL.");
      }
    };

    fetchTripData();
  }, [searchParams]);

  // Get vehicle types from the keys of fares
  const getVehicleTypes = () => {
    const vehicleTypes = [];
    const fares = fullTripData?.distanceData?.fares || [];
    for (let i = 0; i < fares.length; i++) {
      vehicleTypes.push(Object.keys(fares[i])[0]);
    }

    return vehicleTypes;
  };

  const vehicleTypes = getVehicleTypes();

  const calculateTotalFare = (type) => {
    const fareTypes = fullTripData?.distanceData?.fareTypes || [];
    let totalFare = 0;
    let fareInfo = "";

    for (const fareType of fareTypes) {
      const fareArray = fullTripData?.distanceData[fareType] || [];
      const fareEntry = fareArray.find(
        (entry) => Object.keys(entry)[0] === type
      );

      if (fareEntry) {
        const value = Object.values(fareEntry)[0];
        totalFare += parseFloat(value) || 0;
        fareInfo += `${fareType}: ${value}\n`;
      }
    }

    return [totalFare.toLocaleString(), fareInfo.trim()];
  };

  const formattedDuration = convertMinutesToHoursAndMinutes(
    fullTripData?.distanceData?.duration
      ? parseInt(fullTripData.distanceData.duration.split(" ")[0], 10)
      : 0
  );

  const handleCabSelection = (
    vehicleTag,
    vehicleType,
    totalCost,
    duration,
    passengers,
    luggage
  ) => {
    const cabData = {
      ...fullTripData,
      vehicleTag,
      vehicleType,
      totalCost,
      duration,
      passengers,
      luggage,
    };

    console.log("Cab Data:", cabData);

    router.push(
      "/confirmCab?" +
        new URLSearchParams({ data: btoa(JSON.stringify(cabData)) }).toString()
    );
  };

  const tripType = fullTripData?.tripType || "ONE WAY";

  return (
    <div className="container mx-auto px-4 py-6">
      {fullTripData ? (
        <>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Trip Details
            </h2>
            <p className="text-gray-700">
              <strong>Trip Type:</strong> {tripType}
            </p>
            <p className="text-gray-700">
              <strong>Source:</strong> {fullTripData.source}
            </p>
            <p className="text-gray-700">
              <strong>Pickup Date and Time:</strong>{" "}
              {fullTripData.pickupDatetime
                ? new Date(fullTripData.pickupDatetime).toString()
                : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Distance:</strong> {fullTripData.distanceData?.distance}
            </p>
            <p className="text-gray-700">
              <strong>Duration:</strong> {formattedDuration}
            </p>
          </div>
          <section className="text-gray-600 body-font flex flex-col overflow-hidden">
            {vehicleTypes.map((type) => {
              const [fare, fareInfo] = calculateTotalFare(type);

              return (
                <VehicleCard
                  key={type}
                  type={type}
                  total={fare}
                  info={fareInfo}
                  passengers={passengers}
                  luggage={luggage}
                  distance={fullTripData.distanceData?.distance}
                  duration={formattedDuration}
                  hourly={
                    fullTripData.tripType == "HOURLY RENTAL" ? true : false
                  }
                  onClick={() =>
                    handleCabSelection(
                      "Economy", // Example value, should be dynamically determined if needed
                      type,
                      fare,
                      formattedDuration,
                      passengers,
                      luggage
                    )
                  }
                />
              );
            })}
          </section>
        </>
      ) : (
        <p className="text-gray-600 text-center">Loading...</p>
      )}
    </div>
  );
};

const convertMinutesToHoursAndMinutes = (minutes) => {
  if (isNaN(minutes) || minutes === null) {
    return "N/A";
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export default CabSelection;
