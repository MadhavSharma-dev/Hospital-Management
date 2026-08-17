const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
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
    DOB: {
        type: Date
    },
    specialization: {
        type: String,
        required: true
    },
    qualifications: [String],
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    experience: {
        type: Number, // in years
        default: 0
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    availableDays: {
        type: [String],
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    availableTime: {
        start: { type: String }, // e.g. "09:00"
        end: { type: String }    // e.g. "17:00"
    },
    profilePicture: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
