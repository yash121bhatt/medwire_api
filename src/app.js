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
// const path = require("path");
// const helperFunction = require("./helper/helperFunction");
app.use(express.static("public"));

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