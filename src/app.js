const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyparser = require("body-parser");

const authRoute = require("./routes/auth.route");
const adminRoute = require("./routes/admin.route");
const laboratoryRoute = require("./routes/laboratory.route");

const { httpLogStream } = require("./utils/logger");

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(morgan("dev"));
app.use(morgan("combined", { stream: httpLogStream }));
app.use(cors());
const path = require("path");
const helperFunction = require("./helper/helperFunction");
app.use(express.static("public"));

const nodemailer = require("nodemailer");
app.get("/send-email", async (req, res) => {
    console.info(req.method, req.originalUrl);
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            // port: 587,
            // secure: false,
            // port: 587,
            // secure: false,
            port: 2525,
            secure: false,
            auth: {
                user: "apikey",
                pass: "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",
            },
        });

        const to = req.query?.to || "rk85783@mailinator.com";
        const info = await transporter.sendMail({
            from: "yash121bhatt@gmail.com",
            to,
            subject: "✅ Test Email from SendGrid + Nodemailer",
            html: "<h2>It works! 🚀</h2><p>This is a test email sent via SendGrid SMTP and Nodemailer.</p>",
        });

        console.log("✅ Email sent successfully:", info.messageId);

        res.status(200).json({
            success: true,
            message: `Mail sent to : ${to}`
        });
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        res.status(500).json({
            success: true,
            message: "Internal server error",
            stack: error.stack
        });
    }
});

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/laboratory", laboratoryRoute);

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

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send({
        status: "error",
        message: err.message
    });
    next();
});

module.exports = app;