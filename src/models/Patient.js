const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 5
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true
    },
    password :{
        type : String,
        required : true,
        minlength : 5
    },
    DOB : {
        type : Date,
        required : true
    },
    contact : {
        type : String,
        required : true
    },
    gender : {
        type : String,
        enum : ["Male" , "Female" , "Others"]
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
},
    BloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required: true
    },
    Emergencycontact : {
        type : String,
        required : true
    },
    allergies : {
        type : String
    },
    medicalHistory : {
        type : String
    },
},{timestamps : true});
module.exports = mongoose.model("patient" , patientSchema);