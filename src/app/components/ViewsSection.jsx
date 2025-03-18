import Image from "next/image";
import React from "react";

const StatCard = ({ icon, number, label, description }) => (
  <div className="p-6 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50">
      <Image
        src={icon}
        width={32}
        height={32}
        alt={`${label} icon`}
        className="text-blue-500"
      />
    </div>
    <h2 className="text-4xl font-bold text-custom-dark mb-2">{number}</h2>
    <p className="text-xl font-medium text-custom-dark mb-2">{label}</p>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default function ViewsSection() {
  const stats = [
    {
      icon: "/download.png",
      number: "2.7K+",
      label: "Downloads",
      description: "Active app installations across platforms",
    },
    {
      icon: "/users.png",
      number: "4.7K+",
      label: "Happy Users",
      description: "Satisfied customers who love our service",
    },
    {
      icon: "/files.png",
      number: "6.7K+",
      label: "Trips Planned",
      description: "Successful journeys organized through our platform",
    },
    {
      icon: "/places.png",
      number: "10.4K+",
      label: "Destinations",
      description: "Unique locations available for your next adventure",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-16 px-10">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-custom-dark mb-12">
          Empowering Your Travel Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
