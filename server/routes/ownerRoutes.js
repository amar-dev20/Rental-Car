import express from "express";

import { protect } from "../middleware/auth.js";

import {
  addCar,
  changeRoleToOwner,
  deleteCar,
  getOwnerCars,
  toggleCarAvailability,
  updateUserImage,
  getDashboardData,
} from "../controllers/ownerController.js";

import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

// Change user role to owner
ownerRouter.post(
  "/change-role",
  protect,
  changeRoleToOwner
);

// Add a new car
ownerRouter.post(
  "/add-car",
  protect,
  upload.single("image"),
  addCar
);

// Get all cars belonging to the logged-in owner
ownerRouter.get(
  "/cars",
  protect,
  getOwnerCars
);

// Toggle car availability
ownerRouter.post(
  "/toggle-car",
  protect,
  toggleCarAvailability
);

// Remove car from owner's listing
ownerRouter.post(
  "/delete-car",
  protect,
  deleteCar
);

// Get owner dashboard data
ownerRouter.get(
  "/dashboard",
  protect,
  getDashboardData
);

// Update owner profile image
ownerRouter.post(
  "/update-image",
  protect,
  upload.single("image"),
  updateUserImage
);

export default ownerRouter;