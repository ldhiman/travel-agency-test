import React from "react";
import {
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  X,
  User,
  Star,
  BadgeIndianRupee,
  Navigation,
  MapPinned,
} from "lucide-react";

const formatDateTime = (pickupDatetime) => {
  const date = new Date(pickupDatetime);
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-IN", options).replace(/,/, ", ");
};

const formatStatus = (id) => {
  // Keep the existing formatStatus implementation from previous code
  switch (id) {
    case 100:
      return {
        text: "Awaiting Payment",
        color: "bg-blue-100 text-blue-600",
        canCancel: true,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 20,
      };
    case 101:
      return {
        text: "Booked",
        color: "bg-yellow-100 text-yellow-700",
        canCancel: true,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 10,
      };
    case 102:
      return {
        text: "Confirmed",
        color: "bg-green-100 text-green-700",
        canCancel: true,
        canFetchDetails: true,
        canLeaveFeedback: false,
        progress: 35,
      };
    case 103:
      return {
        text: "Picked Up",
        color: "bg-blue-100 text-blue-700",
        canCancel: false,
        canFetchDetails: true,
        canLeaveFeedback: false,
        progress: 50,
      };
    case 104:
      return {
        text: "Dropped",
        color: "bg-purple-100 text-purple-700",
        canCancel: false,
        canFetchDetails: true,
        canLeaveFeedback: false,
        progress: 70,
      };
    case 105:
      return {
        text: "Completed",
        color: "bg-purple-100 text-purple-800",
        canCancel: false,
        canFetchDetails: true,
        canLeaveFeedback: true,
        progress: 100,
      };
    case 201:
      return {
        text: "Cancelled",
        color: "bg-red-100 text-red-700",
        canCancel: false,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 0,
      };
    case 202:
      return {
        text: "Cancelled (No Vendor)",
        color: "bg-red-100 text-red-600",
        canCancel: false,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 0,
      };
    case 203:
      return {
        text: "Cancelled by Vendor",
        color: "bg-red-100 text-red-700",
        canCancel: false,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 0,
      };
    case 204:
      return {
        text: "Cancelled (Unpaid)",
        color: "bg-red-100 text-red-800",
        canCancel: false,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 0,
      };
    default:
      return {
        text: `Unknown (${id})`,
        color: "bg-gray-100 text-gray-600",
        canCancel: false,
        canFetchDetails: false,
        canLeaveFeedback: false,
        progress: 0,
      };
  }
};

const TripCard = ({ trip, onCancel, onDetails, onAdvanceFee, onFeedback }) => {
  const {
    text,
    color,
    canCancel,
    canFetchDetails,
    canLeaveFeedback,
    progress,
  } = formatStatus(trip.status);

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
      aria-label={`Trip ${trip.Id} details`}
    >
      {/* Header with Status */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-full">
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Trip ID: {trip.Id}
              {trip.tripType === "HOURLY RENTAL" && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Hourly Rental
                </span>
              )}
            </h3>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}
          aria-label={`Trip status: ${text}`}
        >
          {text}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        {/* Route Visualization */}
        <div className="relative">
          <div className="flex items-center h-12">
            <div className="absolute inset-x-0 h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: progress ? `${progress}%` : "0%" }}
                aria-label={`Trip progress: ${progress}%`}
              />
            </div>
            <div className="absolute left-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="absolute right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-700">
            <span
              className="truncate max-w-[45%] font-medium"
              title={trip.source}
            >
              {trip.source}
            </span>
            <span
              className="truncate max-w-[45%] text-right font-medium"
              title={
                trip.tripType === "HOURLY RENTAL"
                  ? `${trip.hours} hr`
                  : trip.destination
              }
            >
              {trip.tripType === "HOURLY RENTAL"
                ? `${trip.hours} hr`
                : trip.destination}
            </span>
          </div>
        </div>

        {/* Trip Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 text-blue-600 mr-2" />
              <span className="font-medium">Pickup:</span>{" "}
              {formatDateTime(trip.pickupDatetime)}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 text-purple-600 mr-2" />
              <span className="font-medium">Booked:</span>{" "}
              {formatDateTime(trip.bookedTime)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              <span className="font-medium">Total Cost:</span> ₹
              {parseFloat(trip.totalCost).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <BadgeIndianRupee className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="font-medium">Advance Paid:</span> ₹
              {(trip.paymentLink && trip.paymentLink.amount / 100) || "0.00"}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {trip.driver && (
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                {trip.driver.name}
              </p>
              <p className="text-xs text-gray-500">Assigned Driver</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {trip.status === 100 && (
            <button
              onClick={() => onAdvanceFee(trip)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 text-sm font-medium group-hover:translate-x-1 transform transition"
              aria-label="Pay and Confirm Trip"
            >
              <BadgeIndianRupee className="w-4 h-4 mr-2" />
              Pay & Confirm
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(trip.Id)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium group-hover:translate-x-1 transform transition"
              aria-label="Cancel Trip"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Trip
            </button>
          )}
          {canFetchDetails && (
            <button
              onClick={() => onDetails(trip)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium group-hover:translate-x-1 transform transition"
              aria-label="View Trip Details"
            >
              <User className="w-4 h-4 mr-2" />
              View Details
            </button>
          )}
          {canLeaveFeedback && (
            <button
              onClick={() => onFeedback(trip)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium group-hover:translate-x-1 transform transition"
              aria-label="Leave Trip Feedback"
            >
              <Star className="w-4 h-4 mr-2" />
              Leave Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
