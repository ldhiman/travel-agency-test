"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  getCustomerDetails,
  getCustomerTripIds,
  getTripDetails,
  updateTripStatus,
  saveTripFeedback,
  checkExistingFeedback,
} from "./function";
import Modal from "../components/Modal";
import ConfirmationDialog from "../components/confirmCancellation";
import toast from "react-hot-toast";
import {
  Loader2,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  BadgeIndianRupee,
} from "lucide-react";

const ProfilePage = () => {
  const [uid, setUid] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverDetails, setDriverDetails] = useState({});
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [tripToCancel, setTripToCancel] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [statistics, setStatistics] = useState({
    totalTrips: 0,
    averageCost: 0,
    totalSpent: 0,
  });
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: "",
    customerID: "",
  });
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [tripForFeedback, setTripForFeedback] = useState(null);

  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState(
    "Loading your profile..."
  );

  const formatDateTime = (pickupDatetime) => {
    const date = new Date(pickupDatetime);
    const options = {
      day: "2-digit", // DD (e.g., "18")
      month: "short", // MMM (e.g., "Mar")
      year: "numeric", // YYYY (e.g., "2025")
      hour: "2-digit", // HH (e.g., "03")
      minute: "2-digit", // MM (e.g., "30")
      hour12: true, // A (e.g., "PM")
    };
    return date.toLocaleString("en-IN", options).replace(/,/, ", "); // e.g., "18 Mar 2025, 03:30 PM"
  };

  const formatStatus = (id) => {
    switch (id) {
      case 100:
        return {
          text: "Pay Trip Confirmation Fee",
          color: "text-blue-600",
          canCancel: true,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
      case 101:
        return {
          text: "Booked",
          color: "text-yellow-600",
          canCancel: true,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
      case 102:
        return {
          text: "Confirmed",
          color: "text-green-600",
          canCancel: true,
          canFetchDetails: true,
          canLeaveFeedback: false,
        };
      case 103:
        return {
          text: "Picked Up",
          color: "text-blue-600",
          canCancel: false,
          canFetchDetails: true,
          canLeaveFeedback: false,
        };
      case 104:
        return {
          text: "Dropped",
          color: "text-purple-600",
          canCancel: false,
          canFetchDetails: true,
          canLeaveFeedback: false,
        };
      case 105:
        return {
          text: "Completed",
          color: "text-purple-700",
          canCancel: false,
          canFetchDetails: true,
          canLeaveFeedback: true,
        };
      case 201:
        return {
          text: "Cancelled",
          color: "text-red-600",
          canCancel: false,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
      case 202:
        return {
          text: "Cancelled (No Vendor Interested)",
          color: "text-red-500",
          canCancel: false,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
      case 203:
        return {
          text: "Cancelled By Vendor",
          color: "text-red-700",
          canCancel: false,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
      case 204:
        return {
          text: "Cancelled - Confirmation Fee not Paid",
          color: "text-red-700",
          canCancel: false,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
      default:
        return {
          text: `Unknown Status (${id})`,
          color: "text-gray-600",
          canCancel: false,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
    }
  };

  const handleCancel = async () => {
    try {
      const trip = trips.find((trip) => trip.Id === tripToCancel);
      if (!trip) {
        toast.error("Trip not found");
        return;
      }
      if (trip.pickupDatetime - 60 * 60 * 1000 > Date.now()) {
        toast.error(
          "Trip can be canceled only up to 1 hour before pickup time"
        );
        return;
      }
      await updateTripStatus(tripToCancel, 201);
      const updatedTrips = trips.map((trip) =>
        trip.Id === tripToCancel ? { ...trip, status: 201 } : trip
      );
      setTrips(updatedTrips);
      applyFilterAndSort(updatedTrips);
      closeConfirmDialog();
      toast.success("Your trip has been canceled.");
    } catch (error) {
      console.log(error);
      toast.error("There was an issue canceling the trip.");
      closeConfirmDialog();
    }
  };

  const handleFetchDetails = async (trip) => {
    try {
      if (trip.driverDetail) setDriverDetails(trip.driverDetail);
      if (trip.vehicleDetail) setVehicleDetails(trip.vehicleDetail);
      setSelectedTripId(trip.Id);
      setIsModalOpen(true);
    } catch (error) {
      setError("Failed to fetch trip details.");
    }
  };

  const handleAdvanceFee = async (trip) => {
    try {
      if (trip.paymentLink && trip.paymentLink.short_url) {
        window.open(trip.paymentLink.short_url, "_blank");
      } else {
        toast.error("Some Error Occur!!");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong!!");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDriverDetails({});
    setVehicleDetails({});
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    applyFilterAndSort(trips, filterStatus, newOrder);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    applyFilterAndSort(trips, status, sortOrder);
  };

  const applyFilterAndSort = (
    trips,
    status = filterStatus,
    order = sortOrder
  ) => {
    let filtered = trips;
    if (status !== "all") {
      if (status !== "all") {
        if (status === "201, 202, 203") {
          // Filter for cancelled trips
          filtered = trips.filter((trip) =>
            [201, 202, 203].includes(trip.status)
          );
        } else {
          // Filter for other statuses
          filtered = trips.filter((trip) => trip.status === parseInt(status));
        }
      }
    }
    const sorted = [...filtered].sort((a, b) => {
      return order === "asc"
        ? new Date(a.bookedTime) - new Date(b.bookedTime)
        : new Date(b.bookedTime) - new Date(a.bookedTime);
    });
    setFilteredTrips(sorted);
  };

  const calculateStatistics = (trips) => {
    const activeTrips = trips.filter(
      (trip) => ![201, 202, 203].includes(trip.status)
    );
    const totalTrips = activeTrips.length;
    const totalSpent = activeTrips.reduce(
      (sum, trip) => sum + parseFloat(trip.totalCost),
      0
    );
    const averageCost = totalTrips > 0 ? totalSpent / totalTrips : 0;

    setStatistics({
      totalTrips,
      averageCost: averageCost.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
    });
  };

  const openFeedbackModal = async (trip) => {
    const feedbackExists = await checkExistingFeedback(trip.Id, uid);
    if (feedbackExists) {
      toast("You have already submitted feedback for this trip.");
      return;
    }
    setTripForFeedback(trip);
    setFeedback({ rating: 0, comment: "" });
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setTripForFeedback(null);
  };

  const handleFeedbackSubmit = async () => {
    try {
      await saveTripFeedback(tripForFeedback.Id, feedback);
      toast.success("Thank you for your feedback!");
      closeFeedbackModal();
    } catch (error) {
      console.log(error);
      toast.error("There was an issue submitting your feedback.");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        try {
          setProgress(10);
          setProgressMessage("Loading customer information...");
          const customerDetails = await getCustomerDetails(user.uid);
          setCustomer(customerDetails);

          setProgress(50);
          setProgressMessage("Loading trip information...");
          const tripIds = await getCustomerTripIds(user.uid);
          const tripDetails = await Promise.all(tripIds.map(getTripDetails));
          tripDetails.sort(
            (a, b) => new Date(b.bookedTime) - new Date(a.bookedTime)
          );
          setTrips(tripDetails);
          applyFilterAndSort(tripDetails);
          calculateStatistics(tripDetails);

          setProgress(100);
          setProgressMessage("All data loaded.");
        } catch (error) {
          console.log(error);
          setError("Error loading data.");
        } finally {
          setLoading(false);
        }
      } else {
        toast.error("Please log in to continue.");
        setError("Login required.");
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const openConfirmDialog = (tripId) => {
    setTripToCancel(tripId);
    setIsConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setTripToCancel(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            {progressMessage}
          </h2>
          <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            {progress}% Complete
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-700 text-center">
            {error}
          </p>
          <p className="mt-2 text-gray-600 text-center">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
          <User className="w-10 h-10 text-gray-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 text-center">
            No customer data available
          </p>
          <p className="mt-2 text-gray-600 text-center">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Profile Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="w-8 h-8 text-indigo-600 mr-3" />
            Welcome, {customer.name}!
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50 p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-800">
                  {customer.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base font-medium text-gray-800">
                  {customer.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-base font-medium text-gray-800">
                  {customer.dob}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Trip Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-100 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-indigo-700">
                {statistics.totalTrips}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">Average Cost</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{statistics.averageCost}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-purple-700">
                ₹{statistics.totalSpent}
              </p>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="w-6 h-6 text-indigo-600 mr-2" /> Your Trips
          </h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="101">Booked</option>
                <option value="102">Confirmed</option>
                <option value="103">Picked Up</option>
                <option value="104">Dropped</option>
                <option value="105">Completed</option>
                <option value="201, 202, 203">Cancelled</option>
              </select>
            </div>
            <button
              onClick={handleSort}
              className="flex items-center space-x-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
              <span>Sort by Date</span>
            </button>
          </div>

          {filteredTrips.length > 0 ? (
            <ul className="space-y-6">
              {filteredTrips.map((trip, index) => {
                const {
                  text,
                  color,
                  canCancel,
                  canFetchDetails,
                  canLeaveFeedback,
                } = formatStatus(trip.status);
                return (
                  <li
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <MapPin className="w-5 h-5 text-indigo-600 mr-2" /> Trip
                        ID: {trip.Id}
                      </h3>
                      <span className={`text-sm font-medium ${color}`}>
                        {text}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 text-green-600 mr-2" />{" "}
                          <strong>From:</strong>&nbsp; {trip.source}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 text-red-600 mr-2" />{" "}
                          <strong>
                            {trip.tripType === "HOURLY RENTAL"
                              ? "Duration:"
                              : "To:"}
                          </strong>
                          &nbsp;
                          {trip.tripType === "HOURLY RENTAL"
                            ? `${trip.hours} hour`
                            : trip.destination}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 text-blue-600 mr-2" />{" "}
                          <strong>Pickup:</strong>&nbsp;
                          {formatDateTime(trip.pickupDatetime)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 mr-2" />{" "}
                          <strong>Cost:</strong>&nbsp;₹
                          {parseFloat(trip.totalCost).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 text-purple-600 mr-2" />{" "}
                          <strong>Booked:</strong>&nbsp;
                          {formatDateTime(trip.bookedTime)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {trip.status === 100 && (
                        <button
                          onClick={() => handleAdvanceFee(trip)}
                          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          <BadgeIndianRupee className="w-4 h-4 mr-2" /> Pay &
                          Confirm
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => openConfirmDialog(trip.Id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </button>
                      )}
                      {canFetchDetails && (
                        <button
                          onClick={() => handleFetchDetails(trip)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <User className="w-4 h-4 mr-2" /> Details
                        </button>
                      )}
                      {canLeaveFeedback && (
                        <button
                          onClick={() => openFeedbackModal(trip)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <Star className="w-4 h-4 mr-2" /> Feedback
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-xl">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No trips found.</p>
              <p className="text-sm text-indigo-600 mt-2">
                Try adjusting the filters or book a new trip!
              </p>
            </div>
          )}
        </div>

        {/* Trip Details Modal */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <button
            onClick={closeModal}
            className="top-4 right-4 p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 text-indigo-600 mr-2" /> Trip ID:{" "}
              {selectedTripId}
            </h3>
            {driverDetails.name && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Driver Details
                </h4>
                <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <img
                    src={
                      driverDetails.profile_picture ||
                      "https://via.placeholder.com/80"
                    }
                    alt="Driver"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Name:</strong> {driverDetails.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {driverDetails.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {vehicleDetails.vehicleMake && (
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Vehicle Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Vehicle:</strong> {vehicleDetails.vehicleMake}{" "}
                    {vehicleDetails.vehicleModel}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Color:</strong> {vehicleDetails.vehicleColor}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>License Plate:</strong>{" "}
                    {vehicleDetails.vehicleNumber}
                  </p>
                  <div className="flex gap-4 mt-2">
                    {vehicleDetails.VEHICLE_FRONT && (
                      <img
                        src={vehicleDetails.VEHICLE_FRONT}
                        alt="Front"
                        className="w-24 h-24 rounded-md object-cover"
                      />
                    )}
                    {vehicleDetails.VEHICLE_BACK && (
                      <img
                        src={vehicleDetails.VEHICLE_BACK}
                        alt="Back"
                        className="w-24 h-24 rounded-md object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Feedback Modal */}
        <Modal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal}>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Leave Feedback
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Trip ID: {tripForFeedback?.Id}
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= feedback.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                    onClick={() =>
                      setFeedback({
                        ...feedback,
                        rating: star,
                        customerID: uid,
                      })
                    }
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="comment"
                className="block text-sm text-gray-600 mb-2"
              >
                Comment
              </label>
              <textarea
                id="comment"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                value={feedback.comment}
                onChange={(e) =>
                  setFeedback({ ...feedback, comment: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleFeedbackSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Submit Feedback
            </button>
          </div>
        </Modal>

        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={closeConfirmDialog}
          onConfirm={handleCancel}
          message={`Are you sure you want to cancel Trip ${tripToCancel}? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
