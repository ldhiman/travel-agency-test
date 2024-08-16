import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

export default function ReviewSection() {
  return (
    <div>
      <section class="">
        <div class="container px-5 py-20 mx-auto border-gray-900 shadow-xl">
          <div class="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
            <div class="p-4 md:w-1/3 sm:mb-0 mb-6">
              <div class="rounded-lg h-64 overflow-hidden">
                <Image
                  src="/hill.jpg"
                  width={400}
                  height={400}
                  alt="content"
                  class="object-cover object-center h-full w-full"
                />
              </div>
              <h2 class="text-xl font-semibold font-barlow-condensed text-custom-dark mt-5">
                Packages
              </h2>

              <Link
                href="/"
                class="text-xl font-medium font-barlow-condensed text-custom-pink mt-5"
              >
                {`Learn More -->`}
              </Link>
            </div>
            <div class="p-4 md:w-1/3 sm:mb-0 mb-6">
              <div class="rounded-lg h-64 overflow-hidden">
                <Image
                  src="/driver.jpg"
                  width={400}
                  height={400}
                  alt="content"
                  class="object-cover object-center h-full w-full"
                />
              </div>
              <h2 class="text-xl font-semibold font-barlow-condensed text-custom-dark mt-5">
                Drivers
              </h2>

              <Link
                href="/"
                class="text-xl font-medium font-barlow-condensed text-custom-pink mt-5"
              >
                {`Learn More -->`}
              </Link>
            </div>
            <div class="p-4 md:w-1/3 sm:mb-0 mb-6">
              <div class="rounded-lg h-64 overflow-hidden">
                <Image
                  src="/cars.jpg"
                  width={400}
                  height={400}
                  alt="content"
                  class="object-cover object-center h-full w-full"
                />
              </div>
              <h2 class="text-xl font-semibold font-barlow-condensed text-custom-dark mt-5">
                Vehicles
              </h2>

              <Link
                href="/"
                class="text-xl font-medium font-barlow-condensed text-custom-pink mt-5"
              >
                {`Learn More -->`}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
