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
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  Star,
  Shield,
  Zap,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";

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
  recommended = false,
  rating = 4.5, // Default rating
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(false);
  const [includeToll, setIncludeToll] = useState(true);
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const imageSrc = vehicleImages[type.toLowerCase()] || vehicleImages.sedan;
  const capacity = vehicleCapacity[type.toLowerCase()] || 4;

  useEffect(() => {
    if (recommended) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recommended]);

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

  const getAdjustedTotalFare = () => {
    const tollCost =
      fareDetails.tollTax && fareDetails.tollTax > 0 ? fareDetails.tollTax : 0;
    return includeToll
      ? fareDetails.totalFare
      : fareDetails.totalFare - tollCost;
  };

  const handleSelect = () => {
    setSelectedVehicle(true);
    onSelect(type, getAdjustedTotalFare(), includeToll);

    // Simulate a confirmation after 1 second
    setTimeout(() => {
      setSelectedVehicle(false);
    }, 1000);
  };

  // Create fare breakdown items as array for better rendering
  const getFareBreakdownItems = () => {
    const items = [];

    console.log(fareDetails);

    if (fareDetails.baseFare >= 0) {
      items.push({
        label: "Base Fare",
        value: fareDetails.baseFare.toFixed(2),
        highlight: false,
      });
    }

    if (fareDetails.driverAllowance >= 0) {
      items.push({
        label: "Driver Allowance",
        value: fareDetails.driverAllowance.toFixed(2),
        highlight: false,
      });
    }

    if (fareDetails.stateTax > 0) {
      items.push({
        label: "State Tax",
        value: fareDetails.stateTax.toFixed(2),
        highlight: false,
      });
    }

    if (fareDetails.tollTax && fareDetails.tollTax > 0) {
      items.push({
        label: "Toll Tax",
        value: includeToll ? fareDetails.tollTax.toFixed(2) : "0.00 (Excluded)",
        highlight: includeToll,
      });
    }

    if (fareDetails.nightDrop && fareDetails.nightDrop > 0) {
      items.push({
        label: "Night Drop",
        value: fareDetails.nightDrop.toFixed(2),
        highlight: false,
      });
    }

    if (fareDetails.extraCharge && tripType === "HOURLY RENTAL") {
      items.push({
        label: "Extra Hours",
        value: fareDetails.extraCharge.toFixed(2),
        highlight: false,
      });
    }

    if (fareDetails.gst >= 0) {
      items.push({
        label: "GST",
        value: fareDetails.gst.toFixed(2),
        highlight: false,
      });
    }

    return items;
  };

  // Get notes for the fare
  const getFareNotes = () => {
    const notes = [];

    if (fareDetails.stateTax <= 0) {
      notes.push("State Tax not included, if any paid by passenger");
    }

    if (!fareDetails.tollTax || fareDetails.tollTax <= 0) {
      notes.push("Toll Tax not included, if any paid by passenger");
    }

    if (tripType === "HOURLY RENTAL") {
      notes.push(
        "Extra km charged at ₹" + fareDetails.extraKmCharge + " per km"
      );
    }

    return notes;
  };

  // Function to render stars for rating
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} fill="currentColor" />
        ))}
        {hasHalfStar && (
          <span className="relative">
            <Star size={14} className="text-gray-300" fill="currentColor" />
            <Star
              size={14}
              className="absolute top-0 left-0 overflow-hidden w-1/2"
              fill="currentColor"
            />
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div
      className={`bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
        selectedVehicle ? "ring-4 ring-indigo-300" : ""
      } ${
        recommended
          ? `border-2 border-indigo-500 ${isAnimating ? "animate-pulse" : ""}`
          : "border-2 border-transparent"
      }`}
    >
      {recommended && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-1 px-4 text-center font-medium flex items-center justify-center">
          <Award className="mr-1" size={16} /> Best Choice for Your Trip
        </div>
      )}
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

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex justify-between items-center">
              <div className="text-white font-semibold">
                {formatVehicleType(type)}
              </div>
              {renderRatingStars(rating)}
            </div>
          </div>
        </div>
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {formatVehicleType(type)}
                </h3>
                <div className="flex space-x-2 text-xs text-gray-600">
                  <span className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
                    <MapPin className="mr-1" size={12} />
                    {distance}
                  </span>
                  <span className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
                    <Clock className="mr-1" size={12} />
                    {duration}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-indigo-600">
                  ₹{getAdjustedTotalFare().toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowFareBreakdown(!showFareBreakdown)}
                className="w-full flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700 flex items-center">
                  <DollarSign className="mr-2" size={16} />
                  Fare Breakdown
                </span>
                {showFareBreakdown ? (
                  <ChevronUp className="text-gray-600" size={18} />
                ) : (
                  <ChevronDown className="text-gray-600" size={18} />
                )}
              </button>

              {showFareBreakdown && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 animate-fadeIn">
                  <table className="w-full text-sm">
                    <tbody>
                      {getFareBreakdownItems().map((item, index) => (
                        <tr
                          key={index}
                          className={`${
                            item.highlight
                              ? "text-indigo-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          <td className="py-1">{item.label}</td>
                          <td className="py-1 text-right">₹{item.value}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-200">
                        <td className="py-2 font-bold">Total</td>
                        <td className="py-2 text-right font-bold">
                          ₹{getAdjustedTotalFare().toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {fareDetails.tollTax > 0 && (
              <div className="mb-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    includeToll
                      ? "bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-2 ${
                        includeToll ? "bg-indigo-100" : "bg-gray-200"
                      }`}
                    >
                      <CreditCard
                        className={`${
                          includeToll ? "text-indigo-600" : "text-gray-500"
                        }`}
                        size={16}
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-medium">
                        Toll Charges
                      </span>
                      <span className="text-xs text-gray-500">
                        ₹{fareDetails.tollTax.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={includeToll}
                      onChange={(e) => setIncludeToll(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      {includeToll ? "Included" : "Excluded"}
                    </span>
                  </label>
                </div>
              </div>
            )}
            {getFareNotes().length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle
                    className="mr-3 text-amber-600 flex-shrink-0 mt-0.5"
                    size={18}
                  />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-2">Important Notes:</p>
                    {getFareNotes().map((note, index) => (
                      <p key={index} className="mb-1">
                        • {note}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={handleSelect}
              className={`w-full py-3 px-6 rounded-lg shadow-md transition-all duration-300 font-semibold flex items-center justify-center ${
                selectedVehicle
                  ? "bg-green-500 text-white"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
            >
              {selectedVehicle ? (
                <>
                  <Check className="mr-2" size={18} />
                  Vehicle Selected!
                </>
              ) : (
                "Book This Vehicle"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TripDetailsCard = ({ tripData }) => {
  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Function to get time remaining until pickup
  const getTimeRemaining = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup - now;

    if (diffMs <= 0) return "Departing soon";

    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h remaining`;
    } else if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins} minutes remaining`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Trip Details</h2>
          <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            {tripData.tripType}
          </span>
        </div>
        {tripData.pickupDatetime && (
          <div className="mt-2 flex items-center text-white/80 text-sm">
            <Clock className="mr-1" size={14} />
            {getTimeRemaining(tripData.pickupDatetime)}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <MapPin className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
              <p className="font-medium">{tripData.source}</p>
            </div>
          </div>

          {tripData.destination && (
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <ArrowLeftRight className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Destination</p>
                <p className="font-medium">{tripData.destination}</p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <Calendar className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Pickup Date & Time</p>
              <p className="font-medium">
                {formatDateTime(tripData.pickupDatetime)}
              </p>
            </div>
          </div>

          {tripData.tripType === "HOURLY RENTAL" ? (
            <div className="flex items-start md:col-span-2">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rental Duration</p>
                <p className="font-medium">{tripData.hours} Hours</p>
              </div>
            </div>
          ) : (
            <>
              {tripData.distanceData?.distance && (
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <CarTaxiFront className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Distance</p>
                    <p className="font-medium">
                      {tripData.distanceData.distance}
                    </p>
                  </div>
                </div>
              )}

              {tripData.distanceData?.duration && (
                <div className="flex items-start md:col-span-2">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <Clock className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Estimated Duration
                    </p>
                    <p className="font-medium">
                      {tripData.distanceData.duration}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { VehicleCard, TripDetailsCard };
