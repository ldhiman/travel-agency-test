import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import Loading from "./components/Loading"; // Import the Loading

const inter = Inter({ subsets: ["latin"] });
const isRestricted = process.env.NEXT_PUBLIC_RESTRICTED === "true";
export const metadata: Metadata = {
  title: isRestricted
    ? "Travel India - Access Restricted"
    : "Travel India - One Stop Travel Solution",
  description: "This website is restricted due to incomplete payment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {isRestricted ? (
          <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-black via-gray-900 to-black text-white text-center">
            <div className="max-w-2xl border border-red-500 rounded-2xl p-10 shadow-xl shadow-red-500/30 bg-gray-950/60 backdrop-blur-lg animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-red-500">
                Out of Service
              </h1>
              <p className="text-sm text-gray-400 mb-6">
                Please check back later.
              </p>
            </div>
          </main>
        ) : (
          <>
            <Navbar />
            <Suspense fallback={<Loading />}>{children}</Suspense>
            <Toaster position="bottom-center" />
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
