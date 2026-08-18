class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
module.exports = {ApiError}

// Yeh ek custom error class hai jo built-in Error ko extend karti hai. Jab bhi API mein koi error aaye, new ApiError(statusCode, message) throw karo — yeh ek structured object deta hai jisme status code, message, aur success flag hota hai. Ek bug bhi hai — errors = erros typo hai jo runtime pe crash karega.

// super(message) parent class yaani Error ka constructor call karta hai.
// Isse do kaam hote hain:
// this.message set hoti hai
// Stack trace capture hota hai (line number, file name, etc.)
// Jab bhi koi class kisi doosri class ko extend kare, toh super() call karna zaroori hai — warna this use karne pe error aata hai. Yeh basically parent ko initialize karta hai pehle, phir hum apni cheezein add karte hain.