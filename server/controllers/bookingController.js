import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// Check whether a car is available for the requested dates
const checkAvailability = async (
    carId,
    pickupDate,
    returnDate,
    excludeBookingId = null
) => {
    const query = {
        car: carId,
        status: { $ne: "cancelled" },
        pickupDate: { $lt: returnDate },
        returnDate: { $gt: pickupDate },
    };

    // Exclude the current booking when checking its status
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const overlappingBooking = await Booking.findOne(query);

    return !overlappingBooking;
};

// Check availability of cars
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        if (!location || !pickupDate || !returnDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Location, pickup date and return date are required",
            });
        }

        const pickup = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (
            Number.isNaN(pickup.getTime()) ||
            Number.isNaN(returned.getTime()) ||
            returned <= pickup
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pickup or return date",
            });
        }

        // Escape special regex characters in location
        const escapedLocation = location.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const cars = await Car.find({
            location: {
                $regex: `^${escapedLocation}$`,
                $options: "i",
            },
            isAvailable: true,
        });

        const results = await Promise.all(
            cars.map(async (car) => {
                const available = await checkAvailability(
                    car._id,
                    pickup,
                    returned
                );

                return {
                    ...car.toObject(),
                    isAvailable: available,
                };
            })
        );

        const availableCars = results.filter(
            (car) => car.isAvailable
        );

        return res.status(200).json({
            success: true,
            availableCars,
        });
    } catch (error) {
        console.error("Check availability error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to check car availability",
        });
    }
};


// Create a booking
export const createBooking = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { car, pickupDate, returnDate } = req.body;

        // Check authentication
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please log in to create a booking",
            });
        }

        // Validate required fields
        if (!car || !pickupDate || !returnDate) {
            return res.status(400).json({
                success: false,
                message: "Car, pickup date and return date are required",
            });
        }

        // Validate car ID
        if (!mongoose.isValidObjectId(car)) {
            return res.status(400).json({
                success: false,
                message: "Invalid car ID",
            });
        }

        // Validate dates
        const pickup = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (
            Number.isNaN(pickup.getTime()) ||
            Number.isNaN(returned.getTime()) ||
            returned <= pickup
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pickup or return date",
            });
        }

        // Find car
        const carData = await Car.findById(car);

        if (!carData) {
            return res.status(404).json({
                success: false,
                message: "Car not found",
            });
        }

        if (!carData.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "This car is currently unavailable",
            });
        }

        // Compare actual user and car owner IDs
        const loggedInUserId = userId.toString();

        const carOwnerId = carData.owner
            ? carData.owner.toString()
            : null;

        // Log IDs for debugging
        console.log("Logged-in user:", loggedInUserId);
        console.log("Car owner:", carOwnerId);

        // Prevent booking your own car
        if (carOwnerId === loggedInUserId) {
            return res.status(403).json({
                success: false,
                message: "You cannot book your own car. Please use a customer account.",
            });
        }

        // Check date availability
        const available = await checkAvailability(
            carData._id,
            pickup,
            returned
        );

        if (!available) {
            return res.status(409).json({
                success: false,
                message: "Car is already booked for these dates",
            });
        }

        // Calculate rental days
        const millisecondsPerDay = 1000 * 60 * 60 * 24;

        const noOfDays = Math.ceil(
            (returned.getTime() - pickup.getTime()) /
            millisecondsPerDay
        );

        const price = Number(carData.pricePerDay) * noOfDays;

        if (!Number.isFinite(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid car rental price",
            });
        }

        // Create booking
        const booking = await Booking.create({
            car: carData._id,
            owner: carData.owner,
            user: userId,
            pickupDate: pickup,
            returnDate: returned,
            price,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking,
        });

    } catch (error) {
        console.error("Create booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};



// Get bookings for the logged-in user

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id;

        const bookings = await Booking.find({ user: userId })
            .populate("car")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("Get User Bookings Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Get bookings belonging to the logged-in owner
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user?.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only owners can view these bookings",
            });
        }

        const ownerId = req.user._id;

        const bookings = await Booking.find({
            owner: ownerId,
        })
            .populate("car")
            .populate("user", "name email image")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("Get owner bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch owner bookings",
        });
    }
};

// Change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const ownerId = req.user?._id;
        const { bookingId, status } = req.body;

        if (!ownerId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        if (req.user.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only owners can change booking status",
            });
        }

        if (!bookingId || !status) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and status are required",
            });
        }

        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const allowedStatuses = [
            "pending",
            "confirmed",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            owner: ownerId,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or unauthorized",
            });
        }

        // Only check overlaps when confirming
        if (
            status === "confirmed" &&
            booking.status !== "confirmed"
        ) {
            const available = await checkAvailability(
                booking.car,
                booking.pickupDate,
                booking.returnDate,
                booking._id
            );

            if (!available) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another active booking overlaps these dates",
                });
            }
        }

        booking.status = status;

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        console.error("Change booking status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update booking status",
        });
    }
};