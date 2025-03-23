import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

const FooterLink = ({ href, children }) => (
  <li>
    <Link
      href={href}
      className="text-gray-300 hover:text-white transition duration-300 flex items-center py-2"
    >
      <FontAwesomeIcon
        icon={faAngleRight}
        className="w-3 h-3 mr-2 text-pink-400"
      />
      <span>{children}</span>
    </Link>
  </li>
);

const SocialIcon = ({ href, icon }) => (
  <Link
    href={href}
    className="bg-gray-800 hover:bg-pink-600 text-white p-3 rounded-full transition duration-300 flex items-center justify-center"
    aria-label={`Follow us on ${icon.iconName}`}
  >
    <FontAwesomeIcon icon={icon} className="w-5 h-5" />
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Top Section with Logo and Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-8">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-baseline">
              <span className="text-3xl font-bold text-white">Travel</span>
              <span className="text-3xl font-bold text-pink-500">India</span>
              <span className="text-sm font-bold text-pink-400">.tours</span>
            </Link>
            <p className="text-gray-400 mt-2 max-w-md">
              Your premier destination for exploring the diverse beauty of India
              through comfortable and reliable cab services.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <h3 className="text-lg font-semibold mb-3">
              Subscribe to our Newsletter
            </h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none w-full md:w-64"
              />
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-r-md transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section with Links and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-pink-600 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-1">
              <FooterLink href="/">Our Services</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-pink-600 pb-2 inline-block">
              Our Services
            </h3>
            <ul className="space-y-1">
              <FooterLink href="/">One Way Trips</FooterLink>
              <FooterLink href="/">Round Trips</FooterLink>
              <FooterLink href="/">Hourly Rental</FooterLink>
              <FooterLink href="/">Airport Transfers</FooterLink>
              <FooterLink href="/">Corporate Travel</FooterLink>
              <FooterLink href="/">Wedding Transportation</FooterLink>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-pink-600 pb-2 inline-block">
              Popular Destinations
            </h3>
            <ul className="space-y-1">
              <FooterLink href="/">Delhi to Agra</FooterLink>
              <FooterLink href="/">Mumbai to Pune</FooterLink>
              <FooterLink href="/">Bangalore to Mysore</FooterLink>
              <FooterLink href="/">Chennai to Pondicherry</FooterLink>
              <FooterLink href="/">Jaipur to Udaipur</FooterLink>
              <FooterLink href="/">Delhi to Jaipur</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-pink-600 pb-2 inline-block">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-4 h-4 mr-3 text-pink-500 mt-1"
                />
                <div>
                  <p className="font-medium">Phone Numbers:</p>
                  <p className="text-gray-400">+91 9266332195</p>
                  <p className="text-gray-400">+91 9266332196</p>
                </div>
              </li>
              <li className="flex">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-4 h-4 mr-3 text-pink-500 mt-1"
                />
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="text-gray-400">support@travelindia.tours</p>
                </div>
              </li>
              <li className="flex">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="w-4 h-4 mr-3 text-pink-500 mt-1"
                />
                <div>
                  <p className="font-medium">Address:</p>
                  <p className="text-gray-400">
                    Ground Floor, Plot No. G-47 Kh. No. 103/4, House No. G-47,
                    BIK-G Rajeev Nagar, New Delhi, North Delhi, Delhi, 110086
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Socials and Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-6 md:mb-0">
              <SocialIcon href="/" icon={faFacebookF} />
              <SocialIcon href="/" icon={faTwitter} />
              <SocialIcon href="/" icon={faInstagram} />
              <SocialIcon href="/" icon={faLinkedin} />
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Travel India. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Designed with ❤️ for travelers across India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
