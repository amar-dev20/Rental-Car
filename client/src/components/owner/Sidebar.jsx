import React, { useState, useEffect } from "react";
import { assets, ownerMenuLinks } from "../../assets/assets";
import { useLocation, NavLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const Sidebar = () => {
    const { user, axios, fetchUser } = useAppContext();
    const location = useLocation();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [uploading, setUploading] = useState(false);

    // Create a temporary preview of the selected image
    useEffect(() => {
        if (!image) {
            setPreview("");
            return;
        }

        const imageUrl = URL.createObjectURL(image);
        setPreview(imageUrl);

        return () => {
            URL.revokeObjectURL(imageUrl);
        };
    }, [image]);

    // Select and validate profile image
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB");
            event.target.value = "";
            return;
        }

        setImage(file);

        // Allow selecting the same file again later
        event.target.value = "";
    };

    // Upload profile image to backend
    const updateImage = async () => {
        if (!image) {
            toast.error("Please select an image first");
            return;
        }

        if (uploading) return;

        setUploading(true);

        try {
            const formData = new FormData();

            // Must match upload.single("image") in ownerRoute.js
            formData.append("image", image);

            const response = await axios.post(
                "/api/owner/update-image",
                formData
            );

            const data = response.data;

            if (!data?.success) {
                throw new Error(
                    data?.message || "Failed to update profile image"
                );
            }

            if (typeof fetchUser === "function") {
                await fetchUser();
            }

            setImage(null);

            toast.success(
                data.message || "Profile image updated successfully"
            );
        } catch (error) {
            console.error("Profile image upload failed:", {
                status: error.response?.status,
                response: error.response?.data,
                message: error.message,
            });

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to update profile image"
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative min-h-screen md:flex flex-col items-center pt-8 w-full md:w-auto md:min-w-48 border-r border-bordercolor text-sm">

            {/* Profile image */}
            <div className="group relative">
                <label
                    htmlFor="profile-image"
                    className="cursor-pointer"
                >
                    <img
                        src={
                            preview ||
                            user?.image ||
                            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"
                        }
                        alt="Profile"
                        className="h-9 w-9 md:h-14 md:w-14 rounded-full mx-auto object-cover"
                    />

                    <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        hidden
                        disabled={uploading}
                        onChange={handleImageChange}
                    />

                    <div className="absolute inset-0 hidden bg-black/10 rounded-full group-hover:flex items-center justify-center">
                        <img
                            src={assets.edit_icon}
                            alt="Edit profile"
                            className="w-5 h-5"
                        />
                    </div>
                </label>
            </div>

            {/* Save image button */}
            {image && (
                <button
                    type="button"
                    onClick={updateImage}
                    disabled={uploading}
                    className="flex items-center gap-2 mt-2 px-3 py-1 rounded bg-primary text-white disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Save"}

                    {!uploading && (
                        <img
                            src={assets.check_icon}
                            width={13}
                            alt="Confirm"
                        />
                    )}
                </button>
            )}

            {/* User name */}
            <p className="mt-2 text-base max-md:hidden">
                {user?.name || "User"}
            </p>

            {/* Sidebar navigation */}
            <div className="w-full">
                {ownerMenuLinks.map((link, index) => {
                    const isActive =
                        location.pathname === link.path ||
                        (
                            link.path !== "/" &&
                            location.pathname.startsWith(`${link.path}/`)
                        );

                    return (
                        <NavLink
                            key={link.path || index}
                            to={link.path}
                            className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600"
                            }`}
                        >
                            <img
                                src={
                                    isActive
                                        ? link.coloredIcon
                                        : link.icon
                                }
                                alt=""
                                className="w-5 h-5"
                            />

                            <span className="max-md:hidden">
                                {link.name}
                            </span>

                            <div
                                className={`w-1.5 h-8 rounded-l right-0 absolute ${
                                    isActive ? "bg-primary" : ""
                                }`}
                            />
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;