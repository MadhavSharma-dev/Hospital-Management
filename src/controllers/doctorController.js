const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const Appoinment = require("../models/Appoinment");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/Apiresponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const bcrypt = require("bcryptjs");
const fs = require("fs");

// @POST /api/doctors
const createDoctor = asyncHandler(async (req, res) => {
    const {
        name, email, password, contact, gender, DOB,
        specialization, qualifications, licenseNumber,
        experience, department, availableDays, availableTime
    } = req.body;

    if (!name || !email || !password || !contact || !specialization || !licenseNumber || !department)
        throw new ApiError(400, "All required fields must be provided");

    const existingEmail = await Doctor.findOne({ email });
    if (existingEmail) throw new ApiError(409, "Email already registered");

    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) throw new ApiError(409, "License number already registered");

    const dept = await Department.findById(department);
    if (!dept) throw new ApiError(404, "Department not found");

    // Handle profile picture upload
    let profilePictureUrl;
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (!uploaded) throw new ApiError(500, "Profile picture upload failed");
        profilePictureUrl = uploaded.url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
        name, email, password: hashedPassword, contact, gender, DOB,
        specialization,
        qualifications: qualifications ? JSON.parse(qualifications) : [],
        licenseNumber, experience, department,
        availableDays: availableDays ? JSON.parse(availableDays) : [],
        availableTime,
        profilePicture: profilePictureUrl
    });

    const doctorData = doctor.toObject();
    delete doctorData.password;

    return res.status(201).json(
        new ApiResponse(201, doctorData, "Doctor created successfully")
    );
});

// @GET /api/doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    const { department, specialization, active } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };
    if (active !== undefined) filter.isActive = active === "true";

    const doctors = await Doctor.find(filter)
        .select("-password")
        .populate("department", "name");

    return res.status(200).json(
        new ApiResponse(200, doctors, "Doctors fetched successfully")
    );
});

// @GET /api/doctors/:id
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
        .select("-password")
        .populate("department", "name location");

    if (!doctor) throw new ApiError(404, "Doctor not found");

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor fetched successfully")
    );
});

// @PUT /api/doctors/:id
const updateDoctor = asyncHandler(async (req, res) => {
    const {
        name, contact, gender, DOB, specialization,
        qualifications, experience, department,
        availableDays, availableTime, isActive
    } = req.body;

    if (department) {
        const dept = await Department.findById(department);
        if (!dept) throw new ApiError(404, "Department not found");
    }

    const updateData = {
        name, contact, gender, DOB, specialization,
        experience, department, availableTime, isActive
    };

    if (qualifications) updateData.qualifications = JSON.parse(qualifications);
    if (availableDays) updateData.availableDays = JSON.parse(availableDays);

    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).select("-password").populate("department", "name location");

    if (!doctor) throw new ApiError(404, "Doctor not found");

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor updated successfully")
    );
});

// @DELETE /api/doctors/:id
const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) throw new ApiError(404, "Doctor not found");

    return res.status(200).json(
        new ApiResponse(200, {}, "Doctor deleted successfully")
    );
});

// @PATCH /api/doctors/:id/profile-picture
const updateProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No file provided");

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
        fs.unlinkSync(req.file.path);
        throw new ApiError(404, "Doctor not found");
    }

    const uploaded = await uploadOnCloudinary(req.file.path);
    if (!uploaded) throw new ApiError(500, "Profile picture upload failed");

    doctor.profilePicture = uploaded.url;
    await doctor.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { profilePicture: doctor.profilePicture }, "Profile picture updated successfully")
    );
});

// @GET /api/doctors/:id/appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new ApiError(404, "Doctor not found");

    const { status } = req.query;
    const filter = { doctor: req.params.id };
    if (status) filter.status = status;

    const appointments = await Appoinment.find(filter)
        .populate("patient", "name contact email")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, appointments, "Appointments fetched successfully")
    );
});

// @PATCH /api/doctors/:id/toggle-status
const toggleDoctorStatus = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new ApiError(404, "Doctor not found");

    doctor.isActive = !doctor.isActive;
    await doctor.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { isActive: doctor.isActive }, `Doctor ${doctor.isActive ? "activated" : "deactivated"} successfully`)
    );
});

module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    updateProfilePicture,
    getDoctorAppointments,
    toggleDoctorStatus
};


// createDoctor — email aur licenseNumber dono ka duplicate check karta hai. Department exist karta hai verify karta hai. Agar file aayi toh Cloudinary pe upload, URL save. qualifications aur availableDays JSON.parse kiye kyunki form-data mein string aate hain.

// getAllDoctors — 3 filters: ?department=<id>, ?specialization=cardio (case-insensitive regex search), ?active=true.

// getDoctorById — department name aur location populate karke deta hai. Nahi mila toh 404.

// updateDoctor — email aur password update nahi hote. Department validate hoti hai. Arrays conditionally parse hote hain — sirf tab jab diye gaye ho.

// deleteDoctor — hard delete, 404 if not found.

// updateProfilePicture — alag PATCH route sirf iske liye. Pehle doctor exist check, nahi mila toh local temp file bhi delete karta hai (fs.unlinkSync). Phir Cloudinary pe upload karke URL save.

// getDoctorAppointments — ?status=Scheduled/Completed/Cancelled optional filter ke saath. Patient ka naam, contact, email populate hota hai. Latest appointments pehle.

// toggleDoctorStatus — isActive flip karta hai, response mein clearly "activated" ya "deactivated" batata hai.