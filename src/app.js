//App.js

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const app = express();

// ─── Security & Parsing Middleware ───────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
// TODO: import and mount routes here
// app.use("/api/patients", patientRoutes);
// app.use("/api/doctors", doctorRoutes);
// app.use("/api/staff", staffRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/appointments", appointmentRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
});

module.exports = app;


//CORS (Cross-Origin Resource Sharing)

// Maan lo tera backend localhost:8000 pe hai aur frontend localhost:3000 pe. By default browser bolega — "different origin hai, request block karta hoon." CORS middleware browser ko permission deta hai ki "haan bhai, is domain se request aane do.

// Helmet

// Yeh tera bodyguard hai. HTTP headers ko secure banata hai — kuch dangerous headers hata deta hai, kuch add kar deta hai. Hackers jo common attacks karte hain, unke against protection deta hai.

//Cookie-Parser

// Jab client request bhejta hai toh saath mein cookies bhi aati hain. Yeh cookies raw string format mein hoti hain. Cookie-parser unhe parse karke req.cookies mein ready-to-use object bana deta hai.
//Parse ka matlab hai — "raw data ko samajhne wale format mein convert karna"


//Cookie ek chhota sa data piece hai jo browser mein save hota hai.

// Kaise kaam karta hai:

// Tu login karta hai
// Server tera token banata hai aur cookie mein bhej deta hai
// Browser us cookie ko save kar leta hai
// Agle har request mein browser automatically woh cookie saath bhejta hai
// Server cookie dekh ke pehchaan leta hai — "arrey yeh toh mera logged in user hai"