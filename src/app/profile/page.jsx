"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  getCustomerDetails,
  getCustomerTripIds,
  getTripDetails,
  updateTripStatus,
} from "./function";
import Modal from "../components/Modal";
import ConfirmationDialog from "../components/confirmCancellation";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [uid, setUid] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverDetails, setDriverDetails] = useState({});
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [tripToCancel, setTripToCancel] = useState(null);

  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState(
    "Loading your profile..."
  );

  const formatStatus = (id) => {
    switch (id) {
      case 101:
        return {
          text: "Booked",
          color: "text-yellow-600",
          canCancel: true,
          canFetchDetails: false,
        };
      case 102:
        return {
          text: "Confirmed",
          color: "text-green-600",
          canCancel: true,
          canFetchDetails: true,
        };
      case 103:
        return {
          text: "Picked Up",
          color: "text-blue-600",
          canCancel: false,
          canFetchDetails: true,
        };
      case 104:
        return {
          text: "Dropped",
          color: "text-purple-600",
          canCancel: false,
          canFetchDetails: true,
        };
      case 105:
        return {
          text: "Completed",
          color: "text-purple-700",
          canCancel: false,
          canFetchDetails: true,
        };
      case 201:
        return {
          text: "Cancelled",
          color: "text-red-600",
          canCancel: false,
          canFetchDetails: false,
        };
      case 202:
        return {
          text: "Cancelled (No Vendor Interested)",
          color: "text-red-500",
          canCancel: false,
          canFetchDetails: false,
        };
      case 203:
        return {
          text: "Cancelled By Vendor",
          color: "text-red-700",
          canCancel: false,
          canFetchDetails: false,
        };
      default:
        return {
          text: "Unknown Status",
          color: "text-gray-600",
          canCancel: false,
          canFetchDetails: false,
        };
    }
  };

  const handleCancel = async () => {
    try {
      await updateTripStatus(tripToCancel, 201);
      const tripIds = await getCustomerTripIds(uid);
      const tripDetails = await Promise.all(tripIds.map(getTripDetails));
      tripDetails.sort(
        (a, b) => new Date(b.bookedTime) - new Date(a.bookedTime)
      );
      setTrips(tripDetails);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setDriverDetails({});
    setVehicleDetails({});
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
      <div className="flex flex-col justify-center items-center h-screen max-h-80 bg-gradient-to-br from-gray-100 to-gray-200 p-8">
        <div className="w-full max-w-md">
          <p className="text-lg font-semibold text-gray-600 mb-4">
            {progressMessage}
          </p>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-teal-600 bg-teal-200">
                {progress}%
              </span>
            </div>
            <div className="flex-auto border-2 rounded-xl bg-gray-200">
              <div
                className="progress-bar h-2 rounded-xl bg-teal-500"
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );

  if (!customer)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <p className="text-lg font-semibold text-gray-600">
          No customer data available
        </p>
      </div>
    );

  return (
    <div className="p-8 w-auto md:mx-20 mx-3 bg-white shadow-lg rounded-xl border border-gray-300">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
          Your Profile
        </h2>
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Name:</span> {customer.name}
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Email:</span> {customer.email}
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Phone:</span> {customer.phone}
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Date of Birth:</span> {customer.dob}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
          Your Trip History
        </h2>
        {trips.length > 0 ? (
          <ul className="space-y-6">
            {trips.map((trip, index) => {
              const { text, color, canCancel, canFetchDetails } = formatStatus(
                trip.status
              );
              return (
                <li
                  key={index}
                  className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Trip ID: {trip.Id}
                  </h3>
                  <p className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">Source:</span> {trip.source}
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">Destination:</span>{" "}
                    {trip.destination}
                  </p>
                  <p className="text-lg mb-2">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className={`font-semibold ${color}`}>{text}</span>
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">Total Cost:</span>{" "}
                    {trip.totalCost}
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    <span className="font-semibold">Pickup Date/Time:</span>{" "}
                    {new Date(trip.pickupDatetime).toLocaleString()}
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    <span className="font-semibold">Booking Time:</span>{" "}
                    {new Date(trip.bookedTime).toLocaleString()}
                  </p>
                  <div className="flex space-x-4">
                    {canCancel && (
                      <button
                        onClick={() => openConfirmDialog(trip.Id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                      >
                        Cancel Trip
                      </button>
                    )}
                    {canFetchDetails && (
                      <button
                        onClick={() => handleFetchDetails(trip)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-lg text-gray-700 ml-5">You have no trips yet.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="relative">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Trip Details - {selectedTripId}
          </h3>
          {driverDetails && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Driver Details
              </h4>
              <div className="flex items-center space-x-4">
                <img
                  loading="lazy"
                  src={driverDetails.profile_picture}
                  onError={(e) => {
                    e.target.onerror = null; // Prevents looping in case fallback also fails
                    e.target.src =
                      "https://avatars.githubusercontent.com/u/26671790?v=4"; // Fallback URL
                  }}
                  alt="Driver"
                  className="w-16 h-16 object-cover rounded-full ring"
                />

                <div>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Name:</span>{" "}
                    {driverDetails.name}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Phone:</span>{" "}
                    {driverDetails.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
          {vehicleDetails && (
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Vehicle Information
              </h4>
              <div className="space-y-2">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Vehicle:</span>{" "}
                  {vehicleDetails.vehicleMake} ({vehicleDetails.vehicleModel}
                  {", "}
                  {vehicleDetails.vehicleColor})
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">License Plate:</span>{" "}
                  {vehicleDetails.vehicleNumber}
                </p>
                <div className="flex space-x-4">
                  {vehicleDetails.VEHICLE_FRONT && (
                    <img
                      loading="lazy"
                      src={vehicleDetails.VEHICLE_FRONT}
                      alt="Front View"
                      className="w-24 h-24 object-cover rounded-md border border-gray-300"
                    />
                  )}
                  {vehicleDetails.VEHICLE_BACK && (
                    <img
                      loading="lazy"
                      src={vehicleDetails.VEHICLE_BACK}
                      alt="Back View"
                      className="w-24 h-24 object-cover rounded-md border border-gray-300"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleCancel}
        message={`Are you sure you want to cancel Trip ID: ${tripToCancel}?`}
      />
    </div>
  );
};

export default ProfilePage;
