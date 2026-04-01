const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const { response } = require("express");
const moment = require("moment");
class Notification {
    static getMenturationCycle() {
        return new Promise((resolve, reject) => {
            var query = "SELECT * FROM `menturation_cycle` INNER JOIN `users` ON `users`.`id` = `menturation_cycle`.`user_id`  ORDER BY `menturation_cycle`.`m_id` DESC";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getPregnantWomenNotification() {
        return new Promise((resolve, reject) => {
            var query = "SELECT `pregnant_women`.`date_of_pregnancy`,`users`.`device_token`,`users`.`device_type` FROM `pregnant_women` INNER JOIN `users` ON `users`.`id` = `pregnant_women`.`user_id` where `pregnant_women`.`date_of_pregnancy` >= CURDATE()";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getPreNotification() {
        return new Promise((resolve, reject) => {
            var query = "SELECT * FROM `pre_notification` ORDER BY `pre_notification`.`pre_id` DESC";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getPreMedicines() {
        return new Promise((resolve, reject) => {
            var query = "SELECT * FROM `notification_pre_medicine` ORDER BY `notification_pre_medicine`.`medicine_id` DESC";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static InsertReminder(from_user_id, to_user_id, title, notification_type, message, created_at) {
        return new Promise((resolve, reject) => {
            var query = "Insert into `system_notifications` set `from_user_id`= '" + from_user_id + "',`to_user_id`= '" + to_user_id + "',`title`= '" + title + "',`type`= '" + notification_type + "',`message`= " + db.escape(message) + ", `created_at`='" + created_at + "' ";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static notification_pre_medicine(user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth, cb) {
        db.query("INSERT INTO notification_pre_medicine(user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two,take_time_third,take_dose_third,take_time_fourth,take_dose_fourth, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())",
            [
                user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                // db.query
                db.query("SELECT first_name from users where role_id = ? AND id = ?", [2, member_id]
                    , (error, response) => {
                        if (response.length > 0) {
                            cb(null, {
                                medicine_id: res.insertId,
                                user_id: user_id,
                                member_id: member_id,
                                memberName: response[0].first_name,
                                medicine_name: medicine_name,
                                medicine_type: medicine_type,
                                quantity: quantity,
                                frequency: frequency,
                                take_time_one: take_time_one,
                                take_dose_one: take_dose_one,
                                take_time_two: take_time_two,
                                take_dose_two: take_dose_two,
                                take_time_third: take_time_third,
                                take_dose_third: take_dose_third,
                                take_time_fourth: take_time_fourth,
                                take_dose_fourth: take_dose_fourth
                            });
                        }
                    });
            });
    }
    static edit_notification_pre_medicine(user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth, medicine_id, cb) {
        db.query(`UPDATE notification_pre_medicine SET user_id=?, member_id=?, medicine_name=?, medicine_type=?, quantity=?, frequency=?, take_time_one=?, take_dose_one=?, take_time_two=?, take_dose_two=?,take_time_third=?,take_dose_third=?,take_time_fourth=?,take_dose_fourth=?, updated_at = NOW() WHERE medicine_id = '${medicine_id}'`,
            [
                user_id, member_id, medicine_name, medicine_type, quantity, frequency, take_time_one, take_dose_one, take_time_two, take_dose_two, take_time_third, take_dose_third, take_time_fourth, take_dose_fourth, medicine_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    medicine_id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    medicine_name: medicine_name,
                    medicine_type: medicine_type,
                    quantity: quantity,
                    frequency: frequency,
                    take_time_one: take_time_one,
                    take_dose_one: take_dose_one,
                    take_time_two: take_time_two,
                    take_dose_two: take_dose_two,
                    take_time_third: take_time_third,
                    take_dose_third: take_dose_third,
                    take_time_fourth: take_time_fourth,
                    take_dose_fourth: take_dose_fourth
                });
            });
    }
    static delete_notification_pre_medicine(medicine_id, user_id, member_id, cb) {
        db.query("DELETE FROM notification_pre_medicine WHERE medicine_id=? AND user_id = ? AND member_id = ?",
            [
                medicine_id, user_id, member_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }
    static deletePreNotification(pre_id, user_id, member_id) {
        return new Promise((resolve, reject) => {
            var query = `DELETE FROM pre_notification WHERE pre_id=${pre_id} AND user_id = ${user_id} AND member_id = ${member_id}`;
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static list_notification_pre_medicine(user_id, member_id, cb) {
        db.query("SELECT * FROM notification_pre_medicine WHERE user_id = ? AND member_id = ?  ORDER BY medicine_id DESC ",
            [
                user_id, member_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }

    static pre_notification(user_id, member_id, name, date_time, type, time, cb) {
        db.query("INSERT INTO pre_notification(user_id, member_id, name, date_time,type, time, created_at) VALUES(?,?,?,?,?,?,NOW())",
            [
                user_id, member_id, name, date_time, type, time
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                db.query("SELECT first_name from users where role_id = ? AND id = ?", [2, member_id]
                    , (error, response) => {
                        if (response.length > 0) {
                            cb(null, {
                                pre_id: res.insertId,
                                user_id: user_id,
                                member_id: member_id,
                                memberName: response[0].first_name,
                                name: name,
                                date_time: date_time,
                                type: type
                            });
                        }
                    });

            });
    }
    static list_pre_notification(user_id, member_id, type, cb) {
        db.query("SELECT * FROM pre_notification WHERE user_id = ? AND member_id = ? AND type = ?  ORDER BY pre_id DESC ",
            [
                user_id, member_id, type
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }
    
    static add(added_by, notification_type, user_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, n_patient_ids, notification_title, notification_date_time, description, cb) {
        db.query("INSERT INTO notifications(added_by,type,created_by_id,notification_for,promo_code_id,doctor_id,test_id,notification_sent_by,patient_pin_code,patient_ids,notification_title,notification_date_time,description, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())",
            [
                added_by, notification_type, user_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, n_patient_ids, notification_title, notification_date_time, description
            ], async (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (notification_type == 1) {
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
                            if (user_detail.length > 0) {
                                var payload = {
                                    notification: {
                                        title: title,
                                        body: message
                                    }
                                };
                                if (user_detail[0].device_type != undefined) {
                                    if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                                        await helperFunction.pushNotification(user_detail[0].device_token, payload);
                                    }
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
                        console.log(`SELECT GROUP_CONCAT(id) AS patient_ids FROM users WHERE pin_code = '${patient_pin_code}' and role_id = 2`);
                        db.query(`SELECT GROUP_CONCAT(id) AS patient_ids FROM users WHERE pin_code = '${patient_pin_code}' and role_id = 2`, [patient_pin_code], async (err, data) => {
                            if (err) {
                                cb(err, null);
                                return 0;
                            }

                            console.log(data, "------------------------");

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

                                    if (user_detail.length > 0) {
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
                cb(null, {
                    notification_id: res.insertId,
                    user_id: user_id,
                    notification_for: notification_for,
                    doctor_id: doctor_id,
                    test_id: test_id,
                    description: description
                });
            });
    }

    static findStaffAll(user_id, added_by, cb) {
        var deleted_at = "IS NULL";
        var test_name = "";
        var promo_code = "";
        var patient_name = "";
        var doctor_name = "";
        var staff_name = "";

        db.query(`SELECT * FROM notifications WHERE created_by_id = '${user_id}' and added_by = '${added_by}' and deleted_at ${deleted_at} order by id desc`, [user_id, deleted_at], async (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const allData = [];
            if (res.length > 0) {
                for (const [key, item] of Object.entries(res)) {
                    const id = item.id;
                    const pin_code = item.patient_pin_code;
                    const type = item.type;
                    var notification_for = item.notification_for;
                    var test_id = item.test_id;
                    var promo_code_id = item.promo_code_id;
                    var notification_sent_by = item.notification_sent_by;
                    var patient_ids = item.patient_ids;
                    var doctor_id = item.doctor_id;
                    var added_by = item.added_by;

                    if (added_by) {
                        db.query(`SELECT * FROM users WHERE id = '${added_by}'`, [added_by], (err, data) => {
                            if (err) {
                                cb(err, null);
                                return 0;
                            }
                            if (data) {
                                staff_name = data[0].first_name;
                            }
                        });
                    }


                    if (notification_for == "test") {
                        const labtestData = await helperQuery.All(`SELECT * FROM lab_tests WHERE test_id = '${test_id}'`);
                        if (labtestData.length > 0) {
                            var test_name = (labtestData[0]) ? labtestData[0].test_name : "";

                        } else {
                            var test_name = "";
                        }

                    }


                    if (notification_for == "promo_code") {

                        const promoCodeData = await helperQuery.All(`SELECT * FROM promo_code WHERE id = '${promo_code_id}'`);
                        if (promoCodeData.length > 0) {
                            var promo_code = (promoCodeData[0]) ? promoCodeData[0].promo_code : "";
                        } else {
                            var promo_code = "";
                        }
                    }


                    if (notification_for == "doctor") {
                        const doctorData = await helperQuery.All(`SELECT * FROM users WHERE id = '${doctor_id}'`);
                        if (doctorData.length > 0) {
                            var doctor_name = (doctorData[0] && doctorData[0].first_name != undefined) ? doctorData[0].first_name : "";

                        } else {
                            var doctor_name = "";
                        }
                    }

                    if (patient_ids != null && patient_ids != "") {
                        const patientData = await helperQuery.All(`SELECT GROUP_CONCAT(first_name) AS first_name FROM users WHERE id IN (${patient_ids})`);
                        if (patientData) {
                            var patient_name = (patientData[0]) ? patientData[0].first_name : "";

                        } else {
                            var patient_name = "";
                        }
                    }

                    const notification_title = item.notification_title;
                    const notification_date_time = item.notification_date_time;
                    const description = item.description;

                    allData.push({ id, type, doctor_id, doctor_name, notification_sent_by, promo_code_id, test_id, patient_ids, pin_code, test_name, staff_name, promo_code, patient_name, notification_for, notification_title, notification_date_time, description });
                }

                cb(null, allData);
            }
            else {
                cb({ kind: "not_found" }, null);
            }
        });
    }

    static findAll(user_id, cb) {
        var deleted_at = "IS NULL";
        var test_name = "";
        var promo_code = "";
        var patient_name = "";
        var doctor_name = "";
        var staff_name = "";


        db.query(`SELECT * FROM notifications WHERE created_by_id = '${user_id}' and deleted_at ${deleted_at} order by id desc`, [user_id, deleted_at], async (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const allData = [];
            if (res.length > 0) {
                for (const [key, item] of Object.entries(res)) {
                    const id = item.id;
                    const pin_code = item.patient_pin_code;
                    const type = item.type;
                    var notification_for = item.notification_for;
                    var test_id = item.test_id;
                    var promo_code_id = item.promo_code_id;
                    var notification_sent_by = item.notification_sent_by;
                    var patient_ids = item.patient_ids;
                    var doctor_id = item.doctor_id;

                    var added_by = item.added_by;

                    if (added_by) {
                        db.query(`SELECT * FROM users WHERE id = '${added_by}'`, [added_by], (err, data) => {
                            if (err) {
                                cb(err, null);
                                return 0;
                            }
                            if (data) {
                                staff_name = data[0].first_name;
                            }
                        });
                    }


                    if (notification_for == "test") {
                        const labtestData = await helperQuery.All(`SELECT * FROM lab_tests WHERE test_id = '${test_id}'`);
                        if (labtestData.length > 0) {
                            var test_name = (labtestData[0]) ? labtestData[0].test_name : "";

                        } else {
                            var test_name = "";
                        }

                    }


                    if (notification_for == "promo_code") {

                        const promoCodeData = await helperQuery.All(`SELECT * FROM promo_code WHERE id = '${promo_code_id}'`);
                        if (promoCodeData.length > 0) {
                            var promo_code = (promoCodeData[0]) ? promoCodeData[0].promo_code : "";
                        } else {
                            var promo_code = "";
                        }
                    }


                    if (notification_for == "doctor") {
                        const doctorData = await helperQuery.All(`SELECT * FROM users WHERE id = '${doctor_id}'`);
                        if (doctorData.length > 0) {
                            var doctor_name = (doctorData[0] && doctorData[0].first_name != undefined) ? doctorData[0].first_name : "";

                        } else {
                            var doctor_name = "";
                        }
                    }

                    if (patient_ids != null && patient_ids != "") {
                        const patientData = await helperQuery.All(`SELECT GROUP_CONCAT(first_name) AS first_name FROM users WHERE id IN (${patient_ids})`);
                        if (patientData) {
                            var patient_name = (patientData[0]) ? patientData[0].first_name : "";

                        } else {
                            var patient_name = "";
                        }
                    }

                    const notification_title = item.notification_title;
                    const notification_date_time = item.notification_date_time;
                    const description = item.description;

                    allData.push({ id, type, doctor_id, doctor_name, notification_sent_by, promo_code_id, test_id, patient_ids, pin_code, staff_name, test_name, promo_code, patient_name, notification_for, notification_title, notification_date_time, description });
                }

                cb(null, allData);
            }
            else {
                cb({ kind: "not_found" }, null);
            }
        });
    }


    static findById(id, cb) {
        var deleted_at = "IS NULL";
        var test_name = "";
        var promo_code = "";
        var patient_name = "";
        var doctor_name = "";

        db.query(`SELECT * FROM notifications WHERE id = '${id}' and deleted_at ${deleted_at} order by id desc`, [id, deleted_at], async (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            const allData = [];
            if (res.length > 0) {
                for (const [key, item] of Object.entries(res)) {

                    const id = item.id;
                    const pin_code = item.patient_pin_code;
                    const type = item.type;
                    var notification_for = item.notification_for;
                    var test_id = item.test_id;
                    var promo_code_id = item.promo_code_id;
                    var notification_sent_by = item.notification_sent_by;
                    var patient_ids = item.patient_ids;
                    var doctor_id = item.doctor_id;
                    if (notification_for == "test") {
                        const labtestData = await helperQuery.All(`SELECT * FROM lab_tests WHERE test_id = '${test_id}'`);
                        if (labtestData.length > 0) {
                            var test_name = (labtestData[0]) ? labtestData[0].test_name : "";

                        } else {
                            var test_name = "";
                        }

                    }


                    if (notification_for == "promo_code") {

                        const promoCodeData = await helperQuery.All(`SELECT * FROM promo_code WHERE id = '${promo_code_id}'`);
                        if (promoCodeData.length > 0) {
                            var promo_code = (promoCodeData[0]) ? promoCodeData[0].promo_code : "";
                        } else {
                            var promo_code = "";
                        }
                    }


                    if (notification_for == "doctor") {
                        const doctorData = await helperQuery.All(`SELECT * FROM users WHERE id = '${doctor_id}'`);
                        if (doctorData.length > 0) {
                            var doctor_name = (doctorData[0] && doctorData[0].first_name != undefined) ? doctorData[0].first_name : "";

                        } else {
                            var doctor_name = "";
                        }
                    }

                    if (patient_ids != null && patient_ids != "") {
                        const patientData = await helperQuery.All(`SELECT GROUP_CONCAT(first_name) AS first_name FROM users WHERE id IN (${patient_ids})`);
                        if (patientData) {
                            var patient_name = (patientData[0]) ? patientData[0].first_name : "";

                        } else {
                            var patient_name = "";
                        }
                    }

                    const notification_title = item.notification_title;
                    const notification_date_time = item.notification_date_time;
                    const description = item.description;

                    allData.push({ id, type, doctor_id, doctor_name, notification_sent_by, promo_code_id, test_id, patient_ids, pin_code, test_name, promo_code, patient_name, notification_for, notification_title, notification_date_time, description });
                }

                cb(null, allData);
            } else {
                cb({ kind: "not_found" }, null);
            }
        });

    }
    static update({ added_by, notification_type, user_id, notification_id, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, n_patient_ids, notification_title, notification_date_time, description }, cb) {
        var updated_at = helperFunction.getCurrentDateTime();

        db.query("UPDATE notifications set added_by = ? ,type = ? ,notification_for = ? , promo_code_id = ? , doctor_id = ? , test_id = ? , notification_sent_by = ? , patient_pin_code = ? , patient_ids = ? , notification_title = ? , notification_date_time = ? , description = ? , updated_at = ? where id = ? ",
            [added_by, notification_type, notification_for, promo_code_id, doctor_id, test_id, notification_sent_by, patient_pin_code, n_patient_ids, notification_title, notification_date_time, description, updated_at, notification_id],



            async (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }

                if (res.affectedRows > 0) {
                    if (notification_type == 1) {
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
                                                var test_name = data[0].test_name;
                                                var title = "Notification for test " + test_name;
                                                var type = "Notification for test " + test_name;

                                            }


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
                                                var doctor_name = data[0].first_name;
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
                    cb(null, {
                        type: notification_type,
                        notification_for: notification_for,
                        promo_code_id: promo_code_id,
                        doctor_id: doctor_id,
                        test_id: test_id,
                        notification_sent_by: notification_sent_by,
                        patient_pin_code: patient_pin_code,
                        patient_ids: patient_ids,
                        notification_title: notification_title,
                        notification_date_time: notification_date_time,
                        description: description,
                    });
                } else {

                    cb({ kind: "failed" }, null);
                }
            });
    }



    static deleteStaffNotification(id, added_by, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();
        db.query("update notifications set deleted_at = ?, added_by = ?  WHERE id= ?", [deleted_at, added_by, id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, { id: id });
        });
    }

    static delete(id, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();

        db.query("update notifications set deleted_at = ? WHERE id= ?", [deleted_at, id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, { id: id });
        });
    }

    static findAllSystemNotifications(user_id, is_get_all, cb) {
        if (is_get_all == 1) {
            var query = `SELECT * FROM system_notifications WHERE to_user_id = '${user_id}' order by id desc`;
        } else {
            var query = `SELECT title,type,id,message,created_at,(SELECT count(*) FROM system_notifications WHERE to_user_id = '${user_id}' and is_read = '0') as unread_notifications FROM system_notifications WHERE to_user_id = '${user_id}' order by id desc limit 10`;
        }
        db.query(query, [user_id], (err, all_notifications) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            var response = [];

            if (all_notifications.length > 0) {
                for (let [index, value] of all_notifications.entries()) {
                    var HH = moment(value.created_at).format("HH");
                    let time_period = "";
                    if (HH >= 12) {
                        time_period = "PM";
                    }
                    else {
                        time_period = "AM";
                    }
                    all_notifications[index].created_at = moment(value.created_at).format("MM/DD/YYYY hh:mm") + " " + time_period;
                }

                var unread_notifications_count = all_notifications[0].unread_notifications;
                response.push({ all_notifications, unread_notifications_count });
                cb(null, response);
                return;
            }
            else {
                cb({ kind: "not_found" }, null);
            }
        });
    }
    static readAllSystemNotifications(user_id, cb) {
        db.query(`update system_notifications set is_read = '1' WHERE to_user_id = '${user_id}'`, [user_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.affectedRows > 0) {
                cb(null, res);
                return;
            }
            else {
                cb({ kind: "failed" }, null);
            }
        });
    }

    static getScheduledNotifications() {
        return new Promise((resolve, reject) => {
            var query = "SELECT * from notifications where type = '2' and deleted_at IS NULL";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
}
module.exports = Notification;