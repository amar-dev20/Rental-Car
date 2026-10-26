import React, { useCallback, useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ManageBooking = () => {
const { currency, axios, isOwner } = useAppContext();

const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [updatingBookingId, setUpdatingBookingId] = useState(null);

// Fetch all bookings for the logged-in owner
const fetchOwnerBookings = useCallback(async () => {
try {
setLoading(true);


  const { data } = await axios.get("/api/bookings/owner");

  if (data.success) {
    setBookings(data.bookings || []);
  } else {
    setBookings([]);
    toast.error(data.message || "Failed to fetch bookings");
  }
} catch (error) {
  console.error(
    "Fetch owner bookings error:",
    error.response?.data || error.message
  );

  setBookings([]);

  toast.error(
    error.response?.data?.message || "Failed to fetch bookings"
  );
} finally {
  setLoading(false);
}


}, [axios]);

// Update booking status
const handleStatusChange = async (bookingId, status) => {
try {
setUpdatingBookingId(bookingId);


  const { data } = await axios.post(
    "/api/bookings/change-status",
    {
      bookingId,
      status,
    }
  );

  if (data.success) {
    toast.success(data.message || "Booking status updated");

    setBookings((previousBookings) =>
      previousBookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, status }
          : booking
      )
    );
  } else {
    toast.error(data.message || "Failed to update booking status");
  }
} catch (error) {
  console.error(
    "Update booking status error:",
    error.response?.data || error.message
  );

  toast.error(
    error.response?.data?.message ||
      "Failed to update booking status"
  );
} finally {
  setUpdatingBookingId(null);
}


};

useEffect(() => {
if (isOwner) {
fetchOwnerBookings();
} else {
setLoading(false);
}
}, [isOwner, fetchOwnerBookings]);

return ( <div className="flex-1 min-h-screen bg-white px-4 pt-8 sm:px-6 md:px-10 md:pt-10">
{/* Page heading */} <Title
     title="Manage Bookings"
     subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses."
   />


  {/* Loading */}
  {loading ? (
    <p className="mt-8 text-sm text-gray-500">
      Loading bookings...
    </p>
  ) : !isOwner ? (
    <p className="mt-8 text-sm text-red-500">
      You are not authorized to manage bookings.
    </p>
  ) : (
    <div className="mt-5 w-full max-w-4xl overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full min-w-[600px] border-collapse text-left text-xs text-gray-600">
        {/* Table header */}
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="px-3 py-3 font-medium sm:px-4">
              Car
            </th>

            <th className="px-3 py-3 font-medium sm:px-4">
              Date Range
            </th>

            <th className="px-3 py-3 font-medium sm:px-4">
              Total
            </th>

            <th className="px-3 py-3 font-medium sm:px-4">
              Payment
            </th>

            <th className="px-3 py-3 font-medium sm:px-4">
              Actions
            </th>
          </tr>
        </thead>

        {/* Booking rows */}
        <tbody>
          {bookings.map((booking) => {
            const car = booking.car || {};

            const image = Array.isArray(car.image)
              ? car.image[0]
              : car.image;

            const bookingStatus = (
              booking.status || "pending"
            ).toLowerCase();

            const paymentMethod = (
              booking.paymentMethod || "offline"
            ).toLowerCase();

            return (
              <tr
                key={booking._id}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                {/* Car */}
                <td className="px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    {image ? (
                      <img
                        src={image}
                        alt={`${car.brand || ""} ${car.model || ""}`}
                        className="h-10 w-14 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[9px] text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="whitespace-nowrap font-medium text-gray-800">
                        {car.brand || ""} {car.model || "Car"}
                      </p>

                      <p className="whitespace-nowrap text-[10px] text-gray-500">
                        {car.year
                          ? car.year
                          : car.transmission || ""}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Date Range */}
                <td className="whitespace-nowrap px-3 py-2 text-[11px] sm:px-4">
                  {booking.pickupDate
                    ? new Date(booking.pickupDate)
                        .toISOString()
                        .slice(0, 10)
                    : "N/A"}

                  {" to "}

                  {booking.returnDate
                    ? new Date(booking.returnDate)
                        .toISOString()
                        .slice(0, 10)
                    : "N/A"}
                </td>

                {/* Total */}
                <td className="whitespace-nowrap px-3 py-2 sm:px-4">
                  {currency || "₹"}
                  {Number(
                    booking.price ?? booking.totalPrice ?? 0
                  ).toLocaleString("en-IN")}
                </td>

                {/* Payment */}
                <td className="px-3 py-2 sm:px-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-500">
                    {paymentMethod}
                  </span>
                </td>

                {/* Actions: Always show dropdown */}
                <td className="px-3 py-2 sm:px-4">
                  <select
                    value={bookingStatus}
                    disabled={updatingBookingId === booking._id}
                    onChange={(event) =>
                      handleStatusChange(
                        booking._id,
                        event.target.value
                      )
                    }
                    className={`w-[100px] cursor-pointer rounded-md border border-gray-200 px-2 py-1.5 text-[11px] outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 ${
                      bookingStatus === "confirmed"
                        ? "bg-emerald-50 text-emerald-600"
                        : bookingStatus === "cancelled"
                          ? "bg-red-50 text-red-500"
                          : "bg-white text-gray-600"
                    }`}
                    aria-label={`Update booking status for ${
                      car.brand || ""
                    } ${car.model || ""}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </td>
              </tr>
            );
          })}

          {/* Empty state */}
          {bookings.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</div>


);
};

export default ManageBooking;
