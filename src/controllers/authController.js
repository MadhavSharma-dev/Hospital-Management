const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/Apiresponse");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// @POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
        throw new ApiError(400, "All fields are required");

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "Email already registered");

    const user = await User.create({ name, email, password, role });

    const accessToken = generateToken(user._id, user.role);
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, { accessToken, refreshToken }, "User registered successfully")
    );
});

// @POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        throw new ApiError(400, "Email and password required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid credentials");

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const accessToken = generateToken(user._id, user.role);
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
    );
});

// @POST /api/auth/logout
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
});

// @POST /api/auth/refresh-token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) throw new ApiError(401, "Refresh token required");

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
        throw new ApiError(401, "Invalid or expired refresh token");

    const newAccessToken = generateToken(user._id, user.role);

    return res.status(200).json(
        new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
    );
});

// @GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Profile fetched")
    );
});

// @PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, email },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated")
    );
});

// @PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        throw new ApiError(400, "Both old and new password required");

    const user = await User.findById(req.user._id);
    const isMatch = await user.isPasswordCorrect(oldPassword);

    if (!isMatch) throw new ApiError(401, "Old password is incorrect");

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// @POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "No user found with this email");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store token & expiry on user (add these fields to User model if needed)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link: /api/auth/reset-password/<resetToken>
    // Uncomment below when nodemailer/email service is configured:
    // await sendResetEmail(user.email, resetToken);

    // Remove resetToken from response in production — send via email only
    return res.status(200).json(
        new ApiResponse(200, { resetToken }, "Password reset token generated. Send this via email in production.")
    );
});

// @POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Token is invalid or has expired");

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
};


// Sabse pehle humne zaroori cheezein import ki:

// User model — database se user ka data lene ke liye
// generateToken — JWT access token banane ke liye
// ApiError — structured error throw karne ke liye
// ApiResponse — consistent response format ke liye
// asyncHandler — har function mein try-catch likhne ki jhanjhat khatam
// jwt — refresh token banane aur verify karne ke liye
// crypto — password reset ke liye random secure token generate karne ke liye
// 1. registerUser
// Naya user banane ka kaam yahan hota hai.

// Pehle name, email, password check kiye — koi bhi missing ho toh 400 error
// Database mein check kiya — kya yeh email pehle se registered hai? Agar haan toh 409 conflict error
// User.create() se naya user banaya — password automatically bcrypt se hash hoga kyunki humne User model mein pre("save") hook lagaya hua hai
// Dono tokens generate kiye — access token (1 din) aur refresh token (7 din)
// Refresh token user ke database record mein save kiya
// Response mein dono tokens bhej diye
// 2. loginUser
// Existing user ko andar laane ka kaam.

// email aur password validate kiye
// Database mein email se user dhundha — nahi mila toh 401
// user.isPasswordCorrect() se password verify kiya — yeh method humne User model mein banaya hua hai jo bcrypt.compare use karta hai
// Dono tokens generate karke refresh token save kiya
// Response mein tokens bhej diye
// 3. logoutUser
// User ko bahar nikalna.

// Yeh route protect middleware ke baad aata hai, matlab req.user already available hai
// Bas database mein us user ka refreshToken null kar diya
// Isse agla refresh token request automatically fail ho jaayegi
// 4. refreshAccessToken
// Jab access token expire ho jaaye tab kaam aata hai.

// Request body se refreshToken liya
// jwt.verify() se token valid hai ya nahi check kiya
// Database se user dhundha aur confirm kiya ki stored token match karta hai — isse token reuse attacks se bachte hain
// Naya fresh access token generate karke bhej diya
// 5. getProfile
// Logged-in user apni info dekh sake.

// protect middleware se req.user._id already available hai
// Database se user fetch kiya lekin password aur refreshToken ko .select("-password -refreshToken") se hide kiya
// Clean user object response mein bheja
// 6. updateProfile
// User apna name ya email update kar sake.

// findByIdAndUpdate() use kiya new: true ke saath — matlab updated document wapas milta hai
// runValidators: true — mongoose validations phir se run honge
// Updated profile return kiya, sensitive fields hide karke
// 7. changePassword
// Password change karna — sirf logged-in user ke liye.

// oldPassword aur newPassword dono required hain
// Pehle isPasswordCorrect() se purana password verify kiya
// Galat hua toh 401 error — koi bhi kisi ka password nahi badal sakta
// Naya password set karke user.save() kiya — pre("save") hook automatically naya password hash kar dega
// 8. forgotPassword
// User ka password bhool jaana handle karna.

// Email se user dhundha
// crypto.randomBytes(32) se ek random secure token banaya
// Woh token sha256 se hash karke database mein store kiya — raw token kabhi store nahi hota security ke liye
// Token ki expiry 10 minute rakhi
// Real app mein yahan email bheja jaata — abhi ke liye token response mein hai (production mein hataana hoga)
// 9. resetPassword
// Naya password set karna reset link se.

// URL params se token liya, use hash kiya aur database mein dhundha
// Saath mein expiry bhi check ki — $gt: Date.now() matlab token abhi valid hona chahiye
// Dono conditions fail ho toh 400 error — "token invalid ya expire ho gaya"
// Naya password set kiya aur reset token fields database se hata diye
// user.save() se bcrypt hash ho gaya automatically