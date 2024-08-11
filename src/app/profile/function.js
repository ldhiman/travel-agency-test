// firebaseFunctions.js
import { ref,get } from "firebase/database";
import { db } from "../firebase"

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
    throw error;
  }
}

export async function getCustomerTripIds(customerId) {
  try {
    const customerRef = ref(db, `customers/${customerId}/trips`);
    const snapshot = await get(customerRef);
    if (snapshot.exists()) {
      const tripIds = Object.keys(snapshot.val());
      return tripIds;
    } else {
      throw new Error("No trips found for this customer");
    }
  } catch (error) {
    console.error("Error getting customer trip IDs:", error);
    throw error;
  }
}

export async function getTripDetails(tripId) {
  try {
    const tripRef = ref(db, `trips/${tripId}`);
    const snapshot = await get(tripRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error("Trip not found");
    }
  } catch (error) {
    console.error("Error getting trip details:", error);
    throw error;
  }
}
