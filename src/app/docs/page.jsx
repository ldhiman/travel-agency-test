"use client";

import React, { useEffect, useState } from "react";
import { getImageUrl } from "../firebase";
import Link from "next/link";

export default function DownloadButton() {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function fetchImageUrl() {
      try {
        const url = await getImageUrl();
        setImageUrl(url);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      }
    }
    fetchImageUrl();
  }, []);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "image.jpg"; // You can specify a custom filename here
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto">
          <h1 className="flex-grow sm:pr-16 text-2xl mb-10 shadow-xl font-medium title-font text-gray-900">
            All the nessessary documents listed here :
          </h1>
          <div className="lg:w-2/3 flex flex-col sm:flex-row sm:items-center items-start mx-auto">
            <div className="flex flex-col">
              <h2 className="flex-grow sm:pr-16 text-2xl font-medium title-font text-gray-900">
                NOC for vehicle permission
              </h2>
              <p>
                You can download the NOC for vehicle from here and fill all the
                details then submit the document in pdf format on app
              </p>
            </div>
            {imageUrl && (
              <button
                onClick={handleDownload}
                className="flex-shrink-0 text-black bg-custom-pink border-0 py-2 px-8 focus:outline-none hover:text-white hover:bg-black rounded text-lg mt-10 sm:mt-0"
              >
                Download
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
