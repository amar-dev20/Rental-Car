import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import{motion} from 'motion/react'
const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    cars,
    axios,
    token,
    user,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    setShowLogin,
  } = useAppContext();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const currency = import.meta.env.VITE_CURRENCY || "₹";

  // Find car by ID
  useEffect(() => {
    setLoading(true);

    const foundCar = cars?.find(
      (item) => String(item._id) === String(id)
    );

    setCar(foundCar || null);
    setLoading(false);
  }, [id, cars]);

  // Handle booking
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Require authentication
    const savedToken = localStorage.getItem("token");

    if (!token || !savedToken) {
      toast.error("Please log in before booking a car");
      setShowLogin(true);
      return;
    }

    if (!pickupDate || !returnDate) {
      toast.error("Please select pickup and return dates");
      return;
    }

    // Validate dates
    const pickup = new Date(`${pickupDate}T00:00:00`);
    const returned = new Date(`${returnDate}T00:00:00`);

    if (
      Number.isNaN(pickup.getTime()) ||
      Number.isNaN(returned.getTime()) ||
      returned <= pickup
    ) {
      toast.error("Return date must be after pickup date");
      return;
    }

    if (bookingLoading) return;

    try {
      setBookingLoading(true);

      // Send token explicitly as an additional safeguard
      const { data } = await axios.post(
        "/api/bookings/create",
        {
          car: id,
          pickupDate,
          returnDate,
        },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );

      if (data.success) {
        toast.success(
          data.message || "Booking created successfully"
        );

        navigate("/my-bookings");
      } else {
        toast.error(
          data.message || "Unable to create booking"
        );
      }
    } catch (error) {
      console.error("Booking error:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setShowLogin(true);
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to create booking"
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Car not found
  if (!car) {
    return (
      <div className="mt-20 px-6 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          Car not found!
        </h2>

        <p className="mt-2 text-gray-500">
          Car ID: {id}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-5 rounded-lg bg-black px-5 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 px-6 md:px-16 lg:px-24 xl:px-32">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex cursor-pointer items-center gap-2 text-gray-500"
      >
        <img
          src={assets.arrow_icon}
          alt=""
          className="rotate-180 opacity-65"
        />
        Back to all cars
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        {/* Left: Car Image and Details */}
        <motion.div
         initial={{ opacity: 0 ,y:30}}
whileInView={{ opacity: 1,y:0}}
transition={{  duration: 0.6 }}
       className="lg:col-span-2">
          <motion.img
           initial={{ opacity: 0 ,scale:0.98}}
whileInView={{ opacity: 1,scale:1}}
transition={{  duration: 0.5 }}
      
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="mb-6 h-auto max-h-[400px] w-full rounded-xl object-cover shadow-md"
          />

          <motion.div
           initial={{ opacity: 0 }}
whileInView={{ opacity: 1}}
transition={{ delay:0.2, duration: 0.5 }}
      
          className="space-y-6">
            {/* Car Title */}
            <div>
              <h1 className="text-3xl font-bold">
                {car.brand} {car.model}
              </h1>

              <p className="text-lg text-gray-500">
                {car.category} • {car.year}
              </p>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Car Information */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  icon: assets.user_icon,
                  text: `${car.seating_capacity} Seats`,
                },
                {
                  icon: assets.fuel_icon,
                  text: car.fuel_type,
                },
                {
                  icon: assets.car_icon,
                  text: car.transmission,
                },
                {
                  icon: assets.location_icon,
                  text: car.location,
                },
              ].map(({ icon, text }, index) => (
                <motion.div
 initial={{ opacity: 0 ,y:10}}
whileInView={{ opacity: 1,y:0}}
transition={{  duration: 0.4 }}
      


                  key={index}
                  className="flex flex-col items-center rounded-lg bg-light p-4"
                >
                  <img
                    src={icon}
                    alt=""
                    className="mb-2 h-5"
                  />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="mb-3 text-xl font-medium">
                Description
              </h2>

              <p className="text-gray-500">
                {car.description || "No description available."}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="mb-3 text-xl font-medium">
                Features
              </h2>

              <ul className="grid grid-cols-1 gap-2 text-gray-500 sm:grid-cols-2">
                {[
                  "360 Camera",
                  "Bluetooth",
                  "GPS",
                  "Heated Seats",
                  "Rear View Mirror",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center"
                  >
                    <img
                      src={assets.check_icon}
                      className="mr-2 h-4"
                      alt=""
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.form
         initial={{ opacity: 0 ,y:30}}
animate={{ opacity: 1,y:0}}
transition={{ delay:0.3, duration: 0.6 }}
      
          onSubmit={handleSubmit}
          className="sticky top-18 h-max space-y-6 rounded-xl p-6 text-gray-500 shadow-lg"
        >
          {/* Price */}
          <p className="flex items-center justify-between text-2xl font-semibold text-gray-800">
            {currency}
            {car.pricePerDay}

            <span className="text-base font-normal text-gray-400">
              per day
            </span>
          </p>

          <hr className="my-6 border-gray-200" />

          {/* Pickup Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="pickup-date">
              Pickup Date
            </label>

            <input
              type="date"
              id="pickup-date"
              value={pickupDate || ""}
              onChange={(event) =>
                setPickupDate(event.target.value)
              }
              min={new Date().toLocaleDateString("en-CA")}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          {/* Return Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="return-date">
              Return Date
            </label>

            <input
              type="date"
              id="return-date"
              value={returnDate || ""}
              onChange={(event) =>
                setReturnDate(event.target.value)
              }
              min={pickupDate || new Date().toLocaleDateString("en-CA")}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          {/* Book Button */}
          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full cursor-pointer rounded-xl bg-primary py-3 font-medium text-white transition-all hover:bg-primary-dull disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingLoading
              ? "Processing..."
              : "Book Now"}
          </button>

          <p className="text-center text-sm">
            No credit card required to reserve
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default CarDetails;