import Image from "next/image";
import {
  Users,
  Info,
  TrendingUp,
  MapPin,
  ArrowLeftRight,
  Calendar,
  CarTaxiFront,
  Clock,
} from "lucide-react";
import { useState } from "react"; // Added useState import

const vehicleImages = {
  sedan: "/sedan.png",
  suv: "/suv.png",
  traveller12: "/traveller_1.png",
  traveller12_14: "/traveller_1.png",
  traveller16: "/traveller.png",
  dzire: "/dzire.png",
  compact: "/compact.png",
  innova: "/innova.png",
  innovacrysta: "/innovacrysta.png",
};

const vehicleCapacity = {
  sedan: 4,
  suv: 6,
  traveller12: 12,
  traveller12_14: 14,
  traveller16: 16,
  dzire: 4,
  compact: 4,
  innova: 7,
  innovacrysta: 7,
};

const VehicleCard = ({
  type,
  fareDetails,
  distance,
  duration,
  tripType,
  onSelect,
}) => {
  const imageSrc = vehicleImages[type.toLowerCase()] || vehicleImages.sedan;
  const capacity = vehicleCapacity[type.toLowerCase()] || 4;
  const [includeToll, setIncludeToll] = useState(true); // State for toll inclusion

  const formatVehicleType = (type) => {
    if (type.toLowerCase() === "traveller12_14")
      return "Traveller 12-14 Seater";
    if (type.toLowerCase() === "traveller12") return "Traveller 12 Seater";
    if (type.toLowerCase() === "traveller16") return "Traveller 16 Seater";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Calculate adjusted total fare based on toll inclusion
  const getAdjustedTotalFare = () => {
    const tollCost =
      fareDetails.tollTax && fareDetails.tollTax > 0 ? fareDetails.tollTax : 0;
    return includeToll
      ? fareDetails.totalFare
      : fareDetails.totalFare - tollCost;
  };

  const handleSelect = () => {
    onSelect(type, getAdjustedTotalFare(), includeToll); // Pass includeToll
  };

  // Create fare breakdown info string
  const getFareBreakdown = () => {
    const items = [];
    let note = "Note: ";
    if (fareDetails.baseFare >= 0)
      items.push(`Base Fare: ₹${fareDetails.baseFare.toFixed(2)}`);
    if (fareDetails.driverAllowance >= 0)
      items.push(
        `Driver Allowance: ₹${fareDetails.driverAllowance.toFixed(2)}`
      );
    if (fareDetails.stateTax > 0) {
      items.push(`State Tax: ₹${fareDetails.stateTax.toFixed(2)}`);
    } else {
      note += "State Tax not included!!\n";
    }
    if (fareDetails.tollTax && fareDetails.tollTax > 0) {
      if (includeToll) {
        items.push(`Toll Tax: ₹${fareDetails.tollTax.toFixed(2)}`);
      } else {
        items.push(`Toll Tax: ₹0.00 (Excluded)`);
      }
    } else {
      note += "Toll Tax not applicable!!\n";
    }
    if (fareDetails.nightDrop && fareDetails.nightDrop > 0)
      items.push(`Night Drop: ₹${fareDetails.nightDrop.toFixed(2)}`);
    if (fareDetails.extraCharge && tripType === "HOURLY RENTAL")
      items.push(`Extra Hours: ₹${fareDetails.extraCharge.toFixed(2)}`);
    if (fareDetails.gst >= 0) items.push(`GST: ₹${fareDetails.gst.toFixed(2)}`);
    return items.join("\n") + "\n\n" + note;
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 relative">
          <Image
            src={imageSrc}
            alt={`${type} vehicle`}
            layout="responsive"
            width={400}
            height={300}
            className="object-cover"
          />
          <div className="absolute top-0 left-0 bg-indigo-600 text-white px-3 py-1 rounded-br-lg">
            <Users className="inline-block mr-1" size={16} />
            {capacity} seats
          </div>
        </div>
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {formatVehicleType(type)}
              </h3>
              <p className="text-3xl font-semibold text-indigo-600">
                ₹{getAdjustedTotalFare().toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="mr-1" size={16} />
                {distance}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1" size={16} />
                {duration}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium text-gray-700 mb-2 flex items-center">
                <Info className="mr-2" size={16} />
                Fare Breakdown:
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {getFareBreakdown()}
              </p>
              {fareDetails.tollTax > 0 && (
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id={`toll-${type}`}
                    checked={includeToll}
                    onChange={(e) => setIncludeToll(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`toll-${type}`}
                    className="text-sm text-gray-700"
                  >
                    Include Toll Tax (₹{fareDetails.tollTax.toFixed(2)})
                  </label>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSelect}
            className="w-full bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-300"
          >
            Select This Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

// TripDetailsCard remains unchanged
const TripDetailsCard = ({ tripData }) => {
  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-8 p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Trip Details</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <TrendingUp className="mr-2 text-indigo-500" />
          <span className="font-semibold">{tripData.tripType}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 text-green-500" />
          <span className="truncate">{tripData.source}</span>
        </div>
        {tripData.destination && (
          <div className="flex items-center">
            <ArrowLeftRight className="mr-2 text-green-500" />
            <span className="truncate">{tripData.destination}</span>
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="mr-2 text-red-500" />
          <span>{formatDateTime(tripData.pickupDatetime)}</span>
        </div>
        {tripData.distanceData?.distance && (
          <div className="flex items-center">
            <CarTaxiFront className="mr-2 text-blue-500" />
            <span>{tripData.distanceData.distance}</span>
          </div>
        )}
        {tripData.distanceData?.duration && (
          <div className="flex items-center">
            <Clock className="mr-2 text-purple-500" />
            <span>{tripData.distanceData.duration}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { VehicleCard, TripDetailsCard };
