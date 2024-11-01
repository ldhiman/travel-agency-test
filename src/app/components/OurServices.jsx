import Image from "next/image";
import Link from "next/link";
import React from "react";

const ServiceCard = ({ image, title, description, link }) => (
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

export default function OurServices() {
 const services = [
    {
      image: "/oneWay.png",
      title: "One Way",
      description:
        "Efficient transportation for your single-direction journeys.",
      link: "/",
    },
    {
      image: "/roundTrip.png",
      title: "Round Trip",
      description: "Convenient round-trip services for your travel needs.",
      link: "/",
    },
    {
      image: "/local.png",
      title: "Local Trip",
      description: "Explore your local area with our reliable transportation.",
      link: "/",
    },
    {
      image: "/airportPickup.png",
      title: "Airport Pickup",
      description:
        "Stress-free airport transfers for a smooth travel experience.",
      link: "/",
    },
  ];



  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-16">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-custom-dark mb-12">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
