
import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY || '₹';
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/car-details/${car._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleClick}
      className="group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer"
    >
      {/* Car Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Availability */}
        {car.isAvaliable && (
          <p className="absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full">
            Available Now
          </p>
        )}

        {/* Price */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <span className="font-semibold">
            {currency}{car.pricePerDay}
          </span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>

      {/* Car Details */}
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">
              {car.brand} {car.model}
            </h3>

            <p className="text-gray-500 text-sm">
              {car.category} • {car.year}
            </p>
          </div>
        </div>

        {/* Car Features */}
        <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2 text-gray-600">
          {/* Seats */}
          <div className="flex items-center text-sm text-gray-500">
            <img
              src={assets.user_icon}
              alt=""
              className="h-4 w-4 mr-2"
            />
            <span>{car.seating_capacity} Seats</span>
          </div>

          {/* Fuel */}
          <div className="flex items-center text-sm text-gray-500">
            <img
              src={assets.fuel_icon}
              alt=""
              className="h-4 w-4 mr-2"
            />
            <span>{car.fuel_type}</span>
          </div>

          {/* Transmission */}
          <div className="flex items-center text-sm text-gray-500">
            <img
              src={assets.car_icon}
              alt=""
              className="h-4 w-4 mr-2"
            />
            <span>{car.transmission}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500">
            <img
              src={assets.location_icon}
              alt=""
              className="h-4 w-4 mr-2"
            />
            <span>{car.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
