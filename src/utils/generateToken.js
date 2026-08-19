const jwt = require("jsonwebtoken");
const generateToken = (id,role) => {
    return jwt.sign({id,role},process.env.JWT_SECRET,{
        expiresIn : "1d"
    });
};
module.exports = generateToken;

// Yeh ek simple utility function hai jo user ke liye JWT token banata hai.

// id aur role leta hai — jaise "doctor" ya "admin" — aur jwt.sign() se ek encrypted token generate karta hai.

// Token ke andar id aur role store hota hai, JWT_SECRET se sign hota hai, aur 1 din baad expire ho jaata hai.

// Use case:

// Jab user login kare, toh yeh function call karo:

// const token = generateToken(user._id, user.role);
// Bas — ek signed token mil jaata hai jo client ko bhej sakte ho. Agle requests mein client yahi token bhejega aur authMiddleware isse verify karega.

// Ek line mein:

// User ka ID aur role do, signed JWT token lo — itna hi kaam hai is file ka.