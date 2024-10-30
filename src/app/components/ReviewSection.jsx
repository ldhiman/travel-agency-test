import Image from "next/image";
import Link from "next/link";
import React from "react";

const FeatureCard = ({ image, title, description, link }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl">
    <div className="relative h-64">
      <Image
        src={image}
        layout="fill"
        objectFit="cover"
        alt={title}
        className="transition-transform duration-300 transform hover:scale-110"
      />
    </div>
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-custom-dark mb-3">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        href={link}
        className="inline-flex items-center text-custom-pink font-medium hover:underline"
      >
        Learn More
        <svg
          className="w-4 h-4 ml-2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </Link>
    </div>
  </div>
);

export default function ReviewSection() {
  const features = [
    {
      image: "/hill.jpg",
      title: "Exciting Packages",
      description:
        "Discover our curated travel packages for unforgettable experiences.",
      link: "/",
    },
    {
      image: "/driver.jpg",
      title: "Professional Drivers",
      description:
        "Meet our experienced and courteous drivers for a safe journey.",
      link: "/",
    },
    {
      image: "/cars.jpg",
      title: "Premium Vehicles",
      description:
        "Choose from our fleet of comfortable and well-maintained vehicles.",
      link: "/",
    },
  ];


  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-custom-dark mb-12">
          Explore Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
