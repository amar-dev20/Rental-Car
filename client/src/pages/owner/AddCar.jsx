import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AddCar = () => {
    // Correctly get axios and currency from context
    const { axios, currency } = useAppContext();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [car, setCar] = useState({
        brand: '',
        model: '',
        year: '',
        pricePerDay: '',
        category: '',
        transmission: '',
        fuel_type: '',
        seating_capacity: '',
        location: '',
        description: '',
    });

    // Image preview
    useEffect(() => {
        if (!image) {
            setPreview('');
            return;
        }

        const imageUrl = URL.createObjectURL(image);
        setPreview(imageUrl);

        return () => {
            URL.revokeObjectURL(imageUrl);
        };
    }, [image]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setCar((prevCar) => ({
            ...prevCar,
            [name]: value,
        }));
    };

    // Handle form submission
    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!image) {
            toast.error('Please select a car image');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            formData.append('image', image);
            formData.append('carData', JSON.stringify(car));

            const { data } = await axios.post(
                '/api/owner/add-car',
                formData
            );

            if (data.success) {
                toast.success(data.message || 'Car added successfully');

                // Reset image and form
                setImage(null);

                setCar({
                    brand: '',
                    model: '',
                    year: '',
                    pricePerDay: '',
                    category: '',
                    transmission: '',
                    fuel_type: '',
                    seating_capacity: '',
                    location: '',
                    description: '',
                });
            } else {
                toast.error(data.message || 'Failed to add car');
            }
        } catch (error) {
            console.error(
                'Add car error:',
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to add car'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-10 md:px-10 flex-1">
            <Title
                title="Add New Car"
                subTitle="Fill in details to list a new car for booking, including pricing, availability, and car specifications."
            />

            <form
                onSubmit={onSubmitHandler}
                className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
            >
                {/* Car Image */}
                <div className="flex items-center gap-3 w-full">
                    <label htmlFor="car-image" className="cursor-pointer">
                        <img
                            src={preview || assets.upload_icon}
                            alt="Upload car"
                            className="h-14 w-14 object-cover rounded"
                        />

                        <input
                            type="file"
                            id="car-image"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (file && file.type.startsWith('image/')) {
                                    setImage(file);
                                } else if (file) {
                                    toast.error('Please select a valid image');
                                }

                                e.target.value = '';
                            }}
                        />
                    </label>

                    <p className="text-sm text-gray-500">
                        Upload a picture of your car
                    </p>
                </div>

                {/* Brand and Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col w-full">
                        <label htmlFor="brand">Brand</label>
                        <input
                            id="brand"
                            name="brand"
                            type="text"
                            placeholder="e.g. BMW, Mercedes, Audi"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.brand}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="model">Model</label>
                        <input
                            id="model"
                            name="model"
                            type="text"
                            placeholder="e.g. X5, E-Class, M4"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.model}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Year, Price and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex flex-col w-full">
                        <label htmlFor="year">Year</label>
                        <input
                            id="year"
                            name="year"
                            type="number"
                            placeholder="2025"
                            min="1900"
                            max="2100"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.year}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="pricePerDay">
                            Daily Price ({currency})
                        </label>
                        <input
                            id="pricePerDay"
                            name="pricePerDay"
                            type="number"
                            placeholder="100"
                            min="1"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.pricePerDay}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.category}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Van">Van</option>
                            <option value="Coupe">Coupe</option>
                            <option value="Hatchback">Hatchback</option>
                        </select>
                    </div>
                </div>

                {/* Transmission, Fuel Type and Seating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex flex-col w-full">
                        <label htmlFor="transmission">Transmission</label>
                        <select
                            id="transmission"
                            name="transmission"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.transmission}
                            onChange={handleChange}
                        >
                            <option value="">Select Transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="fuel_type">Fuel Type</label>
                        <select
                            id="fuel_type"
                            name="fuel_type"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.fuel_type}
                            onChange={handleChange}
                        >
                            <option value="">Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="CNG">CNG</option>
                        </select>
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="seating_capacity">
                            Seating Capacity
                        </label>
                        <input
                            id="seating_capacity"
                            name="seating_capacity"
                            type="number"
                            min="1"
                            max="50"
                            placeholder="5"
                            required
                            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                            value={car.seating_capacity}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="flex flex-col w-full">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="Enter car location"
                        required
                        className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                        value={car.location}
                        onChange={handleChange}
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col w-full">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        placeholder="Describe your car"
                        required
                        className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none resize-none"
                        value={car.description}
                        onChange={handleChange}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-md cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Adding Car...' : 'Add Car'}
                </button>
            </form>
        </div>
    );
};

export default AddCar;