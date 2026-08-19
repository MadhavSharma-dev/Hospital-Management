const multer =  require('multer');
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null, "./public/temp")
    },
    filename : function(req,file,cb){
        cb(null, file.originalname)
    }
})
const upload = multer({storage})
module.exports = {upload}

// The public/temp folder is used as a temporary holding area before the file gets uploaded to Cloudinary (or any cloud storage).

// Here's the flow:

// User sends file → Multer saves it to public/temp → Your code uploads it to Cloudinary → You delete the local file
// Why this two-step approach?

// Multer can't directly stream to Cloudinary on its own — it needs to save the file somewhere first. So public/temp acts as a staging area. Once the upload to Cloudinary succeeds, you delete the file from public/temp using fs.unlinkSync().