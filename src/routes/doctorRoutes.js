const express = require("express");
const router = express.Router();
const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    updateProfilePicture,
    getDoctorAppointments,
    toggleDoctorStatus
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer");

router.use(protect);

router.route("/")
    .get(getAllDoctors)
    .post(authorize("admin"), upload.single("profilePicture"), createDoctor);

router.route("/:id")
    .get(getDoctorById)
    .put(authorize("admin"), updateDoctor)
    .delete(authorize("admin"), deleteDoctor);

router.patch("/:id/profile-picture", authorize("admin"), upload.single("profilePicture"), updateProfilePicture);
router.patch("/:id/toggle-status", authorize("admin"), toggleDoctorStatus);
router.get("/:id/appointments", authorize("admin", "doctor"), getDoctorAppointments);

module.exports = router;


// GET  /api/doctors           → sabko dekh sakte hain (logged-in)
// POST /api/doctors           → sirf admin, profile picture ke saath (multer)

// GET    /api/doctors/:id     → sabko
// PUT    /api/doctors/:id     → sirf admin
// DELETE /api/doctors/:id     → sirf admin

// PATCH /api/doctors/:id/profile-picture  → sirf admin (multer)
// PATCH /api/doctors/:id/toggle-status    → sirf admin
// GET   /api/doctors/:id/appointments     → admin aur doctor