const Admin = require("../models/admin.model");
const { hash: hashPassword, compare: comparePassword } = require("../utils/password");
const { generate: generateToken } = require("../utils/token");
const { transporter: transporter } = require("../helper/helper");
const helperFunction = require("../helper/helperFunction");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../utils/secrets");

const moment = require("moment");
const { async } = require("q");
const helperQuery = require("../helper/helperQuery");
exports.signin = (req, res) => {
    const { email, password } = req.body;
    Admin.findByEmail(email.trim(), async (err, data) => {
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
                const token = generateToken(data.id);
                await Admin.saveLogiToken(token, data.id);
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
exports.dashboard_count = (req, res) => {
    Admin.dashboard_count((err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status: "404",
                    message: "Something Went Wrong"
                });
                return;
            }
            res.status(500).send({
                status: "500",
                message: err.message
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status: "200",
                data: data
            });
            return;
        }
    });
};

exports.paitentList = (req, res) => {
    Admin.paitentList((err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status: "404",
                    message: "Something Went Wrong"
                });
                return;
            }
            res.status(500).send({
                status: "500",
                message: err.message
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status: "200",
                data: data
            });
            return;
        }
    });

};
exports.paitentDetail = (req, res) => {
    const { user_id } = req.body;
    Admin.paitentDetail(user_id, user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status: "404",
                    message: "Something Went Wrong"
                });
                return;
            }
            res.status(500).send({
                status: "500",
                message: err.message
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status: "200",
                data: data
            });
            return;
        }
    });
};
exports.labradList = (req, res) => {
    const { role_id } = req.body;
    Admin.labradList(role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status: "404",
                    message: "Something Went Wrong"
                });
                return;
            }
            res.status(500).send({
                status: "500",
                message: err.message
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status: "200",
                data: data
            });
            return;
        }
    });

};
exports.aprroveLabRadUser = (req, res) => {
    const { user_id, status } = req.body;
    Laboratory.aprroveLabRadUser(user_id, status, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Data Not Exist"
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
                message: "Successfully!",
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
    Admin.findById(id, (err, data) => {
        if (data) {
            if (!comparePassword(old_password.trim(), data[0].password)) {
                res.status(500).send({
                    status_code: "500",
                    status: "error",
                    message: "Old Password is wrong"
                });
                return;
            } else {
                Admin.updatePassword(passwordt, id, (err, data) => {
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
                            message: "Password Updated Successfully!",
                            data: data
                        });
                        return;
                    }
                });
            }
        }
    });

};
exports.updateUser = (req, res) => {

    const { name, email, gender, mobile_no, id, } = req.body;
    let file = req.file;
    if (file == undefined) {
        var image_name = "";
    } else {
        var image_name = req.file.filename;
    }
    Admin.updateUser(name, email, gender, image_name, mobile_no, id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: err
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Profile Updated Successfully!",
                data: data
            });
            return;
        }
    });
};
exports.findById = (req, res) => {
    const { id } = req.body;
    Admin.findById(id, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went to wrong"
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                message: "Successfully!",
                data: data
            });
        }
    });
};
exports.operaterCreate = (req, res) => {
    const { name, email, gender, mobile_no } = req.body;
    var posswordt = helperFunction.autoGeneratePassword();
    const password = hashPassword(posswordt.trim());
    var logo = process.env.APP_LOGO;
    var admin_login = process.env.ADMIN_LOGIN_URL;
    var app_name = process.env.APP_NAME;
    let file = req.file;
    if (file == undefined) {
        var image_name = "";
    } else {
        var image_name = req.file.filename;
    }
    Admin.operaterCreate(name, email, gender, image_name, mobile_no, password, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went to wrong"
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                message: "Operator added successfully"
            });
            helperFunction.template(transporter, true);
            transporter.sendMail({
                from: process.env.MAIL_FROM_ADDRESS,
                to: email,
                subject: "MedWire Confirmation Mail",
                template: "email",
                context: { name, email, gender, mobile_no, posswordt, logo, admin_login, app_name }
            }, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });
        }
    });
};
exports.operaterFindById = (req, res) => {
    const { id } = req.body;
    const role = "operator";
    Admin.operaterFindById(id, role, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went wrong"
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                message: "Successfully!",
                data: data
            });
        }
    });
};
exports.operaterShow = (req, res) => {
    //const {id} = req.body;
    const role = "operator";
    Admin.operaterShow(role, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went to wrong"
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                message: "Successfully",
                data: data
            });
        }
    });
};
exports.operaterDelete = (req, res) => {
    const { id } = req.body;
    const role = "operator";
    Admin.operaterDelete(id, role, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went to wrong"
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                message: "Delete Successfully!"
            });
        }
    });
};
exports.operaterUpdate = (req, res) => {
    const { id, name, email, gender, mobile_no } = req.body;
    const role = "operator";
    //const passwordt = hashPassword(password);
    let file = req.file;
    if (file == undefined) {
        var image_name = "";
    } else {
        var image_name = req.file.filename;
    }
    Admin.operaterUpdate(name, email, gender, image_name, mobile_no, role, id, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went to wrong"
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                message: "Successfully!",
            });
        }
    });
};
exports.labradListApprove = (req, res) => {
    const { user_id, approve_status } = req.body;
    Admin.labradListApprove(user_id, approve_status, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Data Not Exist"
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
            try {
                var result = await Admin.getDefaultPlanFor(data.user_id);
                let userData = await helperQuery.First({ table: "users", where: "id=" + data.user_id });
                if (result.length > 0) {
                    var purchased_at = helperFunction.getCurrentDateTime();

                    var plan_id = result[0].plan_id;
                    var user_id = result[0].user_id;
                    var total_limit = result[0].total_limit;

                    var benefit = parseInt(result[0].benefit);

                    var validity = result[0].validity;
                    validity = validity.split(" ");
                    var validity_part_1 = validity[0];
                    var validity_part_2 = validity[1];

                    var date = moment(purchased_at).format("YYYY-MM-DD");
                    var expired_at = "";
                    if (validity_part_2 == "Year") {
                        expired_at = moment(date).add(parseInt(validity_part_1), "years").format("YYYY-MM-DD HH:mm:ss");
                    }
                    if (validity_part_2 == "Month") {
                        expired_at = moment(date).add(parseInt(validity_part_1), "months").format("YYYY-MM-DD HH:mm:ss");
                    }
                    if (validity_part_2 == "day") {
                        expired_at = moment(date).add(parseInt(validity_part_1), "days").subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
                    }

                    await Admin.addDefaultPlanForActive(user_id, plan_id, benefit, expired_at);
                }

                let msg = approve_status == "Approve" && approve_status != null ? "Approved" : "Deactivated";
                if (approve_status == "Approve" && approve_status != null) {
                    var message = "Your Profile has been approved by Admin";
                    var deactive = false;
                } else {
                    var message = "Your Profile has been deactivated by Admin";
                    var deactive = true;
                }
                let status = approve_status == "Approve" && approve_status != null ? "Congratulation!" : "Sorry!";
                // let message=`Your Account is ${msg} by Admin.`;
                let name = userData.first_name;
                let email = userData.email;
                let logo = process.env.APP_LOGO;
                let app_name = process.env.APP_NAME;

                helperFunction.template(transporter, true);
                transporter.sendMail({
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: email,
                    subject: "MedWire Confirmation Mail",
                    template: "ApproveDisapprove",
                    context: { name, email, logo, app_name, message, status, deactive }
                }, function (error, info) {
                    if (error) {
                        console.log(error.message);
                    }
                });
                res.status(200).send({
                    status_code: "200",
                    status: "success",
                    message: msg + " Successfully",
                    data: data
                });
                return;
            } catch (error) {
                res.status(500).send({
                    status_code: "500",
                    status: "error",
                    message: "Internal server Error"
                });
            }
        }
    });
};
exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    const forgot_otp = helperFunction.generateOTP(6);
    Admin.otpVerify(email, forgot_otp, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            const name = "admin";
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

            });
            const token = generateToken(data.id);
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Successfully",
                data: data.email
            });
            return;
        }
    });
};
exports.resetPassword = async (req, res) => {
    try {
        const { forgot_otp, password, verify_token } = req.body;
        const passwordt = hashPassword(password.trim());
        const decoded = jwt.verify(verify_token, JWT_SECRET_KEY);
        console.log(decoded, "----- decoded");
        // console.log(decoded.condition,"decod",decoded);
        if (decoded.condition != "reset") {
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Sorry! Token expire!"
            });
        }
        if (decoded.length > 0) {
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Sorry! Token expire!"
            });
        }
        // console.log(decoded.condition,"decod",decoded);
        const adminData = await helperQuery.All(`SELECT * FROM super_admin WHERE id='${decoded.id}' AND forgot_otp='${forgot_otp}'`);
        if (adminData.length == 0) {
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Sorry! something went wrong"
            });
        }
        // const tok = helperFunction.getIdByToken({id:1,condition:"reset"});

        const data = Admin.resetPassword(adminData[0].id, passwordt);
        if (data) {
            return res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Successfully",
                data: data
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send({
            status_code: "400",
            status: "error",
            message: "something went wrong"
        });
    }
};
exports.checkOtpVerify = (req, res) => {
    const { email, forgot_otp } = req.body;
    Admin.checkOtpVerify(email, forgot_otp, async (err, data) => {
        if (err) {
            res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Otp Not Matched"
            });
            return;
        }
        if (data.length > 0) {
            try {
                const adminData = await helperQuery.All(`SELECT * FROM super_admin WHERE email='${email}'`);
                const token = helperFunction.genrateToken({ id: adminData[0].id, condition: "reset" }, "60s");
                return res.status(200).send({
                    status_code: "200",
                    status: "success",
                    message: "Successfully",
                    token: token
                });

            } catch (error) {
                console.log(error);
                return res.status(500).send({
                    status_code: "500",
                    status: "error",
                    message: "Something went to wrong!",
                });
            }

        } else {
            return res.status(400).send({
                status_code: "400",
                status: "error",
                message: "Otp Not Matched"
            });
        }
    });
};


// vineet
exports.clinicList = (req, res) => {
    const { admin_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllClinics((err, data) => {
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
                        message: "Clinic data found Successfully",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};

// vineet

exports.doctorList = (req, res) => {
    const { admin_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllDoctorsWithClinic((err, data) => {
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
                        message: "Doctor data found Successfully",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};
exports.userListApprove = (req, res) => {
    const { user_id, approve_status } = req.body;
    Admin.userListApprove(user_id, approve_status, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Data Not Exist"
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
            var result = await Admin.getDefaultPlanFor(data.user_id);
            if (result.length > 0) {
                var purchased_at = helperFunction.getCurrentDateTime();

                var plan_id = result[0].plan_id;
                var user_id = result[0].user_id;
                var total_amount = result[0].total_amount;
                var payment_order_id = process.env.APP_NAME + "_" + new Date().getTime();
                var benefit = parseInt(result[0].benefit);
                var payment_currency = "INR";
                var payment_detail = "Set As Default";

                var validity = result[0].validity;
                validity = validity.split(" ");
                var validity_part_1 = validity[0];
                var validity_part_2 = validity[1];

                var date = moment(purchased_at).format("YYYY-MM-DD");
                var expired_at = "";
                if (validity_part_2 == "Year") {
                    expired_at = moment(date).add(parseInt(validity_part_1), "years").format("YYYY-MM-DD HH:mm:ss");
                }
                if (validity_part_2 == "Month") {
                    expired_at = moment(date).add(parseInt(validity_part_1), "months").format("YYYY-MM-DD HH:mm:ss");
                }
                if (validity_part_2 == "day") {
                    expired_at = moment(date).add(parseInt(validity_part_1), "days").subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
                }
                await Admin.addDefaultPlanForActive(user_id, plan_id, benefit, expired_at, total_amount, payment_order_id, payment_currency, payment_detail);
            }
            let userData = await helperQuery.First({ table: "users", where: "id=" + data.user_id });
            let msg = approve_status == "Approve" && approve_status != null ? "Approved" : "Deactivated";
            let status = approve_status == "Approve" && approve_status != null ? "Congratulation!" : "Sorry!";
            let message = "Your Profile has been deactivated by Admin.";
            let deactive = true;
            if (approve_status == "Approve") {
                message = "Your Profile has been successfully verfied and approved from MedWire Team. You can access your Profile and start serving your patients.";
                deactive = false;
            }

            let name = userData.first_name;
            let email = userData.email;
            let logo = process.env.APP_LOGO;
            let app_name = process.env.APP_NAME;

            helperFunction.template(transporter, true);
            transporter.sendMail({
                from: process.env.MAIL_FROM_ADDRESS,
                to: email,
                subject: `Your Profile has been ${msg} Successfully`,
                template: "ApproveDisapprove",
                context: { name, email, logo, app_name, message, status, deactive: deactive }
            }, function (error, info) {
                if (error) {
                    console.log(error.message);
                }
            });
            res.status(200).send({
                status_code: "200",
                status: "success",
                data: data
            });
            return;
        }
    });
};
exports.addPlan = (req, res) => {
    const { admin_id, plan_for, benefit, plan_name, price, validity, description } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id, plan_for, benefit, plan_name, validity, description });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (req.body.plan_for != "clinic" && req.body.plan_for != "laboratories" && req.body.plan_for != "radiology") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please select plan only for clinic,laboratories or radiology"
        });
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.addPlan(admin_id, plan_for, benefit, plan_name, price, validity, description, (err, data) => {
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
                        message: "Plan added Successfully!",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};

// find all plans by vineet shirdhonkar

exports.findAllPlans = (req, res) => {
    const { admin_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllPlans(admin_id, (err, data) => {
                if (err) {

                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Plans Found"
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
                        message: "Plan data found Successfully!",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};

// get plan detail by vineet shirdhonkar

exports.getPlanDetail = (req, res) => {
    const { plan_id } = req.body;

    var valid = helperFunction.customValidater(req, { plan_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findPlanById(plan_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Plan does not exist"
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
                message: "Plan detail found Successfully!",
                data: data
            });
            return;
        }

    });
};



// update plan by vineet shirdhonkar

exports.updatePlan = (req, res) => {
    const { admin_id, plan_for, benefit, plan_name, price, validity, description, plan_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id, plan_for, benefit, plan_name, price, validity, description, plan_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (req.body.plan_for != "clinic" && req.body.plan_for != "laboratories" && req.body.plan_for != "radiology") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please select plan only for clinic,laboratories or radiology"
        });
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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

            Admin.findPlanById(plan_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "success",
                            message: "Plan does not exist"
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
                    Admin.updatePlan(plan_for, benefit, plan_name, price, validity, description, plan_id, (err, data) => {
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
                                message: "Plan updated Successfully!",
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
exports.planPurchaseHistory = async (req, res) => {

    var result = await Admin.getPlanHistory();

    if (result) {
        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Plan purchase history are showing",
            data: result
        });
    }
    else {
        return res.status(500).send({
            status_code: 500,
            status: "error",
            message: err.message
        });
    }
};
exports.setAsDefaultPlan = (req, res) => {
    const { admin_id, plan_for, plan_id, status } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id, plan_for, plan_id, status });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (req.body.plan_for != "clinic" && req.body.plan_for != "laboratories" && req.body.plan_for != "radiology") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Please select plan only for clinic,laboratories or radiology"
        });
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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

            Admin.findPlanById(plan_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "success",
                            message: "Plan does not exist"
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
                    if (status == "Inactive") {
                        Admin.updateSetAsDefaultPlan(plan_id, status, (err, data) => {
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
                                    message: "Plan has set as default",
                                });
                                return;

                            }
                        });
                    }
                    else {
                        Admin.softRemovePlan(plan_for, (err, data) => {
                            if (err) {
                                if (err.kind === "not_found") {
                                    res.status(404).send({
                                        status_code: 404,
                                        status: "success",
                                        message: "Other plan soft does not remove"
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
                                Admin.updateSetAsDefaultPlan(plan_id, status, (err, data) => {
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
                                            message: "Plan has set as default",
                                        });
                                        return;

                                    }
                                });
                            }


                        });
                    }

                }

            });
        }

    });
};

// delete plan by vineet shirdhonkar


exports.deletePlan = (req, res) => {
    const { plan_id } = req.body;

    var valid = helperFunction.customValidater(req, { plan_id });
    if (valid) {
        return res.status(500).json(valid);
    }


    Admin.findPlanById(plan_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Plan does not exist"
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
            Admin.deletePlan(plan_id, (err, data) => {
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
                        message: "Plan Deleted Successfully",
                        data: data
                    });
                    return;
                }
            });

        }
    });
};



// add commission code by vineet shirdhonkar


exports.addCommission = (req, res) => {
    var { admin_id, commission_for, user_ids, commission_percent } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id, commission_for, user_ids, commission_percent });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (commission_for !== "lab" && commission_for !== "radiology") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Commission for should be lab or radiology"
        });
    }



    Admin.findById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Admin does not exist"
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
            var uId;
            var all_data = [];
            if (user_ids.length > 0) {
                for (uId of user_ids) {
                    all_data.push({ "user_id": uId, "commission_for": commission_for, "admin_id": admin_id, "commission_percent": commission_percent });
                }

                Admin.addCommission(all_data, (err, data1) => {
                    if (err) {
                        if (err.kind === "not_inserted") {
                            res.status(500).send({
                                status_code: 500,
                                status: "error",
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
                    if (data1) {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Commission Added Successfully",
                            data: data1
                        });

                    }

                });




            }
        }
    });
};




// get Specific Lab And RadioLogy List code by vineet shirdhonkar


exports.getSpecificLabAndRadioLogyList = (req, res) => {
    const { admin_id, role_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Admin does not exist"
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
            Admin.getSpecificLabAndRadioLogyList(role_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }

                if (data) {
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: (data.length > 0) ? "Data Found Successfully" : "No Record Found",
                        data: data
                    });
                }
            });

        }
    });
};



// get all commissions code by vineet shirdhonkar


exports.getAllCommissions = (req, res) => {
    const { admin_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    Admin.findById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Admin does not exist"
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
            Admin.findAllCommissions(admin_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Data Found"
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
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Data Found Successfully",
                        data: data
                    });
                }
            });

        }
    });
};

// get commission detail code by vineet shirdhonkar


exports.getCommissionDetail = (req, res) => {
    const { commission_id } = req.body;

    var valid = helperFunction.customValidater(req, { commission_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findCommissionById(commission_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Commission Record does not exist"
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
                message: "Commission Details Found Successfully",
                data: data
            });
            return;

        }
    });
};



// update commission code by vineet shirdhonkar


exports.updateCommission = (req, res) => {
    var { commission_id, admin_id, commission_for, user_id, commission_percent } = req.body;

    var valid = helperFunction.customValidater(req, { commission_id, admin_id, commission_for, user_id, commission_percent });
    if (valid) {
        return res.status(500).json(valid);
    }


    if (commission_for !== "lab" && commission_for !== "radiology") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Commission for should be lab or radiology"
        });
    }


    Admin.findById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Admin does not exist"
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

            Admin.updateCommission(commission_id, user_id, commission_for, commission_percent, (err, data1) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data1) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Commission Updated Successfully!",
                        data: data1
                    });
                    return;
                }
            });

        }
    });
};



// delete commission code by vineet shirdhonkar


exports.deleteCommission = (req, res) => {
    const { commission_id } = req.body;

    var valid = helperFunction.customValidater(req, { commission_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findCommissionById(commission_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Commission record does not exist"
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
            Admin.deleteCommission(commission_id, (err, data) => {
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
                        message: "Commission Deleted Successfully!",
                        data: data
                    });
                    return;
                }
            });

        }
    });
};

// vineet

exports.approvedUserList = (req, res) => {
    const { admin_id, role_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findApprovedUserList(role_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Data Found"
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
                        message: "Data found Successfully!",
                        data: data
                    });
                    return;
                }
            });
        }

    });
};

// vineet

exports.getAllAppointments = (req, res) => {
    const { admin_id, appointment_date, appointment_time } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllAppointments(appointment_date, appointment_time, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Data Found"
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
                        message: "Data found Successfully!",
                        data: data,
                        total_appointments: data.length
                    });
                    return;
                }
            });
        }

    });
};

// vineet

exports.getAllLabVistedAppointments = (req, res) => {
    const { admin_id } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllLabVistedAppointments((err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Data Found"
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
                        total_lab_visted_appointments: data.length
                    });
                    return;
                }
            });
        }

    });
};


// vineet

exports.getInsightAppointments = (req, res) => {
    const { from_date, to_date, lab_id, role_id, admin_id, filter_by, appointment_date, week, month, year, age_group, gender, pin_code, blood_group } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllInsightAppointments(from_date, to_date, lab_id, role_id, age_group, gender, pin_code, filter_by, appointment_date, week, month, year, blood_group, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Data Found"
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
                        //total_appointments : data.length,
                        data: data
                    });
                    return;
                }
            });
        }

    });
};

// vineet

exports.getAllAppointmentsForAdmin = (req, res) => {
    const { admin_id, appointment_date, appointment_time } = req.body;

    var valid = helperFunction.customValidater(req, { admin_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Admin.findAdminById(admin_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Admin does not exist"
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
            Admin.findAllAppointmentsForAdmin(appointment_date, appointment_time, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Data Found"
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
                        message: "Data found Successfully!",
                        data: data,
                        total_appointments: data.length
                    });
                    return;
                }
            });
        }

    });
};