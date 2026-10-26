import express from "express";

import {
    changeBookingStatus,
    checkAvailabilityOfCar,
    createBooking,
    getOwnerBookings,
    getUserBookings,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// Check car availability
bookingRouter.post(
    "/check-availability",
    checkAvailabilityOfCar
);

// Create a booking
bookingRouter.post(
    "/create",
    protect,
    createBooking
);

// Get bookings for the logged-in customer
bookingRouter.get(
    "/user",
    protect,
    getUserBookings
);

// Get bookings for the logged-in owner
bookingRouter.get(
    "/owner",
    protect,
    getOwnerBookings
);

// Change booking status
bookingRouter.post(
    "/change-status",
    protect,
    changeBookingStatus
);

export default bookingRouter;