import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function OurServices() {
  return (
<section class="text-gray-600 body-font">
  <div class="container px-5 py-24 mx-auto">
    <div class="flex flex-wrap -m-4">
      <div class="lg:w-1/4 md:w-1/2 p-4 w-full">
        <Link href="/" class="block relative h-48 rounded overflow-hidden">
          <Image alt="ecommerce" class="object-cover object-center w-full h-full block" src="/roundTrip.jpeg" width={200} height={200}/>
        </Link>
        <div class="mt-4">
          <h2 class="text-gray-900 title-font text-lg font-medium">Round Trip</h2>
        </div>
      </div>
      <div class="lg:w-1/4 md:w-1/2 p-4 w-full">
         <Link href="/" class="block relative h-48 rounded overflow-hidden">
          <Image alt="ecommerce" class="object-cover object-center w-full h-full block" src="/roundTrip.jpeg" width={200} height={200}/>
        </Link>
        <div class="mt-4">
          <h2 class="text-gray-900 title-font text-lg font-medium">Round Trip</h2>
        </div>
      </div>
      <div class="lg:w-1/4 md:w-1/2 p-4 w-full">
         <Link href="/" class="block relative h-48 rounded overflow-hidden">
          <Image alt="ecommerce" class="object-cover object-center w-full h-full block" src="/roundTrip.jpeg" width={200} height={200}/>
        </Link>
        <div class="mt-4">
          <h2 class="text-gray-900 title-font text-lg font-medium">Round Trip</h2>
        </div>
      </div>
      <div class="lg:w-1/4 md:w-1/2 p-4 w-full">
         <Link href="/" class="block relative h-48 rounded overflow-hidden">
          <Image alt="ecommerce" class="object-cover object-center w-full h-full block" src="/roundTrip.jpeg" width={200} height={200}/>
        </Link>
        <div class="mt-4">
          <h2 class="text-gray-900 title-font text-lg font-medium">Round Trip</h2>
            </div>
          </div>  
    </div>
  </div>
</section>
  );
}
