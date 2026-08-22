const Appointment = require("../models/Appoinment");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/Apiresponse");
const { asyncHandler } = require("../utils/asyncHandler");

// @POST /api/appointments  — Book a new appointment (patient only)
const bookAppointment = asyncHandler(async (req, res) => {
    const { doctor, date, time, reason } = req.body;

    if (!doctor || !date || !time)
        throw new ApiError(400, "Doctor, date and time are required");

    // Prevent double booking — same doctor, date, time
    const conflict = await Appointment.findOne({ doctor, date, time, status: "Scheduled" });
    if (conflict) throw new ApiError(409, "Doctor already has an appointment at this time");

    const appointment = await Appointment.create({
        patient: req.user._id,
        doctor,
        date,
        time,
        reason
    });

    const populated = await appointment.populate([
        { path: "doctor", select: "name specialization" },
        { path: "patient", select: "name email" }
    ]);

    return res.status(201).json(
        new ApiResponse(201, populated, "Appointment booked successfully")
    );
});

// @GET /api/appointments/my  — Get logged-in patient's appointments
const getMyAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ patient: req.user._id })
        .populate("doctor", "name specialization")
        .sort({ date: 1 });

    return res.status(200).json(
        new ApiResponse(200, appointments, "Appointments fetched")
    );
});

// @GET /api/appointments/doctor  — Get logged-in doctor's appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ doctor: req.user._id })
        .populate("patient", "name email contact")
        .sort({ date: 1 });

    return res.status(200).json(
        new ApiResponse(200, appointments, "Doctor appointments fetched")
    );
});

// @GET /api/appointments  — Get all appointments (admin only)
const getAllAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find()
        .populate("patient", "name email")
        .populate("doctor", "name specialization")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, appointments, "All appointments fetched")
    );
});

// @GET /api/appointments/:id  — Get single appointment
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate("patient", "name email contact")
        .populate("doctor", "name specialization");

    if (!appointment) throw new ApiError(404, "Appointment not found");

    return res.status(200).json(
        new ApiResponse(200, appointment, "Appointment fetched")
    );
});

// @PATCH /api/appointments/:id/status  — Update status (doctor/admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!["Scheduled", "Completed", "Cancelled"].includes(status))
        throw new ApiError(400, "Invalid status value");

    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    ).populate("patient", "name email").populate("doctor", "name specialization");

    if (!appointment) throw new ApiError(404, "Appointment not found");

    return res.status(200).json(
        new ApiResponse(200, appointment, "Appointment status updated")
    );
});

// @DELETE /api/appointments/:id  — Cancel/delete appointment (patient or admin)
const cancelAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) throw new ApiError(404, "Appointment not found");

    // Patient can only cancel their own appointment
    if (
        req.user.role === "patient" &&
        appointment.patient.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "Not authorized to cancel this appointment");
    }

    appointment.status = "Cancelled";
    await appointment.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Appointment cancelled")
    );
});

module.exports = {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment
};
// Imports (Upar wali lines)

// const Appointment = require("../models/Appoinment");
// Yeh line database ke saath kaam karne ke liye Appointment model laati hai — jaise ek form jo hospital mein appointments ke liye hota hai, woh form yahan se aata hai.

// ApiError, ApiResponse, asyncHandler — yeh teeno utilities hain jo humne pehle se bana rakhi hain. Error handle karna, clean response dena, aur try-catch ki tension khatam karna — yahi kaam karte hain.

// 1. bookAppointment — Appointment book karo

// Patient jab koi appointment lena chahta hai tab yeh function chalta hai.

// Pehle check kiya — doctor, date, time aaye hain ya nahi. Koi bhi missing ho toh 400 error.
// Phir double booking check kiya — agar us doctor ke paas us date aur time pe already koi appointment "Scheduled" hai, toh 409 conflict error. Ek doctor ek time pe do patients nahi dekh sakta na.
// Sab theek ho toh Appointment.create() se naya appointment database mein save ho jaata hai. patient: req.user._id — matlab jo bhi logged in hai woh patient automatically set ho jaata hai, koi manually nahi deta.
// populate se doctor ka naam aur specialization, aur patient ka naam aur email response mein aata hai — sirf IDs nahi.
// 2. getMyAppointments — Meri appointments dikhao

// Yeh sirf patient ke liye hai. req.user._id se logged-in patient ki saari appointments fetch hoti hain, date ke hisaab se sort hokar — sabse pehle wali appointment upar.

// 3. getDoctorAppointments — Doctor ka schedule

// Doctor login karke dekhta hai ki aaj kaun kaun aane wala hai. doctor: req.user._id se sirf us doctor ki appointments aati hain — patient ka naam, email, contact saath mein populate hota hai.

// 4. getAllAppointments — Sabki appointments (Admin only)

// Admin poora hospital dekh sakta hai — kisi bhi patient ki, kisi bhi doctor ki. sort({ date: -1 }) matlab latest appointments pehle dikhti hain.

// 5. getAppointmentById — Ek specific appointment ka detail

// URL mein :id dete ho, woh appointment fetch ho jaati hai full details ke saath — patient aur doctor dono populate hote hain. Nahi mili toh 404 error.

// 6. updateAppointmentStatus — Status badlo

// Doctor ya admin appointment ka status badal sakta hai — Scheduled, Completed, ya Cancelled teen hi options hain. Koi aur value di toh 400 error. findByIdAndUpdate se ek hi line mein update aur fetch dono ho jaate hain new: true ki wajah se.

// 7. cancelAppointment — Appointment cancel karo

// Patient ya admin cancel kar sakte hain. Lekin ek important check hai —

// if (req.user.role === "patient" && appointment.patient.toString() !== req.user._id.toString())
// Agar patient hai aur appointment uski nahi hai — toh 403 forbidden. Koi dusre ki appointment cancel nahi kar sakta. Admin ko yeh restriction nahi hai. Cancel karne pe status "Cancelled" ho jaata hai aur save ho jaata hai.