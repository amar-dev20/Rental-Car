import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import imagekit from "../configs/imagekit.js";
import fs from "fs/promises";
import mongoose from "mongoose";

// Change user role to owner
export const changeRoleToOwner = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { role: "owner" },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "You can now list cars",
            user,
        });
    } catch (error) {
        console.error("Change role error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to change user role",
        });
    }
};

// Add a new car
export const addCar = async (req, res) => {
    let imagePath;

    try {
        if (req.user?.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only owners can add cars",
            });
        }

        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({
                success: false,
                message:
                    'Car image is required. Use FormData field "image".',
            });
        }

        imagePath = imageFile.path;

        if (!req.body.carData) {
            return res.status(400).json({
                success: false,
                message: "Car data is required",
            });
        }

        let carData;

        try {
            carData = JSON.parse(req.body.carData);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid car data JSON",
            });
        }

        const requiredFields = [
            "brand",
            "model",
            "year",
            "category",
            "seating_capacity",
            "fuel_type",
            "transmission",
            "pricePerDay",
            "location",
            "description",
        ];

        for (const field of requiredFields) {
            if (
                carData[field] === undefined ||
                carData[field] === null ||
                carData[field] === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`,
                });
            }
        }

        const fileBuffer = await fs.readFile(imagePath);

        const uploadedImage = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/cars",
        });

        if (!uploadedImage?.filePath) {
            throw new Error("ImageKit did not return an image path");
        }

        const imageUrl = imagekit.url({
            path: uploadedImage.filePath,
            transformation: [
                { width: "1280" },
                { quality: "auto" },
                { format: "webp" },
            ],
        });

        const car = await Car.create({
            ...carData,
            owner: req.user._id,
            image: imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Car added successfully",
            car,
        });
    } catch (error) {
        console.error("Add car error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add car",
        });
    } finally {
        if (imagePath) {
            await fs.unlink(imagePath).catch(() => {});
        }
    }
};

// Get cars belonging to the logged-in owner
export const getOwnerCars = async (req, res) => {
    try {
        const cars = await Car.find({
            owner: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            cars,
        });
    } catch (error) {
        console.error("Get owner cars error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch owner cars",
        });
    }
};

// Toggle car availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { carId } = req.body;

        if (!carId) {
            return res.status(400).json({
                success: false,
                message: "Car ID is required",
            });
        }

        const car = await Car.findOne({
            _id: carId,
            owner: req.user._id,
        });

        if (!car) {
            return res.status(404).json({
                success: false,
                message: "Car not found or unauthorized",
            });
        }

        car.isAvailable = !car.isAvailable;

        await car.save();

        return res.status(200).json({
            success: true,
            message: "Car availability updated",
            car,
        });
    } catch (error) {
        console.error("Toggle availability error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update car availability",
        });
    }
};

// Delete a car
export const deleteCar = async (req, res) => {
    try {
        const { carId } = req.body;

        if (!carId) {
            return res.status(400).json({
                success: false,
                message: "Car ID is required",
            });
        }

        const car = await Car.findOne({
            _id: carId,
            owner: req.user._id,
        });

        if (!car) {
            return res.status(404).json({
                success: false,
                message: "Car not found or unauthorized",
            });
        }

        // Avoid deleting a car that has booking records
        const hasBookings = await Booking.exists({
            car: car._id,
        });

        if (hasBookings) {
            return res.status(409).json({
                success: false,
                message:
                    "This car has booking records. Disable its availability instead of deleting it.",
            });
        }

        await Car.deleteOne({
            _id: car._id,
            owner: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Car deleted successfully",
        });
    } catch (error) {
        console.error("Delete car error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete car",
        });
    }
};

// Get complete owner dashboard data

export const getDashboardData = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        if (req.user.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only owners can access the dashboard",
            });
        }

        const ownerId = new mongoose.Types.ObjectId(
            req.user._id.toString()
        );

        const now = new Date();

        const monthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const nextMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        const [
            totalCars,
            availableCars,
            totalBookings,
            pendingBookings,
            confirmedBookings,
            recentBookings,
            revenueResult,
            allPendingBookings,
        ] = await Promise.all([
            Car.countDocuments({
                owner: ownerId,
            }),

            Car.countDocuments({
                owner: ownerId,
                isAvailable: true,
            }),

            Booking.countDocuments({
                owner: ownerId,
            }),

            Booking.countDocuments({
                owner: ownerId,
                status: "pending",
            }),

            Booking.countDocuments({
                owner: ownerId,
                status: "confirmed",
            }),

            Booking.find({
                owner: ownerId,
            })
                .populate("car")
                .populate("user", "name email image")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            Booking.aggregate([
                {
                    $match: {
                        owner: ownerId,
                        status: "confirmed",
                        createdAt: {
                            $gte: monthStart,
                            $lt: nextMonthStart,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$price",
                        },
                    },
                },
            ]),

            // Diagnostic query: pending bookings across all owners
            Booking.find({
                status: "pending",
            })
                .select("_id owner user car status createdAt")
                .lean(),
        ]);

        const monthlyRevenue = revenueResult[0]?.total || 0;

        // Temporary diagnostic logs
        console.log("\n========== DASHBOARD DEBUG ==========");
        console.log("Logged-in owner ID:", ownerId.toString());
        console.log("Logged-in owner role:", req.user.role);
        console.log("Total cars:", totalCars);
        console.log("Total bookings for owner:", totalBookings);
        console.log("Pending bookings for owner:", pendingBookings);
        console.log("Confirmed bookings for owner:", confirmedBookings);
        console.log(
            "All pending bookings in database:",
            allPendingBookings.map((booking) => ({
                bookingId: booking._id.toString(),
                ownerId: booking.owner?.toString(),
                status: booking.status,
            }))
        );
        console.log("=====================================\n");

        return res.status(200).json({
            success: true,
            dashboardData: {
                totalCars,
                availableCars,
                unavailableCars: totalCars - availableCars,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                recentBookings,
                monthlyRevenue,
            },
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
        });
    }
};



// Update owner profile image
export const updateUserImage = async (req, res) => {
    let imagePath;

    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    'Image is required. Use FormData field "image".',
            });
        }

        imagePath = req.file.path;

        const fileBuffer = await fs.readFile(imagePath);

        const uploadedImage = await imagekit.upload({
            file: fileBuffer,
            fileName: req.file.originalname,
            folder: "/users",
        });

        if (!uploadedImage?.filePath) {
            throw new Error("ImageKit did not return an image path");
        }

        const imageUrl = imagekit.url({
            path: uploadedImage.filePath,
            transformation: [
                { width: "400" },
                { quality: "auto" },
                { format: "webp" },
            ],
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    image: imageUrl,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            user,
        });
    } catch (error) {
        console.error("Update profile image error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update profile image",
        });
    } finally {
        if (imagePath) {
            await fs.unlink(imagePath).catch(() => {});
        }
    }
};