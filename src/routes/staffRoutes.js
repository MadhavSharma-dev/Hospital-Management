const express = require("express");
const router = express.Router();
const {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    toggleStaffStatus
} = require("../controllers/staffController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(authorize("admin"), getAllStaff)
    .post(authorize("admin"), createStaff);

router.route("/:id")
    .get(authorize("admin"), getStaffById)
    .put(authorize("admin"), updateStaff)
    .delete(authorize("admin"), deleteStaff);

router.patch("/:id/toggle-status", authorize("admin"), toggleStaffStatus);

module.exports = router;


// POST /api/staff              → naya staff banao
// GET  /api/staff              → saare staff dekho (filters ke saath)

// GET    /api/staff/:id        → ek staff dekho
// PUT    /api/staff/:id        → update karo
// DELETE /api/staff/:id        → delete karo

// PATCH /api/staff/:id/toggle-status → active/inactive karo