
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        // 1. Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing. Please login again.",
            });
        }

        // 2. Check Bearer token format
        const [scheme, token] = authHeader.split(" ");

        if (
            scheme !== "Bearer" ||
            !token ||
            authHeader.split(" ").length !== 2
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format. Use Bearer token.",
            });
        }

        // 3. Check JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from server .env file");

            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error.",
            });
        }

        // 4. Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 5. Get user ID from token payload
        const userId = decoded.id || decoded.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload.",
            });
        }

        // 6. Find user in MongoDB
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again.",
            });
        }

        // 7. Attach user to request
        req.user = user;

        // 8. Continue to controller
        return next();

    } catch (error) {
        console.error(
            "Authentication middleware error:",
            error.name,
            error.message
        );

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please login again.",
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed due to a server error.",
        });
    }
};

