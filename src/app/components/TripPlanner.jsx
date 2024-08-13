"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { processTripData } from "../api/processTripData";
import {
  useLoadScript,
  Autocomplete,
  Marker,
  GoogleMap,
} from "@react-google-maps/api";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import MyLocationIcon from "@mui/icons-material/MyLocation"; // Icon for current location
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

const libraries = ["places"];
const center = { lat: 20.5937, lng: 78.9629 }; // Default center

const TripPlanner = () => {
  const [pickupDatetime, setPickupDatetime] = useState(null);
  const [returnDatetime, setReturnDatetime] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [sourceLocationName, setSourceLocationName] = useState("");
  const [destinationLocationName, setDestinationLocationName] = useState("");
  const [tripType, setTripType] = useState("ONE WAY");
  const [userLocation, setUserLocation] = useState(center);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(null);
  const [sourceAutocomplete, setSourceAutocomplete] = useState(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [loading, setLoading] = useState(false); // Add state for loading

  const router = useRouter();

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

  const getAddressFromCoords = useCallback((coords, callback) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback(results[0].formatted_address);
      } else {
        callback("Unknown location");
      }
    });
  }, []);

  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    let toastID = toast.loading("Selecting Location..");
    getAddressFromCoords(coords, (address) => {
      toast.success(`Location Selected!!`);
      toast.dismiss(toastID);
      setSelectedAddress(address);
      setSelectedLocation(coords);
      if (currentMapType === "source") {
        setSourceCoords(coords);
        setSourceLocationName(address);
        setSource(address);
      } else if (currentMapType === "destination") {
        setDestinationCoords(coords);
        setDestinationLocationName(address);
        setDestination(address);
      }
      setIsDialogOpen(true); // Open the dialog
      // setMapOpen(false); // Close the map modal after selection
    });
  };

  const openMapModal = (type) => {
    setCurrentMapType(type);
    setMapOpen(true);
  };

  const handleExploreCabs = async () => {
    if (!sourceCoords) {
      setError("Source location is required.");
      return;
    }

    if (!destinationCoords) {
      setError("Destination location is required.");
      return;
    }

    if (!pickupDatetime) {
      setError("Pickup date and time are required.");
      return;
    }

    const now = new Date();
    const minPickupDatetime = new Date(now.getTime() + 30 * 60000);

    if (pickupDatetime < minPickupDatetime) {
      setError("Pickup date and time must be at least 30 minutes from now.");
      return;
    }

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

    setError("");
    setLoading(true); // Set loading to true

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

    console.log("Trip Data:", JSON.stringify(tripData));
    try {
      const distanceData = await processTripData(tripData);

      // Check for errors
      if (distanceData.error) {
        toast.error(distanceData.error);
        console.error(distanceData.error);
        setError(distanceData.error);
        return;
      }

      // Add distance data to the trip data
      const completeTripData = {
        ...tripData,
        distanceData: distanceData, // Assuming distanceData contains the details you need
      };
      router.push(
        "/cabSelection?" +
          new URLSearchParams({ data: btoa(JSON.stringify(completeTripData)) })
      );
    } catch (error) {
      toast.error("An error occurred while processing the trip.");
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const getMinTime = () => new Date(new Date().getTime() + 30 * 60000);

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

      const minPickupDatetime = getMinTime();
      if (newDatetime < minPickupDatetime) {
        setPickupDatetime(minPickupDatetime);
      } else {
        setPickupDatetime(newDatetime);
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

      if (newDatetime <= pickupDatetime) {
        setReturnDatetime(new Date(pickupDatetime.getTime() + 30 * 60000));
      } else {
        setReturnDatetime(newDatetime);
      }
    }
  };

  const handleCurrentLocationClick = () => {
    if (mapRef) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Pan to the new location with animation
            mapRef.panTo(newLocation);
            mapRef.setZoom(15); // Optionally adjust zoom level

            // Update user location
            setUserLocation(newLocation);

            // Add or update marker
            if (currentLocationMarker) {
              currentLocationMarker.setPosition(newLocation);
            } else {
              const marker = new window.google.maps.Marker({
                position: newLocation,
                map: mapRef,
                title: "Your Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/POI.png", // Optional: custom icon
              });
              setCurrentLocationMarker(marker);
            }
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              alert("Location access denied. Please enable location services.");
            } else {
              console.error("Error getting user location:", error.message);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    }
  };

  if (!isLoaded) return <div className="text-center p-4">Loading...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="p-6">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <div className="flex mb-6">
          {["ONE WAY", "ROUND TRIP", "LOCAL", "AIRPORT"].map((type) => (
            <button
              key={type}
              onClick={() => setTripType(type)}
              className={`mx-2 my-2 py-2 px-4 rounded-full text-white font-small focus:outline-none shadow-md ${
                tripType === type
                  ? "bg-indigo-700"
                  : "bg-indigo-400 hover:bg-indigo-500"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="relative mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SOURCE
            </label>
            <div className="flex items-center w-full">
              <Autocomplete
                onLoad={setSourceAutocomplete}
                onPlaceChanged={() => {
                  if (sourceAutocomplete) {
                    const place = sourceAutocomplete.getPlace();
                    if (place && place.geometry) {
                      setSource(place.formatted_address || "");
                      setSourceCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      });
                      setSourceLocationName(place.formatted_address || "");
                    }
                  }
                }}
                options={getAutocompleteOptions()}
              >
                <TextField
                  className="w-full"
                  placeholder="Search for source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </Autocomplete>
              {tripType !== "AIRPORT" && (
                <IconButton
                  onClick={() => openMapModal("source")}
                  color="primary"
                >
                  <LocationOnIcon />
                </IconButton>
              )}
            </div>
            {sourceLocationName && (
              <div className="mt-2 text-sm text-gray-500">
                {sourceLocationName}
              </div>
            )}
          </div>

          <div className="relative mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DESTINATION
            </label>
            <div className="flex items-center w-full">
              <Autocomplete
                onLoad={setDestinationAutocomplete}
                onPlaceChanged={() => {
                  if (destinationAutocomplete) {
                    const place = destinationAutocomplete.getPlace();
                    if (place && place.geometry) {
                      setDestination(place.formatted_address || "");
                      setDestinationCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      });
                      setDestinationLocationName(place.formatted_address || "");
                    }
                  }
                }}
                options={getAutocompleteOptions()}
              >
                <TextField
                  className="w-full"
                  placeholder="Search for destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </Autocomplete>
              <IconButton
                onClick={() => openMapModal("destination")}
                color="primary"
              >
                <LocationOnIcon />
              </IconButton>
            </div>
            {destinationLocationName && (
              <div className="mt-2 text-sm text-gray-500">
                {destinationLocationName}
              </div>
            )}
          </div>

          <DatePickerField
            id="pickup-date-field"
            label="PICK UP DATE"
            value={pickupDatetime}
            onChange={handlePickupDateChange}
            minDate={new Date()} // Disables past dates
          />

          <TimePickerField
            id="pickup-time-field"
            label="PICK UP TIME"
            onChange={handlePickupTimeChange}
            disabled={!pickupDatetime} // Disable until date is selected
          />

          {tripType === "ROUND TRIP" && (
            <>
              <DatePickerField
                id="return-date-field"
                label="RETURN DATE"
                value={returnDatetime}
                onChange={handleReturnDateChange}
                minDate={pickupDatetime ? pickupDatetime : new Date()} // Min date should be pickup date
              />
              <TimePickerField
                id="return-time-field"
                label="RETURN TIME"
                onChange={handleReturnTimeChange}
                disabled={!returnDatetime} // Disable until return date is selected
              />
            </>
          )}

          <button
            onClick={handleExploreCabs}
            className="mt-6 py-2 px-4 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:outline-none"
          >
            EXPLORE CABS
          </button>
        </div>

        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="flex items-center justify-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-gray-200 border-solid rounded-full animate-spin opacity-50"></div>
              </div>
              <p className="text-white text-lg font-semibold">Loading...</p>
            </div>
          </div>
        )}

        <Modal
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          aria-labelledby="map-modal-title"
          aria-describedby="map-modal-description"
        >
          <div className="w-full h-full bg-white p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 id="map-modal-title" className="text-lg font-semibold">
                Select Location on Map
              </h2>
              <IconButton onClick={() => setMapOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <div className="w-full h-[90%]">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={
                  currentMapType === "source"
                    ? sourceCoords || userLocation
                    : destinationCoords || userLocation
                }
                zoom={13}
                onClick={handleMapClick}
                onLoad={(map) => setMapRef(map)}
              >
                {sourceCoords && (
                  <Marker
                    position={sourceCoords}
                    icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    title="Source"
                  />
                )}
                {destinationCoords && (
                  <Marker
                    position={destinationCoords}
                    icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    title="Destination"
                  />
                )}
                <button
                  onClick={handleCurrentLocationClick}
                  className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md border border-gray-300"
                >
                  <MyLocationIcon />
                </button>
              </GoogleMap>
            </div>
          </div>
        </Modal>
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          aria-labelledby="confirm-location-dialog-title"
          aria-describedby="confirm-location-dialog-description"
        >
          <DialogTitle id="confirm-location-dialog-title">
            Confirm Location
          </DialogTitle>
          <DialogContent>
            <p>Address: {selectedAddress}</p>
            <p>Latitude: {selectedLocation?.lat}</p>
            <p>Longitude: {selectedLocation?.lng}</p>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setMapOpen(false);
                setIsDialogOpen(false); // Close the dialog
              }}
              color="primary"
            >
              Confirm
            </Button>
            <Button onClick={() => setIsDialogOpen(false)} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

const DatePickerField = ({ id, label, value, onChange, minDate }) => (
  <div className="relative mb-4 w-full">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <DatePicker
      id={id}
      value={value}
      onChange={onChange}
      minDate={minDate}
      renderInput={(params) => <TextField {...params} fullWidth />}
    />
  </div>
);

const TimePickerField = ({ id, label, onChange, disabled }) => (
  <div className="relative mb-4 w-full">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <TimePicker
      id={id}
      onChange={onChange}
      disabled={disabled}
      renderInput={(params) => <TextField {...params} fullWidth />}
    />
  </div>
);

const getAutocompleteOptions = () => ({
  types: ["geocode"],
  componentRestrictions: { country: "in" }, // Set your desired country code
});

export default TripPlanner;
