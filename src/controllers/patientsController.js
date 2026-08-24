const Patient = require("../models/Patient");
const Appoinment = require("../models/Appoinment");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/Apiresponse");
const { asyncHandler } = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");

// @POST /api/patients/register
const registerPatient = asyncHandler(async (req, res) => {
    const { name, email, password, DOB, contact, gender, address, BloodGroup, Emergencycontact, allergies, medicalHistory } = req.body;

    if (!name || !email || !password || !DOB || !contact || !BloodGroup || !Emergencycontact)
        throw new ApiError(400, "All required fields must be provided");

    const existing = await Patient.findOne({ email });
    if (existing) throw new ApiError(409, "Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
        name, email, password: hashedPassword, DOB, contact,
        gender, address, BloodGroup, Emergencycontact, allergies, medicalHistory
    });

    const patientData = patient.toObject();
    delete patientData.password;

    return res.status(201).json(
        new ApiResponse(201, patientData, "Patient registered successfully")
    );
});

// @GET /api/patients
const getAllPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.find().select("-password");

    return res.status(200).json(
        new ApiResponse(200, patients, "Patients fetched successfully")
    );
});

// @GET /api/patients/:id
const getPatientById = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).select("-password");

    if (!patient) throw new ApiError(404, "Patient not found");

    return res.status(200).json(
        new ApiResponse(200, patient, "Patient fetched successfully")
    );
});

// @PUT /api/patients/:id
const updatePatient = asyncHandler(async (req, res) => {
    const { name, contact, gender, address, BloodGroup, Emergencycontact, allergies, medicalHistory } = req.body;

    const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { name, contact, gender, address, BloodGroup, Emergencycontact, allergies, medicalHistory },
        { new: true, runValidators: true }
    ).select("-password");

    if (!patient) throw new ApiError(404, "Patient not found");

    return res.status(200).json(
        new ApiResponse(200, patient, "Patient updated successfully")
    );
});

// @DELETE /api/patients/:id
const deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) throw new ApiError(404, "Patient not found");

    return res.status(200).json(
        new ApiResponse(200, {}, "Patient deleted successfully")
    );
});

// @GET /api/patients/:id/appointments
const getPatientAppointments = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new ApiError(404, "Patient not found");

    const appointments = await Appoinment.find({ patient: req.params.id })
        .populate("doctor", "name email specialization")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, appointments, "Appointments fetched successfully")
    );
});

module.exports = {
    registerPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientAppointments
};

// patientsController.js

// registerPatient — naya patient banata hai. Required fields check karta hai, email duplicate toh 409 error. Patient model mein bcrypt hook nahi tha isliye manually bcrypt.hash(password, 10) kiya. Response mein password nahi bheja — delete patientData.password se hata diya.

// getAllPatients — saare patients laata hai. .select("-password") — password kabhi response mein nahi aana chahiye.

// getPatientById — ek patient :id se dhundta hai, password hide karke. Nahi mila toh 404.

// updatePatient — sirf safe fields update hoti hain jaise contact, address, allergies etc. Email aur password yahan update nahi hote — intentionally nahi rakha. new: true se updated document wapas milta hai.

// deletePatient — hard delete. Patient nahi mila toh 404.

// getPatientAppointments — pehle patient exist karta hai confirm karta hai, phir us patient ki saari appointments laata hai. Doctor ka naam, email, specialization populate hota hai. sort({ date: -1 }) — latest appointments pehle aati hain.