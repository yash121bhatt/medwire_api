const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyparser = require("body-parser");

const authRoute = require("./routes/auth.route");
const adminRoute = require("./routes/admin.route");
const laboratoryRoute = require("./routes/laboratory.route");

const { httpLogStream } = require("./utils/logger");

const app = express();

// ✅ CORS CONFIG (TOP PE HONA CHAHIYE)
const allowedOrigins = [
    process.env.ADMIN_URL,
    process.env.PORTAL_URL
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-access-token"
    ],
    credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ preflight fix

// ✅ BODY PARSER
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

// ✅ LOGGING
app.use(morgan("dev"));
app.use(morgan("combined", { stream: httpLogStream }));

// const path = require("path");
// const helperFunction = require("./helper/helperFunction");
app.use(express.static("public"));

// ✅ ROUTES
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/laboratory", laboratoryRoute);

// ✅ TEST ROUTE
app.get("/", (req, res) => {

    // let email_id = 'rk85783@mailinator.com'

    // Example with templete
    // let emailOption = {
    //     to: email_id,
    //     subject: "This is MedWire Invitation by ",
    //     template: 'plan_purchase',
    //     context: { full_name: "Rohit Kumar Mahor", email_id, logo: "#", app_name: "test", decrypted_password: "hdfhdsfhjk", user_login_url: "#", created_by_name: "Rohit" }
    // }
    // helperFunction.sendEmail(emailOption, true);

    // Example without templete
    // let emailOption1={
    //     to:email_id,
    //     subject:"This is MedWire Invitation by ",
    //     html: "<b>Hello world?</b>"
    // };
    // helperFunction.sendEmail(emailOption1);

    res.status(200).send({
        status: "success",
        data: {
            message: "API working fine"
        }
    });
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send({
        status: "error",
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;