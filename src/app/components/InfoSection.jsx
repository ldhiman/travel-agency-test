import Image from "next/image";
import React from "react";

export default function InfoSection() {
  return (
    <section class="px-5 py-10 mx-14 border-gray-900 shadow-xl">
      <div class="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0 ">
          <Image
            class="object-cover object-center rounded"
            alt="hero"
            src="/cars.jpg"
            width={500}
            height={500}
          />
        </div>
        <div class="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 class=" sm:text-4xl text-xl mb-4 font-barlow-condensed font-medium">
            India s Largest Intercity and Local Cab Services
          </h1>
          <p class="mb-8 font-barlow-condensed font-normal">
            Copper mug try-hard pitchfork pour-over freegan heirloom neutra air
            plant cold-pressed tacos poke beard tote bag. Heirloom echo park
            mlkshk tote bag selvage hot chicken authentic tumeric truffaut
            hexagon try-hard chambray.
          </p>
          <div class="flex justify-center">
            <button class="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              More
            </button>
          </div>
        </div>
      </div>

      <div class="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div class="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 class=" sm:text-4xl text-xl mb-4 font-barlow-condensed font-medium">
            Exploring India, one road trip at a time
          </h1>
          <p class="mb-8 font-barlow-condensed font-normal">
            {`
            To us, a road trip is one of the most exhilarating ways to travel
            the length and breadth of India. There's always something to look
            at, something to explore and to experience. Because we love
            travelling by road so much, we've been striving to make sure you
            have a great experience too. `}
          </p>
          <div class="flex justify-center">
            <button class="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              More
            </button>
          </div>
        </div>
        <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0 lg:ml-10">
          <Image
            class="object-cover object-center rounded"
            alt="hero"
            src="/cars.jpg"
            width={500}
            height={500}
          />
        </div>
      </div>
    </section>
  );
}
