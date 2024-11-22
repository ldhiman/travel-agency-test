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
      default:
        return {
          text: "Unknown Status",
          color: "text-gray-600",
          canCancel: false,
          canFetchDetails: false,
          canLeaveFeedback: false,
        };
    }
  };

  const handleCancel = async () => {
    try {
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
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome!</h2>
          <p className="text-lg font-medium text-gray-700 mb-4">
            {progressMessage}
          </p>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-blue-600 bg-blue-200">
                {progress}%
              </span>
            </div>
            <div className="flex-auto border-2 rounded-xl bg-gray-200">
              <div
                className="progress-bar h-2 rounded-xl bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <p className="mt-4 text-gray-600">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );

  if (!customer)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-lg font-semibold text-gray-600">
            No customer data available
          </p>
          <p className="mt-4 text-gray-600">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-8 w-auto md:mx-auto max-w-4xl bg-white shadow-lg rounded-xl border border-gray-300">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-6 flex items-center">
          <User className="mr-2 h-8 w-8" /> Welcome, {customer.name}!
        </h2>
        <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
          <p className="text-lg text-gray-700 flex items-center">
            <Mail className="mr-2 h-5 w-5 text-blue-600" />
            <span className="font-semibold">Email:</span> {customer.email}
          </p>
          <p className="text-lg text-gray-700 flex items-center">
            <Phone className="mr-2 h-5 w-5 text-blue-600" />
            <span className="font-semibold">Phone:</span> {customer.phone}
          </p>
          <p className="text-lg text-gray-700 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-600" />
            <span className="font-semibold">Date of Birth:</span> {customer.dob}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">
          Trip Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">Total Trips</p>
            <p className="text-3xl font-bold text-blue-600">
              {statistics.totalTrips}
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">Average Cost</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{statistics.averageCost}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">Total Spent</p>
            <p className="text-3xl font-bold text-purple-600">
              ₹{statistics.totalSpent}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center">
          <MapPin className="mr-2 h-7 w-7" /> Your Trips
        </h2>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilter(e.target.value)}
              className="border rounded-md px-2 py-1"
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
            className="flex items-center border rounded-md px-3 py-1 hover:bg-gray-100"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="mr-2 h-5 w-5 text-gray-600" />
            ) : (
              <SortDesc className="mr-2 h-5 w-5 text-gray-600" />
            )}
            Sort by Date
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
                  className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-2xl font-semibold text-blue-800 mb-3 flex items-baseline">
                    <MapPin className="mr-2 h-6 w-6" /> Trip ID: {trip.Id}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg text-gray-700 mb-2 flex items-baseline">
                        <MapPin className="mr-2 h-5 w-5 text-green-600" />
                        <span className="font-semibold">From:</span>{" "}
                        {trip.source}
                      </p>
                      <p className="text-lg text-gray-700 mb-2 flex items-baseline">
                        <MapPin className="mr-2 h-5 w-5 text-red-600" />
                        <span className="font-semibold">To:</span>{" "}
                        {trip.destination}
                      </p>
                      <p className="text-lg mb-2 flex items-baseline">
                        <AlertCircle className="mr-2 h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Status:</span>{" "}
                        <span className={`font-semibold ${color} ml-1`}>
                          {text}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700 mb-2 flex items-baseline">
                        <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                        <span className="font-semibold">Cost:</span> Rs.{" "}
                        {trip.totalCost}
                      </p>
                      <p className="text-lg text-gray-700 mb-2 flex items-baseline">
                        <Clock className="mr-2 h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Pickup:</span>{" "}
                        {new Date(trip.pickupDatetime).toLocaleString()}
                      </p>
                      <p className="text-lg text-gray-700 mb-4 flex items-baseline">
                        <Clock className="mr-2 h-5 w-5 text-purple-600" />
                        <span className="font-semibold">Booked:</span>{" "}
                        {new Date(trip.bookedTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {trip.status === 100 && (
                      <button
                        onClick={() => handleAdvanceFee(trip)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
                      >
                        <BadgeIndianRupee className="mr-2 h-5 w-5" /> Pay &
                        Confirm Trip
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => openConfirmDialog(trip.Id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
                      >
                        <X className="mr-2 h-5 w-5" /> Cancel Trip
                      </button>
                    )}
                    {canFetchDetails && (
                      <button
                        onClick={() => handleFetchDetails(trip)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
                      >
                        <User className="mr-2 h-5 w-5" /> View Details
                      </button>
                    )}
                    {canLeaveFeedback && (
                      <button
                        onClick={() => openFeedbackModal(trip)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center"
                      >
                        <Star className="mr-2 h-5 w-5" /> Leave Feedback
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-4">
              No trips found matching the current filter.
            </p>
            <p className="text-lg text-blue-600">
              Try changing the filter or book a new trip!
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="relative p-6">
          <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
            <MapPin className="mr-2 h-6 w-6" /> Trip ID: {selectedTripId}
          </h3>
          {driverDetails && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <User className="mr-2 h-5 w-5" /> Your Driver
              </h4>
              <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-lg">
                <img
                  loading="lazy"
                  src={driverDetails.profile_picture}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://avatars.githubusercontent.com/u/26671790?v=4";
                  }}
                  alt="Driver"
                  className="w-20 h-20 object-cover rounded-full ring-2 ring-blue-500"
                />
                <div>
                  <p className="text-lg text-gray-700 flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Name:</span>{" "}
                    {driverDetails.name}
                  </p>
                  <p className="text-lg text-gray-700 flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Phone:</span>{" "}
                    {driverDetails.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
          {vehicleDetails && (
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <MapPin className="mr-2 h-5 w-5" /> Vehicle Information
              </h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-lg text-gray-700 flex items-center">
                  <span className="font-semibold">Vehicle:</span>{" "}
                  {vehicleDetails.vehicleMake} {vehicleDetails.vehicleModel}
                </p>
                <p className="text-lg text-gray-700 flex items-center">
                  <span className="font-semibold">Color:</span>{" "}
                  {vehicleDetails.vehicleColor}
                </p>
                <p className="text-lg text-gray-700 flex items-center">
                  <span className="font-semibold">License Plate:</span>{" "}
                  {vehicleDetails.vehicleNumber}
                </p>
                <div className="flex space-x-4 mt-4">
                  {vehicleDetails.VEHICLE_FRONT && (
                    <img
                      loading="lazy"
                      src={vehicleDetails.VEHICLE_FRONT}
                      alt="Front View"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                  )}
                  {vehicleDetails.VEHICLE_BACK && (
                    <img
                      loading="lazy"
                      src={vehicleDetails.VEHICLE_BACK}
                      alt="Back View"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </Modal>

      <Modal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal}>
        <div className="p-6">
          <h3 className="text-2xl font-semibold text-blue-800 mb-4">
            Leave Feedback
          </h3>
          <p className="mb-4">Trip ID: {tripForFeedback?.Id}</p>
          <div className="mb-4">
            <p className="mb-2">Rating:</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= feedback.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() =>
                    setFeedback({ ...feedback, rating: star, customerID: uid })
                  }
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block mb-2">
              Comment:
            </label>
            <textarea
              id="comment"
              className="w-full p-2 border rounded"
              rows="4"
              value={feedback.comment}
              onChange={(e) =>
                setFeedback({ ...feedback, comment: e.target.value })
              }
            ></textarea>
          </div>
          <button
            onClick={handleFeedbackSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
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
  );
};

export default ProfilePage;
