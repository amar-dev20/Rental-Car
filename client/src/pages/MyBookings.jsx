import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-hot-toast";
import {motion} from 'motion/react'
const MyBookings = () => {
    const { axios, currency, user } = useAppContext();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch bookings belonging to the logged-in user
    const fetchMyBookings = useCallback(async () => {
        if (!user) {
            setBookings([]);
            setLoading(false);
            setError("");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // This endpoint must match your backend booking route.
            const { data } = await axios.get("/api/bookings/user");

            if (!data?.success) {
                throw new Error(
                    data?.message || "Failed to fetch bookings"
                );
            }

            setBookings(
                Array.isArray(data.bookings) ? data.bookings : []
            );
        } catch (err) {
            console.error("My Bookings API Error:", {
                status: err.response?.status,
                url: err.config?.url,
                response: err.response?.data,
                message: err.message,
            });

            const message =
                err.response?.data?.message ||
                err.message ||
                "Unable to load your bookings";

            setError(message);
            setBookings([]);

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [axios, user]);

    useEffect(() => {
        fetchMyBookings();
    }, [fetchMyBookings]);

    // Format date as YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toISOString().slice(0, 10);
    };

    // Format booking status
    const formatStatus = (status) => {
        const value = (status || "pending").toLowerCase();

        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    // Status badge colors
    const getStatusClass = (status) => {
        switch ((status || "pending").toLowerCase()) {
            case "confirmed":
                return "bg-green-50 text-green-600";

            case "completed":
                return "bg-blue-50 text-blue-600";

            case "cancelled":
                return "bg-red-50 text-red-500";

            default:
                return "bg-red-50 text-red-500";
        }
    };

    // Get populated car information
    const getCarDetails = (booking) => {
        if (
            booking.car &&
            typeof booking.car === "object" &&
            !Array.isArray(booking.car)
        ) {
            return booking.car;
        }

        return null;
    };

    // Get car image
    const getCarImage = (car) => {
        if (!car?.image) {
            return assets.carIconColored;
        }

        if (Array.isArray(car.image)) {
            return car.image[0] || assets.carIconColored;
        }

        return car.image;
    };

    // Get pickup location
    const getPickupLocation = (booking, car) => {
        return (
            booking.pickupLocation ||
            booking.location ||
            car?.location ||
            "Location unavailable"
        );
    };

    // Get total booking price
    const getTotalPrice = (booking) => {
        const price = Number(
            booking.price ??
            booking.totalPrice ??
            0
        );

        return price.toLocaleString("en-IN");
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white px-5 py-10 sm:px-8 md:px-12 lg:px-20">
                <h1 className="text-2xl font-semibold text-gray-900">
                    My Bookings
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    View and manage all your car bookings.
                </p>

                <div className="mt-8 space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Main page
    return (
        <div className="min-h-screen bg-white px-5 py-8 sm:px-8 md:px-12 lg:px-20 lg:py-10">

            {/* Page Heading */}
            <motion.div
            initial={{opacity:0,y:30}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.6}}
            className="mx-auto max-w-5xl">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                    My Bookings
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View and manage all your car bookings.
                </p>

                {/* Not Logged In */}
                {!user && (
                    <div className="mt-8 rounded-lg border border-gray-200 p-8 text-center">
                        <h2 className="font-medium text-gray-800">
                            Login required
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Please log in to view your bookings.
                        </p>
                    </div>
                )}

                {/* API Error */}
                {user && error && (
                    <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">
                        <h2 className="font-medium text-red-600">
                            Unable to load bookings
                        </h2>

                        <p className="mt-2 text-sm text-red-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchMyBookings}
                            className="mt-4 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty Bookings */}
                {user && !error && bookings.length === 0 && (
                    <div className="mt-8 rounded-lg border border-gray-200 px-5 py-12 text-center">
                        <img
                            src={assets.carIconColored}
                            alt="Car"
                            className="mx-auto h-16 w-16 object-contain opacity-70"
                        />

                        <h2 className="mt-4 text-lg font-medium text-gray-800">
                            No bookings found
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Your car bookings will appear here once you book a car.
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.assign("/cars")}
                            className="mt-5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Browse Cars
                        </button>
                    </div>
                )}

                {/* Booking Cards */}
                {user && !error && bookings.length > 0 && (
                    <div className="mt-7 space-y-4">

                        {bookings.map((booking, index) => {
                            const car = getCarDetails(booking);

                            const carName = car
                                ? `${car.brand || ""} ${car.model || ""}`.trim()
                                : "Car details unavailable";

                            const carImage = getCarImage(car);

                            const totalPrice = getTotalPrice(booking);

                            const bookingStatus =
                                booking.status || "pending";

                            const bookingNumber =
                                booking.bookingNumber ||
                                `#${index + 1}`;

                            return (
                                <motion.article
            initial={{opacity:0,y:20}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.4,delay:index*0.1}}



                                    key={booking._id || index}
                                    className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:grid-cols-[140px_minmax(0,1fr)_115px] sm:gap-5 sm:p-5"
                                >
                                    {/* Car Image and Details */}
                                    <div className="min-w-0">
                                        <img
                                            src={carImage}
                                            alt={carName}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src =
                                                    assets.carIconColored;
                                            }}
                                            className="h-36 w-full rounded-md object-cover sm:h-24 sm:w-32"
                                        />

                                        <h2 className="mt-3 text-sm font-semibold text-gray-900">
                                            {carName}
                                        </h2>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {[
                                                car?.year,
                                                car?.category,
                                                car?.location,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ") ||
                                                "Car information unavailable"}
                                        </p>
                                    </div>

                                    {/* Booking Information */}
                                    <div className="flex min-w-0 flex-col justify-center gap-3">

                                        {/* Booking Number and Status */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-medium text-gray-800">
                                                Booking {bookingNumber}
                                            </span>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(
                                                    bookingStatus
                                                )}`}
                                            >
                                                {formatStatus(bookingStatus)}
                                            </span>
                                        </div>

                                        {/* Rental Period */}
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5 text-sm text-blue-500">
                                                ▣
                                            </span>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Rental Period
                                                </p>

                                                <p className="mt-0.5 text-xs font-medium text-gray-700">
                                                    {formatDate(
                                                        booking.pickupDate
                                                    )}
                                                    {" to "}
                                                    {formatDate(
                                                        booking.returnDate
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pickup Location */}
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5 text-sm text-blue-500">
                                                ●
                                            </span>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Pick-up Location
                                                </p>

                                                <p className="mt-0.5 text-xs font-medium text-gray-700">
                                                    {getPickupLocation(
                                                        booking,
                                                        car
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price and Booking Date */}
                                    <div className="flex flex-row items-center justify-between border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">

                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-gray-500">
                                                Total Price
                                            </p>

                                            <p className="mt-0.5 text-xl font-semibold text-blue-600">
                                                {currency}
                                                {totalPrice}
                                            </p>
                                        </div>

                                        <div className="mt-0 text-right sm:mt-2">
                                            <p className="text-xs text-gray-500">
                                                Booked on{" "}
                                                {formatDate(
                                                    booking.createdAt ||
                                                    booking.bookingDate
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MyBookings;