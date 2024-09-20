import Image from "next/image";
import React from "react";

const InfoCard = ({
  image,
  title,
  description,
  buttonText,
  imageOnLeft = true,
}) => (
  <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 py-16">
    {imageOnLeft ? (
      <>
        <ImageSection image={image} />
        <ContentSection
          title={title}
          description={description}
          buttonText={buttonText}
        />
      </>
    ) : (
      <>
        <ContentSection
          title={title}
          description={description}
          buttonText={buttonText}
        />
        <ImageSection image={image} />
      </>
    )}
  </div>
);

const ImageSection = ({ image }) => (
  <div className="lg:w-1/2">
    <Image
      className="rounded-lg shadow-lg object-cover w-full h-[400px]"
      src={image}
      alt="Car service"
      width={600}
      height={400}
    />
  </div>
);

const ContentSection = ({ title, description, buttonText }) => (
  <div className="lg:w-1/2 space-y-6">
    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
      {title}
    </h2>
    <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
    <button className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105">
      {buttonText}
    </button>
  </div>
);

export default function InfoSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <InfoCard
        image="/Dzire.jpg"
        title="India's Premier Intercity and Local Cab Services"
        description="Experience seamless travel across India with our extensive network of professional drivers and well-maintained vehicles. Whether you're commuting locally or embarking on an intercity adventure, we ensure comfort, safety, and reliability at every step of your journey."
        buttonText="Explore Our Services"
      />
      <InfoCard
        image="/sedan.jpeg"
        title="Discover India's Beauty on the Open Road"
        description="Embark on unforgettable road trips with us and witness the diverse landscapes of India. From bustling cities to serene countryside, our expert drivers and comfortable cars make every journey an experience to cherish. Let's create memories together as we explore the hidden gems of this beautiful country."
        buttonText="Plan Your Trip"
        imageOnLeft={false}
      />
    </section>
  );
}
