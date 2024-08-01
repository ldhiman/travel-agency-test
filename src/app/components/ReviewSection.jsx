import Image from 'next/image'
import React from 'react'

export default function ReviewSection() {
  return (
    <div>
      <section class="text-gray-600 body-font">
        <div class="container px-5 py-24 mx-auto">
          <div class="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
            <div class="p-4 md:w-1/3 sm:mb-0 mb-6">
              <div class="rounded-lg h-64 overflow-hidden">
                <Image
                  src="/hill.jpg"
                  width={200}
                  height={200}
                  alt="content"
                  class="object-cover object-center h-full w-full"
                />
              </div>
              <h2 class="text-xl font-medium title-font text-gray-900 mt-5">
                Packages
              </h2>

              <a class="text-indigo-500 inline-flex items-center mt-3">
                Learn More
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  class="w-4 h-4 ml-2"
                  viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div class="p-4 md:w-1/3 sm:mb-0 mb-6">
              <div class="rounded-lg h-64 overflow-hidden">
                <Image
                  src="/driver.jpg"
                  width={200}
                  height={200}
                  alt="content"
                  class="object-cover object-center h-full w-full"
                />
              </div>
              <h2 class="text-xl font-medium title-font text-gray-900 mt-5">
                Driver
              </h2>

              <a class="text-indigo-500 inline-flex items-center mt-3">
                Learn More
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  class="w-4 h-4 ml-2"
                  viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div class="p-4 md:w-1/3 sm:mb-0 mb-6">
              <div class="rounded-lg h-64 overflow-hidden">
                <Image
                  src="/cars.jpg"
                  width={200}
                  height={200}
                  alt="content"
                  class="object-cover object-center h-full w-full"
                />
              </div>
              <h2 class="text-xl font-medium title-font text-gray-900 mt-5">
                Vehicles
              </h2>

              <a class="text-indigo-500 inline-flex items-center mt-3">
                Learn More
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  class="w-4 h-4 ml-2"
                  viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
