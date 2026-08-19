const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new ApiError(401, "No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!req.user) throw new ApiError(401, "User no longer exists");

    next();
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `Role (${req.user.role}) is not allowed`));
        }
        next();
    };
};

module.exports = { protect, authorize };

//Is file mein do kaam hote hain:

// protect — ye check karta hai ki user logged in hai ya nahi

// Request ke header se JWT token uthata hai
// Token ko verify karta hai JWT_SECRET se
// Database se user dhundh ke req.user mein daal deta hai
// Agar token nahi hai ya galat hai toh 401 error de deta hai
// authorize — ye check karta hai ki user ko permission hai ya nahi

// protect ke baad use hota hai
// Allowed roles pass karo jaise "admin", "doctor"
// Agar user ka role match nahi kiya toh 403 error de deta hai
// Simple shabdon mein:

// protect = "Bhai tu logged in hai?"
// authorize = "Aur tujhe ye karne ki permission hai?"