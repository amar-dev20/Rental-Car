import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        pickupDate: {
            type: Date,
            required: true,
        },

        returnDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return value > this.pickupDate;
                },
                message: "Return date must be after pickup date",
            },
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes to improve common booking queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({
    car: 1,
    status: 1,
    pickupDate: 1,
    returnDate: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;