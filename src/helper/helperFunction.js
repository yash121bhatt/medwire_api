const mysql = require("mysql2");
const { unlink } = require("node:fs/promises");
const { logger } = require("../utils/logger");
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../utils/secrets");
const fetch = require("node-fetch");
const PaytmChecksum = require("../config/cheksum");
const https = require("https");
const fs = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("../../public/medwire-8bd32-firebase-adminsdk-pnlgd-39a3686663.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "medwire-8bd32",
});

class helperFunction {
    constructor(i) {
        this.i = i;
    }
    static async pushNotification(device_token, payload) {
        // const options = {
        //     priority: "high",
        //     timeToLive: 60 * 60 * 24
        // };
        // admin.messaging().sendToDevice(device_token, payload, options).then(function (response) {
        //     console.log("Successfully sent message:", response);
        // }).catch(function (error) {
        //     console.log("Error sending push message:", error);
        // });
        console.log("xxxxxxxx");
    }
    static async paytmPaymentFunct(req, res, querystrings, call_back_url) {
        try {
            let body = "";
            const orderId = querystrings.payment_order_id;
            req
                .on("error", (err) => {
                    console.error(err.stack);
                })
                .on("data", (chunk) => {
                    body += chunk;
                })
                .on("end", () => {
                    const paytmParams = {};
                    paytmParams.body = {
                        requestType: "Payment",
                        mid: process.env.Paytm_mid,
                        websiteName: process.env.APP_NAME,
                        orderId: orderId,
                        callbackUrl: call_back_url,
                        txnAmount: {
                            value: querystrings.total_amount,
                            currency: "INR",
                        },
                        userInfo: {
                            custId: querystrings.email,
                        },
                    };

                    PaytmChecksum.generateSignature(
                        JSON.stringify(paytmParams.body),
                        process.env.Paytm_key
                    ).then(function (checksum) {
                        paytmParams.head = { signature: checksum };

                        var post_data = JSON.stringify(paytmParams);
                        var options = {
                            //for Staging
                            hostname: "securegw-stage.paytm.in",
                            //for Production
                            // hostname: 'securegw.paytm.in',

                            port: 443,
                            path: `/theia/api/v1/initiateTransaction?mid=${process.env.Paytm_mid}&orderId=${orderId}`,
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Content-Length": post_data.length,
                            },
                        };
                        var response = "";
                        var post_req = https.request(options, function (post_res) {
                            post_res.on("data", function (chunk) {
                                response += chunk;
                            });

                            post_res.on("end", function () {
                                response = JSON.parse(response);
                                /* console.log('txnToken:', response); */

                                res.writeHead(200, { "Content-Type": "text/html" });
                                res.write(`<html>
                                <head>
                                    <title>Show Payment Page</title>
                                </head>
                                <body>
                                    <center>
                                        <h1>Please do not refresh this page...</h1>
                                    </center>
                                    <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${process.env.Paytm_mid}&orderId=${orderId}" name="paytm">
                                        <table border="1">
                                            <tbody>
                                                <input type="hidden" name="mid" value="${process.env.Paytm_mid}">
                                                    <input type="hidden" name="orderId" value="${orderId}">
                                                    <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                                            </tbody>
                                        </table>
                                        <script type="text/javascript"> document.paytm.submit(); </script>
                                    </form>
                                </body>
                                </html>`);
                                res.end();
                            });
                        });
                        post_req.write(post_data);
                        post_req.end();
                    });
                });
        } catch (error) {
            console.error("there was an error:", error.message);
        }
    }

    static async sendJapiSMS(mobile_number, message) {
        try {
            var japi_sms_key = process.env.Japi_sms_key;
            var url = "https://japi.instaalerts.zone/httpapi/QueryStringReceiver?ver=1.0&key=" + japi_sms_key + "&encrpt=0&dest=" + mobile_number + "&send=MEDWIR&text=" + message;

            var res = await fetch(url);
            var data = await res.text();

            console.log("sendJapiSMS(): ", data);
        } catch (error) {
            console.error("there was an error:", error.message);
        }
    }

    static template(transporter, temp) {
        const handlebarOptions = {
            viewEngine: {
                extname: "handlebars",
                partialsDir: path.resolve("./public/views/"),
                defaultLayout: false,
            },
            viewPath: path.resolve("./public/views/"),
        };
        if (temp == true) {
            return transporter.use("compile", hbs(handlebarOptions));
        }
    }

    static sendEmail(mailPayload, temp = false, from = process.env.MAIL_FROM_ADDRESS) {
        mailPayload.from = from;
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE, // true for 465, false for other ports
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
        });
        const handlebarOptions = {
            viewEngine: {
                extname: "handlebars",
                partialsDir: path.resolve("./public/views/"),
                defaultLayout: false,
            },
            viewPath: path.resolve("./public/views/"),
        };
        // compile template file with nodemailer
        if (temp == true) {
            transporter.use("compile", hbs(handlebarOptions));
        }
        // transporter.sendMail(mailPayload,
        //     (error, info) => {
        //         if (error) {
        //             console.log(error);
        //         } else {
        //             console.log("Mail send successfully! \n", info.response);
        //         }
        //     });
        try {
            transporter.sendMail(mailPayload).then(info => {
                console.log("Mail send successfully! \n", info.response);
            }).catch(err => {
                console.log(err);
            });
        } catch (err) {
            console.error("❌ Error sending email:", err);
        }
    }

    static customValidater(req, validateP) {
        var vali;
        for (var ky in validateP) {
            if (
                req.body[ky] == undefined ||
                req.body[ky] == null ||
                req.body[ky] == ""
            ) {
                var vali = {
                    status_code: "500",
                    status: "error",
                    message: ky + " is required!",
                };
            }
        }
        return vali;
    }
    static json2array(json, type = "") {
        var result = [];
        var keys = Object.keys(json);
        if (type == "key") {
            keys.forEach(function (key) {
                result.push(key);
            });
        }
        if (type == "value") {
            keys.forEach(function (key) {
                result.push(json[key]);
            });
        }
        return result;
    }
    static async removeFileFromFolder(
        fileName,
        folderPath = "member",
        baseFolder = "public"
    ) {
        try {
            const deleteFile = baseFolder + "/" + folderPath + "/" + fileName;
            await unlink(deleteFile);
            console.log("file remove successfully deleted!");
        } catch (error) {
            console.error("there was an error:", error.message);
        }
    }
    static autoGeneratePassword() {
        var chars = "1234567890abcdefghijklmnopqrstuvwqyz!#%&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var passwordLength = 12;
        var password = "";

        for (let index = 0; index < passwordLength; index++) {
            var randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber + 1);
        }
        return password;
    }
    static generateOTP(digit = 4) {
        var start = 1;
        var end = 0;
        for (var i = 0; i < digit - 1; i++) {
            start = 10 * start;
        }
        end = start * 9;

        let otp = "";
        const value = Math.floor(start + Math.random() * end);
        otp = otp + value;

        return otp;
    }
    static dateFormat(inputDate, format = "dd-mm-yyyy") {
        const date = new Date(inputDate);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        format = format.replace("mm", month.toString().padStart(2, "0"));
        if (format.indexOf("yyyy") > -1) {
            format = format.replace("yyyy", year.toString());
        } else if (format.indexOf("yy") > -1) {
            format = format.replace("yy", year.toString().substr(2, 2));
        }
        format = format.replace("dd", day.toString().padStart(2, "0"));
        return format;
    }
    static convertStringToArray(str, index, bythe = " ") {
        if (index === undefined || index === null) {
            return str.split(bythe);
        }
        return str.split(bythe)[index];
    }
    static handleDisconnect(db_config) {
        var self = this;
        var connection;

        connection = mysql.createPool(db_config); // Recreate the connection, since
        connection.getConnection(function (err, connections) {
            if (err) {
                console.log("error when connecting to db:", err);

            }
            else {
                logger.info("Database connected");
                connections.release();
            }
        });
        connection.on("error", function (err) {
            console.log("db error", err);
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                console.log("wait database reconnecting!");
                self.handleDisconnect(db_config); // lost due to either server restart, or a
            } else {
                throw err; // server variable configures this)
            }
        });
        return connection;
    }
    static recurs(params) {
        var self = this;
        params++;

        if (params != 5) {
            self.recurs(params);
        }
    }
    static removeDuplicatesInArray(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }
    static age(date) {
        const bdate = date != undefined && date != "" && date != null ? date : "0000/00/00";
        var dateString = helperFunction.dateFormat(bdate, "yyyy/mm/dd");
        var today = new Date();

        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    static discount({ total_amount, percentage, type, discount_price }) {
        if (type == "percent") {
            if (percentage == undefined || percentage == null || percentage == "") {
                return total_amount;
            }
            const per = parseFloat(percentage) / 100;
            const discount = parseFloat(total_amount) * per;
            return parseFloat(total_amount) - discount;
        } else if (type == "flat") {
            return parseFloat(total_amount) - parseFloat(discount_price);
        } else {
            return parseFloat(total_amount);
        }
    }
    static gstAmount(amount, GSTpercentage) {
        if (
            GSTpercentage == undefined ||
            GSTpercentage == null ||
            GSTpercentage == ""
        ) {
            return amount;
        }
        const per = GSTpercentage / 100;
        const gstAmount = amount * per;
        return amount + gstAmount;
    }
    static timeSlot(x) {
        let openTime =
            x?.opentime?.length > 8 ? x.opentime.substring(11, 16) : x.opentime;
        let closeTime =
            x?.closetime?.length > 8 ? x.closetime.substring(11, 16) : x.closetime;

        let startTime = moment(openTime, "HH:mm");

        let endTime = moment(closeTime, "HH:mm");

        let allTimes = [];

        if (startTime > endTime) {
            let endTime = moment(closeTime, "HH:mm").add(1, "days");
            while (startTime <= endTime) {
                //Push times
                allTimes.push(startTime.format("HH:mm"));
                //Add interval of 30 minutes
                startTime.add(x.slotInterval, "minutes");
            }
        } else {
            while (startTime <= endTime) {
                allTimes.push(startTime.format("HH:mm"));
                startTime.add(x.slotInterval, "minutes");
            }
        }

        return allTimes;
    }
    static railwayToNormalTimeConvert(time) {
        // Check correct time format and split into components
        time = time
            .toString()
            .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) {
            // If time format correct
            time = time.slice(1); // Remove full string match value
            time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(""); // return adjusted time or original string
    }
    static normalToRalwayTimeConvert(timeStr) {
        const [time, modifier] = timeStr?.split(" ");
        let [hours, minutes] = time?.split(":");
        if (hours === "12") {
            hours = "00";
        }
        if (modifier === "PM") {
            hours = parseFloat(hours, 10) + 12;
        }
        return `${hours}:${minutes}`;
    }
    static dateToDayConvert(date) {
        const d = new Date(date);
        let day_name;
        if (d.getDay() == 1) { day_name = "Monday"; }
        else if (d.getDay() == 2) { day_name = "Tuesday"; }
        else if (d.getDay() == 3) { day_name = "Wednesday"; }
        else if (d.getDay() == 4) { day_name = "Thursday"; }
        else if (d.getDay() == 5) { day_name = "Friday"; }
        else if (d.getDay() == 6) { day_name = "Saturday"; }
        else if (d.getDay() == 0) { day_name = "Sunday"; }
        return day_name;
    }
    static startToEndTimeSlot(slotInterval = 15, opentimes, closetimes, bookedSlot = [], date) {
        console.log("op,cl", opentimes, closetimes);
        var todayDate = new Date().toString();
        console.log("today", todayDate);
        var checkCurentTimeSlot = false;
        if (opentimes == null || opentimes == "" || opentimes == undefined || closetimes == null || closetimes == "" ||
            closetimes == undefined) {
            var opentimes = "00:00";
            var closetimes = "00:00";
        }
        var opentime_s = moment(opentimes, "HH:mm A").format("HH:mm");
        console.log("user open time : ", opentimes);
        console.log("user close time : ", closetimes);
        if (closetimes == "12:00 AM") {
            var closetime_s = "12:00";
        }
        else {
            var closetime_s = moment(closetimes, "HH:mm A").format("HH:mm");
        }

        var openingMinut = 0;
        var closingMinut = 0;
        for (let index = 0; index < 8; index++) {
            if (parseInt(openingMinut) < 59 && parseInt(openingMinut) < todayDate.slice(19, 21)) {
                openingMinut = parseInt(slotInterval) * index;
            }
            if (closingMinut <= !59) {
                closingMinut = parseInt(slotInterval) * index;
            }
        }

        checkCurentTimeSlot = parseInt(todayDate.slice(16, 21).replace(/:/g, "")) <
            parseInt(closetime_s.replace(/:/g, ""));

        var today_date_with_time = moment().format("DD-MM-YYYY") + "T00:00:00.000Z";

        if (today_date_with_time == date) {
            if (checkCurentTimeSlot) {
                if (parseInt(todayDate.slice(16, 21).replace(/:/g, "")) >= parseInt(opentime_s.replace(/:/g, ""))) {
                    var opentime = checkCurentTimeSlot == true ? moment().format("HH:mm") : opentime_s;

                    var closetime = closetime_s;
                }
                else {
                    var opentime = opentime_s;
                    var closetime = closetime_s;
                }
            }
            else {
                console.log("imeldhjdfhk");
            }
            if (openingMinut == "60") {
                var opentime = (opentime != undefined) ? (parseInt(opentime.split(":")[0]) + 1) + ":00" : "";
            }
            else {
                var opentime = (opentime != undefined) ? opentime.split(":")[0] + ":" + openingMinut : "";
            }
        } else {
            var opentime = opentime_s;
            var closetime = closetime_s;
        }

        let TimeSlot = helperFunction.timeSlot({ slotInterval, opentime, closetime, });

        var Solt = [];
        for (let i = 0; i <= TimeSlot.length; i++) {
            const from = TimeSlot[i] ?? null;
            const to = TimeSlot[i + 1] ?? null;

            if (from != null && to != null) {
                const Stime = helperFunction.railwayToNormalTimeConvert(from) + " - " + helperFunction.railwayToNormalTimeConvert(to);
                Solt.push({ Stime });
            }
        }
        const Slots = Solt.reduce((unique, o) => {
            if (!unique.some((obj) => obj.Stime === o.Stime)) {
                unique.push(o);
            }
            return unique;
        }, []);
        for (const item of bookedSlot) {
            for (const iterator of Slots) {
                if (item.Stime == iterator.Stime) {
                    Slots.splice(Slots.indexOf(iterator), 1);
                }
            }
        }
        return Slots;
    }

    static getGreetingTime() {
        var currentTime = new Date();
        const currentHour = currentTime.getHours();
        const splitAfternoon = 12; // 24hr time to split the afternoon
        const splitEvening = 17; // 24hr time to split the evening

        if (currentHour >= splitAfternoon && currentHour <= splitEvening) {
            // Between 12 PM and 5PM
            return "afternoon";
        } else if (currentHour >= splitEvening) {
            // Between 5PM and Midnight
            return "evening";
        }
        // Between dawn and noon
        return " morning";
    }
    static doctorStartToEndTimeSlot(slotInterval = 15, opentimes, closetimes, bookedSlot = [], date, session) {
        var todayDate = new Date().toString();
        var checkCurentTimeSlot = false;
        if (opentimes == null || opentimes == "" || opentimes == undefined || closetimes == null || closetimes == "" ||
            closetimes == undefined) {
            var opentimes = "00:00";
            var closetimes = "00:00";
        }
        var opentime_s = moment(opentimes, "HH:mm A").format("HH:mm");
        if (closetimes == "12:00 AM") {
            var closetime_s = "12:00";
        }
        else {
            var closetime_s = moment(closetimes, "HH:mm A").format("HH:mm");
        }

        var openingMinut = 0;
        var closingMinut = 0;
        for (let index = 0; index < 8; index++) {
            if (parseInt(openingMinut) < 59 && parseInt(openingMinut) < todayDate.slice(19, 21)) {
                openingMinut = parseInt(slotInterval) * index;
            }
            if (closingMinut <= !59) {
                closingMinut = parseInt(slotInterval) * index;
            }
        }

        var today_date_with_time = moment().format("DD-MM-YYYY") + "T00:00:00.000Z";

        checkCurentTimeSlot = moment().format("DD-MM-YYYY HH:mm:ss") < moment(closetime_s, "HH:mm A").format("DD-MM-YYYY HH:mm:ss");

        if (today_date_with_time == date) {
            if (checkCurentTimeSlot) {
                if (parseInt(todayDate.slice(16, 21).replace(/:/g, "")) >= parseInt(opentime_s.replace(/:/g, ""))) {
                    var opentime = checkCurentTimeSlot == true ? moment().format("HH:mm") : opentime_s;
                    var closetime = closetime_s;
                }
                else {
                    var opentime = opentime_s;
                    var closetime = closetime_s;
                }
            }
            else {
                console.log("imeldhjdfhk");
            }
            if (helperFunction.getGreetingTime() == session) {
                var opentime = (opentime != undefined) ? opentime.split(":")[0] + ":" + openingMinut : "";
            }
            else {
                var opentime = opentime;
            }
        } else {
            var opentime = opentime_s;
            var closetime = closetime_s;
        }

        let TimeSlot = helperFunction.timeSlot({ slotInterval, opentime, closetime, });

        var Solt = [];
        for (let i = 0; i <= TimeSlot.length; i++) {
            const from = TimeSlot[i] ?? null;
            const to = TimeSlot[i + 1] ?? null;

            if (from != null && to != null) {
                const Stime = helperFunction.railwayToNormalTimeConvert(from) + " - " + helperFunction.railwayToNormalTimeConvert(to);
                Solt.push({ Stime });
            }
        }
        const Slots = Solt.reduce((unique, o) => {
            if (!unique.some((obj) => obj.Stime === o.Stime)) {
                unique.push(o);
            }
            return unique;
        }, []);
        for (const item of bookedSlot) {
            for (const iterator of Slots) {
                if (item.Stime == iterator.Stime) {
                    Slots.splice(Slots.indexOf(iterator), 1);
                }
            }
        }
        return Slots;
    }

    static getCurrentDateTime() {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);

        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        let current_date_time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        return current_date_time;
    }
    static getCurrentTime() {
        let date_ob = new Date();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        let current_time = hours + "" + minutes + "" + seconds;
        return current_time;
    }
    static totalAmount(obj) {
        let total = 0;
        for (const iterator of obj) {
            total = parseInt(iterator.amount) + total;
        }
        return total;
    }
    static isJsonObject(text) {
        if (
            /^[\],:{}\s]*$/.test(
                text
                    .replace(/\\["\\\/bfnrtu]/g, "@")
                    .replace(
                        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                        "]"
                    )
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
            )
        ) {
            return true;
        } else {
            return false;
        }
    }
    static isJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
    static genrateToken(data, expiresIn = "1d") {
        const generate = jwt.sign(data, JWT_SECRET_KEY, { expiresIn: expiresIn });
        return generate;
    }
    static OrderBy(data, by = "created_at", type = "DESC") {
        try {
            if ((type = "DESC")) {
                return data.slice().sort((a, b) => b.created_at - a.created_at);
            }
            return data.slice().sort((a, b) => a.created_at - b.created_at);
        } catch (e) {
            return false;
        }
    }
    static filterData(data, conditionFuction) {
        try {
            const couponData = data.filter(conditionFuction);
            return couponData;
        } catch (e) {
            console.log("error=>", e);
            return e;
        }
    }
    static tokenDecode(token) {
        try {
            return jwt.verify(token, JWT_SECRET_KEY);
        } catch (e) {
            console.log("error=>", e);
            return e;
        }
    }
    static genrateToken(data, expiresIn = "1d") {
        try {
            return jwt.sign(data, JWT_SECRET_KEY, { expiresIn: expiresIn });
        } catch (e) {
            console.log("error=>", e);
            return e;
        }
    }
    static compliteProfilePercentage(totalLength, complitedLength) {
        try {
            let per_info = 100 / parseInt(totalLength);
            let total = 0;
            for (let index = 0; index < complitedLength; index++) {
                total = per_info + total;
            }
            return total;
        } catch (e) {
            console.log("error=>", e);
            return e;
        }
    }
    static isEmptyObject(obj) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }
    static is_base64_decodable(data) {
        const pattern =
            /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
        if (data == null || data == "" || data == undefined) {
            return null;
        }
        if (data.match(pattern)) {
            return base64decode(data);
        } else {
            return data;
        }
    }
    static is_file_existOld(fileName) {
        if (fileName == undefined || fileName == null) {
            return null;
        }
        const filePath = process.env.CLOUDINARY_BASE_URL;
        const DCMfilePath = process.env.APP_URL_DCM;
        if (fs.existsSync("./public/member/" + fileName)) {
            return filePath + "member/" + fileName;
        } else if (fs.existsSync("./public/laboratory/" + fileName)) {
            const labRadi =
                helperFunction.check_file_DCM(fileName) != 2
                    ? filePath + "laboratory/" + fileName
                    : DCMfilePath + fileName;
            return labRadi;
        } else if (fs.existsSync("./public/prescription_pdfs/" + fileName)) {
            return filePath + "prescription_pdfs/" + fileName;
        } else {
            return null;
        }
    }
    static async is_file_exist(fileName) {
        if (!fileName) {
            return null;
        }

        const base = process.env.CLOUDINARY_BASE_URL;          // like: 'https://res.cloudinary.com/dqpruenbu/image/upload/yash_medwire_dev/'
        const DCMfilePath = process.env.APP_URL_DCM;

        // ---------------- OLD STRUCTURE STARTS (we keep same folder order) ----------------

        // 1️⃣ member folder
        const memberUrl = `${base}member/${fileName}`;
        if (await this.isValidCloudinaryUrl(memberUrl)) {
            console.log(memberUrl, "------------");
            return memberUrl;
        }

        // 2️⃣ laboratory folder
        const labUrl = `${base}laboratory/${fileName}`;

        if (await this.isValidCloudinaryUrl(labUrl)) {

            // keep same old logic = check_file_DCM()
            const labRadi =
                helperFunction.check_file_DCM(fileName) != 2
                    ? labUrl
                    : DCMfilePath + fileName;

            return labRadi;
        }

        // 3️⃣ prescription_pdfs folder
        const pdfUrl = `${base}prescription_pdfs/${fileName}`;
        if (await this.isValidCloudinaryUrl(pdfUrl)) {
            return pdfUrl;
        }

        // ---------------- OLD STRUCTURE ENDS ----------------

        console.log("end");
        return null;
    }
    static async isValidCloudinaryUrl(url) {
        try {
            console.log(url);
            const res = await fetch(url, { method: "HEAD" });
            return res.ok;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    static check_file_DCM(fileName) {
        if (fileName == undefined || fileName == null || fileName == "") {
            return 0;
        }
        if (path.extname(fileName) == ".pdf") {
            return 1;
        }
        else if (path.extname(fileName) == ".DCM" || path.extname(fileName) == ".dcm" || path.extname(fileName) == ".zip") {
            return 2;
        }
        else {
            return null;
        }
    }
    static is_mobile_number_email(data, message = "User already exist", isMsg = false) {
        let phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (data == undefined || data == null || data == "") {
            return "Invalid User Credentials";
        }
        if (data.match(phoneno)) {
            return message + (isMsg == false ? " with this Mobile No. " + data.substr(0, 2) + "****" + data.substr(data.length - 3) + "."
                : "");
        }
        if (data.match(mailformat)) {
            return message + (isMsg == false ? " with this Email Address. " + data.substr(0, 5) + "******" + data.substr(data.length - 10) + "." : "");
        }
        if (!data.match(phoneno) && !data.match(mailformat)) {
            return "Invalid User Credentials";
        }
    }
    static getFullAge(date) {
        const bdate = date != undefined && date != "" && date != null ? date : "0000/00/00";
        var now = new Date();
        var today = new Date(now.getYear(), now.getMonth(), now.getDate());

        var yearNow = now.getYear();
        var monthNow = now.getMonth();
        var dateNow = now.getDate();
        var dateString = helperFunction.dateFormat(bdate, "mm/dd/yyyy");
        var dob = new Date(dateString.substring(6, 10),
            dateString.substring(0, 2) - 1,
            dateString.substring(3, 5)
        );

        var yearDob = dob.getYear();
        var monthDob = dob.getMonth();
        var dateDob = dob.getDate();
        var age = {};
        var ageString = "";
        var yearString = "";
        var monthString = "";
        var dayString = "";


        var yearAge = yearNow - yearDob;

        if (monthNow >= monthDob)
            var monthAge = monthNow - monthDob;
        else {
            yearAge--;
            var monthAge = 12 + monthNow - monthDob;
        }

        if (dateNow >= dateDob)
            var dateAge = dateNow - dateDob;
        else {
            monthAge--;
            var dateAge = 31 + dateNow - dateDob;

            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        age = {
            years: yearAge,
            months: monthAge,
            days: dateAge
        };

        if (age.years > 1) yearString = " years";
        else yearString = " year";
        if (age.months > 1) monthString = " months";
        else monthString = " month";
        if (age.days > 1) dayString = " days";
        else dayString = " day";


        if ((age.years > 0) && (age.months > 0) && (age.days > 0))
            ageString = age.years + yearString + ", " + age.months + monthString;
        else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
            ageString = age.days + dayString;
        else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
            ageString = age.years + yearString;
        else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
            ageString = age.years + yearString + " and " + age.months + monthString;
        else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
            ageString = age.months + monthString;
        else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
            ageString = age.years + yearString;
        else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
            ageString = age.months + monthString;
        else ageString = "Oops! Could not calculate age!";

        return ageString;
    }

    static get_Moths(date) {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        if (date) {
            const d = new Date(date);
            return monthNames[d.getMonth()];
        } else {
            return null;
        }
    }
    static get_Full_Year(date) {
        if (date) {
            const d = new Date(date);
            let year = d.getFullYear();
            return year;
        } else {
            return null;
        }
    }
    static check_today_current_slote(slote, datea) {
        const date = "Mar 23 2023";
        var todayDate = new Date().toString();
        if (opentimes == null || opentimes == "" || opentimes == undefined || closetimes == null || closetimes == "" || closetimes == undefined) {
            var opentimes = "00:00";
            var closetimes = "00:00";
        }
        const slotes = "1:00PM - 1:15PM";
        const sData = slotes.split(" ");

        var opentime_s = helperFunction.normalToRalwayTimeConvert(
            "1:00 PM" ?? "00:00"
        );
        var closetime_s = helperFunction.normalToRalwayTimeConvert(
            sData[2] ?? "00:00"
        );
        console.log("dfgfd", opentime_s);

        var openingMinut = 0;
        var closingMinut = 0;
        // for (let index = 0; index < 8; index++) {
        //   if (
        //     parseInt(openingMinut) < 59 &&
        //     parseInt(openingMinut) < todayDate.slice(19, 21)
        //   ) {
        //     openingMinut = parseInt(slotInterval) * index;
        //   }
        //   if (closingMinut <= !59) {
        //     closingMinut = parseInt(slotInterval) * index;
        //   }
        // }
        var checkCurentTimeSlot = false;
        if (parseInt(opentimes.replace(/:/g, "")) > parseInt(closetime_s.replace(/:/g, ""))) {
            console.log("im1");
            var checkCurentTimeSlot =
                parseInt(todayDate.slice(16, 21).replace(/:/g, "")) >
                parseInt(opentime_s.replace(/:/g, "")) &&
                parseInt(todayDate.slice(16, 21).replace(/:/g, "")) >
                parseInt(closetime_s.replace(/:/g, ""));
        } else {
            var checkCurentTimeSlot =
                parseInt(todayDate.slice(16, 21).replace(/:/g, "")) >
                parseInt(opentime_s.replace(/:/g, "")) &&
                parseInt(todayDate.slice(16, 21).replace(/:/g, "")) <
                parseInt(closetime_s.replace(/:/g, ""));
        }
        console.log(
            parseInt(todayDate.slice(16, 21).replace(/:/g, "")),
            parseInt(opentime_s.replace(/:/g, "")),
            parseInt(todayDate.slice(16, 21).replace(/:/g, "")),
            parseInt(closetime_s.replace(/:/g, "")), "con", checkCurentTimeSlot
        );

        if (
            helperFunction.dateFormat(todayDate, "yyyymmdd") ==
            helperFunction.dateFormat(date, "yyyymmdd")
        ) {
            if (checkCurentTimeSlot) {
                var opentime =
                    checkCurentTimeSlot == true
                        ? helperFunction.normalToRalwayTimeConvert(
                            todayDate.slice(16, 18) + ":" + openingMinut
                        )
                        : opentime_s;
                var closetime = closetime_s;
                console.log("im in if ", opentime, closetime);
            }
        } else {
            var opentime = opentime_s;
            var closetime = closetime_s;
            console.log("im in else ", opentime, closetime);
        }
        console.log(opentime, closetime);
    }
}
module.exports = helperFunction;