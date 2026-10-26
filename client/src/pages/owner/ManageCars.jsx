
import React, { useCallback, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const ManageCars = () => {
  const { isOwner, axios, currency } = useAppContext();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCarId, setUpdatingCarId] = useState(null);
  const [deletingCarId, setDeletingCarId] = useState(null);

  // Fetch cars belonging to the logged-in owner
  const fetchOwnerCars = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/api/owner/cars");

      if (data.success) {
        setCars(data.cars || []);
      } else {
        toast.error(data.message || "Failed to fetch cars");
      }
    } catch (error) {
      console.error(
        "Fetch owner cars error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to fetch cars"
      );
    } finally {
      setLoading(false);
    }
  }, [axios]);

  // Toggle car availability
  const toggleAvailability = async (carId) => {
    try {
      setUpdatingCarId(carId);

      const { data } = await axios.post("/api/owner/toggle-car", {
        carId,
      });

      if (data.success) {
        toast.success(data.message || "Availability updated");

        setCars((previousCars) =>
          previousCars.map((car) =>
            car._id === carId
              ? { ...car, isAvailable: !car.isAvailable }
              : car
          )
        );
      } else {
        toast.error(data.message || "Failed to update availability");
      }
    } catch (error) {
      console.error(
        "Toggle availability error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to update availability"
      );
    } finally {
      setUpdatingCarId(null);
    }
  };

  // Delete a car
  const deleteCar = async (carId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this car?"
    );

    if (!confirmed) return;

    try {
      setDeletingCarId(carId);

      const { data } = await axios.post("/api/owner/delete-car", {
        carId,
      });

      if (data.success) {
        toast.success(data.message || "Car removed successfully");

        setCars((previousCars) =>
          previousCars.filter((car) => car._id !== carId)
        );
      } else {
        toast.error(data.message || "Failed to remove car");
      }
    } catch (error) {
      console.error(
        "Delete car error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to remove car"
      );
    } finally {
      setDeletingCarId(null);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchOwnerCars();
    } else {
      setLoading(false);
    }
  }, [isOwner, fetchOwnerCars]);

  return (
    <div className="flex-1 min-h-screen bg-white px-4 pt-8 sm:px-6 md:px-10 md:pt-10">
      {/* Page heading */}
      <Title
        title="Manage Cars"
        subTitle="View all listed cars, update their details, or remove them from the booking platform."
      />

      {/* Loading state */}
      {loading ? (
        <div className="mt-8 text-sm text-gray-500">
          Loading cars...
        </div>
      ) : !isOwner ? (
        <div className="mt-8 text-sm text-red-500">
          You are not authorized to manage cars.
        </div>
      ) : cars.length === 0 ? (
        <div className="mt-8 text-sm text-gray-500">
          No cars found. Add a car to see it here.
        </div>
      ) : (
        <div className="mt-5 w-full max-w-4xl overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm text-gray-600">
            {/* Table heading */}
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="px-3 py-3 font-medium sm:px-4">
                  Car
                </th>

                <th className="px-3 py-3 font-medium sm:px-4">
                  Category
                </th>

                <th className="px-3 py-3 font-medium sm:px-4">
                  Price
                </th>

                <th className="px-3 py-3 font-medium sm:px-4">
                  Status
                </th>

                <th className="px-3 py-3 text-center font-medium sm:px-4">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Car list */}
            <tbody>
              {cars.map((car) => (
                <tr
                  key={car._id}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  {/* Car image and details */}
                  <td className="px-3 py-2 sm:px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          Array.isArray(car.image)
                            ? car.image[0] || assets.car_image1
                            : car.image || assets.car_image1
                        }
                        alt={`${car.brand || ""} ${car.model || ""}`}
                        className="h-10 w-14 shrink-0 rounded-md object-cover"
                      />

                      <div className="min-w-0">
                        <p className="whitespace-nowrap font-medium text-gray-800">
                          {car.brand} {car.model}
                        </p>

                        <p className="mt-0.5 whitespace-nowrap text-[11px] text-gray-500">
                          {car.seating_capacity
                            ? `${car.seating_capacity} Seats`
                            : car.seatingCapacity
                              ? `${car.seatingCapacity} Seats`
                              : car.year || ""}
                          {" "}
                          {car.transmission
                            ? `• ${car.transmission}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2 text-xs sm:px-4">
                    {car.category || "-"}
                  </td>

                  {/* Price */}
                  <td className="whitespace-nowrap px-3 py-2 text-xs sm:px-4">
                    {currency}
                    {car.pricePerDay}
                    <span className="text-gray-400">/day</span>
                  </td>

                  {/* Availability badge */}
                  <td className="px-3 py-2 sm:px-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        car.isAvailable
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {car.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-3 py-2 sm:px-4">
                    <div className="flex items-center justify-center gap-3">
                      {/* Toggle availability */}
                      <button
                        type="button"
                        onClick={() => toggleAvailability(car._id)}
                        disabled={
                          updatingCarId === car._id ||
                          deletingCarId === car._id
                        }
                        title={
                          car.isAvailable
                            ? "Mark as unavailable"
                            : "Mark as available"
                        }
                        aria-label={`Toggle availability for ${car.brand} ${car.model}`}
                        className="text-gray-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingCarId === car._id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {car.isAvailable ? (
                              <>
                                <path d="M3 3l18 18" />
                                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                <path d="M9.9 5.2A10.9 10.9 0 0112 5c5 0 8.3 4.5 9 7-.3 1-1 2.2-2 3.3" />
                                <path d="M6.6 6.6C4.2 8 2.6 10.5 2 12c.5 1.7 3.8 7 10 7 1.4 0 2.7-.3 3.8-.9" />
                              </>
                            ) : (
                              <>
                                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            )}
                          </svg>
                        )}
                      </button>

                      {/* Delete car */}
                      <button
                        type="button"
                        onClick={() => deleteCar(car._id)}
                        disabled={
                          deletingCarId === car._id ||
                          updatingCarId === car._id
                        }
                        title="Remove car"
                        aria-label={`Remove ${car.brand} ${car.model}`}
                        className="text-gray-500 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingCarId === car._id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v5M14 11v5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCars;

