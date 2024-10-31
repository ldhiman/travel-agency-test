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
} from "@fortawesome/free-solid-svg-icons";

const FooterSection = ({ title, children }) => (
  <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 mb-8 md:mb-0">
    <h3 className="text-custom-pink font-bold text-lg mb-4">{title}</h3>
    {children}
  </div>
);

const FooterLink = ({ href, children }) => (
  <li className="mb-2">
    <Link
      href={href}
      className="text-gray-600 hover:text-custom-pink transition duration-300"
    >
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ href, icon }) => (
  <Link
    href={href}
    className="text-custom-pink hover:text-custom-dark transition duration-300"
  >
    <FontAwesomeIcon icon={icon} className="w-5 h-5" />
  </Link>
);

export default function Footer() {
  return (
    <footer className="pt-16 pb-8 from-white to-blue-500">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <FooterSection title="About Us">
            <p className="text-gray-600 mb-4">
              TravelIndia.tours is your premier destination for exploring the
              diverse beauty of India through comfortable and reliable cab
              services.
            </p>
            <div className="flex space-x-4">
              <SocialIcon href="/" icon={faFacebookF} />
              <SocialIcon href="/" icon={faTwitter} />
              <SocialIcon href="/" icon={faInstagram} />
              <SocialIcon href="/" icon={faLinkedin} />
            </div>
          </FooterSection>

          <FooterSection title="Quick Links">
            <ul>
              <FooterLink href="/">Our Services</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/policy">Privacy Policy</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </FooterSection>

          <FooterSection title="Services">
            <ul>
              <FooterLink href="/">One Way Trips</FooterLink>
              <FooterLink href="/">Round Trips</FooterLink>
              <FooterLink href="/">Hourly Rental</FooterLink>
            </ul>
          </FooterSection>

          <FooterSection title="Contact Us">
            <ul className="text-gray-600">
              <li className="mb-2 flex items-center">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-4 h-4 mr-2 text-custom-pink"
                />
                +91 70113 07838
              </li>
              <li className="mb-2 flex items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-4 h-4 mr-2 text-custom-pink"
                />
                support@travelindia.tours
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="w-4 h-4 mr-2 mt-1 text-custom-pink"
                />
                Bawana, Delhi, India 110039
              </li>
            </ul>
          </FooterSection>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link
              href="/"
              className="flex items-center text-custom-pink font-sans font-extrabold text-xl"
            >
              TravelIndia<span className="font-bold text-sm">.tours</span>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TravelIndia.tours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
