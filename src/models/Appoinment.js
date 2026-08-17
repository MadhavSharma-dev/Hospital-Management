const mongoose = require("mongoose");
const appoinmentSchema = new mongoose.Schema({
    patient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient",
        required : true
    },
    doctor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Doctor",
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    time : {
        type : String,
        required : true
    },
    status : {
        type : String,
        enum : ["Scheduled" , "Completed" , "Cancelled"],
        default : "Scheduled"
    },
    reason : {
        type : String
    }
},{timestamps:true});
module.exports = mongoose.model("Appoinment" , appoinmentSchema);