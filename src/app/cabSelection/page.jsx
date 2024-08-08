"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VehicleCard from "../components/vehicleCard";
// import styles from "./style.module.css";

const CabSelection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullTripData, setFullTripData] = useState(null);
  const [vehicleTag, setVehicleTag] = useState("");
  const [vehicleType, setVehicleType] = useState("");
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

  const calculateTotalFare = (type) => {
    const fares = fullTripData?.distanceData?.fares || {};
    const tollCosts = fullTripData?.distanceData?.tollCosts || {};
    const fare = fares[type] || 0;
    const tollCost = tollCosts[type] || 0;
    const totalCost = fare + tollCost;
    return totalCost.toLocaleString();
  };

  const vehicleTypes = [
    { type: "Compact", passengers: 4, luggage: 1 },
    { type: "Sedan", passengers: 4, luggage: 1 },
    { type: "SUV", passengers: 6, luggage: 3 },
    { type: "TempoTraveller", passengers: 12, luggage: 10 },
  ];

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

  return (
    <div className="container mx-auto px-4 py-6">
      {fullTripData ? (
        <>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Trip Details
            </h2>
            <p className="text-gray-700">
              <strong>Trip Type:</strong> {fullTripData.tripType}
            </p>
            <p className="text-gray-700">
              <strong>Source:</strong> {fullTripData.source}
            </p>
            <p className="text-gray-700">
              <strong>Destination:</strong> {fullTripData.destination}
            </p>
            <p className="text-gray-700">
              <strong>Pickup Date and Time:</strong>{" "}
              {fullTripData.pickupDatetime
                ? new Date(fullTripData.pickupDatetime).toString()
                : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Return Date and Time:</strong>{" "}
              {fullTripData.returnDatetime
                ? new Date(fullTripData.returnDatetime).toString()
                : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Duration:</strong> {formattedDuration}
            </p>
          </div>
          <section className="text-gray-600 body-font flex flex-col overflow-hidden">
            {vehicleTypes.map(({ type, passengers, luggage }) => (
              <VehicleCard
                key={type}
                type={type}
                total={calculateTotalFare(type)}
                baseFare={fullTripData.distanceData.fares[type]}
                tollTax={fullTripData.distanceData.tollCosts[type]}
                passengers={passengers}
                luggage={luggage}
                distance={fullTripData.distanceData?.distance}
                duration={formattedDuration}
                onClick={() =>
                  handleCabSelection(
                    "Economy", // Example value, should be dynamically determined if needed
                    type,
                    calculateTotalFare(type),
                    formattedDuration,
                    passengers,
                    luggage
                  )
                }
              />
            ))}
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
