"use client";

import React, { useState, useEffect } from "react";
import { ref, update, get } from "firebase/database";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Phone } from "lucide-react";

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
        setLoading(true);
        setFormData((prevData) => ({
          ...prevData,
          contact: user.phoneNumber || "", // Update contact number from authenticated user
        }));
        setUid(user.uid);

        const userRef = ref(db, `customers/${user.uid}`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setFormData({
              name: userData.name || "",
              email: userData.email || "",
              dob: userData.dob || "",
              contact: user.phoneNumber || "",
            });
            setLoading(false);
          } else {
            setLoading(false);
          }
        });
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

  const InputField = ({
    name,
    label,
    type,
    value,
    onChange,
    icon: Icon,
    disabled = false,
  }) => (
    <div className="mb-6 relative">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`block w-full pl-10 px-5 py-3 sm:text-sm border-gray-300 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          placeholder={`Enter your ${label.toLowerCase()}`}
          required
        />
      </div>
    </div>
  );

  const DatePickerField = ({ id, label, value, onChange }) => (
    <div className="mb-6 relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={value ? new Date(value) : null}
            onChange={(date) => onChange(date)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  className:
                    "pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500",
                }}
              />
            )}
            inputFormat="dd/MM/yyyy"
            placeholder={`Select your ${label.toLowerCase()}`}
          />
        </LocalizationProvider>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your details to complete the registration process
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField
              name="name"
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={handleTextChange}
              icon={User}
            />
            <InputField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              icon={Mail}
            />
            <DatePickerField
              id="dob"
              label="Date of Birth"
              value={formData.dob}
              onChange={handleDateChange}
            />
            <InputField
              name="contact"
              label="Contact Number"
              type="tel"
              value={formData.contact}
              onChange={handleTextChange}
              icon={Phone}
              disabled
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {error}
              </p>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Submitting..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
