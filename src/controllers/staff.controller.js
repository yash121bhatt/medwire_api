const Staff = require("../models/staff.model");
const ClinicOrHospital = require("../models/clinicorhospital.model");
const { hash: hashPassword, compare: comparePassword } = require("../utils/password");
const { transporter: transporter, mailOptions: mailOptions, autoGenPassword: autoGenPassword, convertDate: convertDate, dateFormat: dateFormat } = require("../helper/helper");
const helperFunction = require("../helper/helperFunction");
const { async } = require("q");
const helperQuery = require("../helper/helperQuery");
// add Staff code by vineet shirdhonkar

exports.addStaff = async (req, res) => {
    const { clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, role_id } = req.body;
    var profile_image = "";

    var password = autoGenPassword();
    var encryptedPassword = hashPassword(password.trim());

    var valid = helperFunction.customValidater(req, { clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, role_id });
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


    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please enter valid email id"
        });
    }



    if (req.body.role_id != 6 && req.body.role_id != 7) {
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
        var profile_image = req.file.filename;
    }



    ClinicOrHospital.findByIdAndRole(req.body.clinic_id, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
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
            Staff.add(clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, role_id, profile_image, encryptedPassword, async (err, data) => {
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
                    const clinicData = await helperQuery.All(`SELECT first_name FROM users WHERE id = '${clinic_id}'`);

                    var created_by_name = (clinicData) ? clinicData[0].first_name : "";

                    const decrypted_password = password;

                    var logo = process.env.APP_LOGO;
                    var app_name = process.env.APP_NAME;
                    var user_login_url = process.env.USER_LOGIN_URL;
                    var context = "You have been registered by " + created_by_name + " on MedWire. Now you can avail all the benefits by login in the MedWire app.";

                    helperFunction.template(transporter, true);
                    transporter.sendMail({
                        from: process.env.MAIL_FROM_ADDRESS,
                        to: email_id,
                        subject: "You have been Registered by " + created_by_name + " on MedWire",
                        template: "createStaffAccountByClinic",
                        context: { full_name, email_id, logo, app_name, decrypted_password, mobile_number, user_login_url, created_by_name, context }
                    }, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                    });

                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Staff Added Successfully",
                        data: data
                    });
                    return;
                }
            });
        }
    });
};

// get all Staff code by vineet shirdhonkar
exports.getAllStaffs = (req, res) => {
    const { clinic_id } = req.body;

    var valid = helperFunction.customValidater(req, { clinic_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    ClinicOrHospital.findByIdAndRole(clinic_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
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
            Staff.findAll(clinic_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
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
                if (data.length > 0) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Staff data found Successfully",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};

// get staff detail code by vineet shirdhonkar


exports.getStaffDetail = (req, res) => {
    const { staff_id } = req.body;


    var valid = helperFunction.customValidater(req, { staff_id });
    if (valid) {
        return res.status(500).json(valid);
    }



    Staff.findByIdAndRole(staff_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Staff does not exist"
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
                message: "Staff Details Found Successfully",
                data: data
            });
            return;

        }
    });
};


// update staff code by vineet shirdhonkar

exports.updateStaff = (req, res) => {
    const { clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, role_id, staff_id } = req.body;

    var valid = helperFunction.customValidater(req, { clinic_id, full_name, email_id, date_of_birth, mobile_number, gender, role_id, staff_id });
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



    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please enter valid email id"
        });
    }



    if (req.body.role_id != 6 && req.body.role_id != 7) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Role id should be valid"
        });
    }



    ClinicOrHospital.findByIdAndRole(req.body.clinic_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
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
            Staff.findByIdAndRole(req.body.staff_id, (err, data) => {

                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "success",
                            message: "Staff does not exist"
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

                if (data.length > 0) {
                    if (req.file != undefined) {
                        var profile_image = req.file.filename;

                    } else {
                        var profile_image = data[0].profile_image_name;
                    }
                    var staff_id = req.body.staff_id;
                    Staff.update(clinic_id, full_name, role_id, email_id, date_of_birth, mobile_number, gender, profile_image, staff_id, (err, data) => {
                        if (err) {

                            if (err.kind === "already_added") {
                                res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: "Email or Mobile Number is already exist"
                                });
                                return;
                            }

                            if (err.kind == "failed") {
                                res.status(500).send({
                                    status_code: 500,
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
                                message: "Staff Updated Successfully",
                                data: data
                            });


                            transporter.sendMail({
                                from: process.env.MAIL_FROM_ADDRESS,
                                to: req.body.email_id,
                                subject: "this mail form medwire for updated account",
                                html: "<b>Clinic has updated your profile , Following are your updated details :-<br/> Email: " + email_id + "<br/> Mobile Number : " + mobile_number + "<br/></b>",
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
        }
    });
};

// delete Staff code by vineet shirdhonkar


exports.deleteStaff = (req, res) => {
    const { staff_id } = req.body;

    var valid = helperFunction.customValidater(req, { staff_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Staff.findByIdAndRole(staff_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Staff does not exist"
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

        if (data.length > 0) {
            Staff.delete(staff_id, (err, data) => {
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
                        message: "Staff Deleted Successfully",
                        data: data
                    });
                    return;
                }
            });

        }
    });
};