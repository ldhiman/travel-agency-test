import Image from "next/image";

const vehicleImages = {
  sedan: "/sedan.png",
  suv: "/suv.png",
  traveller12_14: "/traveller_1.png",
  traveller16: "/traveller.png",
  dzire: "/dzire.png",
  compact: "/compact.png",
  innova: "/innova.png",
  innovacrysta: "/innovacrysta.png",
};

const VehicleCard = ({ type, total, info, distance, duration, onClick }) => {

  // Get the image URL based on the vehicle type
  const imageSrc = vehicleImages[type];

  return (
    <div className="p-6 w-full bg-white shadow-lg rounded-xl flex flex-col md:flex-row mb-6 transition-transform transform hover:shadow-xl">
      {/* Car image on the left side, hidden on medium screens and below */}
      <div className="w-full md:w-1/2 flex-shrink-0 h-full overflow-hidden rounded-xl md:block hidden">
        <Image
          src={imageSrc}
          alt={`${type} vehicle`}
          layout="responsive"
          width={400}
          height={400}
          className="object-cover rounded-xl"
        />
      </div>
      {/* Vehicle details on the right side */}
      <div className="w-full md:w-1/2 pl-0 md:pl-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {type != "traveller12_14"
              ? type != "traveller16"
                ? type.substring(0, 1).toUpperCase() + type.substring(1)
                : "Traveller 16 Seater"
              : "Traveller 12-14 Seater"}
          </h3>
          <p className="text-3xl font-semibold text-indigo-600">₹{total}</p>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-grow text-sm text-gray-600">
            <p className="whitespace-pre-line bg-gray-50 p-3 text-lg rounded-lg h-full">
              <strong className="font-medium text-gray-700">
                Fare Breakdown:
              </strong>
              {"\n" + info}
            </p>
          </div>
          <button
            className="mt-4 bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition-colors"
            onClick={onClick}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
