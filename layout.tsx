import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import Loading from "./components/Loading"; // Import the Loading component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel India",
  description: "Generated by travel india team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <Toaster position="bottom-center" />
        <Footer />
      </body>
    </html>
  );
}
