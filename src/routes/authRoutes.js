const express = require("express");
const router = express.Router();
const {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   getProfile,
   updateProfile,
   changePassword,
   forgotPassword,
   resetPassword 
} = require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");

router.post("/register" , registerUser);
router.post("/login", loginUser);
router.post("/logout" , protect , logoutUser);
router.post("/refresh-token",refreshAccessToken);
router.get("/profile" , protect , getProfile);
router.put("/profile" , protect , updateProfile);
router.put("/change-password" , protect , changePassword);
router.post("/forgot-password" , forgotPassword);
router.post("/reset-password/:token" , resetPassword);
module.exports = router;


// Yeh file basically ek "traffic controller" hai — jab bhi koi user kuch karna chahta hai (login, logout, profile dekhna), toh request pehle yahan aati hai aur sahi jagah bhej di jaati hai.

// Routes ka breakdown:

// /register — Naya user account banao
// /login — Apna account mein ghuso
// /logout — Bahar niklo (sirf logged-in user kar sakta hai)
// /refresh-token — Purana token expire ho gaya? Naya lo
// /profile (GET) — Apni profile dekho (login zaroori hai)
// /profile (PUT) — Profile update karo (login zaroori hai)
// /change-password — Purana password badlo (login zaroori hai)
// /forgot-password — Password bhool gaye? Reset link bhejo
// /reset-password/:token — Link se naya password set karo
// protect middleware woh security guard hai jo kuch routes pe khada hai — bina token ke andar nahi jaane deta.