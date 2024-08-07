"use client";

import { duration } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ConfirmCab = () => {
  const searchParams = useSearchParams();
  const [cabData, setCabData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let fetchCabData = async () => {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        try {
          const decodedData = JSON.parse(atob(dataParam));
          setCabData(decodedData);
          console.log("Here is the data", decodedData); // Ensure data is correctly parsed and logged
        } catch (error) {
          console.error("Failed to parse trip data:", error);
        }
      } else {
        console.error("No data parameter found in URL.");
      }
    };

    fetchCabData();
  }, [searchParams]);

  return (
    <>
      <div className="text-gray-600 text-sm title-font font-medium mb-1 ml-2">
        {cabData ? (
          <>
            <div>
              <p>Trip Type: {cabData.tripType}</p>
              <span>Source: {cabData.source}</span>
              <span> , Destination: {cabData.destination}</span>
              <p>
                Pickup Date and Time:{" "}
                {cabData.pickupDatetime
                  ? new Date(cabData.pickupDatetime).toString()
                  : "N/A"}
              </p>
              <p>
                Return Date and Time:{" "}
                {cabData.returnDatetime
                  ? new Date(cabData.returnDatetime).toString()
                  : "N/A"}
              </p>
              <p> Duration: {cabData.duration}</p>
            </div>
            <div>
              <h1>Cab Confirmation</h1>
              <p>Vehicle Tag: {cabData.vehicleTag}</p>
              <p>Vehicle Type: {cabData.vehicleType}</p>
              <p>Total Cost: ₹ {cabData.totalCost}</p>
              <p>Passengers: {cabData.passengers}</p>
              <p>Luggage: {cabData.luggage}</p>
            </div>
          </>
        ) : (
          <p>No trip data available.</p>
        )}
      </div>
    </>
  );
};

export default ConfirmCab;
