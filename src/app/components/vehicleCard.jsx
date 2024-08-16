import Image from "next/image";

const VehicleCard = ({
  type,
  total,
  info,
  distance,
  duration,
  hourly,
  onClick,
}) => {
  // Function to parse the fare information
  const parseInfo = (info) => {
    const infoLines = info.split("\n");
    const parsedInfo = {};

    for (let i = 0; i < infoLines.length; i++) {
      if (infoLines[i].split(":")[0] == "extraDistance") {
        parsedInfo[infoLines[i].split(":")[0]] =
          infoLines[i].split(":")[1] + " per Km after time ends";
      } else {
        parsedInfo[infoLines[i].split(":")[0]] = infoLines[i].split(":")[1];
      }
    }

    return parsedInfo;
  };

  const parsedInfo = parseInfo(info);

  return (
    <div
      className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg overflow-hidden mb-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full lg:w-1/3">
        <Image
          alt={`${type} vehicle`}
          src={`/cars.jpg`} // Assuming images are named by vehicle type
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div className="p-6 flex flex-col justify-between w-full lg:w-2/3">
        <div>
          <button className="bg-indigo-500 text-white py-1 px-3 rounded-full text-sm mb-2">
            {type === "TempoTraveller" ? "Value" : "Economy"}
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {type.toUpperCase()}
          </h2>
          <p className="text-xl font-medium text-gray-800 mb-2">₹ {total}</p>

          {/* Fare breakdown */}
          <div className="text-gray-600 mb-4">
            <div className="flex flex-col">
              {parsedInfo.fares && (
                <p className="text-gray-700 mb-1">
                  <strong>Base Fare:</strong> ₹ {parsedInfo.fares}
                </p>
              )}
              {parsedInfo.extraDistance && (
                <p className="text-gray-700 mb-1">
                  <strong>Extra Distance:</strong> ₹ {parsedInfo.extraDistance}
                </p>
              )}
              {parsedInfo.nightDrop && (
                <p className="text-gray-700 mb-1">
                  <strong>Night Drop:</strong> ₹ {parsedInfo.nightDrop}
                </p>
              )}
            </div>
          </div>

          {!hourly && (
            <div className="flex flex-col mb-4">
              <p className="text-gray-700">
                <strong>Distance:</strong> {distance || "N/A"}
              </p>
              <p className="text-gray-700">
                <strong>Duration:</strong> {duration}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                fill={index < 4 ? "currentColor" : "none"}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                className="w-5 h-5 text-yellow-500"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-600 text-sm">Moderate comfort, Best price</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
