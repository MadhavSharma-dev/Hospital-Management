const Department = require("../models/Department");
const Doctor = require("../models/Doctor");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/Apiresponse");
const { asyncHandler } = require("../utils/asyncHandler");

// @POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description, location, hod } = req.body;

    if (!name) throw new ApiError(400, "Department name is required");

    const existing = await Department.findOne({ name });
    if (existing) throw new ApiError(409, "Department with this name already exists");

    if (hod) {
        const doctor = await Doctor.findById(hod);
        if (!doctor) throw new ApiError(404, "Doctor (HOD) not found");
    }

    const department = await Department.create({ name, description, location, hod });

    return res.status(201).json(
        new ApiResponse(201, department, "Department created successfully")
    );
});

// @GET /api/departments
const getAllDepartments = asyncHandler(async (req, res) => {
    const { active } = req.query;

    const filter = {};
    if (active !== undefined) filter.isActive = active === "true";

    const departments = await Department.find(filter)
        .populate("hod", "name email specialization");

    return res.status(200).json(
        new ApiResponse(200, departments, "Departments fetched successfully")
    );
});

// @GET /api/departments/:id
const getDepartmentById = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id)
        .populate("hod", "name email specialization");
    if (!department) throw new ApiError(404, "Department not found");

    return res.status(200).json(
        new ApiResponse(200, department, "Department fetched successfully")
    );
});

// @PUT /api/departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
    const { name, description, location, hod, isActive } = req.body;

    if (hod) {
        const doctor = await Doctor.findById(hod);
        if (!doctor) throw new ApiError(404, "Doctor (HOD) not found");
    }

    const department = await Department.findByIdAndUpdate(
        req.params.id,
        { name, description, location, hod, isActive },
        { new: true, runValidators: true }
    ).populate("hod", "name email specialization");

    if (!department) throw new ApiError(404, "Department not found");

    return res.status(200).json(
        new ApiResponse(200, department, "Department updated successfully")
    );
});

// @DELETE /api/departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) throw new ApiError(404, "Department not found");

    return res.status(200).json(
        new ApiResponse(200, {}, "Department deleted successfully")
    );
});

// @GET /api/departments/:id/doctors
const getDepartmentDoctors = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);
    if (!department) throw new ApiError(404, "Department not found");

    const doctors = await Doctor.find({ department: req.params.id, isActive: true })
        .select("-password");

    return res.status(200).json(
        new ApiResponse(200, doctors, "Doctors fetched successfully")
    );
});

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getDepartmentDoctors
};


// departmentsController.js

// Yahan actual kaam hota hai. Ek ek function ka kaam:

// createDepartment — naya department banata hai. Pehle check karta hai name diya ya nahi, phir same naam ka department pehle se hai toh 409 conflict. Agar HOD diya hai toh doctor exist karta hai ya nahi yeh bhi verify karta hai.

// getAllDepartments — saare departments laata hai. Ek optional query param hai ?active=true — sirf active departments chahiye toh woh filter bhi kaam karta hai. populate("hod", ...) se HOD ka sirf naam, email, specialization aata hai — poora doctor object nahi.

// getDepartmentById — ek specific department :id se dhundta hai, HOD populated ke saath. Nahi mila toh 404.

// updateDepartment — koi bhi field update karo. HOD badal rahe ho toh pehle check karega ki woh doctor exist karta hai. new: true matlab updated document wapas milta hai, purana nahi.

// deleteDepartment — hard delete hai, seedha database se hata deta hai. Nahi mila toh 404.

// getDepartmentDoctors — pehle department exist karta hai confirm karta hai, phir us department ke saare isActive: true doctors return karta hai. .select("-password") se password field response mein nahi aata.