"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./style.module.css";

const CabSelection = () => {
  const searchParams = useSearchParams();
  const [fullTripData, setFullTripData] = useState(null);
  const [vehicleTag, setVehicleTag] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [passengers, setPassengers] = useState("");
  const [luggage, setLuggage] = useState("");
  const router = useRouter();

  let cabData = {
    vehicleTag,
    vehicleType,
    passengers,
    luggage,
  };

  useEffect(() => {
    const fetchTripData = async () => {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        try {
          const decodedData = JSON.parse(atob(dataParam));
          setFullTripData(decodedData);
          console.log("Here is the data", decodedData); // Ensure data is correctly parsed and logged
        } catch (error) {
          console.error("Failed to parse trip data:", error);
        }
      } else {
        console.error("No data parameter found in URL.");
      }
    };

    fetchTripData();
  }, [searchParams]);

  // Function to convert minutes to hours and minutes
  const convertMinutesToHoursAndMinutes = (minutes) => {
    if (isNaN(minutes) || minutes === null) {
      return "N/A";
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // To calculate the total fare
  const calculateTotalFare = (type) => {
    const fares = fullTripData?.distanceData?.fares;
    const tollCosts = fullTripData?.distanceData?.tollCosts;

    if (fares && tollCosts) {
      const fare = fares[type] ?? 0;
      const tollCost = tollCosts[type] ?? 0;

      const totalCost = fare + tollCost;

      // Convert number to string
      let totalCostStr = totalCost.toString();

      // Apply Indian numbering format
      if (totalCostStr.length > 3) {
        // Insert comma after the first three digits from the end
        totalCostStr = totalCostStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
      }

      return totalCostStr;
    }

    return 0;
  };

  // Call to get totol fare
  const compactTotal = calculateTotalFare("Compact");
  const sedanTotal = calculateTotalFare("Sedan");
  const SuvTotal = calculateTotalFare("SUV");
  const tempoTravllerTotal = calculateTotalFare("TempoTraveller");

  // Get the duration in minutes from fullTripData
  const durationInMinutes = fullTripData?.distanceData?.duration
    ? parseInt(fullTripData.distanceData.duration.split(" ")[0], 10)
    : 0;

  // Convert duration to hours and minutes
  const formattedDuration = convertMinutesToHoursAndMinutes(durationInMinutes);

  // Handler function for redirection
 const handlerCabSelection = (
   vehicleTag,
   vehicleType,
   totalCost,
   duration,
   passengers,
   luggage
 ) => {
   cabData = {
     ...fullTripData,
     vehicleTag,
     vehicleType,
     totalCost,
     duration,
     passengers,
     luggage,
   };

   console.log("Cab Data:", cabData);

   // Use `router.push` to navigate to the confirmCab page with encoded data
   router.push(
     "/confirmCab?" +
       new URLSearchParams({ data: btoa(JSON.stringify(cabData)) }).toString()
   );
 };

  return (
    <>
      <div className="text-gray-600 text-sm title-font font-medium mb-1 ml-2">
        {fullTripData ? (
          <>
            {" "}
            <div>
              <p>Trip Type: {fullTripData.tripType}</p>
              <span>Source: {fullTripData.source}</span>
              <span> , Destination: {fullTripData.destination}</span>
              <p>
                Pickup Date and Time:{" "}
                {fullTripData.pickupDatetime
                  ? new Date(fullTripData.pickupDatetime).toString()
                  : "N/A"}
              </p>
              <p>
                Return Date and Time:{" "}
                {fullTripData.returnDatetime
                  ? new Date(fullTripData.returnDatetime).toString()
                  : "N/A"}
              </p>
              <p> Duration: {formattedDuration}</p>
              {/* <p>
              Source Coordinates: {JSON.stringify(fullTripData.sourceCoords)}
            </p>
            <p>
              Destination Coordinates:{" "}
              {JSON.stringify(fullTripData.destinationCoords)}
            </p> */}
            </div>
            <div
              className="m-5"
              onClick={() =>
                handlerCabSelection(
                  "Economy",
                  "Compact",
                  compactTotal,
                  formattedDuration,
                  4,
                  1
                )
              }
            >
              <button className="flex w-20 text-white bg-indigo-400 border-0 py-1 px-2 focus:outline-none rounded">
                Economy
              </button>
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
                COMPACT
              </h1>
              <span className="title-font font-medium text-2xl text-gray-900">
                ₹ {compactTotal}
              </span>
              <span className="flex ml-3 pl-3 py-2  space-x-2s">
                Passenger : 4
              </span>
              <span className="flex ml-3 pl-3 py-2  space-x-2s">
                Luggage : 1
              </span>
            </div>
          </>
        ) : (
          <p>No trip data available.</p>
        )}
      </div>
    </>
  );
};

export default CabSelection;
