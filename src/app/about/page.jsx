import React from "react";

export default function About() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>

      <p className="mb-4">
        Welcome to <strong>Travel India</strong>, your trusted travel partner
        for exploring the rich and diverse beauty of India. Our mission is to
        provide seamless, enjoyable, and unforgettable travel experiences to
        customers across the globe. With a deep passion for tourism and a
        commitment to customer satisfaction, we strive to make every journey
        memorable.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Who We Are</h2>
      <p className="mb-4">
        {`
        Established in 2024, Travel India was founded with a simple goal: to
        make travel easy, accessible, and enjoyable for everyone. We specialize
        in curating unique travel experiences, whether you're looking to explore
        the serene landscapes of Kerala, the vibrant culture of Rajasthan, or
        the majestic Himalayas.`}
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">What We Do</h2>
      <p className="mb-4">
        {`
        At Travel India, we offer a variety of travel services tailored to meet
        the unique needs of every traveler. Our services include:`}
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Customized travel packages across India</li>
        <li>Hotel bookings and accommodation</li>
        <li>Flight bookings and transportation</li>
        <li>Tour guides and local experiences</li>
        <li>24/7 customer support for your travel needs</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Why Choose Us?</h2>
      <p className="mb-4">
        {`
        Our focus is on delivering a high level of personalized service to
        ensure that your trip is planned and executed with care. Here's why you
        should choose Travel India:`}
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Expert local knowledge and partnerships</li>
        <li>Affordable, transparent pricing</li>
        <li>Dedicated support team available 24/7</li>
        <li>A wide range of destinations and activities</li>
        <li>Commitment to sustainable and responsible tourism</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Our Vision</h2>
      <p className="mb-4">
        {`
        Our vision is to be the leading travel agency in India, known for
        providing authentic, immersive, and responsible travel experiences. We
        are committed to showcasing the incredible diversity of India's
        landscapes, cultures, and heritage while fostering a sustainable
        approach to tourism.`}
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Our Team</h2>
      <p className="mb-4">
        Travel India is powered by a passionate team of travel experts who share
        a common love for exploring and showcasing the beauty of India. Our team
        brings years of experience in the travel industry, ensuring that every
        detail of your trip is taken care of with precision.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Contact Us</h2>
      <p className="mb-4">
        Ready to explore India with us? Get in touch with our team to start
        planning your next adventure!
      </p>
      <ul className="list-none pl-0 mb-4">
        <li>
          <strong>Email:</strong> support@travelindia.tours
        </li>
        <li>
          <strong>Phone:</strong> {`+91 9266332195 , +91 9266332196 `}
        </li>
        <li>
          <strong>Address:</strong> Bawana, Delhi, India 110039
        </li>
      </ul>
    </div>
  );
}
