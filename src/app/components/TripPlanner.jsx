"use client";

import React, { useEffect, useState } from "react";
import { useLoadScript, GoogleMap, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

const TripPlanner = () => {
  const [autocomplete, setAutocomplete] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    libraries,
  });

  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry != null) {
        console.log(place);
      } else if (place.name) {
        console.log("No details available for input: '" + place.name + "'");
      } else {
        console.log("Place details are not available.");
      }
    } else {
      console.log("Autocomplete is not loaded.");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row flex-wrap">
        <button className="inline-flex mx-2 my-2 text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded-xl text-lg">
          ONE WAY
        </button>
        <button className="inline-flex mx-2 my-2 text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded-md text-lg">
          ROUND TRIP
        </button>
        <button className="inline-flex mx-2 my-2 text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded-md text-lg">
          LOCAL
        </button>
        <button className="inline-flex mx-2 my-2 text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded-md text-lg">
          AIRPORT
        </button>
      </div>
      <div className="flex flex-col">
        <div className="relative ml-4 md:w-full lg:w-full xl:w-1/2 w-2/4">
          <label
            htmlFor="pickup-field"
            className="leading-7 text-sm text-gray-600"
          >
            PICK UP
          </label>
          <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              id="pickup-field"
              name="pickup-field"
              className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              placeholder="Search places"
            />
          </Autocomplete>
        </div>
        <div className="relative ml-4 md:w-full lg:w-full xl:w-1/2 w-2/4">
          <label
            htmlFor="destination-field"
            className="leading-7 text-sm text-gray-600"
          >
            DESTINATION
          </label>
          <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              id="destination-field"
              name="destination-field"
              className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </Autocomplete>
        </div>
        <div className="relative ml-4 md:w-full lg:w-full xl:w-1/2 w-2/4">
          <label
            htmlFor="pickup-date-field"
            className="leading-7 text-sm text-gray-600"
          >
            PICK UP DATE
          </label>
          <input
            type="text"
            id="pickup-date-field"
            name="pickup-date-field"
            className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div className="relative ml-4 md:w-full lg:w-full xl:w-1/2 w-2/4">
          <label
            htmlFor="return-date-field"
            className="leading-7 text-sm text-gray-600"
          >
            RETURN DATE
          </label>
          <input
            type="text"
            id="return-date-field"
            name="return-date-field"
            className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div className="relative ml-4 md:w-full lg:w-full xl:w-1/2 w-2/4">
          <label
            htmlFor="pickup-time-field"
            className="leading-7 text-sm text-gray-600"
          >
            PICK UP TIME
          </label>
          <input
            type="text"
            id="pickup-time-field"
            name="pickup-time-field"
            className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
      </div>

      <div className="flex justify-center py-2">
        <button className="inline-flex mx-2 text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded-md text-lg">
          EXPLORE CABS
        </button>
      </div>
    </div>
  );
};

export default TripPlanner;
