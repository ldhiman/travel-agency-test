"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TripDetailsCard, VehicleCard } from "../components/vehicleCard";
const CabSelection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(atob(dataParam)));
          setTripData(decodedData);
        } catch (error) {
          console.error("Failed to parse trip data:", error);
        }
      }
    };

    fetchTripData();
  }, [searchParams]);

  const handleVehicleSelection = (vehicleType, totalCost, includeToll) => {
    const bookingData = {
      ...tripData,
      vehicleType,
      totalCost,
      includeToll,
      fare: tripData.distanceData.fares[vehicleType],
    };

    router.push(
      "/confirmCab?" +
        new URLSearchParams({
          data: btoa(JSON.stringify(bookingData)),
        }).toString()
    );
  };

  if (!tripData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <TripDetailsCard tripData={tripData} />

        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Select Your Ride
        </h3>
        <div className="space-y-6">
          {Object.entries(tripData.distanceData.fares).map(
            ([type, fareDetails]) => (
              <VehicleCard
                key={type}
                type={type}
                fareDetails={fareDetails}
                distance={tripData.distanceData.distance}
                duration={tripData.distanceData.duration}
                tripType={tripData.tripType}
                onSelect={handleVehicleSelection}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CabSelection;
