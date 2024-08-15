import Image from "next/image";
import React from "react";
import TripPlanner from "./TripPlanner";

export default function HeroSection() {
  return (
    <section className="">
      <div className="container flex lg:flex-row  sm:flex-col mx-auto px-5 py-2 items-center">
        <div className=" flex w-full md:justify-start  flex-col justify-center items-start">
          <h1 className="text-custom-dark  sm:text-xl text-xl mb-2 font-barlow-condensed font-semibold ">
            Start your journey here
          </h1>
          {/* Trip Planner */}
          <TripPlanner />
        </div>
        <div className="h-full w-full flex items-center justify-center lg:w-full">
          <Image
            src="/b.png"
            width={500}
            height={500}
            alt="image insert here"
            class="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded"
          />
        </div>
      </div>
    </section>
  );
}
