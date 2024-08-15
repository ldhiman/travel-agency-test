"use client";

import React, { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    contact: "", // Contact field will be disabled
  });
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFormData((prevData) => ({
          ...prevData,
          contact: user.phoneNumber || "", // Update contact number from authenticated user
        }));
        setUid(user.uid);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Generic input handler
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Date picker handler
  const handleDateChange = (date) => {
    try {
      setFormData((prevData) => ({
        ...prevData,
        dob: date ? date.toISOString().split("T")[0] : "",
      }));
    } catch (err) {
      setFormData((prevData) => ({
        ...prevData,
        dob: "",
      }));
    }
  };

  // Check if user is at least 18 years old
  const isAdult = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isAdult(formData.dob)) {
      setError("You must be at least 18 years old.");
      setLoading(false);
      return;
    }
    let toastID = toast.loading("Saving Data...");

    try {
      if (!uid) {
        throw new Error("User not authenticated");
      }

      const userRef = ref(db, `customers/${uid}`);
      await update(userRef, {
        name: formData.name,
        email: formData.email,
        dob: formData.dob,
        phone: formData.contact,
      });

      const typeRef = ref(db, `user/${uid}`);
      await update(typeRef, {
        customer: true,
      });
      toast.success("Data Saved!!");
      console.log("Data saved successfully!");
      setFormData({ name: "", email: "", dob: "", contact: "" });
      router.push("/");
    } catch (error) {
      toast.error("Registration failed. Please try again!!");
      setError("Registration failed. Please try again.");
      console.error("Error saving data:", error);
    } finally {
      toast.dismiss(toastID);
      setLoading(false);
    }
  };

  const DatePickerField = ({ id, label, value, onChange, minDate }) => (
    <div className="mb-4">
      <label htmlFor={id} className="leading-7 text-sm text-gray-600">
        {label}
      </label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          value={value ? new Date(value) : null}
          onChange={(date) => onChange(date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
          minDate={minDate}
          inputFormat="dd/MM/yyyy"
          placeholder={`Select ${label.toLowerCase()}`}
        />
      </LocalizationProvider>
    </div>
  );

  return (
    <div>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Registration Form
        </h1>
        <form
          className="w-full max-w-sm mx-auto bg-white p-8 rounded-md shadow-md"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleTextChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleTextChange}
              required
              placeholder="john@example.com"
            />
          </div>
          <DatePickerField
            id="dob"
            label="Date of Birth"
            value={formData.dob}
            onChange={handleDateChange}
          />
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="contact"
            >
              Contact Number
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleTextChange}
              required
              disabled // Disable contact field
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            className={`w-full bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
