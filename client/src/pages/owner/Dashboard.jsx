
import React, { useState, useEffect, useCallback } from "react";
import { assets } from "../../assets/assets";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const initialDashboardData = {
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
};

const Dashboard = () => {
    const { axios, isOwner, currency } = useAppContext();

    const [data, setData] = useState(initialDashboardData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const { data: response } = await axios.get(
                "/api/owner/dashboard"
            );

            console.log("Dashboard API Response:", response);

            if (!response?.success) {
                throw new Error(
                    response?.message || "Failed to fetch dashboard data."
                );
            }

            const dashboardData = response.dashboardData || {};

            setData({
                totalCars: Number(dashboardData.totalCars) || 0,
                totalBookings: Number(dashboardData.totalBookings) || 0,
                pendingBookings:
                    Number(dashboardData.pendingBookings) || 0,
                confirmedBookings:
                    Number(dashboardData.confirmedBookings) || 0,
                recentBookings: Array.isArray(
                    dashboardData.recentBookings
                )
                    ? dashboardData.recentBookings
                    : [],
                monthlyRevenue:
                    Number(dashboardData.monthlyRevenue) || 0,
            });
        } catch (err) {
            console.error("Dashboard API Error:", {
                status: err.response?.status,
                url: err.config?.url,
                response: err.response?.data,
                message: err.message,
            });

            const message =
                err.response?.data?.message ||
                err.message ||
                "Failed to load dashboard.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [axios]);

    useEffect(() => {
        if (isOwner) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [isOwner, fetchDashboardData]);

    const dashboardCards = [
        {
            title: "Total Cars",
            value: data.totalCars,
            icon: assets.carIconColored,
        },
        {
            title: "Total Bookings",
            value: data.totalBookings,
            icon: assets.listIconColored,
        },
        {
            title: "Pending Bookings",
            value: data.pendingBookings,
            icon: assets.listIconColored,
        },
        {
            title: "Confirmed Bookings",
            value: data.confirmedBookings,
            icon: assets.carIconColored,
        },
    ];

    if (loading) {
        return (
            <div className="flex-1 px-4 pt-10 md:px-10">
                <Title
                    title="Admin Dashboard"
                    subTitle="Monitor cars, bookings, revenue, and recent activities."
                />

                <p className="mt-8 text-center text-gray-500">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="flex-1 px-4 pt-10 md:px-10">
                <Title
                    title="Admin Dashboard"
                    subTitle="Monitor cars, bookings, revenue, and recent activities."
                />

                <p className="mt-8 text-center text-red-500">
                    You are not authorized to access this dashboard.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 px-4 pt-10 md:px-10">
                <Title
                    title="Admin Dashboard"
                    subTitle="Monitor cars, bookings, revenue, and recent activities."
                />

                <div className="mt-8 rounded-lg border border-red-200 p-6 text-center">
                    <p className="font-medium text-red-600">
                        Unable to load dashboard
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchDashboardData}
                        className="mt-5 rounded-md bg-primary px-5 py-2 text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 px-4 pt-10 md:px-10">
            <Title
                title="Admin Dashboard"
                subTitle="Monitor cars, bookings, revenue, and recent activities."
            />

            <div className="my-8 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dashboardCards.map((card) => (
                    <div
                        key={card.title}
                        className="flex items-center justify-between gap-2 rounded-md border border-borderColor p-4"
                    >
                        <div>
                            <h1 className="text-xs text-gray-500">
                                {card.title}
                            </h1>

                            <p className="text-lg font-semibold">
                                {card.value.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <img
                                src={card.icon}
                                alt=""
                                className="h-4 w-4"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-8 flex w-full flex-wrap items-start gap-6">
                <div className="w-full max-w-2xl rounded-md border border-borderColor p-4 md:p-6">
                    <h1 className="text-lg font-medium">
                        Recent Bookings
                    </h1>

                    <p className="text-gray-500">
                        Latest customer bookings
                    </p>

                    {data.recentBookings.length > 0 ? (
                        data.recentBookings.map((booking, index) => {
                            const car =
                                booking.car &&
                                typeof booking.car === "object"
                                    ? booking.car
                                    : null;

                            const customer =
                                booking.user &&
                                typeof booking.user === "object"
                                    ? booking.user
                                    : null;

                            const status = (
                                booking.status || "pending"
                            ).toLowerCase();

                            const statusClass =
                                status === "confirmed"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : status === "cancelled"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-yellow-200 bg-yellow-50 text-yellow-700";

                            return (
                                <div
                                    key={booking._id || index}
                                    className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-borderColor pb-4 last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-primary/10 md:flex">
                                            <img
                                                src={assets.listIconColored}
                                                alt=""
                                                className="h-5 w-5"
                                            />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                {car
                                                    ? `${car.brand || ""} ${car.model || ""}`.trim() ||
                                                      "Car"
                                                    : "Car details unavailable"}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {booking.createdAt
                                                    ? new Date(
                                                          booking.createdAt
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "Date unavailable"}
                                            </p>

                                            {customer?.name && (
                                                <p className="text-xs text-gray-500">
                                                    Customer: {customer.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium text-gray-600">
                                            {currency}
                                            {(
                                                Number(booking.price) || 0
                                            ).toLocaleString("en-IN")}
                                        </p>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs ${statusClass}`}
                                        >
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">
                            No recent bookings found.
                        </p>
                    )}
                </div>

                <div className="w-full max-w-xs rounded-md border border-borderColor p-4 md:p-6">
                    <h1 className="text-lg font-medium">
                        Monthly Revenue
                    </h1>

                    <p className="text-gray-500">
                        Revenue for the current month
                    </p>

                    <p className="mt-6 text-3xl font-semibold text-primary">
                        {currency}
                        {data.monthlyRevenue.toLocaleString("en-IN")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

