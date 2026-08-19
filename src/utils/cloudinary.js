const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localfilepath) => {
    try{
        if(!localfilepath) return null
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type : "auto"
        })
        console.log("File is uploaded on cloudinary" , response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localfilepath)
        return null;
    }
}
module.exports = {uploadOnCloudinary}

// Cloudinary.js ka kaam kya hai?

// Yeh file ek helper function hai jo local server se file uthata hai aur Cloudinary pe upload kar deta hai.

// Step by step:

// Config — Pehle Cloudinary ko .env se credentials deta hai — cloud name, api key, api secret. Bina iske Cloudinary pehchaanega nahi ki request kaun bhej raha hai.

// uploadOnCloudinary function — Yeh async function localfilepath leta hai, yaani woh path jo Multer ne public/temp mein save kiya tha.

// Agar path hi nahi hai — if(!localfilepath) return null — seedha null return kar do, kuch mat karo.

// Upload — cloudinary.uploader.upload() se file Cloudinary pe bhej deta hai. resource_type: "auto" ka matlab hai — image ho, video ho, PDF ho, kuch bhi ho — Cloudinary khud detect kar lega.

// Success pe — Cloudinary ka response return karta hai jisme response.url hoti hai, yaani uploaded file ka public link.

// Error pe — Agar upload fail ho gaya toh fs.unlinkSync(localfilepath) se local temp file delete kar deta hai taaki server pe garbage na pade, aur null return karta hai.