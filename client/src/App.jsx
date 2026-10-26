
import React from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import MyBookings from './pages/MyBookings';

import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import AddCar from './pages/owner/AddCar';
import ManageCar from './pages/owner/ManageCars';
import ManageBooking from './pages/owner/ManageBooking';

import Login from './components/owner/Login';
import { useAppContext } from './context/AppContext';

const App = () => {
    const { showLogin } = useAppContext();
    const location = useLocation();

    // Check whether the current page belongs to the owner dashboard
    const isOwnerPath = location.pathname.startsWith('/owner');

    return (
        <>
            {/* Toast notifications */}
            <Toaster position="top-right" />

            {/* Login popup */}
            {showLogin && <Login />}

            {/* Navbar for customer pages */}
            {!isOwnerPath && <Navbar />}

            <Routes>
                {/* Home page */}
                <Route path="/" element={<Home />} />

                {/* All cars */}
                <Route path="/cars" element={<Cars />} />

                {/* Car details */}
                <Route
                    path="/car-details/:id"
                    element={<CarDetails />}
                />

                {/* Customer bookings */}
                <Route
                    path="/my-bookings"
                    element={<MyBookings />}
                />

                {/* Owner dashboard layout */}
                <Route path="/owner" element={<Layout />}>
                    {/* Dashboard home */}
                    <Route
                        index
                        element={<Dashboard />}
                    />

                    {/* Add a car */}
                    <Route
                        path="add-car"
                        element={<AddCar />}
                    />

                    {/* Manage cars */}
                    <Route
                        path="manage-cars"
                        element={<ManageCar />}
                    />

                    {/* Manage customer bookings */}
                    <Route
                        path="manage-bookings"
                        element={<ManageBooking />}
                    />
                </Route>

                {/* Page not found */}
                <Route
                    path="*"
                    element={
                        <div className="flex min-h-[60vh] flex-col items-center justify-center">
                            <h1 className="text-3xl font-semibold">
                                404
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Page not found
                            </p>

                            <button
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                className="mt-5 rounded-md bg-blue-600 px-5 py-2 text-white"
                            >
                                Go Home
                            </button>
                        </div>
                    }
                />
            </Routes>

            {/* Footer for customer pages */}
            {!isOwnerPath && <Footer />}
        </>
    );
};

export default App;
