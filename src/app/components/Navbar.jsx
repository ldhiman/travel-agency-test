import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <header class="text-gray-600 body-font">
      <div class="container mx-auto flex content justify-evenly flex-wrap p-5 flex-col md:flex-row items-center">
        <Link
          href="/"
          class="flex font-ubantu font-bold items-center text-customPink mb-4 md:mb-0">
          <span class="ml-3 text-xl">Travelindia</span>
          <span class="text-medium">.tours</span>
        </Link>
        <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <Link href="/apps" class="mr-5 hover:text-customPink">
            Apps
          </Link>
          <Link href="/login" class="mr-5 hover:text-customPink">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
