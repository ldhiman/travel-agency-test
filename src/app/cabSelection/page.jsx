import Image from "next/image";
import React from "react";

export default function CabSelectionPage() {
  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container pl-12">{`> Outstaion (Round Trip) > Sat, 3rd Aug, 08:45 PM (Delhi - Haridwar - Delhi ) > Vehicle type`}</div>
        <div className="container pl-12">
          Booking for : <span>Abhishek</span>
        </div>
        <div className="container px-5 py-24 mx-auto flex flex-wrap">
          <div className="lg:w-1/2 sm:w-1/3 w-full rounded-lg overflow-hidden mt-6 sm:mt-0">
            <Image
              class="object-cover object-center w-lg h-lg"
              alt="stats"
              src="/cars.jpg"
              width={300}
              height={300}
            />
          </div>
          <div className="flex flex-wrap -mx-4 mt-2 mb-auto lg:w-1/2 sm:w-2/3 content-start sm:pr-10">
            <div classname="w-full flex flex-row sm:p-4 px-4 mb-1">
              <div className="w-full  flex flex-col sm:p-4 px-4 mb-1">
                <h1 className="title-font font-medium text-xl mx-2 text-gray-900">
                  Vehicle name
                </h1>
                <span className="mr-5 text-left mx-2 hover:text-customPink">
                  Category of vehicle
                </span>
              </div>
              <div className="w-full flex flex-row sm:p-4 px-4 mb-1">
                <h2 className="title-font font-medium text-md mx-2 text-gray-900">
                  Passangers count
                </h2>
                <h2 className="title-font font-medium text-md mx-2 text-gray-900">
                  Lugage count
                </h2>
              </div>
            </div>
            <div classname="w-full flex flex-col sm:p-4 px-4 mb-1">
              <div className="w-full flex flex-start flex-row sm:p-4 px-4 mb-1">
                <h2 className="title-font font-medium text-md mx-2 text-gray-900">
                  ₹35,394 - ₹40,302 <span>info</span>
                </h2>
              </div>
              <div className="w-full flex flex-row sm:p-4  mb-1">
                <span className="flex flex-row items-center px-5 ">
                  <svg
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="w-4 h-4 text-customPink"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="w-4 h-4 text-customPink"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="w-4 h-4 text-customPink"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="w-4 h-4 text-customPink"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="w-4 h-4 text-customPink"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
              </div>
              <div className="leading-relaxed px-6">Pour-over craft beer</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
