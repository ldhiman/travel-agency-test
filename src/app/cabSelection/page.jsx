"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const CabSelection = () => {
  const searchParams = useSearchParams();
  const [fullTripData, setFullTripData] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        try {
          const decodedData = JSON.parse(atob(dataParam));
          setFullTripData(decodedData);
          console.log(decodedData); // Ensure data is correctly parsed and logged
        } catch (error) {
          console.error("Failed to parse trip data:", error);
        }
      } else {
        console.error("No data parameter found in URL.");
      }
    };

    fetchTripData();
  }, [searchParams]);

  return (
    <div>
      <h1>Cab Selection</h1>
      {fullTripData ? (
        <div>
          <p>Trip Type: {fullTripData.tripType}</p>
          <p>Source: {fullTripData.source}</p>
          <p>Destination: {fullTripData.destination}</p>
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
          <p>Source Coordinates: {JSON.stringify(fullTripData.sourceCoords)}</p>
          <p>
            Destination Coordinates:{" "}
            {JSON.stringify(fullTripData.destinationCoords)}
          </p>
        </div>
      ) : (
        <p>No trip data available.</p>
      )}
    </div>
  );
};

export default CabSelection;
