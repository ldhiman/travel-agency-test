import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import Loading from "./components/Loading"; // Import the Loading component
import { AuthProvider } from "../context/authContext";

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
        <AuthProvider>
          <Navbar />
          <Suspense fallback={<Loading />}>{children}</Suspense>
          <Toaster position="bottom-center" />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
