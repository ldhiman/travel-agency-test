"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { processTripData } from "../api/processTripData";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const libraries = ["places"];

const TripPlanner = () => {
  const [autocompleteSource, setAutocompleteSource] = useState(null);
  const [autocompleteDestination, setAutocompleteDestination] = useState(null);
  const [pickupDatetime, setPickupDatetime] = useState(null);
  const [returnDatetime, setReturnDatetime] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
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
        setSourceCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    } else if (field === "destination" && autocompleteDestination) {
      place = autocompleteDestination.getPlace();
      if (place && place.geometry) {
        setDestination(place.formatted_address || "");
        setDestinationCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
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
      return {
        ...baseOptions,
        types: ["local"],
        ...(userLocation && {
          location: new window.google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ),
          radius: 10000, // 10KM
        }),
      };
    }

    return {
      ...baseOptions,
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

  const handleExploreCabs = () => {
    // Validate source and destination
    if (!source) {
      setError("Source location is required.");
      return;
    }

    if (!destination) {
      setError("Destination location is required.");
      return;
    }

    if (!sourceCoords) {
      setError("Please Select Source Location from Given Options.");
      return;
    }

    if (!destinationCoords) {
      setError("Please Select Destination Location from Given Options.");
      return;
    }

    // Validate pickup datetime
    if (!pickupDatetime) {
      setError("Pickup date and time are required.");
      return;
    }

    const now = new Date();
    const minPickupDatetime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    if (pickupDatetime < minPickupDatetime) {
      setError("Pickup date and time must be at least 30 minutes from now.");
      return;
    }

    // Validate return datetime for ROUND TRIP
    if (tripType === "ROUND TRIP") {
      if (!returnDatetime) {
        setError("Return date and time are required for a round trip.");
        return;
      }

      if (returnDatetime <= pickupDatetime) {
        setError(
          "Return date and time must be later than the pickup date and time."
        );
        return;
      }
    }

    // If no errors, proceed with processing the trip data
    setError("");

    const tripData = {
      tripType,
      source,
      destination,
      pickupDatetime: pickupDatetime?.getTime(),
      sourceCoords,
      destinationCoords,
      ...(tripType === "ROUND TRIP" && {
        returnDatetime: returnDatetime?.getTime(),
      }),
    };

    console.log("Trip Data:", JSON.stringify(tripData, null, 2));
    processTripData(tripData);
  };

  const getMinTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 30 * 60000); // 30 minutes from now
  };

  const isValidDatetime = (datetime) => {
    if (!pickupDatetime) return true; // No date-time selected yet

    const minTime = new Date(pickupDatetime);
    minTime.setMinutes(minTime.getMinutes() + 30);

    return datetime >= minTime;
  };

  const handlePickupDateChange = (date) => {
    setPickupDatetime((prev) => {
      if (prev) {
        return new Date(date.setHours(prev.getHours(), prev.getMinutes()));
      }
      return new Date(date);
    });
  };

  const handlePickupTimeChange = (time) => {
    if (pickupDatetime) {
      const newDatetime = new Date(pickupDatetime);
      newDatetime.setHours(time.getHours());
      newDatetime.setMinutes(time.getMinutes());
      if (isValidDatetime(newDatetime)) {
        setPickupDatetime(newDatetime);
      } else {
        console.log("Selected time is less than 30 minutes from now.");
        setPickupDatetime(getMinTime());
      }
    }
  };

  const handleReturnDateChange = (date) => {
    setReturnDatetime((prev) => {
      if (prev) {
        return new Date(date.setHours(prev.getHours(), prev.getMinutes()));
      }
      return new Date(date);
    });
  };

  const handleReturnTimeChange = (time) => {
    if (returnDatetime) {
      const newDatetime = new Date(returnDatetime);
      newDatetime.setHours(time.getHours());
      newDatetime.setMinutes(time.getMinutes());
      if (isValidDatetime(newDatetime)) {
        setReturnDatetime(newDatetime);
      } else {
        console.log("Selected time is less than 30 minutes from now.");
        setReturnDatetime(getMinTime());
      }
    }
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
            value={pickupDatetime ? pickupDatetime : null}
            onChange={handlePickupDateChange}
            minDate={new Date()} // Disables past dates
          />

          <TimePickerField
            id="pickup-time-field"
            label="PICK UP TIME"
            value={pickupDatetime ? pickupDatetime : null}
            onChange={handlePickupTimeChange}
            disabled={!pickupDatetime} // Disable until date is selected
          />

          {tripType === "ROUND TRIP" && (
            <>
              <DatePickerField
                id="return-date-field"
                label="RETURN DATE"
                value={returnDatetime ? returnDatetime : null}
                minDate={
                  pickupDatetime
                    ? new Date(pickupDatetime.getTime())
                    : new Date()
                }
                onChange={handleReturnDateChange}
              />
              <TimePickerField
                id="return-time-field"
                label="RETURN TIME"
                value={returnDatetime ? returnDatetime : null}
                onChange={handleReturnTimeChange}
                disabled={!returnDatetime} // Disable until return date is selected
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

const DatePickerField = ({ id, label, value, onChange, minDate }) => (
  <div className="relative flex flex-col ml-4 md:w-full lg:w-full xl:w-3/4">
    <label htmlFor={id} className="leading-7 text-sm text-gray-600">
      {label}
    </label>
    <DatePicker
      value={value}
      onChange={(date) => {
        onChange(date);
      }}
      renderInput={(params) => <TextField {...params} fullWidth />}
      minDate={minDate}
      inputFormat="dd/MM/yyyy"
      placeholder={`Select ${label.toLowerCase()}`}
    />
  </div>
);

const TimePickerField = ({ id, label, value, onChange, disabled }) => (
  <div className="relative flex flex-col ml-4 md:w-full lg:w-full xl:w-3/4">
    <label htmlFor={id} className="leading-7 text-sm text-gray-600">
      {label}
    </label>
    <TimePicker
      value={value}
      onChange={onChange}
      renderInput={(params) => <TextField {...params} fullWidth />}
      disabled={disabled}
      ampm={true} // Optional: If you want to use 24-hour time format
    />
  </div>
);

export default TripPlanner;
