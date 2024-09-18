"use client";
import React, { useState, useRef } from "react";

// Form Validation Helper Functions
const validateEmail = (email) =>
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone);

const VehicleAuthorizationForm = () => {
  const [formData, setFormData] = useState({
    licensePlate: "",
    color: "",
    model: "",
    make: "",
    purchaseDate: "",
    ownerFirstName: "",
    ownerLastName: "",
    registrationEndDate: "",
    taxPaidUntil: "",
    commercialPermitEndDate: "",
    fitnessExpiryDate: "",
    insuranceExpiryDate: "",
    expiryDate: "",
    ownerDrivingLicense: "",
    ownerPanNumber: "",
    authorizationStartDate: "",
    authorizationEndDate: "",
    ownerEmail: "",
    ownerPhone: "",
    companyName: "Travel India Pvt. Ltd.",
    companyAddress: "Delhi, 110039",
  });

  const [errors, setErrors] = useState({});
  const [showDocument, setShowDocument] = useState(false);
  const documentRef = useRef(null);
  const terms_and_condition_url = "/terms";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(),
    }));
  };

  // Input validation
  const validateForm = () => {
    let tempErrors = {};
    if (!validateEmail(formData.ownerEmail))
      tempErrors.ownerEmail = "Invalid email format";
    if (!validatePhone(formData.ownerPhone))
      tempErrors.ownerPhone = "Phone must be 10 digits";
    // Add more validation checks as needed (e.g., date ranges)
    return tempErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tempErrors = validateForm();
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }
    setShowDocument(true);
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      licensePlate: "",
      color: "",
      model: "",
      make: "",
      purchaseDate: "",
      ownerFirstName: "",
      ownerLastName: "",
      registrationEndDate: "",
      taxPaidUntil: "",
      commercialPermitEndDate: "",
      fitnessExpiryDate: "",
      insuranceExpiryDate: "",
      expiryDate: "",
      ownerDrivingLicense: "",
      ownerPanNumber: "",
      authorizationStartDate: "",
      authorizationEndDate: "",
      ownerEmail: "",
      ownerPhone: "",
      companyName: "Travel India Pvt. Ltd.",
      companyAddress: "Delhi, 110039",
    });
    setShowDocument(false);
    setErrors({});
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    // Custom CSS styles for the print document
    const printStyles = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1{
          color: #333;
          text-align: center;
        }
        h3{
          color: #333;
        }
        p {
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .document-container {
          border: 2px solid #ddd;
          padding: 20px;
          border-radius: 10px;
          background-color: #f9f9f9;
        }
        .signature {
          margin-top: 50px;
        }
        ul {
          margin-bottom: 20px;
          padding-left: 20px;
        }
        ul li {
          margin-bottom: 5px;
        }
        .document-header, .document-footer {
          text-align: center;
          margin-bottom: 20px;
        }
        .document-footer {
          font-size: 10px;
          color: #777;
        }
        .terms-link a{
          color: gray;
          text-decoration: underline;
        }
        .bold {
          font-weight: bold;
        }
      </style>
    `;

    printWindow.document.write(
      "<html><head><title>Vehicle Authorization</title>"
    );
    printWindow.document.write(printStyles); // Add the custom styles here
    printWindow.document.write("</head><body>");
    printWindow.document.write("<div class='document-container'>");
    printWindow.document.write("<h1>Vehicle Authorization</h1>");
    printWindow.document.write(documentRef.current.innerHTML);
    printWindow.document.write(
      `<p class='document-footer'>By signing this form, you agree to the <span class="terms-link"><a href="${terms_and_condition_url}">terms and conditions</a></span> that you authorize the driver to operate your vehicle.</p>`
    );
    printWindow.document.write(
      `<p class='document-footer'>© ${new Date().getFullYear()} Travel India Pvt. Ltd. All rights reserved.</p>`
    );
    printWindow.document.write("</div>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  // Reusable input field component with validation error display
  const renderFormField = (name, label, type = "text", required = true) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`border p-2 rounded ${errors[name] && "border-red-500"}`}
        required={required}
      />
      {errors[name] && (
        <span className="text-xs text-red-500 mt-1">{errors[name]}</span>
      )}
    </div>
  );

  const renderSection = (title, fields) => (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mt-10 mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => renderFormField(...field))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Vehicle Authorization Form</h1>
      {!showDocument ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderSection("Vehicle Information", [
            ["licensePlate", "License Plate Number"],
            ["make", "Make"],
            ["model", "Model"],
            ["color", "Color"],
          ])}

          {renderSection("Owner Information", [
            ["ownerFirstName", "First Name"],
            ["ownerLastName", "Last Name"],
            ["ownerDrivingLicense", "Driving License Number"],
            ["ownerPanNumber", "PAN Number"],
            ["ownerEmail", "Email", "email"],
            ["ownerPhone", "Phone", "tel"],
          ])}

          {renderSection("Registration", [
            ["purchaseDate", "Date of Purchase", "date"],
            ["registrationEndDate", "Registration End Date", "date"],
          ])}

          {renderSection("Permits and Taxes", [
            ["taxPaidUntil", "Tax Paid Until", "date"],
            ["commercialPermitEndDate", "Commercial Permit End Date", "date"],
            ["fitnessExpiryDate", "Fitness Expiry Date", "date"],
            ["insuranceExpiryDate", "Insurance Expiry Date", "date"],
          ])}

          {renderSection("Authorization", [
            ["authorizationStartDate", "Authorization Start Date", "date"],
            ["authorizationEndDate", "Authorization End Date", "date"],
          ])}

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Generate Document
          </button>
        </form>
      ) : (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Generated Authorization Document
          </h2>
          <div ref={documentRef} className="bg-gray-100 p-4 rounded">
            <p>To</p>
            <h3 className="text-lg font-bold ml-2">{formData.companyName}</h3>
            <p className="mb-5 ml-3">{formData.companyAddress}</p>
            <p className="mb-4">
              I,{" "}
              <span className="font-bold">
                {formData.ownerFirstName} {formData.ownerLastName}
              </span>
              , being the rightful owner of the vehicle with license plate
              number <span className="font-bold">{formData.licensePlate}</span>,
              hereby authorize the bearer of this document to operate the
              aforementioned vehicle under the following terms and conditions:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>
                Vehicle Details: {formData.make} {formData.color}{" "}
                {formData.model}
              </li>
              <li>Date of Purchase: {formData.purchaseDate || "N/A"}</li>
              <li>
                Registration End Date: {formData.registrationEndDate || "N/A"}
              </li>
              <li>Tax Paid Until: {formData.taxPaidUntil || "N/A"}</li>
              <li>
                Commercial Permit End Date:{" "}
                {formData.commercialPermitEndDate || "N/A"}
              </li>
              <li>
                Fitness Expiry Date: {formData.fitnessExpiryDate || "N/A"}
              </li>
              <li>
                Insurance Expiry Date: {formData.insuranceExpiryDate || "N/A"}
              </li>
              <br />
              <li>
                Authorization Valid From:{" "}
                {formData.authorizationStartDate || "N/A"}
              </li>
              <li>
                Authorization Valid Until:{" "}
                {formData.authorizationEndDate || "N/A"}
              </li>
            </ul>
            <p className="mb-4">
              The bearer is authorized to operate this vehicle from{" "}
              {formData.authorizationStartDate} to{" "}
              {formData.authorizationEndDate}, subject to maintaining valid
              insurance and adhering to all applicable traffic laws and
              regulations.
            </p>
            <p className="mb-4">
              Owner's Contact Information:
              <br />
              Driving License: {formData.ownerDrivingLicense}
              <br />
              Pan Card: {formData.ownerPanNumber}
              <br />
              Email: {formData.ownerEmail}
              <br />
              Phone: {formData.ownerPhone}
            </p>
            <p className="mb-4">
              By presenting this document, the bearer acknowledges that they
              have been duly authorized by the vehicle owner to operate this
              vehicle within the specified period and conditions.
            </p>
            <p>
              <span className="mb-5">Signed: ________________________</span>
              <br />
              Name:
              <span className="font-bold mb-4">
                {" "}
                {formData.ownerFirstName} {formData.ownerLastName}
              </span>
              <br />
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={handlePrint}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Print Document
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Reset Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleAuthorizationForm;
