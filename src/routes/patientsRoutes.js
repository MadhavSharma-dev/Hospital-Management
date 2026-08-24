const express = require("express");
const router = express.Router();
const {
    registerPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientAppointments
} = require("../controllers/patientsController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public route — no login needed to register
router.post("/register", registerPatient);

router.use(protect);

router.get("/", authorize("admin", "doctor", "staff"), getAllPatients);

router.route("/:id")
    .get(authorize("admin", "doctor", "staff"), getPatientById)
    .put(authorize("admin", "staff"), updatePatient)
    .delete(authorize("admin"), deletePatient);

router.get("/:id/appointments", authorize("admin", "doctor", "staff"), getPatientAppointments);

module.exports = router;

// POST /api/patients/register     → public, koi bhi register kar sakta hai (no login)

// GET  /api/patients              → admin, doctor, staff — saare patients
// GET  /api/patients/:id          → admin, doctor, staff — ek patient
// PUT  /api/patients/:id          → admin, staff — update kar sakte hain
// DELETE /api/patients/:id        → sirf admin — delete kar sakta hai

// GET  /api/patients/:id/appointments → admin, doctor, staff — us patient ki appointments