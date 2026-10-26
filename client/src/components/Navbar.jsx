import React, { useState } from "react";
import { assets, menuLinks } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import {motion} from 'motion/react'

const Navbar = () => {
  const {
    setShowLogin,
    user,
    logout,
    isOwner,
    axios,
    setIsOwner,
    setUser,
    token,
  } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [changingRole, setChangingRole] = useState(false);

  // Handle List Cars / Dashboard button
  const handleListCars = async () => {
    setOpen(false);

    // User must be logged in
    if (!user || !token || !localStorage.getItem("token")) {
      setShowLogin(true);
      toast.error("Please login first to list your car");
      return;
    }

    // If already an owner, open dashboard
    if (isOwner || user.role === "owner") {
      navigate("/owner");
      return;
    }

    // Prevent duplicate requests
    if (changingRole) {
      return;
    }

    try {
      setChangingRole(true);

      // Axios interceptor automatically attaches the saved JWT
      const { data } = await axios.post(
        "/api/owner/change-role"
      );

      if (!data.success) {
        toast.error(
          data.message || "Failed to update your account role"
        );
        return;
      }

      // Update the user using the server response
      if (data.user) {
        setUser(data.user);
      } else {
        // Refresh user information if the response has no user
        await refreshUserRole();
      }

      setIsOwner(true);

      toast.success(data.message || "You can now list cars");

      // Open the owner dashboard
      navigate("/owner");
    } catch (error) {
      console.error("Change role error:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(message || "Unable to activate owner account");
      }
    } finally {
      setChangingRole(false);
    }
  };

  // Refresh user details if necessary
  const refreshUserRole = async () => {
    const { data } = await axios.get("/api/user/data");

    if (data.success && data.user) {
      setUser(data.user);
      setIsOwner(data.user.role === "owner");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    < motion.nav
    initial={{y: -20,opacity:0}}
    animate={{y:0,opacity:1}}
    transition={{duration:0.5}}
      className={`relative flex items-center justify-between border-b border-borderColor px-6 py-4 text-gray-600 transition-all md:px-16 lg:px-24 xl:px-32 ${
        location.pathname === "/" ? "bg-light" : "bg-white"
      }`}
    >
      {/* Logo */}
      <Link to="/" onClick={() => setOpen(false)}>
        <motion.img 
        whileHover={{scale:1.05}}
          src={assets.logo}
          alt="CarRental logo"
          className="h-8"
        />
      </Link>

      {/* Navigation links */}
      <div
        className={`max-sm:fixed max-sm:right-0 max-sm:top-16 max-sm:h-screen max-sm:w-full max-sm:border-t max-sm:border-borderColor max-sm:p-4 sm:flex sm:items-center sm:gap-4 sm:p-0 ${
          location.pathname === "/" ? "bg-light" : "bg-white"
        } ${
          open
            ? "max-sm:translate-x-0"
            : "max-sm:translate-x-full"
        } z-50 flex flex-col items-start gap-4 transition-all duration-300 sm:flex-row sm:items-center`}
      >
        {/* Main links */}
        {menuLinks.map((link, index) => (
          <Link
            key={link.path || index}
            to={link.path}
            onClick={() => setOpen(false)}
            className="transition-colors hover:text-primary"
          >
            {link.name}
          </Link>
        ))}

        {/* Search */}
        <div className="hidden max-w-3xl items-center gap-2 rounded-full border border-borderColor px-3 text-sm lg:flex">
          <input
            type="text"
            className="w-full bg-transparent py-1.5 outline-none placeholder-gray-500"
            placeholder="Search products"
            aria-label="Search products"
          />

          <img
            src={assets.search_icon}
            alt=""
            className="h-4 w-4"
          />
        </div>

        {/* Authentication and owner actions */}
        <div className="flex items-start gap-6 max-sm:flex-col sm:items-center">
          <button
            type="button"
            onClick={handleListCars}
            disabled={changingRole}
            className="cursor-pointer whitespace-nowrap transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingRole
              ? "Please wait..."
              : isOwner || user?.role === "owner"
                ? "Dashboard"
                : "List cars"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (user) {
                handleLogout();
              } else {
                setShowLogin(true);
                setOpen(false);
              }
            }}
            className="cursor-pointer rounded-lg bg-primary px-8 py-2 text-white transition-all hover:bg-primary-dull"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="cursor-pointer sm:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <img
          src={open ? assets.close_icon : assets.menu_icon}
          alt=""
        />
      </button>
    </ motion.nav>
  );
};

export default Navbar;