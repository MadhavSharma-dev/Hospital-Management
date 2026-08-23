const express = require("express");
const router = express.Router();
const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getDepartmentDoctors
} = require("../controllers/departmentsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(getAllDepartments)
    .post(authorize("admin"), createDepartment);

router.route("/:id")
    .get(getDepartmentById)
    .put(authorize("admin"), updateDepartment)
    .delete(authorize("admin"), deleteDepartment);

router.get("/:id/doctors", getDepartmentDoctors);

module.exports = router;


// departmentsRoutes.js

// Yeh file sirf ek "traffic controller" ki tarah kaam karti hai. Koi bhi request aaye, pehle protect middleware se guzarti hai — matlab bina login ke kuch nahi milega.

// GET  /api/departments        → koi bhi logged-in user dekh sakta hai
// POST /api/departments        → sirf admin bana sakta hai

// GET  /api/departments/:id    → koi bhi dekh sakta hai
// PUT  /api/departments/:id    → sirf admin update kar sakta hai
// DELETE /api/departments/:id  → sirf admin delete kar sakta hai

// GET  /api/departments/:id/doctors → us department ke saare doctors
// router.use(protect) — yeh ek baar likh diya toh har route automatically protected ho gaya, baar baar likhna nahi pada.