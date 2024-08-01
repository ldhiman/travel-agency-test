"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { isFuture, isAfter, setHours, setMinutes } from "date-fns";

const libraries = ["places"];

const TripPlanner = () => {
  const [autocompleteSource, setAutocompleteSource] = useState(null);
  const [autocompleteDestination, setAutocompleteDestination] = useState(null);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [pickupTime, setPickupTime] = useState(null);
  const [returnTime, setReturnTime] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState("ONE WAY");
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    libraries,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => console.error("Error getting user location:", error)
    );
  }, []);

  const onPlaceChanged = (field) => {
    let place;
    if (field === "source" && autocompleteSource) {
      place = autocompleteSource.getPlace();
      if (place && place.geometry) {
        setSource(place.formatted_address || "");
      }
    } else if (field === "destination" && autocompleteDestination) {
      place = autocompleteDestination.getPlace();
      if (place && place.geometry) {
        setDestination(place.formatted_address || "");
      }
    }
  };

  const getAutocompleteOptions = useCallback(() => {
    const baseOptions = {
      componentRestrictions: { country: "in" },
    };

    if (tripType === "AIRPORT") {
      return { ...baseOptions, types: ["airport"] };
    }

    if (tripType === "LOCAL") {
      return { ...baseOptions, types: ["local"] };
    }

    return {
      ...baseOptions,
      types: ["establishment"],
      ...(userLocation && {
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(
            userLocation.lat - 0.1,
            userLocation.lng - 0.1
          ),
          new window.google.maps.LatLng(
            userLocation.lat + 0.1,
            userLocation.lng + 0.1
          )
        ),
      }),
    };
  }, [tripType, userLocation]);

  const isFutureDate = (date) => date && isFuture(date);
  const isFutureDateTime = (date, time) => {
    if (!date || !time) return false;
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(time.getHours(), time.getMinutes());
    return isFuture(combinedDateTime);
  };

  const handleExploreCabs = () => {
    if (!source || !destination || !pickupDate || !pickupTime) {
      setError("Please fill in all required fields.");
      return;
    }

    if (tripType === "ROUND TRIP" && (!returnDate || !returnTime)) {
      setError("Please select a return date and time for round trip.");
      return;
    }

    if (!isFutureDate(pickupDate)) {
      setError("Pickup date must be in the future.");
      return;
    }

    if (!isFutureDateTime(pickupDate, pickupTime)) {
      setError("Pickup date and time must be in the future.");
      return;
    }

    if (tripType === "ROUND TRIP") {
      // Combine pickup date and time
      const pickupDateTime = setHours(
        setMinutes(pickupDate, pickupTime.getMinutes()),
        pickupTime.getHours()
      );

      // Check if return date and time are after pickup date and time
      const returnDateTime = setHours(
        setMinutes(returnDate, returnTime.getMinutes()),
        returnTime.getHours()
      );
      if (
        !isFuture(returnDateTime) ||
        !isAfter(returnDateTime, pickupDateTime)
      ) {
        setError("Return date and time must be after pickup date and time.");
        return;
      }
    }

    setError("");
    const tripData = {
      tripType,
      source,
      destination,
      pickupDate,
      pickupTime,
      returnDate: tripType === "ROUND TRIP" ? returnDate : undefined,
      returnTime: tripType === "ROUND TRIP" ? returnTime : undefined,
    };
    console.log("Trip Data:", JSON.stringify(tripData, null, 2));
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="flex flex-col p-4">
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
        )}
        <div className="flex flex-row flex-wrap">
          {["ONE WAY", "ROUND TRIP", "LOCAL", "AIRPORT"].map((type) => (
            <button
              key={type}
              onClick={() => setTripType(type)}
              className={`inline-flex mx-2 my-2 text-sm text-white border-0 py-1 px-4 rounded-full focus:outline-none shadow-md ${
                tripType === type
                  ? "bg-indigo-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          <AutocompleteField
            id="source-field"
            label="SOURCE"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onPlaceChanged={() => onPlaceChanged("source")}
            options={getAutocompleteOptions()}
            setAutocomplete={setAutocompleteSource}
          />
          <AutocompleteField
            id="destination-field"
            label="DESTINATION"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onPlaceChanged={() => onPlaceChanged("destination")}
            options={getAutocompleteOptions()}
            setAutocomplete={setAutocompleteDestination}
          />
          <DatePickerField
            id="pickup-date-field"
            label="PICK UP DATE"
            value={pickupDate}
            onChange={setPickupDate}
          />
          <TimePickerField
            id="pickup-time-field"
            label="PICK UP TIME"
            value={pickupTime}
            onChange={setPickupTime}
          />
          {tripType === "ROUND TRIP" && (
            <>
              <DatePickerField
                id="return-date-field"
                label="RETURN DATE"
                value={returnDate}
                onChange={setReturnDate}
              />
              <TimePickerField
                id="return-time-field"
                label="RETURN TIME"
                value={returnTime}
                onChange={setReturnTime}
              />
            </>
          )}
          <button
            onClick={handleExploreCabs}
            className="mt-4 inline-flex items-center text-white bg-indigo-600 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-700 rounded text-lg"
          >
            EXPLORE CABS
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
};

// Extracted Components
const AutocompleteField = ({
  id,
  label,
  value,
  onChange,
  onPlaceChanged,
  options,
  setAutocomplete,
}) => (
  <div className="relative ml-4 md:w-full lg:w-full xl:w-3/4">
    <label htmlFor={id} className="leading-7 text-sm text-gray-600">
      {label}
    </label>
    <Autocomplete
      onLoad={setAutocomplete}
      onPlaceChanged={onPlaceChanged}
      options={options}
    >
      <input
        type="text"
        id={id}
        className="w-full bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-base outline-none text-gray-700 py-3 px-4 leading-8 transition-colors duration-200 ease-in-out placeholder-gray-400"
        placeholder="Search places"
        value={value || ""}
        onChange={onChange}
      />
    </Autocomplete>
  </div>
);

const DatePickerField = ({ id, label, value, onChange }) => (
  <div className="relative ml-4 md:w-full lg:w-full xl:w-3/4">
    <label htmlFor={id} className="leading-7 text-sm text-gray-600">
      {label}
    </label>
    <DatePicker
      value={value}
      onChange={onChange}
      renderInput={(params) => <TextField {...params} fullWidth />}
      className="w-full"
      inputFormat="MM/dd/yyyy"
      placeholder={`Select ${label.toLowerCase()}`}
    />
  </div>
);

const TimePickerField = ({ id, label, value, onChange }) => (
  <div className="relative ml-4 md:w-full lg:w-full xl:w-3/4">
    <label htmlFor={id} className="leading-7 text-sm text-gray-600">
      {label}
    </label>
    <TimePicker
      value={value}
      onChange={onChange}
      renderInput={(params) => <TextField {...params} fullWidth />}
      className="w-full"
    />
  </div>
);

export default TripPlanner;
