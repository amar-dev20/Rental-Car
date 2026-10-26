import dns from "node:dns";
import dotenv from "dotenv";

dotenv.config();

// DNS configuration for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";

import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
"http://localhost:5173",
"http://127.0.0.1:5173",
];

app.use(
cors({
origin: (origin, callback) => {
// Allow requests without an Origin header
if (!origin || allowedOrigins.includes(origin)) {
return callback(null, true);
}


        return callback(
            new Error(`CORS blocked for origin: ${origin}`)
        );
    },
    credentials: true,
})


);

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
return res.status(200).json({
success: true,
message: "Server is running",
});
});

// User API routes
app.use("/api/user", userRouter);

// Owner API routes
app.use("/api/owner", ownerRouter);

// Booking API routes
app.use("/api/bookings", bookingRouter);

// Handle routes that do not exist
app.use((req, res) => {
return res.status(404).json({
success: false,
message: `Route not found: ${req.method} ${req.originalUrl}`,
});
});

// Global error handler
app.use((error, req, res, next) => {
console.error("API error:", error.message || error);


if (res.headersSent) {
    return next(error);
}

const statusCode =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status <= 599
        ? error.status
        : 500;

return res.status(statusCode).json({
    success: false,
    message:
        statusCode === 500
            ? "Internal server error"
            : error.message,
});


});

// Connect to MongoDB before starting the server
const startServer = async () => {
try {
await connectDB();


    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log("User API: /api/user");
        console.log("Owner API: /api/owner");
        console.log("Booking API: /api/bookings");
    });
} catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
}


};

startServer();

export default app;
