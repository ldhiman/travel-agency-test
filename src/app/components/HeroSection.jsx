import Image from "next/image";
import React from "react";
import TripPlanner from "./TripPlanner";

export default function HeroSection() {
  return (
    <section className="text-gray-600 body-font">
      <div className="container mx-auto flex px-5 py-10 md:flex-row flex-col items-center">
        <div className="flex w-full md:justify-start  flex-col justify-center items-start">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
            Start your journey here
          </h1>
          {/* Trip Planner */}
          <TripPlanner />
        </div>
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
          <Image
            src="/b.png"
            width={900}
            height={900}
            alt="image insert here"
            class="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded"
          />
        </div>
      </div>
    </section>
  );
}
