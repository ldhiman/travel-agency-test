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

  const calculateTotalFare = (type) => {
    const fares = fullTripData?.distanceData?.fares || {};
    const gst = fullTripData?.distanceData?.gst || 0;
    let totalFare = 0;
    let fareInfo = "";

    if (fares[type]) {
      const {
        baseFare = 0,
        stateTax = 0,
        allowance = 0,
        tollTax = 0,
        extraDistance,
        nightDrop,
      } = fares[type];

      // Ensure all values are numbers
      const baseFareNum = parseFloat(baseFare) || 0;
      const stateTaxNum = parseFloat(stateTax) || 0;
      const tollTaxNum = parseFloat(tollTax) || 0;
      const allowanceNum = parseFloat(allowance) || 0;
      const nightDropNum = parseFloat(nightDrop) || 0; // Ensure nightDrop is a number

      // Calculate the total fare based on trip type
      switch (fullTripData?.tripType) {
        case "ONE WAY":
        case "ROUND TRIP":
          totalFare = baseFareNum + stateTaxNum + allowanceNum + tollTaxNum;
          fareInfo += `\nToll Tax: Rs.${tollTaxNum}`;
          fareInfo += `\nState Tax: Rs.${stateTaxNum}`;
          break;

        case "HOURLY RENTAL":
          totalFare = baseFareNum + allowanceNum; // Additional charges like extraDistance and nightDrop can be factored in based on usage
          if (extraDistance)
            fareInfo += `\nExtra Distance: Rs.${extraDistance} per Km`;
          if (nightDrop) fareInfo += `\nNight Drop: Rs.${nightDrop}`;
          break;

        default:
          break;
      }

      // Apply GST
      totalFare += totalFare * gst;
      fareInfo += `\nBase Fare: Rs.${baseFareNum} \nAllowance: Rs.${allowanceNum}\nGST: ${
        gst * 100
      }%`;

      // Add distance and duration if they are non-zero
      if (
        fullTripData.distanceData?.distance &&
        fullTripData.distanceData.distance > 0
      ) {
        fareInfo += `\nDistance: ${fullTripData.distanceData.distance}`;
      }
      if (
        fullTripData.distanceData?.duration &&
        fullTripData.distanceData.duration > 0
      ) {
        fareInfo += `\nDuration: ${fullTripData.distanceData.duration}`;
      }

      // Add night drop charges if pickup time is at night
      if (shouldIncludeNightDrop(fullTripData.pickupDatetime, nightDropNum)) {
        totalFare += nightDropNum;
        fareInfo += `\nNight Drop Charge: Rs.${nightDropNum}`;
      }

      fareInfo += "\n\nNote: " + fullTripData.distanceData.info;
    }

    // Ensure totalFare is a number before calling toFixed
    return [totalFare.toFixed(2), fareInfo.trim()];
  };

  const formattedDuration = convertMinutesToHoursAndMinutes(
    fullTripData?.distanceData?.duration
      ? parseInt(fullTripData.distanceData.duration.split(" ")[0], 10)
      : 0
  );

  const handleCabSelection = (vehicleType, totalCost) => {
    const parsingData = {
      ...fullTripData,
      fare: fullTripData.distanceData.fares[vehicleType],
      vehicleType,
      totalCost,
    };

    router.push(
      "/confirmCab?" +
        new URLSearchParams({
          data: btoa(JSON.stringify(parsingData)),
        }).toString()
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
            {["ONE WAY", "ROUND TRIP", "HOURLY RENTAL"].includes(tripType) &&
              Object.keys(fullTripData.distanceData?.fares || {}).map(
                (vehicleType, index) => {
                  const fareDetails = calculateTotalFare(vehicleType);

                  return (
                    <VehicleCard
                      key={index}
                      type={vehicleType}
                      total={fareDetails[0]}
                      info={fareDetails[1]}
                      distance={fullTripData.distanceData?.distance}
                      duration={formattedDuration}
                      onClick={() =>
                        handleCabSelection(vehicleType, fareDetails[0])
                      }
                    />
                  );
                }
              )}
          </section>
        </>
      ) : (
        <p className="text-gray-600 text-center">Loading...</p>
      )}
    </div>
  );
};

// Helper function to check if pickup time is during night
const shouldIncludeNightDrop = (pickupDatetime, nightDropCharge) => {
  if (!pickupDatetime || !nightDropCharge) return false;

  const pickupTime = new Date(pickupDatetime).getHours();
  const nightStart = 20; // 8 PM as the start of the night period

  return pickupTime >= nightStart;
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
