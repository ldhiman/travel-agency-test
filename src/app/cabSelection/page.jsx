"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VehicleCard from "../components/vehicleCard";
import {
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  CarTaxiFront,
} from "lucide-react";

const CabSelection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullTripData, setFullTripData] = useState(null);

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

      const baseFareNum = parseFloat(baseFare) || 0;
      const stateTaxNum = parseFloat(stateTax) || 0;
      const tollTaxNum = parseFloat(tollTax) || 0;
      const allowanceNum = parseFloat(allowance) || 0;
      const nightDropNum = parseFloat(nightDrop) || 0;

      switch (fullTripData?.tripType) {
        case "ONE WAY":
        case "ROUND TRIP":
          totalFare = baseFareNum + stateTaxNum + allowanceNum + tollTaxNum;
          fareInfo += `\nToll Tax: Rs.${tollTaxNum}`;
          fareInfo += `\nState Tax: Rs.${stateTaxNum}`;
          break;

        case "HOURLY RENTAL":
          totalFare = baseFareNum + allowanceNum;
          if (extraDistance)
            fareInfo += `\nExtra Distance: Rs.${extraDistance} per Km`;
          if (nightDrop) fareInfo += `\nNight Drop: Rs.${nightDrop}`;
          break;

        default:
          break;
      }

      totalFare += totalFare * gst;
      fareInfo += `\nBase Fare: Rs.${baseFareNum} \nAllowance: Rs.${allowanceNum}\nGST: ${
        gst * 100
      }%`;

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

      if (shouldIncludeNightDrop(fullTripData.pickupDatetime, nightDropNum)) {
        totalFare += nightDropNum;
        fareInfo += `\nNight Drop Charge: Rs.${nightDropNum}`;
      }

      fareInfo += "\n\nNote: " + fullTripData.distanceData.info;
    }

    return [totalFare.toFixed(2), fareInfo.trim()];
  };

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

  const tripType = fullTripData?.tripType || "ONE WAY";
  const formattedDuration = convertMinutesToHoursAndMinutes(
    fullTripData?.distanceData?.duration
      ? parseInt(fullTripData.distanceData.duration.split(" ")[0], 10)
      : 0
  );

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {fullTripData ? (
          <>
            <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Trip Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 text-blue-500" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Trip Type:</span> {tripType}
                  </p>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 text-green-500" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Source:</span>{" "}
                    {fullTripData.source}
                  </p>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 text-green-500" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Destination:</span>{" "}
                    {fullTripData.destination}
                  </p>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 text-red-500" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Pickup:</span>{" "}
                    {fullTripData.pickupDatetime
                      ? new Date(fullTripData.pickupDatetime).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 text-purple-500" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Duration:</span>{" "}
                    {formattedDuration}
                  </p>
                </div>
                <div className="flex items-center">
                  <CarTaxiFront className="mr-2 text-blue-500" />
                  <p className="text-gray-700">
                    <span className="font-semibold">Distance:</span>{" "}
                    {fullTripData.distanceData?.distance}
                  </p>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Select Your Ride
            </h3>
            <div className="space-y-4">
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
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CabSelection;
