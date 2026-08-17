const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String
    },
    location: {
        floor: { type: String },
        wing: { type: String }
    },
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
