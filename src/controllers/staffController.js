const Staff = require("../models/Staff");
const Department = require("../models/Department");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/Apiresponse");
const { asyncHandler } = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");

// @POST /api/staff
const createStaff = asyncHandler(async (req, res) => {
    const { name, email, password, contact, gender, role, department, shift, joiningDate, address } = req.body;

    if (!name || !email || !password || !contact || !role || !shift)
        throw new ApiError(400, "All required fields must be provided");

    const existing = await Staff.findOne({ email });
    if (existing) throw new ApiError(409, "Email already registered");

    if (department) {
        const dept = await Department.findById(department);
        if (!dept) throw new ApiError(404, "Department not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
        name, email, password: hashedPassword, contact,
        gender, role, department, shift, joiningDate, address
    });

    const staffData = staff.toObject();
    delete staffData.password;

    return res.status(201).json(
        new ApiResponse(201, staffData, "Staff created successfully")
    );
});

// @GET /api/staff
const getAllStaff = asyncHandler(async (req, res) => {
    const { role, shift, department, active } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (shift) filter.shift = shift;
    if (department) filter.department = department;
    if (active !== undefined) filter.isActive = active === "true";

    const staff = await Staff.find(filter)
        .select("-password")
        .populate("department", "name location");

    return res.status(200).json(
        new ApiResponse(200, staff, "Staff fetched successfully")
    );
});

// @GET /api/staff/:id
const getStaffById = asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.params.id)
        .select("-password")
        .populate("department", "name location");

    if (!staff) throw new ApiError(404, "Staff not found");

    return res.status(200).json(
        new ApiResponse(200, staff, "Staff fetched successfully")
    );
});

// @PUT /api/staff/:id
const updateStaff = asyncHandler(async (req, res) => {
    const { name, contact, gender, role, department, shift, address, isActive } = req.body;

    if (department) {
        const dept = await Department.findById(department);
        if (!dept) throw new ApiError(404, "Department not found");
    }

    const staff = await Staff.findByIdAndUpdate(
        req.params.id,
        { name, contact, gender, role, department, shift, address, isActive },
        { new: true, runValidators: true }
    ).select("-password").populate("department", "name location");

    if (!staff) throw new ApiError(404, "Staff not found");

    return res.status(200).json(
        new ApiResponse(200, staff, "Staff updated successfully")
    );
});

// @DELETE /api/staff/:id
const deleteStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) throw new ApiError(404, "Staff not found");

    return res.status(200).json(
        new ApiResponse(200, {}, "Staff deleted successfully")
    );
});

// @PATCH /api/staff/:id/toggle-status
const toggleStaffStatus = asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.params.id);
    if (!staff) throw new ApiError(404, "Staff not found");

    staff.isActive = !staff.isActive;
    await staff.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { isActive: staff.isActive }, `Staff ${staff.isActive ? "activated" : "deactivated"} successfully`)
    );
});

module.exports = {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    toggleStaffStatus
};
// createStaff — required fields validate karta hai, email duplicate check, department exist karta hai ya nahi verify karta hai, phir password hash karke staff banata hai. Response mein password nahi aata.

// getAllStaff — 4 optional query filters support karta hai: role, shift, department, active. Jo bhi diya ussi se filter, baaki ignore. Department populate hoti hai naam aur location ke saath.

// getStaffById — ek staff :id se dhundta hai, department populated ke saath. Nahi mila toh 404.

// updateStaff — email aur password update nahi hote intentionally. Department badal rahe ho toh pehle exist karta hai check karta hai. Updated doc wapas milta hai.

// deleteStaff — hard delete, nahi mila toh 404.

// toggleStaffStatus — yeh dedicated route sirf isActive ko flip karta hai. Pehle staff dhundta hai, phir !staff.isActive se toggle karta hai. Response mein bhi clearly batata hai — "activated" ya "deactivated