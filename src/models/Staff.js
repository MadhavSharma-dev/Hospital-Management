const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    contact: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Others"]
    },
    role: {
        type: String,
        enum: ["Nurse", "Receptionist", "Lab Technician", "Pharmacist", "Admin", "Cleaner", "Security"],
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    shift: {
        type: String,
        enum: ["Morning", "Evening", "Night"],
        required: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    profilePicture: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
