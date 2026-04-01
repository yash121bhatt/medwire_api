const User = require("../models/user.model");
const ClinicOrHospital = require("../models/clinicorhospital.model");
const Patient = require("../models/patient.model");
const { hash: hashPassword } = require("../utils/password");
const { transporter: transporter, autoGenPassword: autoGenPassword, uploadFileIntoCloudinary } = require("../helper/helper");
const helperFunction = require("../helper/helperFunction");
const db = require("../config/db.config");
const helperQuery = require("../helper/helperQuery");
const { logger } = require("../utils/logger");

exports.addPatient = async (req, res) => {
    const { staff_id, user_id, alternate_mobile_number, full_name, email_id, date_of_birth, search_key, sex, role_id, pin_code, address, enquiry_date } = req.body;

    var profile_image = "";

    var valid = helperFunction.customValidater(req, { user_id, full_name, date_of_birth, search_key, role_id, enquiry_date });
    if (valid) {
        return res.status(500).json(valid);
    }

    var password = autoGenPassword();
    var encryptedPassword = hashPassword(password.trim());

    if (req.body.search_key == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Mobile number or Medwire ID field is required"
        });
    }

    if (req.body.full_name.length < 3) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Full Name should be minimum 3 characters"
        });
    }

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please enter valid email id"
        });
    }

    if (req.body.search_key.substring(0, 3) != "MED") {
        if (isNaN(req.body.search_key)) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be numeric"
            });
        }

        if (req.body.search_key.length != 10) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be 10 digit"
            });
        }
    }

    if (req.body.suggested_by !== "self" && req.body.suggested_by !== "doctor") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Suggested by should be doctor or self"
        });
    }

    if (req.file == undefined) {
        var profile_image = "";
    } else {
        // var profile_image = req.file.filename;
        var profile_image = await uploadFileIntoCloudinary(req);
    }

    User.findByIdAndRole(req.body.user_id, req.body.role_id, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "User Does Not Exist"
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
            var created_by_id = req.body.user_id;
            Patient.checkExistence(req.body.patient_id, created_by_id, async (err, data) => {
                if (data.length > 0) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Patient already exist"
                    });
                    return;
                } else {
                    Patient.search(req.body.search_key, async (pErr, pData) => {

                        if (pErr) {
                            if (pErr.kind === "not_found") {
                                var full_name = req.body.full_name;
                                var email_id = req.body.email_id;
                                var dob = req.body.date_of_birth;
                                var mobile_number = req.body.search_key;
                                if (req.body.search_key.substring(0, 3) != "MED" || req.body.search_key.substring(0, 3) == "MED") {
                                    if (isNaN(req.body.search_key)) {
                                        return res.status(400).json({
                                            status_code: 400,
                                            status: "error",
                                            message: "Mobile number should be numeric"
                                        });
                                    }

                                    if (req.body.search_key.length != 10) {
                                        return res.status(400).json({
                                            status_code: 400,
                                            status: "error",
                                            message: "Mobile number should be 10 digit"
                                        });
                                    }
                                }

                                var sex = req.body.sex;
                                var pin_code = req.body.pin_code;
                                var address = req.body.address;

                                var suggested_by = req.body.suggested_by;
                                var suggested_by_id = req.body.suggested_by_id;
                                var enquiry_date = req.body.enquiry_date;
                                var alternate_mobile_number = req.body.alternate_mobile_number;
                                var role_id = 2;

                                var added_by = (staff_id) ? staff_id : null;
                                const user = {
                                    user_name: req.body.full_name,
                                    email: req.body.email_id,
                                    password: password
                                };
                                console.log("useer", user);
                                Patient.add(added_by, alternate_mobile_number, full_name, email_id, dob, mobile_number, sex, role_id, pin_code, address, created_by_id, suggested_by, suggested_by_id, enquiry_date, profile_image, encryptedPassword, async (err, data) => {
                                    if (err) {
                                        res.status(500).send({
                                            status_code: 500,
                                            status: "error",
                                            message: "Something Went Wrong"
                                        });
                                        return;
                                    }
                                    if (data) {


                                        var user_detail = await helperQuery.Get({ table: "users", where: "id =" + user_id });

                                        if (mobile_number) {
                                            var url = "https://play.google.com/store/apps/details?id=dev.khct.medwire";
                                            var message = "Dear " + full_name + " " + user_detail[0].first_name + " added you to their patient list. Download our app for online service benefit " + url + " Thanks MedWire Team";

                                            await helperFunction.sendJapiSMS(mobile_number, message);
                                        }

                                        var context = "You have been registered by " + user_detail[0].first_name + " on MedWire. Now you can avail all the benefits by login in the MedWire app.";

                                        const credential = true;
                                        const login = process.env.USER_LOGIN_URL;
                                        const mailOptions = {
                                            from: process.env.MAIL_FROM_ADDRESS,
                                            to: req.body.email_id,
                                            template: "createPatientAccountByLab",
                                            subject: "You have been Registered by " + user_detail[0].first_name + " on MedWire",
                                            context: { context, user, credential: true, login }
                                        };

                                        helperFunction.template(transporter, true);
                                        transporter.sendMail(mailOptions,
                                            function (error, info) {
                                                if (error) {
                                                    console.log(error.message);
                                                } else {
                                                    console.log("Email send succefully!");
                                                }
                                            });

                                        res.status(200).send({
                                            status_code: 200,
                                            status: "success",
                                            message: "Patient Added Successfully",
                                            data: data
                                        });
                                        return;
                                    }
                                });
                            }

                        }

                        if (pData) {

                            db.query("Insert into users_patient(patient_id,user_id) values(?,?)", [req.body.patient_id, created_by_id], (err) => {

                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }



                            });
                            var user_detail = await helperQuery.Get({ table: "users", where: "id =" + user_id });

                            if (mobile_number) {
                                var url = "https://play.google.com/store/apps/details?id=dev.khct.medwire";
                                var message = "Dear " + full_name + " " + user_detail[0].first_name + " added you to their patient list. Download our app for online service benefit " + url + " Thanks MedWire Team";

                                await helperFunction.sendJapiSMS(mobile_number, message);
                            }

                            var context = "You have been registered by " + user_detail[0].first_name + " on MedWire. Now you can avail all the benefits by login in the MedWire app.";
                            const user = {
                                user_name: req.body.full_name,
                                email: req.body.email_id,
                                password: password
                            };
                            console.log("useer", user);
                            const login = process.env.USER_LOGIN_URL;
                            const mailOptions = {
                                from: process.env.MAIL_FROM_ADDRESS,
                                to: req.body.email_id,
                                template: "createPatientAccountByLab",
                                subject: "You have been Registered by " + user_detail[0].first_name + " on MedWire",
                                context: { context, user, credential: false, login }
                            };
                            helperFunction.template(transporter, true);
                            transporter.sendMail(mailOptions,
                                function (error, info) {
                                    if (error) {
                                        console.log(error.message);
                                    } else {
                                        console.log("Email send succefully!");
                                    }
                                });

                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Patient Added Successfully",
                                data: data
                            });
                            return;
                        }
                    });

                }
            });

        }

    });

};
exports.addForClinic = async (req, res) => {
    const { staff_id, user_id, alternate_mobile_number, full_name, email_id, date_of_birth, search_key, sex, role_id, pin_code, address, enquiry_date } = req.body;
    var profile_image = "";
    // console.log({staff_id,user_id,full_name,date_of_birth,search_key,role_id,enquiry_date});
    var valid = helperFunction.customValidater(req, { user_id, full_name, date_of_birth, search_key, role_id, enquiry_date });
    if (valid) {
        return res.status(500).json(valid);
    }

    var password = autoGenPassword();
    var encryptedPassword = hashPassword(password.trim());

    if (req.body.search_key == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Mobile number or Medwire ID field is required"
        });
    }

    if (req.body.full_name.length < 3) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Full Name should be minimum 3 characters"
        });
    }

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please enter valid email id"
        });
    }

    if (req.body.search_key.substring(0, 3) != "MED") {
        if (isNaN(req.body.search_key)) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be numeric"
            });
        }

        if (req.body.search_key.length != 10) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be 10 digit"
            });
        }
    }

    if (req.body.suggested_by !== "self" && req.body.suggested_by !== "doctor") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Suggested by should be doctor or self"
        });
    }

    if (req.file == undefined) {
        var profile_image = "";
    } else {
        // var profile_image = req.file.filename;
        var profile_image = await uploadFileIntoCloudinary(req);
    }

    User.findByIdAndRole(req.body.user_id, req.body.role_id, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "User Does Not Exist"
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
            var created_by_id = req.body.user_id;
            Patient.checkExistence(req.body.patient_id, created_by_id, async (err, data) => {
                if (data.length > 0) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Patient already exist"
                    });
                    return;
                } else {

                    Patient.search(req.body.search_key, async (pErr, pData) => {
                        var added_by = (staff_id) ? staff_id : null;

                        if (pErr) {
                            if (pErr.kind === "not_found") {
                                var full_name = req.body.full_name;
                                var email_id = req.body.email_id;
                                var dob = req.body.date_of_birth;
                                var mobile_number = req.body.search_key;
                                if (req.body.search_key.substring(0, 3) != "MED" || req.body.search_key.substring(0, 3) == "MED") {
                                    if (isNaN(req.body.search_key)) {
                                        return res.status(400).json({
                                            status_code: 400,
                                            status: "error",
                                            message: "Mobile number should be numeric"
                                        });
                                    }

                                    if (req.body.search_key.length != 10) {
                                        return res.status(400).json({
                                            status_code: 400,
                                            status: "error",
                                            message: "Mobile number should be 10 digit"
                                        });
                                    }
                                }

                                var sex = req.body.sex;
                                var pin_code = req.body.pin_code;
                                var address = req.body.address;

                                var suggested_by = req.body.suggested_by;
                                var suggested_by_id = req.body.suggested_by_id;
                                var enquiry_date = req.body.enquiry_date;
                                var alternate_mobile_number = req.body.alternate_mobile_number;
                                var role_id = 2;



                                Patient.addForClinic(added_by, alternate_mobile_number, full_name, email_id, dob, mobile_number, sex, role_id, pin_code, address, created_by_id, suggested_by, suggested_by_id, enquiry_date, profile_image, encryptedPassword, async (err, data) => {
                                    if (err) {
                                        res.status(500).send({
                                            status_code: 500,
                                            status: "error",
                                            message: "Something Went Wrong"
                                        });
                                        return;
                                    }
                                    if (data) {


                                        var user_detail = await helperQuery.Get({ table: "users", where: "id =" + created_by_id });

                                        if (mobile_number) {
                                            var url = "https://play.google.com/store/apps/details?id=dev.khct.medwire";
                                            var message = "Dear " + full_name + " " + user_detail[0].first_name + " added you to their patient list. Download our app for online service benefit " + url + " Thanks MedWire Team";

                                            await helperFunction.sendJapiSMS(mobile_number, message);
                                        }

                                        var context = "You have been registered by " + user_detail[0].first_name + " on MedWire. Now you can avail all the benefits by login in the MedWire app.";
                                        const user = {
                                            user_name: full_name,
                                            email: email_id,
                                            password: password
                                        };
                                        const credential = true;
                                        const login = process.env.USER_LOGIN_URL;
                                        const mailOptions = {
                                            from: process.env.MAIL_FROM_ADDRESS,
                                            to: req.body.email_id,
                                            template: "createPatientAccountByLab",
                                            subject: "You have been Registered by " + user_detail[0].first_name + " on MedWire",
                                            context: { context, user, credential: true, login }
                                        };

                                        helperFunction.template(transporter, true);
                                        transporter.sendMail(mailOptions,
                                            function (error) {
                                                if (error) {
                                                    console.log(error.message);
                                                } else {
                                                    console.log("Email send succefully!");
                                                }
                                            });

                                        res.status(200).send({
                                            status_code: 200,
                                            status: "success",
                                            message: "Patient Added Successfully",
                                            data: data
                                        });
                                        return;
                                    }
                                });
                            }

                        }


                        if (pData) {
                            var context = "You have been registered by " + full_name + " on MedWire. Now you can avail all the benefits by login in the MedWire app.";
                            const user = {
                                user_name: full_name
                            };
                            const login = process.env.USER_LOGIN_URL;
                            const mailOptions = {
                                to: req.body.email_id,
                                template: "createPatientAccountByLab",
                                subject: "You have been Registered by " + full_name + " on MedWire",
                                context: { context, user, credential: true, login }
                            };
                            helperFunction.sendEmail(mailOptions, true);

                            var suggested_id = req.body.suggested_by_id != undefined && req.body.suggested_by_id != req.body.user_id ? req.body.suggested_by_id : null;
                            db.query("Insert into users_patient(patient_id,user_id,suggested_by_id,added_by) values(?,?,?,?)", [req.body.patient_id, created_by_id, suggested_id, added_by], (err) => {

                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }



                            });
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Patient Added Successfully",
                                data: data
                            });
                            return;
                        }
                    });

                }
            });

        }

    });

};

// search patient by vineet shirdhonkar

exports.searchPatient = (req, res) => {
    const { search_key } = req.body;

    var valid = helperFunction.customValidater(req, { search_key });
    if (valid) {
        return res.status(500).json(valid);
    }

    Patient.search(search_key, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "No Record Found"
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
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Data Found Successfully",
                data: data
            });
            return;
        }

    });
};




// get all Patients code by vineet shirdhonkar

exports.getAllPatients = (req, res) => {
    const { user_id, role_id, staff_id } = req.body;

    var valid = helperFunction.customValidater(req, { user_id, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "User Does Not Exist"
                });
                return;
            }
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            Patient.findAll(user_id, role_id, (err, data1) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Record Found",
                            data: []
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
                if (data1) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Patient data found Successfully",
                        data: data1
                    });
                    return;
                }
            });

        }

    });
};
// get all Patients code by vineet shirdhonkar

exports.getAllPatientsClinic = async (req, res) => {
    try {
        const { user_id, role_id, staff_id } = req.body;
        var valid = helperFunction.customValidater(req, { user_id, role_id });
        if (valid) {
            return res.status(500).json(valid);
        }
        const data1 = await Patient.findAllClinicData(user_id, role_id);
        if (data1.kind === "not_found") {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "No Record Found",
                data: []
            });
            return;
        }
        if (data1.length > 0) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Patient data found Successfully",
                data: data1
            });
            return;
        }
    } catch (error) {
        res.status(500).send({
            status_code: 500,
            status: "error",
            message: error.message
        });
    }
};




// get patient detail code by vineet shirdhonkar


exports.getPatientDetail = (req, res) => {
    const { patient_id } = req.body;
    var valid = helperFunction.customValidater(req, { patient_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Patient.findByIdAndRole(patient_id, 2, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Patient Does Not Exist"
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
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Patient Details Found Successfully",
                data: data
            });
            return;
        }
    });
};


// update patient code by vineet shirdhonkar

exports.updatePatient = async (req, res) => {
    const { user_id, alternate_mobile_number, full_name, email_id, date_of_birth, search_key, sex, role_id, pin_code, address, enquiry_date } = req.body;
    var profile_image = "";

    var valid = helperFunction.customValidater(req, { user_id, full_name, search_key, date_of_birth, role_id, enquiry_date });
    if (valid) {
        return res.status(500).json(valid);
    }

    var password = autoGenPassword();
    var encryptedPassword = hashPassword(password.trim());

    if (req.body.search_key == "") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Mobile number or Medwire ID field is required"
        });
    }

    if (req.body.full_name.length < 3) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Full Name should be minimum 3 characters"
        });
    }

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please enter valid email id"
        });
    }




    if (req.body.search_key.substring(0, 3) != "MED") {
        if (isNaN(req.body.search_key)) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be numeric"
            });
        }

        if (req.body.search_key.length != 10) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Mobile number should be 10 digit"
            });
        }
    }


    if (req.body.suggested_by !== "self" && req.body.suggested_by !== "doctor") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Suggested by should be doctor or self"
        });
    }



    if (req.file == undefined) {

        var profile_image = "";

    } else {
        // var profile_image = req.file.filename;
        var profile_image = await uploadFileIntoCloudinary(req);
    }



    User.findByIdAndRole(req.body.user_id, req.body.role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "User Does Not Exist"
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
            var created_by_id = req.body.user_id;
            Patient.search(req.body.search_key, (pErr, pData) => {
                if (pErr) {
                    if (pErr.kind === "not_found") {
                        var full_name = req.body.full_name;
                        var email_id = req.body.email_id;
                        var dob = req.body.date_of_birth;
                        var mobile_number = req.body.search_key;
                        if (req.body.search_key.substring(0, 3) != "MED" || req.body.search_key.substring(0, 3) == "MED") {
                            if (isNaN(req.body.search_key)) {
                                return res.status(400).json({
                                    status_code: 400,
                                    status: "error",
                                    message: "Mobile number should be numeric"
                                });
                            }

                            if (req.body.search_key.length != 10) {
                                return res.status(400).json({
                                    status_code: 400,
                                    status: "error",
                                    message: "Mobile number should be 10 digit"
                                });
                            }
                        }

                        var sex = req.body.sex;
                        var pin_code = req.body.pin_code;
                        var address = req.body.address;
                        var suggested_by = req.body.suggested_by;
                        var suggested_by_id = req.body.suggested_by_id;
                        var enquiry_date = req.body.enquiry_date;
                        var alternate_mobile_number = req.body.alternate_mobile_number;
                        var role_id = 2;

                        Patient.add(alternate_mobile_number, full_name, email_id, dob, mobile_number, sex, role_id, pin_code, address, created_by_id, suggested_by, suggested_by_id, enquiry_date, profile_image, encryptedPassword, (err, data) => {
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
                                    message: "Patient Updated Successfully",
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

                }

                if (pData) {

                    var full_name = req.body.full_name;
                    var email_id = req.body.email_id;
                    var dob = req.body.date_of_birth;
                    var mobile_number = req.body.search_key;
                    var sex = req.body.sex;
                    var pin_code = req.body.pin_code;
                    var address = req.body.address;
                    var suggested_by = req.body.suggested_by;
                    var suggested_by_id = req.body.suggested_by_id;
                    var enquiry_date = req.body.enquiry_date;
                    var alternate_mobile_number = req.body.alternate_mobile_number;
                    var user_id = req.body.patient_id;
                    var primary_user_id = req.body.primary_user_id;


                    Patient.update(primary_user_id, alternate_mobile_number, full_name, email_id, mobile_number, dob, sex, pin_code, address, profile_image, suggested_by, suggested_by_id, enquiry_date, user_id, created_by_id, (err, data) => {
                        if (err) {

                            if (err.kind === "failed_to_update") {
                                res.status(500).send({
                                    status_code: 500,
                                    status: "success",
                                    message: "Failed ! Please try again later"
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
                                message: "Patient Updated Successfully",
                                data: data
                            });

                            transporter.sendMail({
                                from: process.env.MAIL_FROM_ADDRESS,
                                to: req.body.email_id,
                                subject: "this mail form medwire for create account",
                                html: "<b>Following are your updated email and mobile number :-<br/> Email: " + email_id + "<br/> Mobile Number : " + mobile_number + "</b>",
                            }, function (error) {
                                if (error) {
                                    return console.log(error);
                                }
                            });
                            return;
                        }
                    });

                }
            });
        }

    });

};

// delete patient code by vineet shirdhonkar


exports.deletePatient = (req, res) => {
    const { patient_id, created_by_id, staff_id } = req.body;
    var added_by = (staff_id) ? staff_id : null;

    var valid = helperFunction.customValidater(req, { patient_id, created_by_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Patient.delete(patient_id, created_by_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            if (added_by) {
                Patient.deleteStaffPatient(patient_id, added_by, (err) => {
                    if (err) {
                        res.status(500).send({
                            status_code: 500,
                            status: "error",
                            message: "Something Went Wrong"
                        });
                        return;
                    }
                });
            }
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Patient Deleted Successfully",
                data: data
            });
            return;
        }
    });
};