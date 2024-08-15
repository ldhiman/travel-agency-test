import Image from "next/image";
import React from "react";

export default function ViewsSection() {
  return (
    <section class="">
      <div class="container px-5 py-5 mx-auto">
        <div class="flex flex-wrap -m-4 text-center">
          <div class="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div class="border-2 border-gray-400 shadow-lg px-4 py-6 rounded-lg">
              <Image
                src="/download.png"
                width={500}
                height={500}
                alt="image insert here"
                className="text-customPink w-10 h-10 mb-3 inline-block"
              />
              <h2 class="text-custom-dark font-barlow-condensed font-bold">
                2.7K
              </h2>
              <p class="text-custom-dark font-barlow-condensed font-medium">
                Downloads
              </p>
            </div>
          </div>
          <div class="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div class="border-2 border-gray-400 shadow-lg px-4 py-6 rounded-lg">
              <Image
                src="/users.png"
                width={500}
                height={500}
                alt="image insert here"
                className="text-customPink w-10 h-10 mb-3 inline-block"
              />
              <h2 class="text-custom-dark font-barlow-condensed font-bold">
                4.7K
              </h2>
              <p class="text-custom-dark font-barlow-condensed font-medium">
                Across
              </p>
            </div>
          </div>
          <div class="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div class="border-2 border-gray-400 shadow-lg px-4 py-6 rounded-lg">
              <Image
                src="/files.png"
                width={500}
                height={500}
                alt="image insert here"
                className="text-customPink w-10 h-10 mb-3 inline-block"
              />
              <h2 class="text-custom-dark font-barlow-condensed font-bold">
                6.7K
              </h2>
              <p class="text-custom-dark font-barlow-condensed font-medium">
                Trips
              </p>
            </div>
          </div>
          <div class="p-4 md:w-1/4 sm:w-1/2 w-full">
            <div class="border-2 border-gray-400 shadow-lg px-4 py-6 rounded-lg">
              <Image
                src="/places.png"
                width={500}
                height={500}
                alt="image insert here"
                className="text-customPink w-10 h-10 mb-3 inline-block"
              />
              <h2 class="text-custom-dark font-barlow-condensed font-bold">
                10.4K
              </h2>
              <p class="text-custom-dark font-barlow-condensed font-medium">
                Places
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
