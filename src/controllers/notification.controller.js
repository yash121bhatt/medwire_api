const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const helperFunction = require("../helper/helperFunction");
const moment = require("moment");
const helperQuery = require("../helper/helperQuery");
const { token } = require("morgan");
const { async } = require("q");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");


exports.menturationCycle = async (req, res) => {
    var data = await Notification.getMenturationCycle();
    var payload = {
        notification: {
            title: "Menstrual Cycle Reminder",
            body: "From tomorrow your Mesntrual Cycle will begin.Please update your Menstrual Cycle Calendar accordingly"
        }
    };
    var current_date = moment().format("YYYY-MM-DD");
    for (let [index, value] of data.entries()) {
        var new_start_date = new Date(Date.parse(value.start_date));
        var start_date = moment(new_start_date).format("YYYY-MM-DD");

        if (current_date == start_date) {
            if (value.device_token) {
                await helperFunction.pushNotification(value.device_token, payload);
            }
        }
    }
};
exports.pregnantWomen = async (req, res) => {
    /* var device_token = 'fa_15wyZToqEXmLMHeY37q:APA91bF-ppkw0IjArZmNC7aMmPb5eFG8UXNdDHUQOBTbPXcK-uuLJr1DXkfGUtCE8AOftC5cqWNa07wrKusFm8OiD9dIR77gN5M5E0MYBEwWA8QfqxrsS6D7vzxt8YYI30csJgVf_xCO'; */
    var payload = {
        notification: {
            title: "Stages of Child Growth Month-by-Month in Pregnancy",
            body: "This middle section of pregnancy is often thought of as the best part of the experience. "
        }
    };
    var data = await Notification.getPregnantWomenNotification();

    var current_date_time = moment().format("YYYY-MM-DD") + "T" + moment().format("HH:mm:ss") + ".000Z";

    for (let [index, value] of data.entries()) {
        var end_date_time = moment(value.date_of_pregnancy);
        var month_difference = Math.ceil(end_date_time.diff(current_date_time, "months", true));

        if (month_difference > 0) {
            for (let i = 1; i <= month_difference; i++) {
                var start_date_time = moment(end_date_time).subtract(i, "months").format("YYYY-MM-DD") + "T" + moment(end_date_time).subtract(i, "months").format("HH:mm:ss") + ".000Z";

                if (current_date_time == start_date_time) {
                    await helperFunction.pushNotification(value.device_token, payload);
                }
            }
        }
    }
};
exports.InsertPreReminder = async (req, res) => {
    var result = await Notification.getPreNotification();
    var current_moment = moment().format("YYYY-MM-DD HH:mm");

    for (let [index, value] of result.entries()) {
        var date_time = moment(value.date_time).format("YYYY-MM-DD HH:mm");

        var member_first_name = "your";
        var from_user_id = value.member_id;
        var to_user_id = value.user_id;
        var user_result = await helperQuery.Get({ table: "users", where: "id =" + to_user_id });

        if (user_result.length > 0) {
            var first_name = user_result[0].first_name;
        }
        else {
            var first_name = "User";
        }
        if (value.member_id) {
            var member_result = await helperQuery.Get({ table: "users", where: "id =" + value.member_id });
            member_first_name = (member_result.length > 0) ? member_result[0].first_name : "your";
        } else {
            member_first_name = first_name;
        }

        if (current_moment == date_time) {

            if (value.type == "lab_test") {
                var title = "Vaccination Reminder";
                var notification_type = "pre_vaccination_reminder";
                var message = "Hey " + member_first_name + ",<br>  This is a reminder regarding your vaccination. " + value.name + ".";
            }
            else {
                var title = "Appointment Reminder";
                var notification_type = "appointment_reminder";
                var message = "Hey " + member_first_name + ",<br>  This is a reminder regarding your appointment.";
            }
            if (from_user_id) {
                var created_at = moment().format("YYYY-MM-DD HH:mm");
                await Notification.InsertReminder(from_user_id, to_user_id, title, notification_type, message, created_at);
            }
        }
        if (value.time) {
            var get_time = moment(value.date_time).format("YYYY-MM-DD") + " " + value.time;
            var current_get_time = moment().format("YYYY-MM-DD hh:mm A");
            if (current_get_time == get_time) {
                const user_detail = await helperQuery.Get({ table: "users", where: " id=" + value.user_id });

                if (user_detail.length > 0) {
                    if (value.type == "lab_test") {
                        var title = "Vaccination Reminder";
                        var notification_type = "pre_vaccination_reminder";
                        var message = "Hey " + member_first_name + ",<br>  This is a reminder regarding your vaccination. " + value.name + ".";
                        var app_message = "Hey " + member_first_name + ",\nThis is a reminder regarding your vaccination. " + value.name + ".";
                    }
                    else {
                        var title = "Appointment Reminder";
                        var notification_type = "appointment_reminder";
                        var app_message = "Hey " + member_first_name + ",\nThis is a reminder regarding your appointment.";
                        var message = "Hey " + member_first_name + ",<br>  This is a reminder regarding your appointment.";
                    }
                    var payload = {
                        notification: {
                            title: title,
                            body: app_message
                        }
                    };
                    if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                        await helperFunction.pushNotification(user_detail[0].device_token, payload);

                        var created_at = moment().format("YYYY-MM-DD HH:mm");
                        await Notification.InsertReminder(from_user_id, to_user_id, title, notification_type, message, created_at);

                    }
                }
            }
        }
    }
};
exports.InsertMedicineReminder = async (req, res) => {
    var get_pre_medicines = await Notification.getPreMedicines();
    var current_moment = moment().format("hh:mm A");
    for (let [index, value] of get_pre_medicines.entries()) {
        if ((current_moment == value.take_time_one) || (current_moment == value.take_time_two) || (current_moment == value.take_time_third) || (current_moment == value.take_time_fourth)) {
            var from_user_id = value.member_id;

            var to_user_id = value.user_id;
            var user_result = await helperQuery.Get({ table: "users", where: "id =" + to_user_id + " " });

            if (user_result.length > 0) {
                var first_name = user_result[0].first_name;
            }
            else {
                var first_name = "User";
            }



            let member_first_name = "your";
            if (from_user_id) {
                const member_detail = await helperQuery.Get({ table: "users", where: " id=" + from_user_id });
                member_first_name = (member_detail.length > 0) ? member_detail[0].first_name : "your";
            }
            else {
                member_first_name = first_name;
            }



            var title = "Medicine Reminder";
            var notification_type = "pre_medicine_reminder";
            var message = "Hey " + member_first_name + ",<br> This is a reminder regarding your medicine " + value.medicine_name + ". Please take your medicine on time.";
            var app_message = "Hey " + member_first_name + ", \nThis is a reminder regarding your medicine " + value.medicine_name + ". Please take your medicine on time.";
            if (to_user_id) {
                const user_detail = await helperQuery.Get({ table: "users", where: " id=" + to_user_id + " AND device_token IS NOT NULL" });
                if (user_detail.length > 0) {
                    var payload = {
                        notification: {
                            title: title,
                            body: app_message
                        }
                    };
                    if (user_result[0] != undefined && user_result[0] != null && user_result[0].device_type != undefined && user_detail[0].device_type != null) {
                        if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                            await helperFunction.pushNotification(user_detail[0].device_token, payload);
                        }
                    }
                }

                var created_at = moment().format("YYYY-MM-DD HH:mm");
                await Notification.InsertReminder(from_user_id, to_user_id, title, notification_type, message, created_at);
            }
        }
    }
};
exports.pre_notification = (req, res) => {
    const { user_id, member_id, name, date_time, type } = req.body;
    const time = req.body.time != undefined ? req.body.time : null;
    var new_date_time = moment(date_time).format("YYYY-MM-DD HH:mm:ss");
    Notification.pre_notification(user_id, member_id, name, new_date_time, type, time, (err, data) => {
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
                message: "Added Successfully",
                data: data
            });
            return;
        }
    });
};
exports.list_pre_notification = (req, res) => {
    const { user_id, member_id, type } = req.body;
    Notification.list_pre_notification(user_id, member_id, type, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Data not found"
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
            for (let [index, value] of data.entries()) {
                if (value.time) {
                    data[index].date_time = moment(value.date_time).format("MM/DD/YYYY") + " " + value.time;
                }
                else {
                    data[index].date_time = moment(value.date_time).format("MM/DD/YYYY hh:mm A");
                }
            }
            res.status(200).send({
                status_code: "200",
                status: "success",
                data: data
            });
            return;
        }
    });
};

exports.notification_pre_medicine = (req, res) => {
    const { user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth } = req.body;
    Notification.notification_pre_medicine(user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth, (err, data) => {
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
                message: "Added Successfully",
                data: data
            });
            return;
        }
    });
};
exports.edit_notification_pre_medicine = (req, res) => {
    const { medicine_id, user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth } = req.body;
    Notification.edit_notification_pre_medicine(user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth, medicine_id, (err, data) => {
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
                message: "Edit Successfully",
                data: data
            });
            return;
        }
    });
};
exports.list_notification_pre_medicine = (req, res) => {
    const { user_id, member_id } = req.body;
    Notification.list_notification_pre_medicine(user_id, member_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Data not found"
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
exports.delete_notification_pre_medicine = (req, res) => {
    const { medicine_id, user_id, member_id } = req.body;
    Notification.delete_notification_pre_medicine(medicine_id, user_id, member_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: "404",
                    status: "error",
                    message: "Data not found"
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
                data: "Delete Successfully!"
            });
            return;
        }
    });

};
exports.deletePreNotification = async (req, res) => {
    const { pre_id, user_id, member_id } = req.body;
    const vali = helperFunction.customValidater(req, { pre_id, user_id, member_id });
    if (vali) {
        return res.status(500).json(vali);
    }
    var result = await Notification.deletePreNotification(pre_id, user_id, member_id);
    if (result.affectedRows > 0) {
        return res.status(200).send({
            status_code: "200",
            status: "success",
            data: "Delete Successfully!"
        });
    }
    else {
        return res.status(500).send({
            status_code: "500",
            status: "error",
            message: err.message
        });
    }
};

// add notification code by vineet shirdhonkar
exports.addNotification = (req, res) => {
    const { staff_id, type, user_id, role_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, patient_ids, notification_title, notification_date_time, description } = req.body;

    var valid = helperFunction.customValidater(req, { type, user_id, role_id, notification_for, notification_sent_by, notification_title, notification_date_time, description });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (req.body.notification_for !== "promo_code" && req.body.notification_for !== "doctor" && req.body.notification_for !== "general" && req.body.notification_for !== "test") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Notification for should be valid"
        });
    }

    switch (req.body.notification_for) {
        case "promo_code":
            if (req.body.promo_code_id == "") {
                return res.status(400).json({
                    status_code: 400,
                    status: "error",
                    message: "Please select promo code"
                });
            }
            break;

        /* case 'doctor':
        if(req.body.doctor_id == ''){
          return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Please select doctor"
            });  
        }
        break; */

        case "test":
            if (req.body.test_id == "") {
                return res.status(400).json({
                    status_code: 400,
                    status: "error",
                    message: "Please select test"
                });
            }
            break;
    }

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
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
            var added_by = (staff_id) ? staff_id : null;
            Notification.add(added_by, type, user_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, patient_ids, notification_title, notification_date_time, description, (err, data) => {
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
                        message: "Notification Added Successfully!",
                        data: data
                    });
                    return;
                }
            });
        }
    });

};

exports.getAllNotifications = (req, res) => {
    const { user_id, role_id, staff_id } = req.body;

    var valid = helperFunction.customValidater(req, { user_id, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
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
            var added_by = (staff_id) ? staff_id : null;
            if (added_by) {
                Notification.findStaffAll(user_id, added_by, (err, data) => {
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
                            message: "Notification data found Successfully!",
                            data: data
                        });
                        return;
                    }
                });
            }
            else {
                Notification.findAll(user_id, (err, data) => {
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
                            message: "Notification data found Successfully!",
                            data: data
                        });
                        return;
                    }
                });
            }

        }

    });
};



// get Notification detail code by vineet shirdhonkar


exports.getNotificationDetail = (req, res) => {
    const { notification_id } = req.body;


    var valid = helperFunction.customValidater(req, { notification_id });
    if (valid) {
        return res.status(500).json(valid);
    }



    Notification.findById(notification_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Notification does not exist"
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
                message: "Notification Details Found Successfully!",
                data: data
            });
            return;

        }
    });
};



// update notification code by vineet shirdhonkar

exports.updateNotification = (req, res) => {
    const { staff_id, type, notification_id, user_id, role_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, patient_ids, notification_title, notification_date_time, description } = req.body;


    var valid = helperFunction.customValidater(req, { type, notification_id, user_id, role_id, notification_for, notification_sent_by, notification_title, notification_date_time, description });
    if (valid) {
        return res.status(500).json(valid);
    }


    if (req.body.notification_for !== "promo_code" && req.body.notification_for !== "doctor" && req.body.notification_for !== "general" && req.body.notification_for !== "test") {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Notification for should be valid"
        });
    }


    switch (req.body.notification_for) {
        case "promo_code":
            if (req.body.promo_code_id == "") {
                return res.status(400).json({
                    status_code: 400,
                    status: "error",
                    message: "Please select promo code"
                });
            }
            break;

        /* case 'doctor':
        if(req.body.doctor_id == ''){
          return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Please select doctor"
            });  
        }
        break; */

        case "test":
            if (req.body.test_id == "") {
                return res.status(400).json({
                    status_code: 400,
                    status: "error",
                    message: "Please select test"
                });
            }
            break;
    }

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
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
            var added_by = (staff_id) ? staff_id : null;
            var n_patient_ids = patient_ids;
            var notification_type = type;
            Notification.update({ added_by, notification_type, user_id, notification_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, n_patient_ids, notification_title, notification_date_time, description }, (err, data) => {


                if (err) {
                    if (err.kind === "failed") {
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
                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Notification Updated Successfully!",
                        data: data
                    });
                    return;
                }
            });
        }
    });

};
// delete Notification code by vineet shirdhonkar
exports.deleteNotification = (req, res) => {
    const { notification_id, staff_id } = req.body;

    var valid = helperFunction.customValidater(req, { notification_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Notification.findById(notification_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Notification does not exist"
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
            if (added_by) {
                Notification.deleteStaffNotification(notification_id, added_by, (err, data) => {
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
                            message: "Notification Deleted Successfully!",
                            data: data
                        });
                        return;
                    }
                });
            }
            else {
                Notification.delete(notification_id, (err, data) => {
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
                            message: "Notification Deleted Successfully!",
                            data: data
                        });
                        return;
                    }
                });
            }

        }
    });
};
exports.getAllSystemNotifications = (req, res) => {
    const { user_id, role_id, is_get_all } = req.body;

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
            Notification.findAllSystemNotifications(user_id, is_get_all, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Record Found",
                            data: [
                                {
                                    all_notifications: [],
                                    unread_notifications_count: 0
                                }
                            ]
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
                        message: "Notification data found Successfully!",
                        data: data
                    });
                    return;
                }
            });
        }

    });
};

// read all System Notification code by vineet shirdhonkar


exports.readAllSystemNotifications = (req, res) => {
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
                    status: "success",
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
            Notification.readAllSystemNotifications(user_id, (err, data) => {
                if (err) {
                    if (err.kind === "failed") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Failed! Please try again later",
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
                        message: "Notification read Successfully!",
                        data: data
                    });
                    return;
                }
            });
        }

    });
};

exports.sendScheduleNotification = async (req, res) => {

    var data = await Notification.getScheduledNotifications();

    var current_date_time = moment().format("YYYY-MM-DD") + "T" + moment().format("HH:mm:ss") + ".000Z";

    for (let [index, value] of data.entries()) {
        var notification_date_time = moment(value.notification_date_time).format("YYYY-MM-DD") + "T" + moment(value.notification_date_time).format("HH:mm:ss") + ".000Z";
        var n_patient_ids = value.patient_ids;
        var notification_for = value.notification_for;
        var promo_code_id = value.promo_code_id;
        var doctor_id = value.doctor_id;
        var test_id = value.test_id;
        var user_id = value.created_by_id;
        var notification_sent_by = value.notification_sent_by;
        var notification_title = value.notification_title;
        var description = value.description;
        var patient_pin_code = value.patient_pin_code;
        /*console.log("current_date_time",current_date_time)
        console.log("notification_date_time",0)
        console.log(value.id) */
        if (current_date_time == notification_date_time) {
            if (notification_sent_by == "patient") {
                var patient_ids = n_patient_ids.split(",");
                for (var i = 0; i < patient_ids.length; i++) {

                    var from_user_id = user_id;
                    if (notification_for == "test") {
                        const procon = await helperQuery.All(`SELECT * FROM lab_tests WHERE test_id = '${test_id}'`);
                        if (procon.length > 0) {
                            var test_name = procon[0].test_name;
                            var title = "Notification for test " + test_name;
                            var type = "Notification for test " + test_name;

                        }

                    }

                    if (notification_for == "general") {
                        var title = notification_title;
                        var type = "Notification for patient";
                    }


                    if (notification_for == "promo_code") {
                        const procon = await helperQuery.All(`SELECT * FROM promo_code WHERE id = '${promo_code_id}'`);
                        if (procon.length > 0) {
                            var promo_code = procon[0].promo_code;
                            var title = "Notification for promo code " + promo_code;
                            var type = "Notification for promo code " + promo_code;

                        }
                    }


                    if (notification_for == "doctor") {
                        const procon = await helperQuery.All(`SELECT * FROM users WHERE id = '${doctor_id}'`);
                        if (procon.length > 0) {
                            var doctor_name = procon[0].first_name;
                            var title = "Notification from doctor " + doctor_name;
                            var type = "Notification from doctor" + doctor_name;

                        }
                    }
                    var to_user_id = patient_ids[i];
                    var message = description;



                    var user_detail = await helperQuery.Get({ table: "users", where: " id=" + to_user_id });

                    if (user_detail) {
                        var payload = {
                            notification: {
                                title: title,
                                body: message
                            }
                        };
                        if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                            await helperFunction.pushNotification(user_detail[0].device_token, payload);
                        }
                    }

                    var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                    db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)",
                        [
                            from_user_id, to_user_id, title, type, message, created_at
                        ], (err, res) => {

                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }

                        });


                }
            }
            if (notification_sent_by == "pin_code") {
                db.query(`SELECT GROUP_CONCAT(id) AS patient_ids FROM users WHERE pin_code = '${patient_pin_code}' and role_id = 2`, [patient_pin_code], async (err, data) => {
                    if (err) {
                        cb(err, null);
                        return 0;
                    }

                    if (data) {
                        var patient_ids = data[0].patient_ids;
                        var patient_ids = patient_ids.split(",");

                        for (var i = 0; i < patient_ids.length; i++) {

                            var from_user_id = user_id;
                            if (notification_for == "test") {
                                const procon = await helperQuery.All(`SELECT * FROM lab_tests WHERE test_id = '${test_id}'`);
                                if (procon.length > 0) {
                                    var test_name = (procon[0]) ? procon[0].test_name : "";

                                    var title = "Notification for test " + test_name;
                                    var type = "Notification for test " + test_name;

                                }
                            }


                            if (notification_for == "general") {
                                var title = notification_title;
                                var type = "Notification for patient";
                            }


                            if (notification_for == "promo_code") {


                                const procon = await helperQuery.All(`SELECT * FROM promo_code WHERE id = '${promo_code_id}'`);
                                if (procon.length > 0) {
                                    var promo_code = (procon[0]) ? procon[0].promo_code : "";
                                    var title = "Notification for promo code " + promo_code;
                                    var type = "Notification for promo code " + promo_code;

                                }

                            }


                            if (notification_for == "doctor") {
                                const procon = await helperQuery.All(`SELECT * FROM users WHERE id = '${doctor_id}'`);
                                if (procon.length > 0) {
                                    var doctor_name = (procon[0]) ? procon[0].first_name : "";
                                    var title = "Notification from doctor " + doctor_name;
                                    var type = "Notification from doctor" + doctor_name;

                                }

                            }
                            var to_user_id = patient_ids[i];
                            var message = description;

                            var user_detail = await helperQuery.Get({ table: "users", where: " id=" + to_user_id });

                            if (user_detail) {
                                var payload = {
                                    notification: {
                                        title: title,
                                        body: message
                                    }
                                };
                                if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                                    await helperFunction.pushNotification(user_detail[0].device_token, payload);
                                }
                            }

                            var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                            db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)",
                                [
                                    from_user_id, to_user_id, title, type, message, created_at
                                ], (err, res) => {

                                    if (err) {
                                        logger.error(err.message);
                                        cb(err, null);
                                        return;
                                    }

                                });



                        }
                    }
                });

            }
        }
    }

};