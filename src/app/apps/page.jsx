import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AppsPage() {
  return (
    <div>
      <section className="text-gray-600 body-font overflow-hidden">
        <div className="container px-5 py-5 flex flex-row items-center justify-center mx-auto">
          <div className="mx-auto  flex  flex-row items-center justify-center space-x-4 flex-wrap">
            <div className="">
              <Image
                className="rounded-full"
                alt="ecommerce"
                src="/vendorDriverApp.png"
                width={200}
                height={200}
              />
            </div>
            <div className="flex flex-row space-x-2">
              <h1 className=" text-3xl font-semibold text-custom-dark font-barlow-condensed ">
                Vendor & Driver App
              </h1>
              <span>
                <Link
                  href="/"
                  className="flex ml-auto rounded-xl text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 "
                >
                  Download
                </Link>
              </span>
            </div>
          </div>
        </div>
        <div className="container px-5 py-5 flex flex-row items-center justify-center mx-auto">
          <div className="mx-auto   flex flex-row items-center justify-center space-x-24 flex-wrap">
            <div className="">
              <Image
                className="rounded-full"
                alt="ecommerce"
                src="/userApp.png"
                width={200}
                height={200}
              />
            </div>
            <div className="flex flex-row space-x-24">
              <h1 className=" text-3xl font-semibold text-custom-dark font-barlow-condensed ">
                {`User's App`}
              </h1>
              <span>
                <Link
                  href="/"
                  className="flex ml-auto rounded-xl text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 "
                >
                  Soon
                </Link>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
