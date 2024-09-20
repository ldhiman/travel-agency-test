import Image from "next/image";
import React from "react";
import TripPlanner from "./TripPlanner";

export default function HeroSection() {
  return (
    <section className="">
      <div className="container flex lg:flex-row flex-col mx-auto px-5 py-2 items-center">
        <div className=" flex w-full md:justify-start flex-col justify-center items-start">
          <TripPlanner />
        </div>
        <div className=" w-full lg:h-auto h-full object-cover object-center rounded   flex items-center justify-center lg:w-full">
          <Image
            src="/logo.png"
            width={400}
            height={400}
            alt="image insert here"
          />
        </div>
      </div>
    </section>
  );
}
