const User = require("../models/user.model");
const ClinicOrHospital = require("../models/clinicorhospital.model");
const { hash: hashPassword, compare: comparePassword } = require("../utils/password");
const { generate: generateToken } = require("../utils/token");
const { generateOTP } = require("../utils/generateOTP.js");
const { uniqueEmailAndMobile: uniqueEmailAndMobile } = require("../helper/helper");
const helperQuery = require("../helper/helperQuery");
const { async } = require("q");

const { transporter: transporter } = require("../helper/helper");
const helperFunction = require("../helper/helperFunction");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../utils/secrets");
const doctorSpecialityMaster = require("../models/doctorSpecialityMaster.model");


exports.logOut = async (req, res) => {
    try {
        const userId = req.userId;
        const userData = await helperQuery.First({ table: "users", where: " id=" + userId });
        if (!userData) {
            return res.status(401).send({
                status: "error",
                message: "Unauthorized!"
            });
        }
        const result = await User.logOut(userId);
        if (!result) {
            return res.status(401).send({
                status: "error",
                message: "Unauthorized!"
            });
        }
        return res.status(200).send({
            status: "success",
            message: "Logout Successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            status: "error",
            message: "Unauthorized!"
        });
    }
};
exports.updateDeviceDetail = async (req, res) => {
    try {
        const { user_id, device_token, device_type } = req.body;
        const vali = helperFunction.customValidater(req, { user_id, device_token, device_type });
        if (vali) {
            return res.status(500).json(vali);
        }
        await helperQuery.All("UPDATE `users` SET `device_token` = '" + device_token + "',`device_type`='" + device_type + "' WHERE `id` = '" + user_id + "'");

        return res.status(200).send({
            status_code: "200",
            status: "success",
            message: "Device detail update Successfully"
        });
    }
    catch (error) {
        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: error
        });
    }
};
exports.trunCate = async (req, res) => {
    try {
        const { tableName } = req.body;
        const vali = helperFunction.customValidater(req, { tableName });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await helperQuery.TrunCate({ table: tableName });
        return res.status(200).send({
            status_code: "200",
            status: "success",
            message: "table truncate Successfully!"
        });
    } catch (error) {
        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: error
        });
    }
};

exports.radiosignup = async (req, res) => {
    const { username, email, mobile, password, user_type, role_id } = req.body;
    const adhar_card = req.body.adhar_card != undefined ? req.body.adhar_card : null;
    const passwordt = hashPassword(password.trim());
    const approve_document = req.file.filename;
    const forgot_otp = helperFunction.generateOTP(6);
    User.radiocreate(username, email.trim(), mobile.trim(), passwordt, user_type, role_id, adhar_card, approve_document, forgot_otp, async (err, data) => {

        const name = username;
        const logo = process.env.APP_LOGO;
        const admin_login = process.env.ADMIN_LOGIN_URL;
        const app_name = process.env.APP_NAME;
        helperFunction.template(transporter, true);
        transporter.sendMail({
            from: process.env.MAIL_FROM_ADDRESS,
            to: email,
            subject: "MedWire Confirmation Mail",
            template: "signUpVarification",
            context: { name, email, forgot_otp, logo, app_name }
        }, function (error, info) {
            if (error) {
                console.log(error);
            }
            // console.log('Message sent: ' + info.response +'test'+posswordt);
        });
        const token = generateToken(data.id);
        if (mobile) {
            var message = forgot_otp + " is your OTP for Verification of your account at MedWire. Thank you.";
            var mobile_number = mobile;
            await helperFunction.sendJapiSMS(mobile_number, message);
        }
        res.status(200).send({
            status_code: "200",
            status: "success",
            message: "Successfully Registered!",
            data: { token, data }
        });

    });
};

exports.signup = async (req, res) => {
    const { username, email, mobile, password, user_type, role_id } = req.body;
    const alternate_mobile = req.body.alternate_mobile != undefined ? req.body.alternate_mobile : null;
    const passwordt = hashPassword(password.trim());
    //const user = new User(username, email.trim(), mobile.trim(),passwordt, user_type, role_id)
    const forgot_otp = helperFunction.generateOTP(6);
    User.create(username, email.trim(), mobile.trim(), alternate_mobile, passwordt, user_type, forgot_otp, role_id, async (err, data) => {
        if (err) {
            console.log(err);
            const errMs = uniqueEmailAndMobile(err, res);
            res.status(errMs != undefined ? errMs[0].status : 500).send({
                status: "error",
                status_code: errMs != undefined ? errMs[0].status_code : "500",
                message: errMs != undefined ? errMs[0].message : err.message
            });
        } else {

            const name = username;
            const logo = process.env.APP_LOGO;
            const admin_login = process.env.ADMIN_LOGIN_URL;
            const app_name = process.env.APP_NAME;
            const token = generateToken(data.id);
            helperFunction.template(transporter, true);
            transporter.sendMail({
                from: process.env.MAIL_FROM_ADDRESS,
                to: email,
                subject: "MedWire Confirmation Mail",
                template: "signUpVarification",
                context: { name, email, forgot_otp, logo, app_name }
            }, function (error, info) {
                if (error) {
                    console.log(error);
                }
                // console.log('Message sent: ' + info.response +'test'+posswordt);
            });
            if (mobile) {
                var message = forgot_otp + " is your OTP for Verification of your account at MedWire. Thank you.";
                var mobile_number = mobile;
                await helperFunction.sendJapiSMS(mobile_number, message); // rohit
            }
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Successfully Registered!",
                data: {
                    token,
                    data
                }
            });
        }
    });
};

exports.signin = (req, res) => {
    const { email, password } = req.body;
    User.findByEmailForMObile(email.trim(), async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(400).send({
                    status_code: "400",
                    status: "error",
                    message: helperFunction.is_mobile_number_email(email, "User is not found")
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
            if (comparePassword(password.trim(), data.password)) {
                const token = generateToken(data.id);
                await User.saveLogiToken(token, data.id);
                res.status(200).send({
                    status_code: "200",
                    status: "success",
                    data: {
                        token,
                        userData: data,
                    }
                });
                return;
            }
            res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Incorrect password"
            });
        }
    });

};

exports.signinRole = (req, res) => {
    const { email, role_id, password } = req.body;
    User.findByEmailAndRole(email.trim(), role_id, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: `User with email ${email} was not found`
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
            if (comparePassword(password.trim(), data.password)) {
                if (data.role_id != 5 && data.role_id != 2 && data.role_id != 6 && data.role_id != 7) {
                    if (data.approve_status != "Approve") {
                        res.status(404).send({
                            status_code: "404",
                            status: "error",
                            message: "Account is not approved by Admin."
                        });
                        return;
                    } else {
                        const token = generateToken(data.id);
                        await User.saveLogiToken(token, data.id);
                        await helperQuery.All(`UPDATE users SET device_token=NULL,device_type=NULL WHERE id=${data.id}`);
                        res.status(200).send({
                            status_code: "200",
                            status: "success",
                            data: {
                                token,
                                userData: data,
                            }
                        });
                        return;
                    }
                } else {
                    if (data.role_id == 5) {
                        var doctor_id = data.id;
                        User.findAllClinics(doctor_id, async (err, data1) => {
                            if (err) {
                                res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: err.message
                                });
                                return;
                            }
                            if (data1.length == 0) {
                                res.status(400).send({
                                    status_code: "400",
                                    status: "error",
                                    message: "Clinic has deleted your account",
                                    data: data1
                                });
                                return;

                            } else {

                                const token = generateToken(data.id);
                                await User.saveLogiToken(token, data.id);
                                res.status(200).send({
                                    status_code: "200",
                                    status: "success",
                                    data: {
                                        token,
                                        userData: data,
                                    }
                                });
                                return;
                            }

                        });

                    } else {
                        const token = generateToken(data.id);
                        await User.saveLogiToken(token, data.id);
                        res.status(200).send({
                            status_code: "200",
                            status: "success",
                            data: {
                                token,
                                userData: data,
                            }
                        });
                        return;
                    }
                }
            }
            else {
                res.status(400).send({
                    status_code: "400",
                    status: "error",
                    message: "Incorrect password"
                });
                return;
            }
        }
    });

};

exports.profile = (req, res) => {
    const { id } = req.body;
    User.findById(id, async (err, data) => {
        try {
            if (err) {
                console.log(error);
                if (err.kind === "not_found") {
                    res.status(404).send({
                        status_code: "404",
                        status: "error",
                        message: "User was not found"
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

                if (data.length > 0 && data[0].role_id == 5) {
                    try {
                        const doctor_specialities = await helperQuery.Get({ table: "doctor_specialities", where: "doctor_id=" + id });
                        const doctor_degrees = await helperQuery.Get({ table: "doctor_degrees", where: "doctor_id=" + id });
                        return res.status(200).send({
                            status_code: "200",
                            status: "success",
                            data: data,
                            doctor_specialities: doctor_specialities,
                            doctor_degrees: doctor_degrees
                        });

                    } catch (err) {
                        console.log(err);
                        res.status(500).send({
                            status_code: "500",
                            status: "error",
                            message: err.message
                        });
                    }

                } else {
                    return res.status(200).send({
                        status_code: "200",
                        status: "success",
                        data: data
                    });
                }
            }
        } catch (error) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: error.message
            });
            return;
        }
    });

};
exports.myprofiles = (req, res) => {
    const { id } = req.body;
    User.memberfindById(id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "User was not found"
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
            res.status(200).send({
                status_code: "200",
                status: "success",
                data: data
            });
            return;
        }
    });

};
exports.forgotPassword = async (req, res) => {
    const { email, role_id } = req.body;
    //const forgot_otp  = Math.floor(1000 + Math.random() * 9000);
    const forgot_otp = helperFunction.generateOTP(6);
    User.otpVerify(email, forgot_otp, role_id, async (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            try {
                const userData = await helperQuery.All(`SELECT*FROM users WHERE (email='${email}' OR mobile = '${email}') AND role_id='${role_id}' LIMIT 1 `);
                if (userData.length <= 0) {
                    return res.status(500).send({
                        status_code: "500",
                        status: "error",
                        //message: `A user with email address '${email}' not exist`
                        message: "User not exist"
                    });
                }
                const name = userData[0].first_name;
                const logo = process.env.APP_LOGO;
                const admin_login = process.env.ADMIN_LOGIN_URL;
                const app_name = process.env.APP_NAME;
                const token = generateToken(userData[0].id);

                if (userData[0].mobile) {
                    var message = forgot_otp + " is your OTP for Verification of your account at MedWire. Thank you.";
                    var mobile_number = userData[0].mobile;
                    await helperFunction.sendJapiSMS(mobile_number, message);
                }

                if (userData[0].email) {
                    let email_id = userData[0].email;
                    helperFunction.template(transporter, true);
                    transporter.sendMail({
                        from: process.env.MAIL_FROM_ADDRESS,
                        to: email_id,
                        subject: "Forgot Password",
                        template: "forgotTemplate",
                        context: { name, email_id, forgot_otp, logo, app_name }
                    }, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log("Message sent: " + info.response + "test" + posswordt);
                    });
                }


                return res.status(200).send({
                    status_code: "200",
                    status: "success",
                    token: token
                });

            } catch (error) {

                return res.status(500).send({
                    status_code: "500",
                    status: "error",
                    message: error.message
                });
            }

        }
    });
};
exports.resetPassword = async (req, res) => {
    try {
        const { verify_token, otp, password } = req.body;
        const passwordt = hashPassword(password.trim());

        const valid = helperFunction.customValidater(req, { verify_token, otp, password });

        if (valid) {
            return res.status(400).json(valid);
        }
        const decoded = await jwt.verify(verify_token, JWT_SECRET_KEY);

        if (decoded) {
            const verifydata = await helperQuery.All(`SELECT * FROM users WHERE id='${decoded.id}' AND forgot_otp='${otp}'`);
            if (verifydata.length > 0) {
                const verifyUpdate = await helperQuery.All(`UPDATE users SET password = '${passwordt}', forgot_otp=NULL WHERE forgot_otp = '${otp}' AND id='${decoded.id}'`);
                if (verifyUpdate) {
                    console.log(verifyUpdate);
                    return res.status(200).send({
                        status_code: "200",
                        status: "success",
                        message: "Password change Successfully!",
                    });
                }
            }
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Please enter correct OTP.",
            });
        } else {
            return res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Please enter correct OTP.",
            });
        }
    } catch (error) {
        res.status(500).send({
            status_code: "500",
            status: "error",
            message: "Something went to wrong!"
        });
    }
    //     const { email,forgot_otp,password } =req.body;
    //     const passwordt = hashPassword(password.trim());

    //     User.resetPassword(email,forgot_otp,passwordt,(err,data)=>{
    //         if(err){
    //             res.status(400).send({
    //                 status_code : "400",
    //                 status: 'error',
    //                 message: 'Otp Not Matched'
    //             });
    //             return;
    //         }
    //         if (data) {
    //             res.status(200).send({
    //                 status_code : "200",
    //                 status: 'success',
    //                 data: data
    //             });
    //             return;
    //     }
    // })
};

exports.addMembers = (req, res) => {
    const { first_name, date_of_birth, gender, created_by_id } = req.body;
    let file = req.file;
    if (file == undefined) {
        var profile_image = "";
    } else {
        var profile_image = req.file.filename;
    }

    const blood_group = req.body.blood_group != undefined && req.body.blood_group != null ? req.body.blood_group : null;
    var user_type = "patient";
    var role_id = 2;

    User.addMembers(first_name, date_of_birth, user_type, role_id, gender, profile_image, blood_group, created_by_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Member Created Successfully",
                data: data
            });
            return;
        }
    });
};
exports.updateMember = (req, res) => {
    const { first_name, mobile, date_of_birth, gender, user_id } = req.body;
    const blood_group = req.body.blood_group ?? null;
    let file = req.file;
    if (file == undefined) {
        var profile_image = "";
    } else {
        var profile_image = req.file.filename;
    }
    User.updateMember(first_name, mobile, date_of_birth, gender, profile_image, blood_group, user_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Member Updated Successfully",
                data: data
            });
            return;
        }
    });
};


exports.deleteMember = (req, res) => {
    const { member_id, user_id } = req.body;
    User.deleteMember(member_id, user_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Member Deleted Successfully",
                data: data
            });
            return;
        }
    });
};
exports.updatePassword = (req, res) => {
    const { old_password, password, id } = req.body;
    const passwordt = hashPassword(password.trim());
    const passwordot = hashPassword(old_password.trim());
    User.findById(id, (err, data) => {
        if (data) {
            if (!comparePassword(old_password.trim(), data[0].password)) {
                res.status(400).send({
                    status_code: "400",
                    status: "error",
                    message: "Old Password is wrong"
                });
                return;
            } else {
                User.updatePassword(passwordt, id, (err, data) => {
                    if (err) {
                        res.status(500).send({
                            status_code: "500",
                            status: "error",
                            message: "Something Went Wrong"
                        });
                        return;
                    }
                    if (data) {
                        res.status(200).send({
                            status_code: "200",
                            status: "success",
                            message: "Password Updated Successfully",
                            data: data
                        });
                        return;
                    }
                });
            }
        }
    });

};

exports.updateUser = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            mobile,
            gender,
            date_of_birth,
        } = req.body;
        var user_id = req.body.user_id != undefined ? req.body.user_id : req.body.id != undefined ? req.body.id : null;
        let file = req.file;
        if (file == undefined) {
            var profile_image = "";
        } else {
            var profile_image = req.file.filename;
        }

        const alternate_mobile_number = req.body.alternate_mobile_number != undefined ? req.body.alternate_mobile_number : null;
        const username = req.body.username != undefined ? req.body.username : null;
        const address = req.body.address != undefined ? req.body.address : null;
        const pin_code = req.body.pin_code != undefined ? req.body.pin_code : null;
        const opening_time = req.body.opening_time != undefined ? req.body.opening_time : null;
        const closing_time = req.body.closing_time != undefined ? req.body.closing_time : null;
        const blood_group = req.body.blood_group != undefined ? req.body.blood_group : null;
        const latitude = req.body.latitude != undefined ? req.body.latitude : null;
        const longitude = req.body.longitude != undefined ? req.body.longitude : null;

        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        // const doctorMaster = await doctorSpecialityMaster.findBYName();
        User.updateUser(username, mobile, profile_image, gender, date_of_birth, first_name, last_name, address, pin_code, opening_time, closing_time, alternate_mobile_number, blood_group, latitude, longitude, user_id, (err, data) => {
            if (err) {
                console.log("err", err);
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
                    message: "Profile Updated Successfully",
                    data: data
                });
                return;
            }
        });
    } catch (error) {

    }
};

exports.checkOtpVerify = (req, res) => {
    const { email, forgot_otp } = req.body;

    User.checkOtpVerify(email, forgot_otp, (err, data) => {
        if (err) {
            res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Otp Not Matched"
            });
            return;
        }
        if (data.length > 0) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Successfully",
                data: data
            });
            return;
        } else {
            res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Otp Not Matched"
            });
            return;
        }
    });
};
// clinic or hospital signup code by vineet shirdhonkar

exports.clinichospitalsignup = (req, res) => {
    const { name, email_id, mobile_number, password, type, role_id, aadhar_card_number } = req.body;

    const approve_document = "";

    if (req.body.name == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Name field is required"
        });
    }


    if (req.body.name.length < 3) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Name should be minimum 3 characters"
        });
    }

    if (req.body.email_id == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Email id field is required"
        });
    }

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Please enter valid email id"
        });
    }

    if (req.body.mobile_number == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Mobile number field is required"
        });
    }

    if (isNaN(req.body.mobile_number)) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Mobile number should be numeric"
        });
    }

    if (req.body.mobile_number.length != 10) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Mobile number should be 10 digit"
        });
    }

    if (req.body.password == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Password field is required"
        });
    }

    if (req.body.password.length < 8 || (!req.body.password.match(/[a-z]/)) || (!req.body.password.match(/[A-Z]/)) || (!req.body.password.match(/\d/)) || (!req.body.password.match(/[^a-zA-Z0-9\-\/]/)) || req.body.password.length > 36) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Password must contain at least one special character , at least one uppercase and lowercase letter,  at least one number and minimum 8 characters and maximum 36 characters "
        });
    }




    if (req.body.type == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Type field is required"
        });
    }

    if (req.body.type != "clinic" && req.body.type != "hospital") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Type should be either clinic or hospital"
        });
    }


    if (req.body.role_id == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Role id field is required"
        });
    }




    if (req.body.role_id != 8) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Role id should be valid"
        });
    }

    if (req.body.type == "clinic") {
        if (req.body.role_id != 8) {
            return res.status(400).json({
                status_code: "400",
                status: "error",
                message: "Role id should be valid"
            });
        }
    }



    if (req.body.aadhar_card_number == "") {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Aadhar card number field is required"
        });
    }


    if (isNaN(req.body.aadhar_card_number)) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Aadhar card number should be numeric"
        });
    }



    if (req.body.aadhar_card_number.length != 12) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Aadhard card number should be 12 digit"
        });
    }


    if (req.file == undefined) {

        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Approve document field is required"
        });


    } else {
        const approve_document = req.file.filename;
    }


    const passwordt = hashPassword(req.body.password);

    ClinicOrHospital.create(name, email_id.trim(), mobile_number.trim(), passwordt, type, role_id, aadhar_card_number, approve_document, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                status_code: "500",
                message: err
            });
        } else {
            res.status(200).send({
                status_code: "200",
                status: "success",
                data: { data }
            });
        }
    });
};

// clinic or hospital forgot password code by vineet shirdhonkar

exports.clinichospitalforgotPassword = (req, res) => {
    const { email_id } = req.body;
    //const forgot_otp  = Math.floor(1000 + Math.random() * 9000);
    const forgot_otp = 1234;
    ClinicOrHospital.otpVerify(email_id, forgot_otp, (err, data) => {
        if (err) {
            res.status(500).send({
                status: "error",
                status_code: "500",
                message: err.message
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                data: data
            });
            return;
        }
    });
};



// clinic or hospital profile code by vineet shirdhonkar

exports.clinichospitalprofile = (req, res) => {
    const { clinic_id } = req.body;
    ClinicOrHospital.findByIdAndRole(clinic_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Clinic / Hospital does not exist"
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
            var profile_details = [];

            var profile_image_name = (data.profile_image == null) ? "" : data.profile_image;
            var profile_image_path = process.env.APP_URL + "member/" + profile_image_name;
            var doc_name = (data.approve_document == null) ? "" : data.approve_document;
            var doc_link_path = process.env.APP_URL + "member/" + doc_name;
            var address = (data.address == null) ? "" : data.address;
            var pin_code = (data.pin_code == null) ? "" : data.pin_code;

            profile_details.push({ "name": data.first_name, "mobile_number": parseInt(data.mobile), "email_id": data.email, "profile_pic_name": profile_image_name, "profile_pic_path": profile_image_path, "document_name": doc_name, "document_link_path": doc_link_path, "address": address, "pin_code": pin_code });

            res.status(200).send({
                status_code: "200",
                status: "success",
                profile_details: profile_details,
            });
            return;
        }
    });
};

// clinic or hospital or doctor update profile code by vineet shirdhonkar

// clinic or hospital or doctor update profile code by vineet shirdhonkar

exports.updateProfile = (req, res) => {
    const { full_name, email_id, mobile_number, address, pin_code, user_id } = req.body;
    const latitude = req.body.latitude != undefined ? req.body.latitude : null;
    const longitude = req.body.longitude != undefined ? req.body.longitude : null;

    var valid = helperFunction.customValidater(req, { full_name, email_id, address, pin_code, user_id });
    if (valid) {
        return res.status(500).json(valid);
    }


    if (req.body.full_name.length < 3) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Name should be minimum 3 characters"
        });
    }


    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false) {
        return res.status(400).json({
            status_code: "400",
            status: "error",
            message: "Please Enter Valid Email id"
        });
    }

    User.findById(req.body.user_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went to Wrong"
            });
            return;
        }

        if (data.length > 0) {
            if (req.file != undefined) {
                var profile_image = req.file.filename;

            } else {
                var profile_image = data[0].imgName;
            }
            User.updateProfile(full_name, email_id, address, pin_code, profile_image, latitude, longitude, user_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: "500",
                        status: "error",
                        message: "Something Went to Wrong"
                    });
                    return;
                }
                if (data) {
                    res.status(200).send({
                        status_code: "200",
                        status: "success",
                        message: "Profile Updated Successfully",
                        data: data
                    });
                    return;
                }
            });
        } else {
            res.status(200).send({
                status_code: "404",
                status: "success",
                message: "User record not found",
                data: data
            });
            return;
        }
    });
};
exports.onlineOflineStatus = async (req, res) => {
    try {
        const { status, user_id, staff_id } = req.body;
        console.log({ status, user_id });
        const vali = helperFunction.customValidater(req, { status, user_id });
        if (vali) {
            return res.status(500).json(vali);
        }

        var added_by = (staff_id) ? (staff_id) : null;
        if (added_by) {
            var result = await User.onlineStaffOfflineStatus(status, user_id, staff_id);
        }
        else {
            var result = await User.onlineOflineStatus(status, user_id);
        }
        return res.status(200).send({
            status_code: "200",
            status: "success",
            message: "Successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: "Something went to wong!"
        });

    }
};

exports.EmailOtpVerify = async (req, res) => {
    try {
        const { verify_token, otp } = req.body;
        const valid = helperFunction.customValidater(req, { verify_token, otp });

        if (valid) {
            return res.status(400).json(valid);
        }
        const decoded = await jwt.verify(verify_token, JWT_SECRET_KEY);

        if (decoded) {
            const verifydata = await helperQuery.All(`SELECT * FROM users WHERE id='${decoded.id}' AND forgot_otp='${otp}'`);
            if (verifydata.length > 0) {
                const verifyUpdate = await helperQuery.All(`UPDATE users SET account_verify='1', forgot_otp=NULL WHERE id='${decoded.id}'`);
                if (verifyUpdate) {

                    return res.status(200).send({
                        status_code: "200",
                        status: "success",
                        message: "OTP verify Successfully",
                    });
                }
            }
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Please enter correct OTP!",
            });
        } else {
            return res.status(500).send({
                status_code: "500",
                status: "error",
                message: "The OTP has expired.",
            });
        }

    } catch (error) {
        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: error.message == "jwt expired" ? "The OTP has expired." : "Something went to wrong!"
        });
    }
};
exports.PasswordOtpVerify = async (req, res) => {
    try {
        const { verify_token, otp } = req.body;

        const decoded = await jwt.verify(verify_token, JWT_SECRET_KEY);
        if (decoded) {
            const verifydata = await helperQuery.All(`SELECT * FROM users WHERE id='${decoded.id}' AND forgot_otp='${otp}'`);
            if (verifydata.length > 0) {
                const verifyUpdate = await helperQuery.All(`UPDATE users SET account_verify='1' WHERE id='${decoded.id}'`);
                if (verifyUpdate) {

                    return res.status(200).send({
                        status_code: "200",
                        status: "success",
                        message: "Verification completed!",
                    });
                }
                return res.status(200).send({
                    status_code: "200",
                    status: "success",
                    message: "Verification completed!",
                });
            }
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "OTP does not match!",
            });
        } else {
            return res.status(500).send({
                status_code: "500",
                status: "error",
                message: error.message == "jwt expired" ? "The OTP has expired." : "Something went to wrong!"
            });
        }


    } catch (error) {

        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: error.message == "jwt expired" ? "The OTP has expired." : "Something went to wrong!"
        });
    }
};

// exports.resendOtp = async (req, res) => {
//     try {
//         const { verify_token, otp } = req.body;
//         const decoded = await jwt.verify(verify_token, JWT_SECRET_KEY);
//         if (decoded) {
//             const userData = await helperQuery.First({ table: 'users', where: 'id=' + id });
//             if (helperFunction.isEmptyObject(userData) == false) {
//                 return res.status(500).json({
//                     status_code: 500,
//                     status: 'error',
//                     message: 'Something went to wrong!',
//                 })
//             }
//             const forgot_otp = await helperFunction.generateOTP(6);
//             const id = userData?.id ?? 0;
//             const token = helperFunction.genrateToken({ id }, '365d');
//             const data = await User.otpSave({ email: userData.email, forgot_otp: userData.forgot_otp, id: userData.id });
//             if (data) {
//                 const name = userData.first_name;
//                 const logo = process.env.APP_LOGO;
//                 const admin_login = process.env.ADMIN_LOGIN_URL;
//                 const app_name = process.env.APP_NAME;

//                 if (userData.mobile) {
//                     var message = forgot_otp + " is your OTP for Verification of your account at MedWire. Thank you.";
//                     var mobile_number = userData.mobile;
//                     await helperFunction.sendJapiSMS(mobile_number, message);
//                 }

//                 helperFunction.template(transporter, true);
//                 transporter.sendMail(
//                     {
//                         from: process.env.MAIL_FROM_ADDRESS,
//                         to: email,
//                         subject: "MedWire Confirmation Mail",
//                         template: "signInRoleVarification",
//                         context: { name, email, forgot_otp, logo, app_name },
//                     },
//                     function (error, info) {
//                         if (error) {
//                             console.log("email", error);
//                         }
//                     }
//                 );

//                 return res.status(200).send({
//                     status_code: 200,
//                     status: "success",
//                     message: `OTP Resend Successfully!`,
//                     token: token,
//                 });
//             }
//         } else {
//             return res.status(500).send({
//                 status_code: "500",
//                 status: 'error',
//                 message: 'The OTP has expired.',
//             });
//         }

//     } catch (error) {
//         return res.status(500).send({
//             status_code: "500",
//             status: 'error',
//             message: error.message == 'jwt expired'?'The OTP has expired.':'Something went to wrong!'
//         });
//     }
// }

exports.resendOtp = async (req, res) => {
    try {
        const { verify_token } = req.body;
        const decoded = jwt.verify(verify_token, JWT_SECRET_KEY);
        if (decoded) {

            const userData = await helperQuery.First({ table: "users", where: "id=" + decoded.id });
            const emailTemplate = userData.account_verify == "1" ? "signInRoleVarification" : "signUpVarification";
            if (helperFunction.isEmptyObject(userData)) {
                console.log(userData);
                return res.status(500).json({
                    status_code: 500,
                    status: "error",
                    message: "Your Session has expired please sif in again!",
                });
            }
            const forgot_otp = helperFunction.generateOTP(6);
            const id = userData?.id ?? 0;
            const email = userData.email;
            const token = helperFunction.genrateToken({ id }, "365d");
            const data = await User.otpSave({ email, forgot_otp, id: userData.id });
            if (data) {
                const name = userData.first_name;
                const logo = process.env.APP_LOGO;
                const admin_login = process.env.ADMIN_LOGIN_URL;
                const app_name = process.env.APP_NAME;

                if (userData.mobile) {
                    var message = forgot_otp + " is your OTP for Verification of your account at MedWire. Thank you.";
                    var mobile_number = userData.mobile;
                    await helperFunction.sendJapiSMS(mobile_number, message); // rohit
                }

                const messageMT = userData.account_verify == "1" ?
                    "Thank you for choosing MedWire. Use this OTP to complete your Sign In process and verify your account on MedWire." :
                    "Thank you for choosing MedWire. Use this OTP to complete your Sign Up process and verify your account on MedWire.";

                helperFunction.template(transporter, true);
                transporter.sendMail(
                    {
                        from: process.env.MAIL_FROM_ADDRESS,
                        to: email,
                        subject: "MedWire Confirmation Mail",
                        template: "signInRoleVarification",
                        context: { name, email, forgot_otp, logo, app_name, messageMT, messageMTC: true },
                    },
                    function (error, info) {
                        if (error) {
                            console.log("email", error);
                        }
                    }
                );

                return res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "OTP Resend Successfully!",
                    token: token,
                });
            }
        } else {
            return res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Your Session has expired please sign up in again!",
            });
        }

    } catch (error) {
        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: error.message == "jwt expired" ? "The OTP has expired." : "Your Session has expired please sign up in again!"
        });
    }
};

exports.updateDoctorUser = async (req, res) => {
    try {
        const { mobile, gender, date_of_birth, first_name, address, experience_in_year, specialities, degrees, pin_code, alternate_mobile, user_id } = req.body;
        let file = req.file;
        if (file == undefined) {
            var profile_image = "";
        } else {
            var profile_image = req.file.filename;
        }
        const vali = helperFunction.customValidater(req, { mobile, gender, date_of_birth, first_name, address, experience_in_year, specialities, degrees, pin_code, user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const data = await User.updateDoctorUser({ mobile, gender, date_of_birth, first_name, address, experience_in_year, pin_code, alternate_mobile, user_id, profile_image });
        if (data) {
            const doctD = specialities.split(",");
            const doctS = degrees.split(",");
            const DSpeciality = await doctorSpecialityMaster.deleteDoctorSpeciality(user_id);
            if (DSpeciality) {
                for (let index = 0; index < doctD.length; index++) {
                    const specialitie = doctD[index];
                    const doctorMaster = await doctorSpecialityMaster.findBYName(specialitie);
                    if (doctorMaster.length <= 0) {
                        // console.log("ij",specialitie);
                        await doctorSpecialityMaster.add(specialitie);
                    }
                    console.log(specialitie);
                    await doctorSpecialityMaster.addDoctorSpeciality(user_id, null, specialitie);
                }
            }

            const Ddegree = await doctorSpecialityMaster.deleteDoctorDegrees(user_id);
            if (Ddegree) {
                for (let index = 0; index < doctS.length; index++) {
                    const degree = doctS[index];
                    console.log(degree);
                    await doctorSpecialityMaster.addDoctorDegrees(user_id, null, degree);
                }
            }

            return res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Profile Updated Successfully",
            });
        }
    } catch (err) {
        console.log("err", err);
        return res.status(500).send({
            status_code: 500,
            status: "error",
            message: "Something Went Wrong"
        });
    }
};