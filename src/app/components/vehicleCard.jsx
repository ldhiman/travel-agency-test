import Image from "next/image";
import { Users, Clock, MapPin, Info } from "lucide-react";

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

const vehicleCapacity = {
  sedan: 4,
  suv: 6,
  traveller12_14: 14,
  traveller16: 16,
  dzire: 4,
  compact: 4,
  innova: 7,
  innovacrysta: 7,
};

const VehicleCard = ({ type, total, info, distance, duration, onClick }) => {
  const imageSrc = vehicleImages[type];
  const capacity = vehicleCapacity[type] || 4;

  const formatVehicleType = (type) => {
    if (type === "traveller12_14") return "Traveller 12-14 Seater";
    if (type === "traveller16") return "Traveller 16 Seater";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 relative">
          <Image
            src={imageSrc}
            alt={`${type} vehicle`}
            layout="responsive"
            width={400}
            height={300}
            className="object-cover"
          />
          <div className="absolute top-0 left-0 bg-indigo-600 text-white px-3 py-1 rounded-br-lg">
            <Users className="inline-block mr-1" size={16} />
            {capacity} seats
          </div>
        </div>
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {formatVehicleType(type)}
              </h3>
              <p className="text-3xl font-semibold text-indigo-600">₹{total}</p>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="mr-1" size={16} />
                {distance}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1" size={16} />
                {duration}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium text-gray-700 mb-2 flex items-center">
                <Info className="mr-2" size={16} />
                Fare Breakdown:
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {info}
              </p>
            </div>
          </div>
          <button
            className="w-full bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-300"
            onClick={onClick}
          >
            Select This Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
