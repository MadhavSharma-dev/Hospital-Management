const express = require("express");
const router = express.Router();
const {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment
} = require("../controllers/appoinmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require login
router.use(protect);

// Patient routes
router.post("/", authorize("patient"), bookAppointment);
router.get("/my", authorize("patient"), getMyAppointments);

// Doctor routes
router.get("/doctor", authorize("doctor"), getDoctorAppointments);

// Admin only
router.get("/", authorize("admin"), getAllAppointments);

// Shared — patient, doctor, admin
router.get("/:id", authorize("patient", "doctor", "admin"), getAppointmentById);
router.patch("/:id/status", authorize("doctor", "admin"), updateAppointmentStatus);
router.patch("/:id/cancel", authorize("patient", "admin"), cancelAppointment);

module.exports = router;


// router.use(protect);
// Yeh sabse pehle likha hai — matlab is file ki har route pe login compulsory hai. Bina token ke ek bhi route kaam nahi karega.

// Routes ka breakdown:

// Route	Kaun access kar sakta hai	Kya hota hai
// POST /	Patient	Naya appointment book karo
// GET /my	Patient	Apni appointments dekho
// GET /doctor	Doctor	Apna schedule dekho
// GET /	Admin	Sabki appointments dekho
// GET /:id	Patient, Doctor, Admin	Ek appointment ki detail
// PATCH /:id/status	Doctor, Admin	Status update karo
// PATCH /:id/cancel	Patient, Admin	Appointment cancel karo
// authorize("patient") — yeh role check karta hai. Agar doctor ne POST / hit kiya toh 403 milega kyunki woh patient nahi hai.