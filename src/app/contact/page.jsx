import React from "react";
import Link from "next/link";

const Contact = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800">Contact Us</h1>
      <p className="mt-2 text-gray-600">
        If you have any questions or need assistance, feel free to reach out to
        us!
      </p>

      <div className="mt-6 bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Contact Information
        </h2>
        <p className="mt-2">
          <strong>Email:</strong>{" "}
          <a
            href="mailto:support@travelindia.tours"
            className="text-blue-500 hover:underline"
          >
            support@travelindia.tours
          </a>
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          <a href="tel:+917011307838" className="text-blue-500 hover:underline">
            +91 70113 07838
          </a>
        </p>
        <p>
          <strong>Address:</strong> Bawana, Delhi, India 110039
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Follow Us</h2>

        <p className="mt-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Facebook
          </Link>{" "}
          |
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {" "}
            Twitter
          </Link>{" "}
          |
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {" "}
            Instagram
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Contact;
