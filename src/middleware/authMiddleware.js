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