const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        trim : true
    },
    email :{
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    password :{
        type : String,
        required : true,
        minlength : 6
    },
    role :{
        type : String,
        enum : ["patient" , "doctor" , "staff" , "admin"],
        default : "patient"
    },
    refreshToken : {type : String}
},{timestamps: true});

userSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.isPasswordCorrect = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User" , userSchema);