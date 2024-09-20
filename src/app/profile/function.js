import { ref, get, set } from "firebase/database";
import { db } from "../firebase";

// Fetch customer details from the database
export async function getCustomerDetails(customerId) {
  try {
    const customerRef = ref(db, `customers/${customerId}`);
    const snapshot = await get(customerRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error("Customer not found");
    }
  } catch (error) {
    console.error("Error getting customer details:", error);
    throw new Error("Failed to retrieve customer details");
  }
}

// Fetch the trip IDs associated with a customer
export async function getCustomerTripIds(customerId) {
  try {
    const customerRef = ref(db, `customers/${customerId}/trips`);
    const snapshot = await get(customerRef);
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    } else {
      throw new Error("No trips found for this customer");
    }
  } catch (error) {
    console.error("Error getting customer trip IDs:", error);
    throw new Error("Failed to retrieve customer trip IDs");
  }
}

export async function saveTripFeedback(Id, feedback) {
  console.log(Id, feedback);
  try {
    const tripfeedRef = ref(db, `feedbacks/trips/${Id}/${feedback.customerID}`);
    set(tripfeedRef, feedback);
  } catch (error) {
    console.error("Error getting customer trip IDs:", error);
    throw new Error("Failed to save feedback for trip");
  }
}

export const checkExistingFeedback = async (tripId, userId) => {
  try {
    const feedbackRef = ref(db, `feedbacks/trips/${tripId}/${userId}`);
    const snapshot = await get(feedbackRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking existing feedback:", error);
    return false;
  }
};

// Fetch driver details by ID
const fetchDriverDetail = async (id) => {
  try {
    const driverRef = ref(db, `drivers/${id}`);
    const snapshot = await get(driverRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null; // Return null if driver details not found
    }
  } catch (error) {
    console.error("Error fetching driver details:", error);
    return null; // Return null in case of an error
  }
};

// Fetch vehicle details by ID and number
const fetchVehicleDetail = async (id, number) => {
  try {
    const vehicleRef = ref(db, `vendors/${id}/vehicles/${number}`);
    const snapshot = await get(vehicleRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null; // Return null if vehicle details not found
    }
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    return null; // Return null in case of an error
  }
};

// Fetch trip details and associated driver and vehicle details
export async function getTripDetails(tripId) {
  try {
    const tripRef = ref(db, `trips/${tripId}`);
    const snapshot = await get(tripRef);
    if (snapshot.exists()) {
      const tripDetails = snapshot.val();
      const vehicleDetail = await fetchVehicleDetail(
        tripDetails.allocatedBidderID,
        tripDetails.vehicleID
      );
      const driverDetail = await fetchDriverDetail(tripDetails.driverID);
      return {
        ...tripDetails,
        driverDetail,
        vehicleDetail,
        Id: tripId, // Attach the trip ID to the trip details
      };
    } else {
      throw new Error("Trip not found");
    }
  } catch (error) {
    console.error("Error getting trip details:", error);
    throw new Error("Failed to retrieve trip details");
  }
}

// Update the status of a trip
export const updateTripStatus = async (id, status) => {
  try {
    const tripRef = ref(db, `trips/${id}/status`);
    await set(tripRef, status);
  } catch (error) {
    console.error("Error updating trip status:", error);
    throw new Error("Failed to update trip status");
  }
};
