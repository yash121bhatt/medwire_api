
const User = require("../models/user.model");
const ClinicOrHospital = require("../models/clinicorhospital.model");
const { hash: hashPassword } = require("../utils/password");
const { transporter: transporter, autoGenPassword: autoGenPassword, uploadFileIntoCloudinary } = require("../helper/helper");
const helperFunction = require("../helper/helperFunction");
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
// const moment = require("moment");
const moment = require("moment-timezone");
const helperQuery = require("../helper/helperQuery");
const doctorSpecialityMaster = require("../models/doctorSpecialityMaster.model");


exports.createOnlineAppointmentMeetingOld = async (req, res) => {
    const { user_id, role_id } = req.body;

    var valid = helperFunction.customValidater(req, { user_id, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    var result = await User.checkOnlineAppointmentMeeting(user_id, role_id);

    const payload = {
        iss: process.env.ZOOM_API_KEY, //your API KEY
        exp: new Date().getTime() + 5000,
    };
    const token = jwt.sign(payload, process.env.ZOOM_API_SECRET);

    console.log("Console 1 ---------------");

    // your zoom developer email account
    var email = process.env.ZOOM_MEMBER_ACCOUNT;
    var options = {
        method: "POST",
        uri: "https://api.zoom.us/v2/users/me/meetings",
        body: {
            topic: "MedWire Appointment", //meeting title
            type: 2,
            settings: {
                "host_video": true,
                "participant_video": true,
                "waiting_room": false,
                "join_before_host": 2,
            },
        },
        auth: {
            bearer: token,
        },
        headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json",
        },
        json: true, //Parse the JSON string in the response
    };

    console.log("Console 2 ---------------");

    var current_time = moment().format("YYYY-MM-D, hh:mm A");

    for (let [index, value] of result.entries()) {
        var from_time = value.from_time.split(" ").join("");
        var from_time_split = from_time.split("-")[0];

        var from_time_match = from_time_split.match(/.{1,5}/g);
        var from_time_join = from_time_match.join(" ");

        var from_convert_Time12to24 = moment(from_time_join, "hh:mm A").format("HH:mm");

        var from_date = moment(Date().now).format("YYYY-MM-D, " + from_convert_Time12to24);
        var from_then = moment(new Date(from_date)).subtract(15, "minutes").format("YYYY-MM-D, hh:mm A");

        var to_time_split = from_time.split("-")[1];
        var to_time_match = to_time_split.match(/.{1,5}/g);
        var to_time_join = to_time_match.join(" ");
        var to_convert_Time12to24 = moment(to_time_join, "hh:mm A").format("HH:mm");
        var to_date = moment(Date().now).format("YYYY-MM-D, " + to_convert_Time12to24);
        var to_then = moment(new Date(to_date)).format("YYYY-MM-D, hh:mm A");

        /* console.log(' from_then '+from_then+' current_time '+current_time+' to_then '+to_then); */

        if ((current_time >= from_then) && (current_time <= to_then)) {

            var check_meeting = await User.checkAppointmentMeeting(value.id, value.from_time, value.appointment_date, value.patient_id, value.user_id);

            if (check_meeting) {
                var url = JSON.parse(check_meeting.meeting_detail);
                return res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Zoom meeting has created",
                    data: {
                        "join_url": url.join_url
                    }
                });
            }
            else {
                return requestPromise(options).then(async function (response) {
                    var insert_appointment_meeting = await User.createAppointmentMeeting(value.id, value.from_time, value.appointment_date, value.patient_id, value.user_id, response.host_email, response.join_url, response.password, JSON.stringify(response));

                    if (insert_appointment_meeting.insertId > 0) {

                        var check_meeting = await User.checkAppointmentMeeting(value.id, value.from_time, value.appointment_date, value.patient_id, value.user_id);

                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Zoom meeting has created",
                            data: {
                                "join_url": check_meeting.join_url
                            }
                        });
                    }
                }).catch(function (err) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Please create a zoom account",
                    });
                });
            }
        }
    }
    return res.status(200).send({
        status_code: 200,
        status: "success",
        message: "Currently, we don't have any appointment's meeting",
    });
};

// exports.createOnlineAppointmentMeeting = async (req, res) => {
//     try {
//         const { user_id, role_id } = req.body;

//         var valid = helperFunction.customValidater(req, { user_id, role_id });
//         if (valid) {
//             return res.status(500).json(valid);
//         }

//         // Fetch today's appointments
//         const result = await User.checkOnlineAppointmentMeeting(user_id, role_id);
//         console.log(result, "---------------- result");

//         // Get Zoom token once
//         const accessToken = await getZoomAccessToken();

//         const current_time = moment().format("YYYY-MM-D, hh:mm A");

//         for (let value of result) {
//             /* -------------------- TIME LOGIC SAME AS OLD -------------------- */
//             var from_time = value.from_time.split(" ").join("");
//             var from_time_split = from_time.split("-")[0];
//             var from_time_match = from_time_split.match(/.{1,5}/g);
//             var from_time_join = from_time_match.join(" ");
//             var from_convert = moment(from_time_join, "hh:mm A").format("HH:mm");
//             var from_date = moment(Date().now).format("YYYY-MM-D, " + from_convert);
//             var from_then = moment(new Date(from_date)).subtract(15, "minutes").format("YYYY-MM-D, hh:mm A");

//             var to_time_split = from_time.split("-")[1];
//             var to_time_match = to_time_split.match(/.{1,5}/g);
//             var to_time_join = to_time_match.join(" ");
//             var to_convert = moment(to_time_join, "hh:mm A").format("HH:mm");
//             var to_date = moment(Date().now).format("YYYY-MM-D, " + to_convert);
//             var to_then = moment(new Date(to_date)).format("YYYY-MM-D, hh:mm A");

//             /* -------------------- CHECK CURRENT TIME -------------------- */
//             if (current_time >= from_then && current_time <= to_then) {

//                 // Check if meeting already exists
//                 const check_meeting = await User.checkAppointmentMeeting(
//                     value.id,
//                     value.from_time,
//                     value.appointment_date,
//                     value.patient_id,
//                     value.user_id
//                 );

//                 if (check_meeting) {
//                     const url = JSON.parse(check_meeting.meeting_detail);

//                     return res.status(200).send({
//                         status_code: 200,
//                         status: "success",
//                         message: "Zoom meeting already exists",
//                         data: { join_url: url.join_url }
//                     });
//                 }

//                 /* -------------------- CREATE NEW MEETING (NEW ZOOM API) -------------------- */
//                 const meetingPayload = {
//                     topic: "MedWire Appointment",
//                     type: 2,
//                     duration: 30,
//                     timezone: "Asia/Kolkata",
//                     settings: {
//                         host_video: true,
//                         participant_video: true,
//                         waiting_room: false,
//                         join_before_host: true,
//                     }
//                 };

//                 const email = process.env.ZOOM_MEMBER_ACCOUNT;

//                 const meetingResponse = await axios.post(
//                     `https://api.zoom.us/v2/users/${email}/meetings`,
//                     meetingPayload,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${accessToken}`,
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 // Save meeting in DB
//                 const insert = await User.createAppointmentMeeting(
//                     value.id,
//                     value.from_time,
//                     value.appointment_date,
//                     value.patient_id,
//                     value.user_id,
//                     meetingResponse.data.host_email,
//                     meetingResponse.data.join_url,
//                     meetingResponse.data.password,
//                     JSON.stringify(meetingResponse.data)
//                 );

//                 if (insert.insertId > 0) {
//                     return res.status(200).send({
//                         status_code: 200,
//                         status: "success",
//                         message: "Zoom meeting created",
//                         data: {
//                             join_url: meetingResponse.data.join_url
//                         }
//                     });
//                 }
//             }
//         }

//         return res.status(200).send({
//             status_code: 200,
//             status: "success",
//             message: "Currently, we don’t have any appointments meeting"
//         });

//     } catch (err) {
//         console.error("Zoom Error:", err.response?.data || err.message);
//         return res.status(500).send({
//             status_code: 500,
//             status: "error",
//             message: "Zoom meeting could not be created",
//             error: err.response?.data || err.message,
//         });
//     }
// };

exports.createOnlineAppointmentMeetingOld2 = async (req, res) => {
    try {
        const { user_id, role_id } = req.body;

        var valid = helperFunction.customValidater(req, { user_id, role_id });
        if (valid) {
            return res.status(500).json(valid);
        }

        // Fetch today's appointments
        const result = await User.checkOnlineAppointmentMeeting(user_id, role_id);
        console.log(result, "---------------- result");

        // Get Zoom token once
        const accessToken = await getZoomAccessToken();

        // Get the current time in a consistent format (timestamp)
        const current_time = moment().valueOf(); // Get current time in milliseconds

        for (let value of result) {
            /* -------------------- TIME LOGIC SAME AS OLD -------------------- */
            // Get the from_time as "8:10 PM - 8:25 PM" and split it
            var from_time = value.from_time.split(" ").join("");  // Remove spaces
            var from_time_split = from_time.split("-")[0];  // Get the start time (before "-")
            var from_time_match = from_time_split.match(/.{1,5}/g);  // Match each 5 characters (e.g. "8:10")
            var from_time_join = from_time_match.join(" ");  // Rejoin with space
            var from_convert = moment(from_time_join, "hh:mm A").format("HH:mm");  // Convert to 24-hour format

            var from_date = moment().format("YYYY-MM-DD") + ", " + from_convert;  // Add current date
            var from_then = moment(from_date, "YYYY-MM-DD, hh:mm A").subtract(15, "minutes").valueOf();  // 15 minutes before

            // Get the to_time as "8:25 PM" and format it similarly
            var to_time_split = from_time.split("-")[1];  // Get the end time (after "-")
            var to_time_match = to_time_split.match(/.{1,5}/g);  // Match each 5 characters (e.g. "8:25")
            var to_time_join = to_time_match.join(" ");  // Rejoin with space
            var to_convert = moment(to_time_join, "hh:mm A").format("HH:mm");  // Convert to 24-hour format

            var to_date = moment().format("YYYY-MM-DD") + ", " + to_convert;  // Add current date
            var to_then = moment(to_date, "YYYY-MM-DD, hh:mm A").valueOf();  // End time in milliseconds

            // Log the values for debugging
            console.log("Current time:", current_time);
            console.log("From time (start):", from_then);
            console.log("To time (end):", to_then);

            /* -------------------- CHECK CURRENT TIME -------------------- */
            if (current_time >= from_then && current_time <= to_then) {
                console.log("Within the appointment time range.");

                // Check if meeting already exists
                const check_meeting = await User.checkAppointmentMeeting(
                    value.id,
                    value.from_time,
                    value.appointment_date,
                    value.patient_id,
                    value.user_id
                );

                if (check_meeting) {
                    const url = JSON.parse(check_meeting.meeting_detail);
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Zoom meeting already exists",
                        data: { join_url: url.join_url }
                    });
                }

                /* -------------------- CREATE NEW MEETING (NEW ZOOM API) -------------------- */
                const meetingPayload = {
                    topic: "MedWire Appointment",
                    type: 2,
                    duration: 30,
                    timezone: "Asia/Kolkata",
                    settings: {
                        host_video: true,
                        participant_video: true,
                        waiting_room: false,
                        join_before_host: true,
                    }
                };

                const email = process.env.ZOOM_MEMBER_ACCOUNT;

                const meetingResponse = await axios.post(
                    `https://api.zoom.us/v2/users/${email}/meetings`,
                    meetingPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Save meeting in DB
                const insert = await User.createAppointmentMeeting(
                    value.id,
                    value.from_time,
                    value.appointment_date,
                    value.patient_id,
                    value.user_id,
                    meetingResponse.data.host_email,
                    meetingResponse.data.join_url,
                    meetingResponse.data.password,
                    JSON.stringify(meetingResponse.data)
                );

                if (insert.insertId > 0) {
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Zoom meeting created",
                        data: {
                            join_url: meetingResponse.data.join_url
                        }
                    });
                }
            }
        }

        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Currently, we don’t have any appointments meeting"
        });

    } catch (err) {
        console.error("Zoom Error:", err.response?.data || err.message);
        return res.status(500).send({
            status_code: 500,
            status: "error",
            message: "Zoom meeting could not be created",
            error: err.response?.data || err.message,
        });
    }
};

exports.createOnlineAppointmentMeeting = async (req, res) => {
    try {
        const { user_id, role_id } = req.body;

        var valid = helperFunction.customValidater(req, { user_id, role_id });
        if (valid) {
            return res.status(500).json(valid);
        }

        // Fetch today's appointments
        const result = await User.checkOnlineAppointmentMeeting(user_id, role_id);
        console.log(result, "---------------- result");

        // Get Zoom token once
        const accessToken = await getZoomAccessToken();

        // Get the current time in a consistent format (timestamp)
        const current_time = moment().valueOf(); // Get current time in milliseconds

        for (let value of result) {
            /* -------------------- TIME LOGIC SAME AS OLD -------------------- */
            var from_time = value.from_time;                       // "3:00 PM - 6:00 PM"

            // Start time
            var from_time_split = from_time.split("-")[0].trim();  // "3:00 PM"
            var from_time_match = [from_time_split];               // keep as array for join
            var from_time_join = from_time_match.join(" ");        // "3:00 PM"
            var from_convert = moment(from_time_join, "hh:mm A").format("hh:mm A");

            var from_date = moment().format("YYYY-MM-DD") + ", " + from_convert;
            var from_then = moment(from_date, "YYYY-MM-DD, hh:mm A").subtract(15, "minutes").valueOf();

            // End time
            var to_time_split = from_time.split("-")[1].trim();    // "6:00 PM"
            var to_time_match = [to_time_split];
            var to_time_join = to_time_match.join(" ");            // "6:00 PM"
            var to_convert = moment(to_time_join, "hh:mm A").format("hh:mm A");

            var to_date = moment().format("YYYY-MM-DD") + ", " + to_convert;
            var to_then = moment(to_date, "YYYY-MM-DD, hh:mm A").valueOf();

            // Log the values for debugging
            console.log("Current time:", moment(current_time).format("hh:mm A"));
            console.log("From time (start):", from_convert);
            console.log("To time (end):", to_convert);

            /* -------------------- CHECK CURRENT TIME -------------------- */
            if (current_time >= from_then && current_time <= to_then) {
                console.log("Within the appointment time range.");

                // Check if meeting already exists
                const check_meeting = await User.checkAppointmentMeeting(
                    value.id,
                    value.from_time,
                    value.appointment_date,
                    value.patient_id,
                    value.user_id
                );

                if (check_meeting) {
                    const url = JSON.parse(check_meeting.meeting_detail);
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Zoom meeting already exists",
                        data: { join_url: url.join_url }
                    });
                }

                /* -------------------- CREATE NEW MEETING (NEW ZOOM API) -------------------- */
                const meetingPayload = {
                    topic: "MedWire Appointment",
                    type: 2,
                    duration: 30,
                    timezone: "Asia/Kolkata",
                    settings: {
                        host_video: true,
                        participant_video: true,
                        waiting_room: false,
                        join_before_host: true,
                    }
                };

                const email = process.env.ZOOM_MEMBER_ACCOUNT;

                const meetingResponse = await axios.post(
                    `https://api.zoom.us/v2/users/${email}/meetings`,
                    meetingPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Save meeting in DB
                const insert = await User.createAppointmentMeeting(
                    value.id,
                    value.from_time,
                    value.appointment_date,
                    value.patient_id,
                    value.user_id,
                    meetingResponse.data.host_email,
                    meetingResponse.data.join_url,
                    meetingResponse.data.password,
                    JSON.stringify(meetingResponse.data)
                );

                if (insert.insertId > 0) {
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Zoom meeting created",
                        data: {
                            join_url: meetingResponse.data.join_url
                        }
                    });
                }
            }
        }

        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Currently, we don’t have any appointments meeting"
        });

    } catch (err) {
        console.error("Zoom Error:", err.response?.data || err.message);
        return res.status(500).send({
            status_code: 500,
            status: "error",
            message: "Zoom meeting could not be created",
            error: err.response?.data || err.message,
        });
    }
};


exports.getOnlineAppointmentMeeting = async (req, res) => {
    const { patient_id } = req.body;

    var valid = helperFunction.customValidater(req, { patient_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    var result = await User.patientOnlineAppointmentMeeting(patient_id);
    console.log(result, "----------------------- result");

    var current_time = moment().format("YYYY-MM-D, hh:mm A");
    console.log(current_time, "----------------------- current_time");

    for (let [index, value] of result.entries()) {
        var from_time = value.from_time.split(" ").join("");
        var from_time_split = from_time.split("-")[0];

        var from_time_match = from_time_split.match(/.{1,5}/g);
        var from_time_join = from_time_match.join(" ");

        var from_convert_Time12to24 = moment(from_time_join, "hh:mm A").format("HH:mm");

        var from_date = moment(Date().now).format("YYYY-MM-D, " + from_convert_Time12to24);
        var from_then = moment(new Date(from_date)).format("YYYY-MM-D, hh:mm A");


        var to_time_split = from_time.split("-")[1];
        var to_time_match = to_time_split.match(/.{1,5}/g);
        var to_time_join = to_time_match.join(" ");
        var to_convert_Time12to24 = moment(to_time_join, "hh:mm A").format("HH:mm");
        var to_date = moment(Date().now).format("YYYY-MM-D, " + to_convert_Time12to24);
        var to_then = moment(new Date(to_date)).format("YYYY-MM-D, hh:mm A");

        console.log({
            current_time,
            to_then,
            from_then
        });

        if ((current_time >= from_then) && (current_time <= to_then)) {
            return res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Zoom meeting has created",
                data: {
                    "join_url": value.join_url
                }
            });
        }
    }
    return res.status(200).send({
        status_code: 200,
        status: "success",
        message: "Currently, we don't have any appointment's meeting",
    });
};

// add doctor code by krishna
exports.addDoctors = async (req, res) => {
    try {
        const { staff_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, specialities, degrees, role_id } = req.body;
        var valid = helperFunction.customValidater(req, { clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, experience_in_year, specialities, degrees, role_id });
        if (valid) {
            return res.status(500).json(valid);
        }
        var profile_image = "";

        var password = autoGenPassword();
        var encryptedPassword = hashPassword(password.trim());

        if (req.body.full_name.length < 3) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Name should be minimum 3 characters"
            });
        }
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Please enter valid email id"
            });
        }
        if (req.body.mobile_number.length != 10) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be 10 digit"
            });
        }

        if (req.body.role_id != 5) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Role id should be valid"
            });
        }

        if (req.file == undefined) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Profile Image field is required"
            });

        } else {
            // var profile_image = req.file.filename;
            var profile_image = await uploadFileIntoCloudinary(req);
        }

        const data = await ClinicOrHospital.findByIdAndRoleforcl(req.body.clinic_id);
        if (data.kind === "not_found") {
            res.status(404).send({
                status_code: 404,
                status: "error",
                message: "Clinic / Hospital does not exist"
            });
            return;
        }
        if (data) {
            const dataC = await ClinicOrHospital.findDoctorCountClinic(req.body.clinic_id, 5);
            if (dataC.kind === "doctor_limit_reached") {
                res.status(200).send({
                    status_code: 200,
                    status: "error",
                    message: "You can add more doctors after purchasing plan"
                });
                return;
            }
            if (dataC.kind === "new_doctor_limit_reached") {
                res.status(500).send({
                    status_code: 500,
                    status: "error",
                    message: "You can add more doctors after purchasing or renewing existing plan"
                });
                return;
            }

            const dataDoct = await User.addDoctors(staff_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, role_id, profile_image, password, encryptedPassword);

            if (dataDoct.kind === "already_added") {
                res.status(500).send({
                    status_code: 500,
                    status: "error",
                    message: "Email or Mobile Number Already Registered"
                });
                return;
            }
            const doctD = specialities.split(",");
            const user_id = dataDoct.id;
            await User.addClinicDoctorForAddDoctor(user_id, clinic_id);
            const DSpeciality = await doctorSpecialityMaster.deleteDoctorSpeciality(user_id);
            if (DSpeciality) {
                for (let index = 0; index < doctD.length; index++) {
                    const specialitie = doctD[index];
                    const sp = await doctorSpecialityMaster.addDoctorSpeciality(user_id, clinic_id, specialitie);
                    const doctorMaster = await doctorSpecialityMaster.findBYName(specialitie);
                    if (doctorMaster.length <= 0) {
                        await doctorSpecialityMaster.add(specialitie);
                    }

                }
            }
            const doctsSp = degrees.split(",");
            const Degreed = await doctorSpecialityMaster.deleteDoctorDegrees(user_id);
            if (Degreed) {
                for (let j = 0; j < doctsSp.length; j++) {
                    const degree = doctsSp[j];
                    await doctorSpecialityMaster.addDoctorDegrees(user_id, clinic_id, degree);
                }
            }
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor added Successfully!",
                data: dataDoct
            });

        }
    } catch (error) {
        return res.status(500)
            .send({
                status_code: 500,
                status: "error",
                message: error.message
            });
    }
};

// get Doctor Details code by vineet shirdhonkar
exports.getDoctorDetails = (req, res) => {
    const { user_id, staff_id } = req.body;
    if (staff_id) {
        User.findStaffDoctorByIdAndRole(user_id, staff_id, (err, data) => {
            if (err) {
                res.status(500).send({
                    status_code: 500,
                    status: "error",
                    message: err.message
                });
                return;
            }
            if (data[0].id == null) {
                res.status(200).send({
                    status: "success",
                    message: "Doctor does not exist",

                });
                return;
            } else {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Doctor Details Found Successfully!",
                    data: data
                });
                return;

            }

        });
    }
    else {
        User.findDoctorByIdAndRole(user_id, (err, data) => {
            if (err) {
                res.status(500).send({
                    status_code: 500,
                    status: "error",
                    message: err.message
                });
                return;
            }
            if (data[0].id == null) {
                res.status(200).send({
                    status: "success",
                    message: "Doctor does not exist",

                });
                return;
            } else {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Doctor Details Found Successfully",
                    data: data
                });
                return;
            }
        });
    }
};

// get All Doctors code by vineet shirdhonkar

exports.getAllDoctors = (req, res) => {
    const { clinic_id, staff_id } = req.body;

    ClinicOrHospital.findByIdAndRole(clinic_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Clinic / Hospital does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            var added_by = (staff_id) ? staff_id : null;
            User.findAllClinicDoctors(clinic_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }

                if (data.length > 0) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Doctor record found Successfully",
                        data: data
                    });
                    return;

                } else {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Doctor record not found"
                    });
                    return;
                }

            });
        }
    });
};
exports.updateDoctor = async (req, res) => {

    const { staff_id, doctor_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, specialities, degrees, role_id } = req.body;
    var profile_image = "";
    var valid = helperFunction.customValidater(req, { doctor_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, experience_in_year, specialities, degrees, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (req.body.full_name.length < 3) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Name should be minimum 3 characters"
        });
    }


    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please enter valid email id"
        });
    }






    if (isNaN(req.body.mobile_number)) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Mobile number should be numeric"
        });
    }

    if (req.body.mobile_number.length != 10) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Mobile number should be 10 digit"
        });
    }


    if (req.body.alternate_mobile_number !== "" && req.body.alternate_mobile_number != "null" && req.body.alternate_mobile_number != null && req.body.alternate_mobile_number != "undefined") {
        if (req.body.alternate_mobile_number == req.body.mobile_number) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Alternate Mobile number should be different than Mobile Number"
            });
        }


        if (isNaN(req.body.alternate_mobile_number)) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Alternate Mobile number should be numeric"
            });
        }

        if (req.body.alternate_mobile_number.length != 10) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Alternate Mobile number should be 10 digit"
            });
        }
    }


    if (req.body.role_id != 5) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Role id should be valid"
        });
    }


    if (req.file != undefined) {
        // profile_image = req.file.filename;
        var profile_image = await uploadFileIntoCloudinary(req);
    }





    ClinicOrHospital.findByIdAndRole(req.body.clinic_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Clinic / Hospital does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }

        if (data) {

            User.updateDoctor(staff_id, doctor_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, specialities, degrees, profile_image, async (err, data) => {
                if (err) {
                    if (err.kind === "already_added") {
                        res.status(500).send({
                            status_code: 500,
                            status: "error",
                            message: "Email or Mobile Number is already exist"
                        });
                        return;
                    }
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data) {
                    const doctD = specialities.split(",");
                    for (let index = 0; index < doctD.length; index++) {
                        const specialitie = doctD[index];
                        const doctorMaster = await doctorSpecialityMaster.findBYName(specialitie);
                        if (doctorMaster.length <= 0) {
                            await doctorSpecialityMaster.add(specialitie);
                        }
                    }
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Doctor updated Successfully",
                        data: data
                    });

                    transporter.sendMail({
                        from: process.env.MAIL_FROM_ADDRESS,
                        to: req.body.email_id,
                        subject: "this mail form MedWire for create account",
                        html: "<b>Following are your updated email and mobile number :-<br/> Email: " + email_id + "<br/> Mobile Number : " + mobile_number + "</b>",
                    }, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                    });

                    return;
                }
            });
        }
    });
};

// delete doctor code by vineet shirdhonkar


exports.deleteDoctor = (req, res) => {
    const { user_id, created_by_id, staff_id } = req.body;
    User.findDoctorByIdAndRole(user_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }

        if (data.length > 0) {
            if (staff_id) {
                User.deleteStaffDoctor(user_id, created_by_id, staff_id, (err, data) => {
                    if (err) {
                        res.status(500).send({
                            status_code: 500,
                            status: "error",
                            message: "Something Went Wrong"
                        });
                        return;
                    }
                    if (data) {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Doctor Deleted Successfully",
                            data: data
                        });
                        return;
                    }
                });
            }
            else {
                User.deleteDoctor(user_id, created_by_id, (err, data) => {
                    if (err) {
                        res.status(500).send({
                            status_code: 500,
                            status: "error",
                            message: "Something Went Wrong"
                        });
                        return;
                    }
                    if (data) {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Doctor Deleted Successfully!",
                            data: data
                        });
                        return;
                    }
                });
            }


        } else {
            res.status(404).send({
                status_code: 404,
                status: "error",
                message: "Doctor Does Not Exist"
            });
            return;
        }
    });
};



// upload signature code by vineet shirdhonkar


exports.uploadSignature = async (req, res) => {
    const { user_id } = req.body;
    var signature = "";

    if (req.body.user_id == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "User Id field is required"
        });
    }

    if (req.file == undefined) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Signature field is required"
        });

    } else {
        // var signature = req.file.filename;
        var signature = await uploadFileIntoCloudinary(req);
    }



    var ext = signature.split(".").pop();

    if (ext !== "jpg" && ext !== "jpeg" && ext !== "png") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please upload signature in jpg,jpeg or png"
        });
    }

    User.findByIdAndRole(user_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }

        if (data) {

            User.uploadSignature(signature, user_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }

                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Signature Uploaded Successfully",
                        data: data
                    });
                    return;

                }
            });
        }
    });
};




// get Doctor's Clinic code by vineet shirdhonkar

exports.getDoctorsClinic = (req, res) => {
    const { doctor_id } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            User.findAllClinics(doctor_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }
                if (data.length > 0) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Data found Successfully",
                        data: data
                    });
                    return;
                } else {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "No Data not found",
                        data: []
                    });
                    return;
                }
            });
        }

    });
};


exports.addDoctorWeeklySchedule = (req, res) => {
    const { doctor_id, clinic_id, daysData } = req.body;
    if (doctor_id == undefined || doctor_id == null || doctor_id == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "doctor_id is required"
        });
    }
    if (daysData == undefined || daysData == null || daysData == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "daysData is required"
        });
    }
    if (clinic_id == undefined || clinic_id == null || clinic_id == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "clinic_id is required"
        });
    }
    if (daysData.length < 7 || daysData.length > 7) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Full week data is required"
        });
    }

    User.addDoctorWeeklySchedule(doctor_id, clinic_id, daysData, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor schedule added Successfully!"
            });
        }
    });

};

exports.addDoctorAvailability = (req, res) => {
    const { doctor_id, clinic_id, date, days_status, morning_shift_status, afternoon_shift_status, evening_shift_status } = req.body;
    var valid = helperFunction.customValidater(req, { doctor_id, clinic_id, date, days_status, morning_shift_status, afternoon_shift_status, evening_shift_status });
    if (valid) {
        return res.status(500).json(valid);
    }
    User.addDoctorAvailability(doctor_id, clinic_id, date, days_status, morning_shift_status, afternoon_shift_status, evening_shift_status, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor availability added Successfully!"
            });
        }
    });
};

// TODO::RK
exports.viewDoctorAvailabilityOld = (req, res) => {
    const { doctor_id, clinic_id, date } = req.body;
    var valid = helperFunction.customValidater(req, { doctor_id, clinic_id, date });
    if (valid) {
        return res.status(500).json(valid);
    }
    User.viewDoctorAvailability(doctor_id, clinic_id, date, async (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            console.log(date);
            const Ddate = helperFunction.dateFormat(date, "yyyy-mm-dd");
            console.log(Ddate);
            let bookedSlots = [];
            let St = await helperQuery.All(`SELECT * FROM appointments WHERE doctor_id ='${doctor_id}' AND DATE_FORMAT(appointment_date,"%y-%m-%d")=DATE_FORMAT('${Ddate}',"%y-%m-%d") AND status != 'Cancelled'`);
            if (St.length > 0) {
                St.map((item) => {
                    const Stime = item.from_time ?? "00:00";
                    bookedSlots.push({ Stime });
                });

            }
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor availability fetch Successfully",
                result: data,
                bookedSlots: bookedSlots
            });
        }
    });
};
exports.viewDoctorAvailability = (req, res) => {
    const { doctor_id, clinic_id, date } = req.body;
    var valid = helperFunction.customValidater(req, { doctor_id, clinic_id, date });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.viewDoctorAvailability(doctor_id, clinic_id, date, async (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }

        if (data) {
            console.log(date);
            const Ddate = helperFunction.dateFormat(date, "yyyy-mm-dd");
            console.log(Ddate);

            let bookedSlots = [];

            // ✅ yahan sirf ye fix kiya gaya hai ↓
            let St = await helperQuery.All(`
                SELECT * 
                FROM appointments 
                WHERE doctor_id ='${doctor_id}' 
                AND DATE_FORMAT(appointment_date, '%Y-%m-%d') = DATE_FORMAT('${Ddate}', '%Y-%m-%d') 
                AND status != 'Cancelled'
            `);

            if (St.length > 0) {
                St.map((item) => {
                    const Stime = item.from_time ?? "00:00";
                    bookedSlots.push({ Stime });
                });
            }

            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor availability fetch Successfully",
                result: data,
                bookedSlots: bookedSlots
            });
        }
    });
};


exports.viewDoctorWeeklySchedule = (req, res) => {
    const { doctor_id, clinic_id } = req.body;
    var valid = helperFunction.customValidater(req, { doctor_id, clinic_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    User.viewDoctorWeeklySchedule(doctor_id, clinic_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor availability fetch Successfully",
                result: data
            });
        }
    });
};


// vineet
exports.profileAccessRequest = async (req, res) => {
    const { doctor_id, patient_id, member_id } = req.body;
    var valid = helperFunction.customValidater(req, { doctor_id, patient_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    const memberData = await User.checkPatientMemberExistence(patient_id, member_id);
    const length = memberData.length;

    User.requestProfileAccess(doctor_id, patient_id, member_id, length, async (err, data) => {
        if (err) {
            if (err.kind === "already_requested") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "You have already send request"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Profile access request has been sent successfully",
                result: data
            });
            return;
        }
    });
};

// vineet

exports.profileAccessList = (req, res) => {
    const { user_id, role_id } = req.body;
    var valid = helperFunction.customValidater(req, { user_id, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "User does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            User.profileAccessList(user_id, role_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: (data.length > 0) ? "Data Found Successfully" : "No Data Found",
                        data: data
                    });
                }
            });
        }
    });
};
// vineet
exports.changeProfileAccessRequestStatus = (req, res) => {
    const { request_id, status, time_interval } = req.body;
    var valid = helperFunction.customValidater(req, { request_id, status });

    if (valid) {
        return res.status(500).json(valid);
    }
    User.changeProfileAccessRequestStatus(request_id, status, time_interval, (err, data) => {
        if (err) {
            if (err.kind === "failed_to_update") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Failed ! Please try again"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Request " + status + "ed Successfully",
                data: data
            });
        }
    });
};
// vineet
exports.profileAccessDetail = (req, res) => {
    const { request_id } = req.body;
    var valid = helperFunction.customValidater(req, { request_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.profileAccessDetail(request_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: (data.length > 0) ? "Data Found Successfully" : "No Data Found",
                data: data
            });
        }
    });

};
// vineet
exports.updateProfileAccess = async (req, res) => {
    const { doctor_id, patient_id, member_id, request_id } = req.body;
    var valid = helperFunction.customValidater(req, { doctor_id, patient_id, request_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    const memberData = await User.checkPatientMemberExistence(patient_id, member_id);
    const length = memberData.length;

    User.updateProfileAccess(doctor_id, patient_id, member_id, request_id, length, (err, data) => {
        if (err) {
            if (err.kind === "already_requested") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "You have already send request"
                });
                return;
            }

            if (err.kind === "failed_to_update") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Failed ! Please try again"
                });
                return;
            }

            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Profile access request has been sent successfully",
                result: data
            });
        }
    });
};

// vineet

exports.deleteProfileAccess = (req, res) => {
    const { request_id } = req.body;
    var valid = helperFunction.customValidater(req, { request_id });
    if (valid) {
        return res.status(500).json(valid);
    }


    User.deleteProfileAccess(request_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Access deleted Successfully",
                data: data
            });
        }
    });

};



// vineet
exports.sendMeetingNotification = (req, res) => {
    User.sendMeetingNotification((err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Notification has been sent Successfully",
            });
        }
    });
};

// get signature code by vineet shirdhonkar
exports.getSignature = (req, res) => {
    const { user_id } = req.body;
    var valid = helperFunction.customValidater(req, { user_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    User.findByIdAndRole(user_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            User.getSignature(user_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }
                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Data Found Successfully",
                        data: data
                    });
                    return;
                }
            });
        }
    });
};

exports.getUserInfoOld = (req, res) => {
    const payload = {
        // iss: process.env.API_KEY,
        iss: "TH0n5t4VS7G4d0PKvRA3vg",
        exp: new Date().getTime() + 5000,
    };
    // const token = jwt.sign(payload, process.env.API_SECRET);
    const token = jwt.sign(payload, "1h381oG0tKAsUzeXp77rm2v0avXjVdPg");
    const email = "rk85783@gmail.com";
    var options = {
        uri: "https://api.zoom.us/v2/users/" + email,
        qs: {
            status: "active"
        },
        auth: {
            "bearer": token
        },
        headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json"
        },
        json: true //Parse the JSON string in the response
    };

    requestPromise(options).then(function (response) {
        console.log("User has", response);
        const resp = response;

        // Adding html to the page
        var title1 = "Your token:";
        var result1 = title1 + token;
        var title = "Users information:";

        //Prettify the JSON format using pre tag and JSON.stringify
        var result = title + "" + JSON.stringify(resp, null, 2) + "";
        res.send(result1 + "" + result);
    }).catch(function (err) {
        // API call failed...
        console.log("API call failed, reason ", err);
    });
};

exports.createZoomMeetingOld = (req, res) => {

    const payload = {
        iss: process.env.API_KEY, //your API KEY
        exp: new Date().getTime() + 5000,
    };
    const token = jwt.sign(payload, process.env.API_SECRET);

    email = "rk85783@gmail.com"; // your zoom developer email account
    var options = {
        method: "POST",
        uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
        body: {
            topic: "Zoom Meeting Using Node JS", //meeting title
            type: 1,
            settings: {
                host_video: "true",
                participant_video: "true",
            },
        },
        auth: {
            bearer: token,
        },
        headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json",
        },
        json: true, //Parse the JSON string in the response
    };

    requestPromise(options)
        .then(function (response) {
            console.log("response is: ", response);
            res.send("create meeting result: " + JSON.stringify(response));
        })
        .catch(function (err) {
            // API call failed...
            console.log("API call failed, reason ", err);
        });
};

/////// ---- Rk Code
const axios = require("axios");
const qs = require("qs");

const getZoomAccessToken = async () => {
    try {
        const tokenUrl = "https://zoom.us/oauth/token";
        const payload = {
            grant_type: "account_credentials",
            account_id: process.env.ZOOM_ACCOUNT_ID,
        };

        const authHeader = Buffer.from(
            `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64");

        const response = await axios.post(tokenUrl, qs.stringify(payload), {
            headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data.access_token;
    } catch (err) {
        console.error("Error fetching Zoom access token:", err.response?.data || err.message);
        throw new Error("Failed to get Zoom token");
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const accessToken = await getZoomAccessToken();
        const email = "yash121bhatt@gmail.com"; // You can also get from req.query.email

        const response = await axios.get(`https://api.zoom.us/v2/users/${email}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json({
            token: accessToken,
            user: response.data,
        });
    } catch (err) {
        console.error("Zoom API error:", err.response?.data || err.message);
        res.status(500).json({ error: "Zoom API call failed" });
    }
};
/**
{
    "token": "eyJzdiI6IjAwMDAwMiIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6ImVjNGExZTkwLWY3NzUtNGU0Ny05MjEyLTQ5OTc3YTBiMzdlYSJ9.eyJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJCaXNsclpkTVJ5aWVsd3NRLU5uQXZBIiwidmVyIjoxMCwiYXVpZCI6IjE2ZGFhYWY0MGY0MmU1MWViNDI5MzZhMjY2NjUwOGJmMjU2ZDdhNTIyMDM4Y2NmMmU5YTkzMGIwNzcwZDc2NmIiLCJuYmYiOjE3NjMwNjMxMjYsImNvZGUiOiI5aTg2VmNxZVRLU3BSVnVfVnlSeUt3YnVRZmVrT2ZTNHMiLCJpc3MiOiJ6bTpjaWQ6TUxlclpPamVUZ09kSzRZUXlTdXp1ZyIsImdubyI6MCwiZXhwIjoxNzYzMDY2NzI2LCJ0eXBlIjozLCJpYXQiOjE3NjMwNjMxMjYsImFpZCI6IldkcDdCZmdYVGhxWWw4V3ZGTlE5LXcifQ.HK4LIFQrfrZIuFbVcqZqKX3rEjTNieY_G1K8hX2eefTXn0WXrG8YMgBVjsNUAyV5RYEtvD5Fdh9VMAz-rT4mJg",
    "user": {
        "id": "BislrZdMRyielwsQ-NnAvA",
        "first_name": "Rohit Kumar",
        "last_name": "Mahor",
        "display_name": "Rohit Kumar Mahor",
        "email": "rk85783@gmail.com",
        "type": 1,
        "role_name": "Owner",
        "pmi": 6570614034,
        "use_pmi": false,
        "personal_meeting_url": "https://us05web.zoom.us/j/6570614034?pwd=v9K3Zgib9wud333feIwB7UCxZk92EH.1",
        "timezone": "",
        "verified": 1,
        "dept": "",
        "created_at": "2025-11-13T16:39:35Z",
        "last_login_time": "2025-11-13T19:35:59Z",
        "cms_user_id": "",
        "jid": "bislrzdmryielwsq-nnava@xmpp.zoom.us",
        "group_ids": [],
        "im_group_ids": [],
        "account_id": "Wdp7BfgXThqYl8WvFNQ9-w",
        "language": "en-US",
        "phone_country": "",
        "phone_number": "",
        "status": "active",
        "job_title": "",
        "cost_center": "",
        "location": "",
        "login_types": [
            100
        ],
        "role_id": "0",
        "cluster": "us05",
        "user_created_at": "2025-11-13T16:39:35Z"
    }
}
 */

exports.createZoomMeeting = async (req, res) => {
    try {
        const accessToken = await getZoomAccessToken();
        const email = "rk85783@gmail.com"; // Zoom account email

        const meetingPayload = {
            topic: "Zoom Meeting Using Node.js (Server-to-Server OAuth)",
            type: 2, // 2 = Scheduled meeting (1 = Instant)
            start_time: new Date(new Date().getTime() + 5 * 60000).toISOString(), // 5 mins from now
            duration: 30, // minutes
            timezone: "Asia/Kolkata",
            settings: {
                host_video: true,
                participant_video: true,
                waiting_room: false,
                join_before_host: true,
            },
        };

        const response = await axios.post(
            `https://api.zoom.us/v2/users/${email}/meetings`,
            meetingPayload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({
            message: "Zoom meeting created successfully!",
            meeting_details: {
                start_url: response.data.start_url,
                join_url: response.data.join_url,
                password: response.data.password,
            },
        });
    } catch (err) {
        console.error("Error creating Zoom meeting:", err.response?.data || err.message);
        res.status(500).json({
            message: "Failed to create Zoom meeting",
            error: err.response?.data || err.message,
        });
    }
};
/**
{
    "message": "Zoom meeting created successfully!",
    "meeting_details": {
        "start_url": "https://us05web.zoom.us/s/84744657514?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMiIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJpc3MiOiJ3ZWIiLCJjbHQiOjAsIm1udW0iOiI4NDc0NDY1NzUxNCIsImF1ZCI6ImNsaWVudHNtIiwidWlkIjoiQmlzbHJaZE1SeWllbHdzUS1ObkF2QSIsInppZCI6ImM5NGRlZGFkMDBkNTRiODM5OTNmOWFmMWJlYjllYWUyIiwic2siOiIwIiwic3R5IjoxMDAsIndjZCI6InVzMDUiLCJleHAiOjE3NjMwNzA2MDIsImlhdCI6MTc2MzA2MzQwMiwiYWlkIjoiV2RwN0JmZ1hUaHFZbDhXdkZOUTktdyIsImNpZCI6IiJ9.cPu4MVoPcsD0KDK-KNjeoFg8J-tGAxC0goLhH7ua7-M",
        "join_url": "https://us05web.zoom.us/j/84744657514?pwd=RKIEWbWYVMi1yFPmiw8lziFaCqEEra.1",
        "password": "1XNN84"
    }
}
 */
