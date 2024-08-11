'use client'

// pages/profile/[customerId].js
import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import {
  getCustomerDetails,
  getCustomerTripIds,
  getTripDetails,
} from "../../app/profile/function";

const ProfilePage = () => {
  const customerId = useAuth();

  const [customer, setCustomer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      const fetchData = async () => {
        try {
          const customerDetails = await getCustomerDetails(customerId.uid);
          setCustomer(customerDetails);

          const tripIds = await getCustomerTripIds(customerId.uid);
          const tripDetails = await Promise.all(tripIds.map(getTripDetails));

          setTrips(tripDetails);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [customerId]);

  if (loading) return <p>Loading...</p>;

  if (!customer) return <p>No customer found</p>;

  return (
    <div>
      <h1>Profile Page</h1>
      <h2>Customer Details</h2>
      <p>
        <strong>Name:</strong> {customer.name}
      </p>
      <p>
        <strong>Email:</strong> {customer.email}
      </p>
      <p>
        <strong>Phone:</strong> {customer.phone}
      </p>
      <p>
        <strong>Date of Birth:</strong> {customer.dob}
      </p>

      <h2>Trips</h2>
      {trips.length > 0 ? (
        <ul>
          {trips.map((trip, index) => (
            <li key={index}>
              <h3>Trip {index + 1}</h3>
              <p>
                <strong>Source:</strong> {trip.source}
              </p>
              <p>
                <strong>Destination:</strong> {trip.destination}
              </p>
              <p>
                <strong>Total Cost:</strong> {trip.totalCost}
              </p>
              <p>
                <strong>Pickup Date/Time:</strong>{" "}
                {new Date(trip.pickupDatetime).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No trips found</p>
      )}
    </div>
  );
};

export default ProfilePage;
