const moment = require("moment");
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const { transporter } = require("../helper/helper");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");

const { createNewUser: createNewUserQuery, createNewradioUserQuery: createNewradioUserQuery, findUserByIdQuery: findUserByIdQuery, verifyOtp: verifyOtp, findMemberByIdQuery: findMemberByIdQuery, resetPassword: resetPassword, updateUser: updateUser, updatePassword: updatePassword, oldPassword: oldPassword, updateMember: updateMember, createDoctor: createDoctor, addDoctorSpeciality: addDoctorSpeciality, addDoctorDegree: addDoctorDegree, addDoctorSchedule: addDoctorSchedule, updateDoctorSchedule: updateDoctorSchedule, addDoctorAvailability: addDoctorAvailability, updateDoctorAvailability: updateDoctorAvailability } = require("../database/queries");


class User {
    constructor(username, email, mobile, password, user_type, role_id) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.mobile = mobile;
        this.user_type = user_type;
        this.role_id = role_id;
    }

    // TODO::RK
    static findAllInsightAppointmentsOld(from_date, to_date, user_id, role_id, age_group, gender, pin_code, filter_by, appointment_date, month, year, cb) {
        var filter_condition = "";
        if (filter_by == "day") {
            if (appointment_date != "") {
                filter_condition = " where ap.appointment_date =" + "'" + appointment_date + "'";
            }
        }
        if (filter_by == "month") {
            if (month != "") {
                filter_condition = " where MONTH(ap.appointment_date) =" + "'" + month + "'";
            }
        }
        if (filter_by == "year") {
            if (year != "") {
                filter_condition = " where YEAR(ap.appointment_date) =" + "'" + year + "'";
            }
        }
        if (from_date != "" && from_date != undefined && to_date != "" && to_date != undefined) {
            filter_condition = " where ap.appointment_date BETWEEN " + "'" + from_date + "' AND " + "'" + to_date + "'";
        }
        if (gender != "" && gender != undefined) {
            filter_condition += "and u.gender=" + "'" + gender + "'";
        }
        if (user_id != "" && user_id != undefined) {
            filter_condition += "and ap.user_id=" + "'" + user_id + "'";
        }
        if (pin_code != "" && pin_code != undefined) {
            filter_condition += "and u2.pin_code=" + "'" + pin_code + "'";
        }
        if (age_group != "" && age_group != undefined) {
            if (age_group == "below_5") {
                filter_condition += "and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) < 5";
            }
            if (age_group == "between_5_and_18") {
                filter_condition += "and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) BETWEEN 5 AND 18";
            }
            if (age_group == "above_18") {
                filter_condition += "and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) > 18";
            }
        }

        let query;
        if (role_id == 3) {
            query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males,COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females,COUNT(ap.id) as total_booking ,u2.id as lab_id,u2.first_name as lab_name,u2.pin_code as pin_code FROM appointments as ap inner join users as u on ap.created_by_id = u.id  inner join users u2 on ap.user_id = u2.id " + filter_condition + " and u2.role_id = 3 and ap.payment_status = 'Success' GROUP BY ap.user_id ORDER BY ap.id DESC";
        }
        if (role_id == 4) {
            query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males,COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females,COUNT(ap.id) as total_booking ,COUNT(u.id) as total_patients,u2.id as radiology_id,u2.first_name as radiology_name,u2.pin_code as pin_code FROM appointments as ap inner join users as u on ap.created_by_id = u.id inner join users u2 on ap.user_id = u2.id " + filter_condition + " and u2.role_id = 4 and ap.payment_status = 'Success' GROUP BY ap.user_id ORDER BY ap.id DESC";
        }
        if (role_id == 8) {
            query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males,COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females,COUNT(ap.id) as total_booking ,COUNT(u.id) as total_patients,u2.id as clinic_id,u2.first_name as clinic_name,u2.pin_code as pin_code FROM appointments as ap inner join users as u on ap.created_by_id = u.id inner join users u2 on ap.clinic_id = u2.id " + filter_condition + " and u2.role_id = 8 and ap.payment_status = 'Success' GROUP BY ap.user_id ORDER BY ap.id DESC";
        }

        console.log(query);

        db.query(query, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res) {
                cb(null, res);
            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }
    static findAllInsightAppointments(from_date, to_date, user_id, role_id, age_group, gender, pin_code, filter_by, appointment_date, month, year, cb) {
        var filter_condition = "";
        if (filter_by == "day") {
            if (appointment_date != "") {
                filter_condition = " where ap.appointment_date =" + "'" + appointment_date + "'";
            }
        }
        if (filter_by == "month") {
            if (month != "") {
                filter_condition = " where MONTH(ap.appointment_date) =" + "'" + month + "'";
            }
        }
        if (filter_by == "year") {
            if (year != "") {
                filter_condition = " where YEAR(ap.appointment_date) =" + "'" + year + "'";
            }
        }
        if (from_date != "" && from_date != undefined && to_date != "" && to_date != undefined) {
            filter_condition = " where ap.appointment_date BETWEEN " + "'" + from_date + "' AND " + "'" + to_date + "'";
        }
        if (gender != "" && gender != undefined) {
            filter_condition += " and u.gender=" + "'" + gender + "'";
        }
        if (user_id != "" && user_id != undefined) {
            filter_condition += " and ap.user_id=" + "'" + user_id + "'";
        }
        if (pin_code != "" && pin_code != undefined) {
            filter_condition += " and u2.pin_code=" + "'" + pin_code + "'";
        }
        if (age_group != "" && age_group != undefined) {
            if (age_group == "below_5") {
                filter_condition += " and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) < 5";
            }
            if (age_group == "between_5_and_18") {
                filter_condition += " and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) BETWEEN 5 AND 18";
            }
            if (age_group == "above_18") {
                filter_condition += " and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) > 18";
            }
        }

        // ✅ Fix: ORDER BY MAX(ap.id) instead of ap.id (to avoid ONLY_FULL_GROUP_BY error)
        let query;
        if (role_id == 3) {
            query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males, " +
                "COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females, " +
                "COUNT(ap.id) as total_booking, u2.id as lab_id, u2.first_name as lab_name, u2.pin_code as pin_code " +
                "FROM appointments as ap inner join users as u on ap.created_by_id = u.id " +
                "inner join users u2 on ap.user_id = u2.id " +
                filter_condition +
                " and u2.role_id = 3 and ap.payment_status = 'Success' GROUP BY ap.user_id ORDER BY MAX(ap.id) DESC";
        }
        if (role_id == 4) {
            query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males, " +
                "COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females, " +
                "COUNT(ap.id) as total_booking, COUNT(u.id) as total_patients, u2.id as radiology_id, u2.first_name as radiology_name, u2.pin_code as pin_code " +
                "FROM appointments as ap inner join users as u on ap.created_by_id = u.id " +
                "inner join users u2 on ap.user_id = u2.id " +
                filter_condition +
                " and u2.role_id = 4 and ap.payment_status = 'Success' GROUP BY ap.user_id ORDER BY MAX(ap.id) DESC";
        }
        if (role_id == 8) {
            query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males, " +
                "COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females, " +
                "COUNT(ap.id) as total_booking, COUNT(u.id) as total_patients, u2.id as clinic_id, u2.first_name as clinic_name, u2.pin_code as pin_code " +
                "FROM appointments as ap inner join users as u on ap.created_by_id = u.id " +
                "inner join users u2 on ap.clinic_id = u2.id " +
                filter_condition +
                " and u2.role_id = 8 and ap.payment_status = 'Success' GROUP BY ap.user_id ORDER BY MAX(ap.id) DESC";
        }

        console.log(query);

        db.query(query, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res) {
                cb(null, res);
            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }


    static radiocreate(username, email, mobile, password, user_type, role_id, adhar_card, approve_document, forgot_otp, cb) {
        db.query(createNewradioUserQuery,
            [
                username, email, mobile, password, user_type, role_id, adhar_card, approve_document, forgot_otp
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.insertId) {
                    if (role_id == "2") {
                        var permanent_id = "MW" + mobile + "/" + "01";
                        db.query("UPDATE users set permanent_id = ? where id = ? ", [permanent_id, res.insertId], (err) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                        });
                    }
                    cb(null, {
                        id: res.insertId,
                        full_name: username,
                        mobile: mobile,
                        email: email,
                        password: password,
                        user_type: user_type,
                        role_id: role_id
                    });

                }

            });
    }
    static checkAppointmentMeeting(appointment_id, from_time, appointment_date, patient_id, user_id) {
        return new Promise((resolve, reject) => {
            var query = "select * from `appointment_meetings` WHERE `appointment_id`= '" + appointment_id + "' AND `from_time`= '" + from_time + "' AND `appointment_date`= '" + appointment_date + "' AND  `patient_id`= '" + patient_id + "' AND `user_id`= '" + user_id + "' ";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static checkOnlineAppointmentMeeting(user_id, role_id) {
        return new Promise((resolve, reject) => {
            if (role_id == 5) {
                var query = "select * from `appointments` WHERE `type` ='online' AND `payment_status` = 'Success' AND `str_to_date`(`appointment_date`,'%Y-%m-%d') =  curdate() AND `doctor_id`='" + user_id + "' ";
            }
            console.log("checkOnlineAppointmentMeeting() : ", query);
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static patientOnlineAppointmentMeeting(patient_id) {
        return new Promise((resolve, reject) => {
            var query = "select `meeting_detail`,`join_url`,`password`,`from_time` from `appointment_meetings` WHERE  `str_to_date`(`appointment_date`,'%Y-%m-%d') =  curdate() AND `patient_id`='" + patient_id + "' ";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static createAppointmentMeetingOld(appointment_id, from_time, appointment_date, patient_id, user_id, host_email, join_url, password, meeting_detail) {
        return new Promise((resolve, reject) => {
            var query = "Insert into `appointment_meetings` set `appointment_id`= '" + appointment_id + "',`from_time`= '" + from_time + "',`appointment_date`= '" + appointment_date + "',`patient_id`= '" + patient_id + "',`user_id`= '" + user_id + "',`host_email`= '" + host_email + "',`join_url`= '" + join_url + "',`password`= '" + password + "',`meeting_detail`= '" + meeting_detail + "' ";

            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static createAppointmentMeeting(
        appointment_id, from_time, appointment_date,
        patient_id, user_id, host_email, join_url,
        password, meeting_detail
    ) {
        return new Promise((resolve, reject) => {

            const query = `
                            INSERT INTO appointment_meetings 
                            (
                                appointment_id, from_time, appointment_date, patient_id,
                                user_id, host_email, join_url, password, meeting_detail
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                        `;

            const values = [
                appointment_id, from_time, appointment_date,
                patient_id, user_id, host_email, join_url,
                password, meeting_detail
            ];

            db.query(query, values, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }
    static create(username, email, mobile, alternate_mobile, password, user_type, forgot_otp, role_id, cb) {
        db.query(createNewUserQuery,
            [username, email, mobile, alternate_mobile, password, user_type, forgot_otp, role_id],
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.insertId) {
                    if (role_id == "2") {
                        var permanent_id = "MW" + mobile + "/" + "01";
                        db.query("UPDATE users set permanent_id = ? where id = ? ", [permanent_id, res.insertId], (err) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                        });
                    }
                    cb(null, {
                        id: res.insertId,
                        full_name: username,
                        mobile: mobile,
                        email: email,
                        password: password,
                        user_type: user_type,
                        role_id: role_id
                    });
                }
            });
    }
    static findByEmail(email, cb) {
        db.query(`SELECT * FROM users WHERE email = '${email}' OR mobile = '${email}'`, [email], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }
    static findByEmailForMObile(email, cb) {
        db.query(`SELECT * FROM users WHERE (email = '${email}' OR mobile = '${email}') AND role_id=2`, [email], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }
    static findByEmailAndRole(email, role_id, cb) {
        db.query(`SELECT * FROM users WHERE (email = '${email}' OR mobile = '${email}') And role_id='${role_id}' and deleted_at IS NULL`, [email, role_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                var role_id = res[0].role_id;
                cb(null, res[0]);
                return;

            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }
    static findByEmailAndMobile(email, mobile, cb) {
        db.query(`SELECT * FROM users WHERE email = '${email}' OR mobile = '${mobile}'`, [email, mobile], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }
    static findById(id, cb) {
        db.query(findUserByIdQuery, id, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const role_id = item.role_id;
                const experience_in_year = item.experience_in_year;
                const email = item.email;
                const mobile = item.mobile;
                const pin_code = item.pin_code;
                const address = item.address;
                const alternate_mobile = item.alternate_mobile;
                const imgName = item.profile_image;

                const userType = item.created_by_id != "0" && item.created_by_id != null ? "" : "self";

                if (item.profile_image == null || item.profile_image == "") {
                    var img = process.env.CLOUDINARY_BASE_URL + "member/demouser.png";
                }
                else {
                    var img = process.env.CLOUDINARY_BASE_URL + "member/" + item.profile_image;
                    // var img = item.profile_image;
                }
                const first_name = item.first_name;
                const adhar_card = item.adhar_card;
                const date_of_birth = item.date_of_birth;
                const age = helperFunction.getFullAge(item.date_of_birth ?? "00/00/0000");
                const gender = item.gender;
                const approve_document = item.approve_document;
                var doc_name = (item.approve_document == null) ? "" : item.approve_document;
                var doc_link_path = process.env.CLOUDINARY_BASE_URL + "member/" + doc_name;
                const password = item.password;
                const blood_group = item.blood_group ?? null;
                const online_offline_status = item.online_offline_status ?? null;
                const opening_time = item.opening_time != undefined ? item.opening_time : null;
                const closing_time = item.closing_time != undefined ? item.closing_time : null;
                const permanent_id = item.permanent_id !== undefined ? item.permanent_id : "";
                const latitude = item.latitude ?? null;
                const longitude = item.longitude ?? null;
                response.push({ id, role_id, first_name, email, mobile, experience_in_year, adhar_card, pin_code, address, alternate_mobile, date_of_birth, age, gender, img, imgName, approve_document, doc_link_path, password, opening_time, closing_time, online_offline_status, permanent_id, blood_group, latitude, longitude, userType });
            }
            cb(null, response);
        });
    }
    static memberfindById(id, cb) {
        var created_by_id = id;
        db.query(findMemberByIdQuery, [id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const imgName = item.profile_image;
                if ((item.profile_image == null) || (item.profile_image == "")) {
                    var img = process.env.CLOUDINARY_BASE_URL + "member/demouser.png";
                }
                else {
                    var img = process.env.CLOUDINARY_BASE_URL + "member/" + imgName;
                }
                const first_name = item.first_name;
                const last_name = item.last_name;
                const mobile = item.mobile;
                const adhar_card = item.adhar_card;
                const date_of_birth = item.date_of_birth;
                const gender = item.gender;
                const blood_group = item.blood_group ?? null;
                const permanent_id = item.permanent_id !== undefined ? item.permanent_id : "";
                const address = item.address ?? null;
                const pin_code = item.pin_code ?? null;
                const latitude = item.latitude ?? null;
                const longitude = item.longitude ?? null;

                const userType = item.created_by_id != "0" && item.created_by_id != null ? "" : "self";
                const age = helperFunction.getFullAge(item.date_of_birth ?? "00/00/0000");
                response.push({ id, age, first_name, last_name, mobile, adhar_card, date_of_birth, gender, img, imgName, blood_group, permanent_id, address, pin_code, latitude, longitude, userType });

            }
            cb(null, response);
        });
    }
    static otpVerify(email, forgot_otp, role_id, cb) {
        const userData = { email: email, forgot_otp: forgot_otp, role_id: role_id };
        db.query(verifyOtp, [forgot_otp, email, email, role_id
        ], (err) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, userData);
        });
    }
    static resetPassword(email, forgot_otp, password, cb) {
        db.query(resetPassword, [password, forgot_otp, email
        ], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                const message = "Otp Not Matched";
                cb(message, null);
                return;
            }
            cb(null, email);
        });
    }
    static addMembers(first_name, date_of_birth, user_type, role_id, gender, profile_image, blood_group, created_by_id, cb) {
        db.query(`SELECT * FROM users WHERE id='${created_by_id}'`, [created_by_id], async (err, userres) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (userres) {
                const memberData = await helperQuery.First({ table: "users", where: "created_by_id=" + userres[0].id + " ORDER BY id DESC" });

                const mobile_number = userres[0].mobile;

                const memberCount = memberData != undefined && memberData.permanent_id != null ? memberData.permanent_id.substr(memberData.permanent_id.length - 2) : 1;

                let totalMember = parseInt(memberCount) + 1;

                if (parseInt(totalMember).length < 1) {
                    totalMember = "/" + totalMember;
                } else {
                    totalMember = "/0" + totalMember;
                }
                var permanent_id = "MW" + mobile_number + "" + totalMember;
                db.query(`INSERT INTO users(first_name,date_of_birth,user_type,role_id,gender,profile_image,blood_group,created_by_id,permanent_id,created_at) 
                VALUES(?,?,?,?,?,?,?,?,?,NOW())
                `,
                    [first_name, date_of_birth, user_type, role_id, gender, profile_image, blood_group, created_by_id, permanent_id], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        cb(null, {
                            id: res.insertId,
                            first_name: first_name,
                            date_of_birth: date_of_birth,
                            gender: gender,
                            profile_image: profile_image,
                            created_by_id: created_by_id
                        });
                    });
            }

        });
    }

    static updateMember(first_name, mobile, date_of_birth, gender, profile_image, blood_group, id, cb) {
        if (profile_image != "") {
            db.query("UPDATE users SET first_name = ?, date_of_birth = ?, gender = ?, profile_image = ?, blood_group = ? WHERE id = ?", [first_name, date_of_birth, gender, profile_image, blood_group, id], (err) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: id
                });
            });
        } else {
            db.query("UPDATE users SET first_name = ?, date_of_birth = ?, gender = ?, blood_group = ? WHERE id = ?", [first_name, date_of_birth, gender, blood_group, id], (err) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: id
                });
            });
        }
    }

    static deleteMember(id, created_by_id, cb) {
        console.log(id, created_by_id);
        db.query("DELETE FROM users WHERE id= ? AND created_by_id = ?", [id, created_by_id], (err) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });

    }
    static oldPasswordCheck(password, id, cb) {
        db.query(oldPassword, [password, id], (err) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });
    }
    static updatePassword(password, id, cb) {
        db.query(updatePassword, [password, id], (err) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });
    }

    // TODO::RK
    static updateUserOld(username, mobile, profile_image, gender, date_of_birth, first_name, last_name, address, pin_code, opening_time, closing_time, alternate_mobile, blood_group, latitude, longitude, id, cb) {
        if (profile_image != "") {
            db.query(`UPDATE users SET 
                first_name='${first_name}',
                last_name='${last_name}',
                username ='${username}',
                profile_image='${profile_image}',
                gender='${gender}',
                date_of_birth='${date_of_birth}',
                address='${address}',
                pin_code='${pin_code}',
                opening_time='${opening_time}',
                closing_time='${closing_time}',
                alternate_mobile='${alternate_mobile}',
                blood_group='${blood_group}',
                latitude='${latitude}',
                longitude='${longitude}' 
                WHERE id ='${id}'`,
                (err) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, {
                        id: id
                    });
                });
        } else {
            db.query(`UPDATE users SET  username ='${username}',gender='${gender}',date_of_birth='${date_of_birth}',
            first_name='${first_name}',last_name='${last_name}',address='${address}',pin_code='${pin_code}',
            opening_time='${opening_time}',closing_time='${closing_time}',alternate_mobile='${alternate_mobile}',
            blood_group='${blood_group}',latitude='${latitude}',longitude='${longitude}' WHERE id ='${id}'`,
                [username, gender, date_of_birth, first_name, last_name, address, pin_code, opening_time, closing_time, alternate_mobile, blood_group, id], (err) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, {
                        id: id
                    });
                });
        }
    }
    static updateUser(username, mobile, profile_image, gender, date_of_birth, first_name, last_name, address, pin_code, opening_time, closing_time, alternate_mobile, blood_group, latitude, longitude, id, cb) {
        let sql, params;

        if (profile_image && profile_image.trim() !== "") {
            sql = `UPDATE users SET 
            first_name = ?, 
            last_name = ?, 
            username = ?, 
            profile_image = ?, 
            gender = ?, 
            date_of_birth = ?, 
            address = ?, 
            pin_code = ?, 
            opening_time = ?, 
            closing_time = ?, 
            alternate_mobile = ?, 
            blood_group = ?, 
            latitude = ?, 
            longitude = ?
            WHERE id = ?`;

            params = [
                first_name,
                last_name,
                username,
                profile_image,
                gender,
                date_of_birth,
                address,
                pin_code,
                opening_time,
                closing_time,
                alternate_mobile,
                blood_group,
                latitude,
                longitude,
                id
            ];
        } else {
            sql = `UPDATE users SET 
            first_name = ?, 
            last_name = ?, 
            username = ?, 
            gender = ?, 
            date_of_birth = ?, 
            address = ?, 
            pin_code = ?, 
            opening_time = ?, 
            closing_time = ?, 
            alternate_mobile = ?, 
            blood_group = ?, 
            latitude = ?, 
            longitude = ?
            WHERE id = ?`;

            params = [
                first_name,
                last_name,
                username,
                gender,
                date_of_birth,
                address,
                pin_code,
                opening_time,
                closing_time,
                alternate_mobile,
                blood_group,
                latitude,
                longitude,
                id
            ];
        }

        db.query(sql, params, (err) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, { id });
        });
    }


    static dashboardChart(user_id, type, days, cb) {
        if (days == 7) {
            const todayDate = new Date();
            const pastdate = new Date();
            pastdate.setDate(pastdate.getDate() - 7);
            db.query("SELECT heart_rate,createdate FROM users_hwbmi_details WHERE heart_rate != '' AND user_id = ? AND createdate <= ? AND createdate >= ? ", [user_id, todayDate, pastdate], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
        }
        if (days == 30) {
            db.query("", [user_id, type, days], (err) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: id
                });
            });
        }
        if (days == 365) {
            db.query("", [user_id, type, days], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: id
                });
            });
        }
    }

    static checkOtpVerify(email, forgot_otp, cb) {
        const userData = { email, forgot_otp };
        db.query("SELECT first_name,email,mobile,gender,user_type FROM users WHERE email= ? AND forgot_otp=?",
            [
                email,
                forgot_otp
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }

    static addDoctorsold(clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, specialities, degress, role_id, profile_image, password, decrypted_password, cb) {
        // var user_type = 'doctor';
        // var specialities = specialities.split(",")
        // var degress = degress.split(",");


        db.query(`SELECT * FROM users WHERE (email = '${email_id}' OR mobile = '${mobile_number}') and created_by_id='${clinic_id}'`, [email_id, mobile_number, clinic_id], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length > 0) {
                var doctor_id = res[0].id;
                var user_role_id = res[0].role_id;
                db.query("select * from doctors_clinic where doctor_id = ? and clinic_id = ? ", [doctor_id, clinic_id], (err, res) => {

                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }

                    if (res.length) {
                        cb({ kind: "already_added" }, null);
                        return;
                    } else {

                        db.query("Insert into doctors_clinic(doctor_id,clinic_id) values(?,?)", [doctor_id, clinic_id], (err, res) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                            if (res) {
                                cb(null, res);
                                return;
                            }
                        });


                    }
                });
            } else {
                db.query(`SELECT * FROM users WHERE (email = '${email_id}' OR mobile = '${mobile_number}') `, [email_id, mobile_number], (err, res) => {
                    if (res.length > 0) {

                        transporter.sendMail({
                            from: process.env.MAIL_FROM_ADDRESS,
                            to: email_id,
                            subject: "This mail form MedWire for create account",
                            html: "<b>Clinic added you as doctor . Please login with your crendentials</b>",
                        }, function (error, info) {
                            if (error) {
                                return console.log(error);
                            }
                        });

                        var doctor_id = res[0].id;

                        db.query("update users set created_by_id = ? where id = ? ", [clinic_id, doctor_id], (err, res) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }

                        });

                        db.query("Insert into doctors_clinic(doctor_id,clinic_id) values(?,?)", [doctor_id, clinic_id], (err, res) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                            if (res) {
                                cb(null, res);
                                return;
                            }
                        });
                        // for (var i = 0; i < specialities.length; i++) {
                        //     db.query(addDoctorSpeciality, [doctor_id, specialities[i], clinic_id], (err, res) => {
                        //         if (err) {
                        //             logger.error(err.message);
                        //             cb(err, null);
                        //             return;
                        //         }
                        //     })
                        // }
                        // for (var j = 0; j < degress.length; j++) {
                        //     db.query(addDoctorDegree, [doctor_id, degress[j], clinic_id], (err, res) => {
                        //         if (err) {
                        //             logger.error(err.message);
                        //             cb(err, null);
                        //             return;
                        //         }
                        //     })
                        // }
                    } else {
                        db.query(createDoctor, [full_name, email_id, mobile_number, alternate_mobile_number, gender, experience_in_year, date_of_birth, user_type, role_id, clinic_id, password, profile_image], (err, res) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                            if (res) {
                                transporter.sendMail({
                                    from: process.env.MAIL_FROM_ADDRESS,
                                    to: email_id,
                                    subject: "This mail form Medwire for create account",
                                    html: "<b>Following are your login details :-<br/> Email: " + email_id + "<br/> Mobile Number : " + mobile_number + "<br/> Password =" + decrypted_password + "</b>",
                                }, function (error, info) {
                                    if (error) {
                                        return console.log(error);
                                    }
                                });
                                db.query("Insert into doctors_clinic(doctor_id,clinic_id) values(?,?)", [res.insertId, clinic_id], (err, res) => {
                                    if (err) {
                                        logger.error(err.message);
                                        cb(err, null);
                                        return;
                                    }
                                });
                                db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${clinic_id}' and status = 'active'`, [clinic_id], (err, pphres) => {
                                    if (err) {
                                        logger.error(err.message);
                                        cb(err, null);
                                        return;
                                    }
                                    if (pphres.length > 0) {
                                        var total_limit = pphres[0].total_limit;
                                        var new_total_limit = total_limit - 1;

                                        db.query("update plan_purchase_history set total_limit = ? where user_id = ? and status = 'active'", [new_total_limit, clinic_id], (err, res) => {
                                            if (err) {
                                                logger.error(err.message);
                                                cb(err, null);
                                                return;
                                            }
                                        });
                                    }
                                });
                                // for (var i = 0; i < specialities.length; i++) {
                                //     db.query(addDoctorSpeciality, [res.insertId, specialities[i], clinic_id], (err, res) => {
                                //         if (err) {
                                //             logger.error(err.message);
                                //             cb(err, null);
                                //             return;
                                //         }
                                //     })
                                // }

                                // for (var j = 0; j < degress.length; j++) {
                                //     db.query(addDoctorDegree, [res.insertId, degress[j], clinic_id], (err, res) => {
                                //         if (err) {
                                //             logger.error(err.message);
                                //             cb(err, null);
                                //             return;
                                //         }
                                //     })
                                // }
                                cb(null, {
                                    id: res.insertId,
                                    full_name: full_name,
                                    date_of_birth: date_of_birth,
                                    email: email_id,
                                    mobile: parseInt(mobile_number),
                                    gender: gender,
                                    profile_image: profile_image,
                                    experience_in_year: experience_in_year,
                                    specialities: specialities,
                                    degress: degress,
                                    created_by_id: parseInt(clinic_id),
                                    password: password
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    static addDoctors(staff_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, role_id, profile_image, decrypted_password, password) {
        return new Promise(async (resolve, reject) => {
            var user_type = "doctor";
            const clinicData = await helperQuery.All(`SELECT first_name FROM users WHERE id = '${clinic_id}'`);
            if (clinicData) {
                var created_by_name = clinicData[0].first_name;

            }
            var added_by = (staff_id) ? staff_id : null;

            const res = await helperQuery.All(`SELECT * FROM users WHERE (email= '${email_id}' or mobile='${mobile_number}')`);

            if ((res.length > 0) && (res[0].role_id == 5)) {
                var doctor_id = res[0].id;
                var doctor_password = res[0].password;
                db.query("SELECT * FROM doctors_clinic WHERE doctor_id = ?  and clinic_id = ? ", [doctor_id, clinic_id], (err, dcres) => {
                    if (dcres.length > 0) {
                        resolve({ kind: "already_added" });
                        return;
                    } else {
                        db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${clinic_id}' and status = 'active'`, [clinic_id], (err, pphres) => {
                            if (err) {
                                logger.error(err.message);
                                console.log("plan_purchase_history", err);
                            }
                            if (pphres.length > 0) {
                                var total_limit = pphres[0].total_limit;
                                var new_total_limit = total_limit - 1;

                                db.query("update plan_purchase_history set total_limit = ? where user_id = ? and status = 'active'", [new_total_limit, clinic_id], (err, res) => {


                                    if (err) {
                                        logger.error(err.message);
                                        console.log("plan_purchase_history update", err);
                                    }
                                });
                            }
                        });
                        var logo = process.env.APP_LOGO;
                        var app_name = process.env.APP_NAME;
                        var user_login_url = process.env.USER_LOGIN_URL;
                        helperFunction.template(transporter, true);
                        transporter.sendMail({
                            from: process.env.MAIL_FROM_ADDRESS,
                            to: email_id,
                            subject: "You have been Registered by  " + created_by_name + " on MedWire",
                            template: "invitation",
                            context: { full_name, email_id, logo, app_name, decrypted_password, user_login_url, created_by_name }
                        }, function (error, info) {
                            if (error) {
                                return console.log(error);
                            }
                        });

                        return resolve({
                            id: doctor_id,
                            full_name: full_name,
                            date_of_birth: date_of_birth,
                            email: email_id,
                            mobile: parseInt(mobile_number),
                            gender: gender,
                            profile_image: profile_image,
                            experience_in_year: experience_in_year,
                            created_by_id: parseInt(clinic_id),
                            password: password
                        });
                    }
                });

            } else {
                const insertQuery = `
                                        INSERT INTO users (
                                            added_by,
                                            first_name,
                                            email,
                                            mobile,
                                            alternate_mobile,
                                            gender,
                                            experience_in_year,
                                            date_of_birth,
                                            user_type,
                                            role_id,
                                            created_by_id,
                                            password,
                                            profile_image,
                                            created_at,
                                            account_verify
                                        )
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                                    `;

                const insertValues = [
                    added_by,
                    full_name,
                    email_id,
                    mobile_number,
                    alternate_mobile_number,
                    gender,
                    experience_in_year,
                    date_of_birth,
                    user_type,
                    5,
                    clinic_id,
                    password,
                    profile_image,
                    "1"
                ];
                db.query(insertQuery, insertValues, (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        console.log("plan_purchase_history update", err);
                        return reject(err);
                    }
                    if (res) {

                        var logo = process.env.APP_LOGO;
                        var app_name = process.env.APP_NAME;
                        var user_login_url = process.env.USER_LOGIN_URL;
                        helperFunction.template(transporter, true);

                        transporter.sendMail({
                            from: process.env.MAIL_FROM_ADDRESS,
                            to: email_id,
                            subject: "You have been Registered by  " + created_by_name + " on MedWire",
                            template: "new_invitation",
                            context: { full_name, email_id, logo, app_name, created_by_name, decrypted_password, user_login_url }
                        }, function (error, info) {
                            if (error) {
                                return console.log(error);
                            }
                        });

                        db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${clinic_id}' and status = 'active'`, [clinic_id], (err, pphres) => {
                            if (err) {
                                logger.error(err.message);
                                console.log("plan_purchase_history", err);
                            }
                            if (pphres.length > 0) {
                                var total_limit = pphres[0].total_limit;
                                var new_total_limit = total_limit - 1;
                                db.query("update plan_purchase_history set total_limit = ? where user_id = ? and status = 'active'", [new_total_limit, clinic_id], (err, res) => {
                                    if (err) {
                                        logger.error(err.message);
                                        console.log("plan_purchase_history update", err);
                                    }
                                });
                            }
                        });
                        return resolve({
                            id: res.insertId,
                            full_name: full_name,
                            date_of_birth: date_of_birth,
                            email: email_id,
                            mobile: parseInt(mobile_number),
                            gender: gender,
                            profile_image: profile_image,
                            experience_in_year: experience_in_year,
                            created_by_id: parseInt(clinic_id),
                            password: password
                        });
                    }
                });
            }
        });
    }

    static addClinicDoctorForAddDoctor(doctId, clinic_id) {
        return new Promise((resolve, reject) => {
            db.query("Insert into doctors_clinic(doctor_id,clinic_id) values(?,?)", [doctId, clinic_id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    console.log("doctors_clinic add", err);
                    return reject(err.message);
                }
                return resolve(res);
            });
        });
    }
    static findStaffDoctorByIdAndRole(id, staff_id, cb) {
        var query = `SELECT users.id,users.mobile,users.alternate_mobile,users.email,users.profile_image,users.first_name,users.last_name,users.date_of_birth,users.gender,users.experience_in_year,GROUP_CONCAT(DISTINCT doctor_degrees.id) as degrees_ids,doctor_degrees.degree_name,GROUP_CONCAT(DISTINCT doctor_specialities.id) as speciality_ids, GROUP_CONCAT(DISTINCT doctor_specialities.speciality_name) as specialities, GROUP_CONCAT(DISTINCT doctor_degrees.degree_name) as degrees 
        FROM users
        inner join doctor_specialities ON users.id = doctor_specialities.doctor_id 
        inner join doctor_degrees ON users.id = doctor_degrees.doctor_id 
        WHERE users.id = ${id}  and users.added_by = ${staff_id} 
        and users.role_id = 5 and users.deleted_at IS NULL`;
        db.query(query, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];

            for (const item of res) {
                const id = item.id;
                const email = item.email;
                const mobile_number = parseInt(item.mobile);
                const alternate_mobile_number = parseInt(item.alternate_mobile);
                const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                const full_name = item.first_name;
                const date_of_birth = item.date_of_birth;
                const gender = item.gender;
                var specialities = item.specialities;
                var degrees = item.degrees;
                const experience_in_year = item.experience_in_year;
                response.push({ id, full_name, gender, date_of_birth, email, mobile_number, alternate_mobile_number, date_of_birth, gender, profile_image_name, profile_image_path, specialities, degrees, experience_in_year });
            }
            setTimeout(function () {
                cb(null, response);
            }, 100);
        });
    }
    static findDoctorByIdAndRole(id, cb) {
        const oldQuery = `SELECT users.signature,users.id,users.mobile,users.alternate_mobile,users.email,
        users.profile_image,users.first_name,users.last_name,users.date_of_birth,users.gender,users.experience_in_year,GROUP_CONCAT(DISTINCT doctor_degrees.id) as degrees_ids,doctor_degrees.degree_name,GROUP_CONCAT(DISTINCT doctor_specialities.id) as speciality_ids, GROUP_CONCAT(DISTINCT doctor_specialities.speciality_name) as specialities, GROUP_CONCAT(DISTINCT doctor_degrees.degree_name) as degrees 
        FROM users inner join doctor_specialities ON users.id = doctor_specialities.doctor_id 
        inner join doctor_degrees ON users.id = doctor_degrees.doctor_id 
        WHERE users.id = ?  and users.deleted_at IS NULL`;
        const newQuery = `SELECT
                            users.signature,
                            users.id,
                            users.mobile,
                            users.alternate_mobile,
                            users.email,
                            users.profile_image,
                            users.first_name,
                            users.last_name,
                            users.date_of_birth,
                            users.gender,
                            users.experience_in_year,
                            GROUP_CONCAT(DISTINCT doctor_degrees.id) AS degrees_ids,
                            GROUP_CONCAT(DISTINCT doctor_degrees.degree_name) AS degrees,
                            GROUP_CONCAT(DISTINCT doctor_specialities.id) AS speciality_ids,
                            GROUP_CONCAT(DISTINCT doctor_specialities.speciality_name) AS specialities
                            FROM
                            users
                            INNER JOIN doctor_specialities ON users.id = doctor_specialities.doctor_id
                            INNER JOIN doctor_degrees ON users.id = doctor_degrees.doctor_id
                            WHERE
                            users.id = ?
                            AND users.deleted_at IS NULL
                            GROUP BY
                            users.id;`;
        db.query(newQuery, [id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];

            for (const item of res) {
                const id = item.id;
                const email = item.email;
                const mobile_number = parseInt(item.mobile);
                const alternate_mobile_number = parseInt(item.alternate_mobile);
                const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                const full_name = item.first_name;
                const date_of_birth = item.date_of_birth;
                const gender = item.gender;
                var specialities = item.specialities;
                var degrees = item.degrees;
                var signature = item.signature;
                const experience_in_year = item.experience_in_year;
                response.push({ id, signature, full_name, gender, date_of_birth, email, mobile_number, alternate_mobile_number, date_of_birth, gender, profile_image_name, profile_image_path, specialities, degrees, experience_in_year });
            }
            setTimeout(function () {
                cb(null, response);
            }, 100);
        });
    }
    static findDoctorByIdAndRoleAsynca(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT users.signature,users.id,users.mobile,users.alternate_mobile,users.email,users.profile_image,users.first_name,users.last_name,users.date_of_birth,users.gender,users.experience_in_year,GROUP_CONCAT(DISTINCT doctor_degrees.id) as degrees_ids,doctor_degrees.degree_name,GROUP_CONCAT(DISTINCT doctor_specialities.id) as speciality_ids, GROUP_CONCAT(DISTINCT doctor_specialities.speciality_name) as specialities, GROUP_CONCAT(DISTINCT doctor_degrees.degree_name) as degrees FROM users inner join doctor_specialities ON users.id = doctor_specialities.doctor_id inner join doctor_degrees ON users.id = doctor_degrees.doctor_id WHERE users.id = ?  and users.deleted_at IS NULL", [id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                if (res) {
                    const response = [];
                    for (const item of res) {
                        const id = item.id;
                        const email = item.email;
                        const mobile_number = parseInt(item.mobile);
                        const alternate_mobile_number = parseInt(item.alternate_mobile);
                        const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                        const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                        const full_name = item.first_name;
                        const date_of_birth = item.date_of_birth;
                        const gender = item.gender;
                        var specialities = item.specialities;
                        var degrees = item.degrees;
                        var signature = item.signature;
                        const experience_in_year = item.experience_in_year;
                        response.push({ id, signature, full_name, gender, date_of_birth, email, mobile_number, alternate_mobile_number, date_of_birth, gender, profile_image_name, profile_image_path, specialities, degrees, experience_in_year });
                    }
                    return resolve(response);
                }
            });
        });
    }
    static findAllClinicStaffDoctors(clinic_id, added_by, cb) {
        var staff_name = "";
        var query = `SELECT distinct u.id,u.email,u.mobile,u.alternate_mobile,u.profile_image,u.first_name,u.adhar_card,u.date_of_birth,u.experience_in_year,u.gender,u.added_by,u.enquiry_date FROM users as u left join doctors_clinic as dc on u.id = dc.doctor_id WHERE dc.clinic_id = ${clinic_id} AND u.added_by = ${added_by} and u.role_id = 5  order by u.id desc`;
        db.query(query, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const [key, item] of Object.entries(res)) {
                const id = item.id;
                const email = item.email;
                const mobile_number = parseInt(item.mobile);
                const alternate_mobile_number = parseInt(item.alternate_mobile);
                const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                const full_name = item.first_name;
                const aadhar_card_number = parseInt(item.adhar_card);
                const date_of_birth = item.date_of_birth;
                const gender = item.gender;
                var specialities = "";
                var degrees = "";
                const experience_in_year = item.experience_in_year;
                var added_by = item.added_by;

                if (added_by) {
                    db.query(`SELECT * FROM users WHERE id = '${added_by}'`, [added_by], (err, data) => {
                        if (err) {
                            cb(err, null);
                            return 0;
                        }
                        if (data) {
                            response[key]["staff_name"] = data[0].first_name;
                        }
                    });
                }

                response.push({ id, full_name, gender, date_of_birth, email, mobile_number, alternate_mobile_number, date_of_birth, gender, profile_image_name, profile_image_path, experience_in_year });


                db.query("SELECT GROUP_CONCAT(speciality_name) as specialities from doctor_specialities where doctor_id = ? and deleted_at IS NULL", [id], (err, res1) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    specialities = res1[0].specialities;
                    response[key]["specialities"] = specialities;
                });
                db.query("SELECT GROUP_CONCAT(degree_name) as degrees from doctor_degrees where doctor_id = ? and deleted_at IS NULL", [id], (err, res1) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    degrees = res1[0].degrees;
                    response[key]["degrees"] = degrees;
                });
            }
            setTimeout(function () {
                cb(null, response);
            }, 100);
        });
    }

    static findAllClinicDoctors(clinic_id, cb) {
        var staff_name = "";
        const selectQuery = `SELECT distinct
                                u.id,
                                u.email,
                                u.mobile,
                                u.alternate_mobile,
                                u.profile_image,
                                u.first_name,
                                u.adhar_card,
                                u.date_of_birth,
                                u.experience_in_year,
                                u.gender,
                                u.added_by 
                                FROM
                                users as u
                                left join doctors_clinic as dc on u.id = dc.doctor_id 
                                WHERE
                                dc.clinic_id = ? 
                                and u.role_id = 5`;
        // const oldQuery = "SELECT distinct u.id,u.email,u.mobile,u.alternate_mobile,u.profile_image,u.first_name,u.adhar_card,u.date_of_birth,u.experience_in_year,u.gender,u.added_by FROM users as u left join doctors_clinic as dc on u.id = dc.doctor_id WHERE dc.clinic_id = ? and u.role_id = 5 order by dc.id desc"
        db.query(selectQuery, [clinic_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const [key, item] of Object.entries(res)) {
                const id = item.id;
                const email = item.email;
                const mobile_number = parseInt(item.mobile);
                const alternate_mobile_number = parseInt(item.alternate_mobile);
                const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                const full_name = item.first_name;
                const aadhar_card_number = parseInt(item.adhar_card);
                const date_of_birth = item.date_of_birth;
                const gender = item.gender;
                var specialities = "";
                var degrees = "";
                const experience_in_year = item.experience_in_year;
                var added_by = item.added_by;

                if (added_by) {
                    db.query(`SELECT * FROM users WHERE id = '${added_by}'`, [added_by], (err, data) => {
                        if (err) {
                            cb(err, null);
                            return 0;
                        }
                        if (data) {
                            response[key]["staff_name"] = data[0].first_name;
                        }
                    });
                }

                response.push({ id, full_name, gender, date_of_birth, email, mobile_number, alternate_mobile_number, date_of_birth, gender, profile_image_name, profile_image_path, experience_in_year, staff_name });

                db.query("SELECT GROUP_CONCAT(speciality_name) as specialities from doctor_specialities where doctor_id = ? and deleted_at IS NULL", [id], (err, res1) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    specialities = res1[0].specialities;
                    response[key]["specialities"] = specialities;
                });
                db.query("SELECT GROUP_CONCAT(degree_name) as degrees from doctor_degrees where doctor_id = ? and deleted_at IS NULL", [id], (err, res1) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    degrees = res1[0].degrees;
                    response[key]["degrees"] = degrees;
                });

            }
            setTimeout(function () {
                cb(null, response);
            }, 100);
        });
    }

    static updateDoctor(staff_id, doctor_id, clinic_id, full_name, email_id, date_of_birth, mobile_number, alternate_mobile_number, gender, experience_in_year, specialities, degrees, profile_image, cb) {
        var updated_at = helperFunction.getCurrentDateTime();
        var specialities = specialities.split(",");
        var degrees = degrees.split(",");
        var deleted_at = "IS NULL";

        db.query(`SELECT * FROM users WHERE (email = ? OR mobile = ?) and role_id = ? and created_by_id = ? and id!=? and deleted_at ${deleted_at}`, [email_id, mobile_number, 5, clinic_id, doctor_id, deleted_at], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }


            if (res.length > 0) {
                cb({ kind: "already_added" }, null);
                return;
            } else {
                db.query("delete  from doctor_degrees WHERE doctor_id= ? and created_by_id = ?", [doctor_id, clinic_id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    if (res) {
                        for (var j = 0; j < degrees.length; j++) {

                            db.query(addDoctorDegree, [doctor_id, degrees[j], clinic_id], (err, res) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }
                            });
                        }
                    }
                });
                db.query("delete from doctor_specialities  WHERE doctor_id= ? and created_by_id = ?", [doctor_id, clinic_id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    if (res) {
                        for (var i = 0; i < specialities.length; i++) {
                            db.query(addDoctorSpeciality, [doctor_id, specialities[i], clinic_id], (err, res) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }
                            });
                        }
                    }
                });
                if (profile_image != "") {
                    db.query("UPDATE users SET first_name =?,date_of_birth=?,gender=?,mobile=?,alternate_mobile=?,email=?,experience_in_year = ?,profile_image = ?,updated_at = ?,added_by=? WHERE id =?", [full_name, date_of_birth, gender, mobile_number, alternate_mobile_number, email_id, experience_in_year, profile_image, updated_at, staff_id, doctor_id], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {
                            cb(null, { id: doctor_id });
                        }
                    });
                } else {
                    db.query("UPDATE users SET first_name =?,date_of_birth=?,gender=?,mobile=?,alternate_mobile = ?,email=?,experience_in_year = ?,updated_at = ?,added_by=? WHERE id =?", [full_name, date_of_birth, gender, mobile_number, alternate_mobile_number, email_id, experience_in_year, updated_at, staff_id, doctor_id], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {
                            cb(null, { id: doctor_id });
                        }
                    });
                }
            }
        });
    }
    static deleteStaffDoctor(id, created_by_id, staff_id, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();
        var query = `update users set deleted_at = '${deleted_at}', added_by=${staff_id} WHERE id= ${id} and created_by_id = ${created_by_id} `;
        db.query(query, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        db.query("delete from doctors_clinic WHERE doctor_id = ? and clinic_id = ? ", [id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        db.query("update doctor_degrees set deleted_at = ? WHERE doctor_id= ? and created_by_id = ? ", [deleted_at, id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        db.query("update doctor_specialities set deleted_at = ? WHERE doctor_id= ? and created_by_id = ? ", [deleted_at, id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        cb(null, { id: id });
    }
    static deleteDoctor(id, created_by_id, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();
        db.query("delete from doctors_clinic WHERE doctor_id = ? and clinic_id = ? ", [id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            } if (res) {
                db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${created_by_id}' and status = 'active' order by id desc LIMIT 1`, async (err, pphres) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }

                    if (pphres) {
                        var total_limit = pphres[0].total_limit;
                        var plan_id = pphres[0].plan_id;
                        var id = pphres[0].id;
                        var new_total_limit = total_limit + 1;
                        if (total_limit == 1) {
                            var query = `update plan_purchase_history set total_limit = NULL, status='expire', limit_expired_at=NOW() where user_id = '${created_by_id}' and status = 'active' and plan_id='${plan_id}' and id='${id}'`;
                            var arr = [created_by_id];
                        } else {
                            var query = `update plan_purchase_history set total_limit = '${new_total_limit}' where user_id = '${created_by_id}' and status = 'active' and plan_id='${plan_id}' and id='${id}'`;
                            var arr = [new_total_limit, created_by_id];
                        }
                        db.query(query, arr,
                            (err, res) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }
                                if (res) {
                                    console.log({
                                        new_total_limit: new_total_limit,
                                        created_by_id: created_by_id
                                    });
                                }
                            });
                    }
                });
            }
        });
        db.query("update doctor_degrees set deleted_at = ? WHERE doctor_id= ? and created_by_id = ? ", [deleted_at, id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        db.query("update doctor_specialities set deleted_at = ? WHERE doctor_id= ? and created_by_id = ? ", [deleted_at, id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        db.query("update doctor_fees set deleted_at = ? WHERE doctor_id= ? and created_by_id = ? ", [deleted_at, id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        cb(null, { id: id });
    }
    static updateProfile(full_name, email_id, address, pin_code, profile_image, latitude, longitude, user_id, cb) {
        db.query("UPDATE users SET first_name =?,email=?,address=?,pin_code=?,profile_image=?,latitude=?,longitude=?  WHERE id =?", [full_name, email_id, address, pin_code, profile_image, latitude, longitude, user_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res) {
                cb(null, { id: parseInt(user_id) });
            }
        });
    }
    static findByIdAndRole(id, role_id, cb) {
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM users WHERE id = '${id}' And role_id='${role_id}' and deleted_at ${deleted_at}`, [id, role_id, deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
            return;
        });
    }

    static findByIdAndRoleAsync(id, role_id) {
        return new Promise((resolve, reject) => {
            var deleted_at = "IS NULL";
            db.query(`SELECT * FROM users WHERE id = '${id}' And role_id='${role_id}' and deleted_at ${deleted_at}`, [id, role_id, deleted_at], (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res.length > 0) {
                    return resolve(res[0]);

                } else {
                    return resolve({ kind: "not_found" });
                }
            });
        });
    }
    static findDoctorByIdAndRoleAsync(id, role_id) {
        return new Promise((resolve, reject) => {
            var deleted_at = "IS NULL";
            db.query(`SELECT * FROM users WHERE id = '${id}' And role_id='${role_id}' and deleted_at ${deleted_at}`, [id, role_id, deleted_at], (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res.length) {
                    return resolve(res[0]);

                } else {
                    return resolve({ kind: "not_found" });
                }
            });
        });
    }
    static uploadSignature(signature, user_id, cb) {
        db.query("UPDATE users SET signature =? WHERE id =?", [signature, user_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: user_id
            });
        });
    }
    static findByEmailAndMobileForUpdate(email, mobile_number, user_id, cb) {
        var query = `SELECT * FROM users WHERE (email = '${email}' OR mobile = '${mobile_number}') and id!='${user_id}' AND status = 'Approve'`;
        db.query(query, [email, mobile_number, user_id], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
                cb({ kind: "not_found" }, null);
                return;
            }
        });
    }
    static findByEmailAndMobileForUpdateNew(email, mobile_number, created_by_id, cb) {
        var query = `SELECT * FROM users WHERE (email = '${email}' OR mobile = '${mobile_number}') and created_by_id='${created_by_id}'`;

        db.query(query, [email, mobile_number, created_by_id], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
                cb({ kind: "not_found" }, null);
                return;
            }
        });
    }
    static findByEmailForUpdateNew(email, mobile_number, created_by_id, cb) {
        var query = `SELECT * FROM users WHERE (email = '${email}') `;

        db.query(query, [email, mobile_number, created_by_id], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
                cb({ kind: "not_found" }, null);
                return;
            }
        });
    }

    static findByRole(role, cb) {
        db.query(`SELECT * FROM role WHERE role_name='${role}'`, [role], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
                cb({ kind: "not_found" }, null);
                return;
            }

        });
    }
    static findAllClinics(doctor_id, cb) {
        db.query(`SELECT u.id,u.email,u.mobile,u.alternate_mobile,u.profile_image,u.first_name 
        FROM users as u 
        inner join doctors_clinic as dc on u.id = dc.clinic_id 
        WHERE dc.doctor_id = ? and u.role_id = 8 
        and u.deleted_at IS NULL order by u.id desc`,
            [doctor_id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const response = [];
                for (const item of res) {
                    const id = item.id;
                    const email = item.email;
                    const mobile_number = parseInt(item.mobile);
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const full_name = item.first_name;
                    response.push({ id, full_name, email, mobile_number, profile_image_name, profile_image_path });
                }
                cb(null, response);

            });
    }
    static onlineStaffOfflineStatus(status, user_id, added_by) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET online_offline_status='${status}' WHERE id ='${user_id}' AND  added_by ='${added_by}'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static onlineOflineStatus(status, user_id) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET online_offline_status='${status}' WHERE id ='${user_id}'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static addDoctorWeeklySchedule(doctor_id, clinic_id, daysData, cb) {
        db.query("SELECT * FROM doctor_schedule WHERE doctor_id = ? AND clinic_id = ?", [doctor_id, clinic_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length == 7) {
                for (i = 0; i < res.length; i++) {
                    db.query(updateDoctorSchedule, [daysData[i].days, daysData[i].morning_shift_start, daysData[i].morning_shift_end, daysData[i].afternoon_shift_start, daysData[i].afternoon_shift_end, daysData[i].evening_shift_start, daysData[i].evening_shift_end, daysData[i].status, res[i].id], (err, res) => {
                        if (err) {
                            console.log(err);
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                    });
                }
                cb(null, res);
                return;
            }
            else {
                for (var i = 0; i < 7; i++) {
                    db.query(addDoctorSchedule,
                        [doctor_id, clinic_id, daysData[i].days, daysData[i].morning_shift_start, daysData[i].morning_shift_end, daysData[i].afternoon_shift_start, daysData[i].afternoon_shift_end, daysData[i].evening_shift_start, daysData[i].evening_shift_end, daysData[i].status],
                        (err, res) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                        });
                }
                cb(null, res);
                return;
            }
        });
    }
    static addDoctorAvailability(doctor_id, clinic_id, date, days_status, morning_shift_status, afternoon_shift_status, evening_shift_status, cb) {
        const d = new Date(date);
        let day_name;
        if (d.getDay() == 1) {
            day_name = "Monday";
        } else if (d.getDay() == 2) {
            day_name = "Tuesday";
        } else if (d.getDay() == 3) {
            day_name = "Wednesday";
        } else if (d.getDay() == 4) {
            day_name = "Thursday";
        } else if (d.getDay() == 5) {
            day_name = "Friday";
        } else if (d.getDay() == 6) {
            day_name = "Saturday";
        } else if (d.getDay() == 0) {
            day_name = "Sunday";
        }
        let dateD = helperFunction.dateFormat(date, "yyyy-mm-dd");

        db.query("SELECT * FROM doctor_schedule_date WHERE date = ? and doctor_id = ? and clinic_id = ?", [dateD, doctor_id, clinic_id], (err, res) => {
            if (res.length > 0) {
                let data = res[0];
                db.query(updateDoctorAvailability, [dateD, days_status, morning_shift_status, afternoon_shift_status, evening_shift_status, day_name, data.id],
                    (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {
                            cb(null, res);
                            return;
                        }
                    });
            }
            else {
                db.query(addDoctorAvailability,
                    [doctor_id, clinic_id, dateD, days_status, morning_shift_status, afternoon_shift_status, evening_shift_status, day_name],
                    (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {
                            cb(null, res);
                            return;
                        }
                    });
            }
        });
    }
    static viewDoctorAvailability(doctor_id, clinic_id, date, cb) {
        let result = [];
        const d = new Date(date);
        let day_name;
        if (d.getDay() == 1) {
            day_name = "Monday";
        } else if (d.getDay() == 2) {
            day_name = "Tuesday";
        } else if (d.getDay() == 3) {
            day_name = "Wednesday";
        } else if (d.getDay() == 4) {
            day_name = "Thursday";
        } else if (d.getDay() == 5) {
            day_name = "Friday";
        } else if (d.getDay() == 6) {
            day_name = "Saturday";
        } else if (d.getDay() == 0) {
            day_name = "Sunday";
        }

        let dateD = helperFunction.dateFormat(date, "yyyy-mm-dd");
        db.query("SELECT * FROM doctor_schedule_date WHERE date = ? and doctor_id = ? and clinic_id= ?", [dateD, doctor_id, clinic_id], (err, res) => {
            if (res.length > 0) {
                result = res;
            } if (err) {
                cb(err, null);
                return;
            }
        });
        let morningSlots = [];
        let afternoonSlots = [];
        let eveningSlots = [];
        var slotInterval = 15;

        function slot(res, opentime, closetime) {
            let TimeSlot = helperFunction.timeSlot({ slotInterval, opentime, closetime });
            var Solt = [];

            for (let i = 0; i <= TimeSlot.length; i++) {

                const from = TimeSlot[i] ?? null;
                const to = TimeSlot[i + 1] ?? null;

                if (from != null && to != null) {
                    const Stime = helperFunction.railwayToNormalTimeConvert(from) + "-" + helperFunction.railwayToNormalTimeConvert(to);
                    Solt.push({ Stime });
                }
            }
            const Slots = Solt.reduce((unique, o) => {
                if (!unique.some(obj => obj.Stime === o.Stime)) {
                    unique.push(o);
                }
                return unique;
            }, []);
            for (const item of res) {
                for (const iterator of Slots) {
                    if (item.time_slot == iterator.Stime) {

                        Slots.splice(Slots.indexOf(iterator), 1);
                    }
                }
            }
            return Slots;
        }
        db.query("SELECT * FROM doctor_schedule WHERE days = ? and doctor_id = ? and clinic_id = ?", [day_name, doctor_id, clinic_id], (err, res) => {
            if (res) {
                if (res.length > 0) {
                    let data = res[0];
                    let dayStatus = data.status;
                    if (data.morning_shift_start && data.morning_shift_end) {
                        let opentime = helperFunction.normalToRalwayTimeConvert(data.morning_shift_start);
                        let closetime = helperFunction.normalToRalwayTimeConvert(data.morning_shift_end);
                        morningSlots = slot(res, opentime, closetime);
                    }
                    if (data.afternoon_shift_start && data.afternoon_shift_end) {
                        let opentime = helperFunction.normalToRalwayTimeConvert(data.afternoon_shift_start);
                        let closetime = helperFunction.normalToRalwayTimeConvert(data.afternoon_shift_end);
                        afternoonSlots = slot(res, opentime, closetime);
                    }
                    if (data.evening_shift_start && data.evening_shift_end) {
                        let opentime = helperFunction.normalToRalwayTimeConvert(data.evening_shift_start);
                        let closetime = helperFunction.normalToRalwayTimeConvert(data.evening_shift_end);
                        eveningSlots = slot(res, opentime, closetime);
                    }
                    let resultData = {
                        morningSlots: morningSlots,
                        afternoonSlots: afternoonSlots,
                        eveningSlots: eveningSlots,
                        dayStatus: dayStatus,
                        availability: result
                    };
                    cb(null, resultData);
                    return;
                }
                cb(null, []);
                return;
            }
            if (err) {
                cb(err, null);
                return;
            }
        });
    }
    static viewDoctorWeeklySchedule(doctor_id, clinic_id, cb) {
        db.query("SELECT * FROM doctor_schedule WHERE doctor_id = ? AND clinic_id = ?", [doctor_id, clinic_id], (err, res) => {
            console.log("---------------------- res", res);
            if (res.length > 0) {
                let result = [];
                for (let i = 0; i < res.length; i++) {
                    if (res[i].days == "Monday") {
                        result[0] = res[i];
                    }
                    if (res[i].days == "Tuesday") {
                        result[1] = res[i];
                    }
                    if (res[i].days == "Wednesday") {
                        result[2] = res[i];
                    }
                    if (res[i].days == "Thursday") {
                        result[3] = res[i];
                    }
                    if (res[i].days == "Friday") {
                        result[4] = res[i];
                    }
                    if (res[i].days == "Saturday") {
                        result[5] = res[i];
                    }
                    if (res[i].days == "Sunday") {
                        result[6] = res[i];
                    }
                }

                cb(null, result);
                return;
            } else if (res.length == 0) {
                let defaultResult = [{ status: "0" }, { status: "0" }, { status: "0" }, { status: "0" }, { status: "0" }, { status: "0" }, { status: "0" }];
                cb(null, defaultResult);
                return;
            } if (err) {
                cb(err, null);
                return;
            }
        });
    }
    static checkPatientMemberExistence(patient_id, member_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT id FROM users WHERE created_by_id = '${patient_id}' and id = '${member_id}'`,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static requestProfileAccess(doctor_id, patient_id, member_id, length, cb) {
        if (member_id != "" && member_id != null) {
            var query = "SELECT * FROM profile_access WHERE doctor_id = ? and status!='Accept' and (status='Pending' or status='Completed' or resend_status !='completed') and patient_id = ? and member_id = ? and deleted_at IS NULL ORDER BY id DESC ";
            var arr = [doctor_id, patient_id, member_id];
        } else {
            if (length > 0) {
                var query = "SELECT * FROM profile_access WHERE doctor_id = ? and member_id = ? and (status='Pending' or status='Completed' or resend_status !='completed') and deleted_at IS NULL ORDER BY id DESC";
                var arr = [doctor_id, member_id];
            } else {
                var query = "SELECT * FROM profile_access WHERE doctor_id = ? and patient_id = ? and  (status='Pending' or status='Completed' or resend_status !='completed') and deleted_at IS NULL ORDER BY id DESC";
                var arr = [doctor_id, patient_id];
            }
        }
        db.query(query, arr, async (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length > 0) {
                cb({ kind: "already_requested" }, null);
            } else {
                const checkMemberExistence = await helperQuery.All(`SELECT id FROM users WHERE created_by_id = '${patient_id}' and id = '${member_id}'`);
                if (checkMemberExistence.length > 0) {
                    db.query("INSERT into profile_access(doctor_id,patient_id,member_id,status,requested_at) values(?,?,?,?,NOW())", [doctor_id, patient_id, member_id, "Pending"], async (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {

                            const doctor_detail = await helperQuery.Get({ table: "users", where: " id=" + doctor_id });

                            const member_detail = await helperQuery.Get({ table: "users", where: " id=" + member_id });

                            var user_name = (member_detail.length > 0) ? member_detail[0].first_name : "";

                            var doctor_name = (doctor_detail.length > 0) ? doctor_detail[0].first_name : "";

                            var type = "profile_request_access";
                            var title = "Profile Access";
                            var app_message = "Hey " + user_name + ",\nDr. " + doctor_name + " has requested to access your MedWire profile.";
                            var message = "Hey " + user_name + ",<br> Dr. " + doctor_name + " has requested to access your MedWire profile.";

                            const user_detail = await helperQuery.Get({ table: "users", where: " id=" + patient_id });

                            if (user_detail.length > 0) {
                                var payload = {
                                    notification: {
                                        title: title,
                                        body: app_message
                                    }
                                };
                                if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                                    await helperFunction.pushNotification(user_detail[0].device_token, payload);
                                }
                            }

                            var created_at = moment().format("YYYY-MM-DD HH:mm");
                            db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)", [doctor_id, patient_id, title, type, message, created_at], (err, res) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }

                            });
                            cb(null, res);
                            return;
                        }
                    });
                } else {
                    db.query("INSERT into profile_access(doctor_id,patient_id,status,requested_at) values(?,?,?,NOW())", [doctor_id, patient_id, "Pending"], async (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {

                            const doctor_detail = await helperQuery.Get({ table: "users", where: " id=" + doctor_id });


                            const user_detail = await helperQuery.Get({ table: "users", where: " id=" + patient_id });

                            var user_name = (user_detail.length > 0) ? user_detail[0].first_name : "";

                            var doctor_name = (doctor_detail.length > 0) ? doctor_detail[0].first_name : "";


                            var title = "Profile Access";
                            var type = "profile_request_access";

                            var app_message = "Hey " + user_name + ",\nDr. " + doctor_name + " has requested to access your MedWire profile.";
                            var message = "Hey " + user_name + ",<br> Dr. " + doctor_name + " has requested to access your MedWire profile.";


                            if (user_detail.length > 0) {
                                var payload = {
                                    notification: {
                                        title: title,
                                        body: app_message
                                    }
                                };
                                if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                                    await helperFunction.pushNotification(user_detail[0].device_token, payload);
                                }
                                console.log(payload);
                            }

                            var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                            db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)", [doctor_id, patient_id, title, type, message, created_at], (err, res) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }

                            });

                            cb(null, res);
                            return;
                        }
                    });
                }
            }
        });
    }
    static profileAccessList(user_id, role_id, cb) {
        if (role_id == 5) {
            db.query(`SELECT
                        u1.mobile,
                        u1.email,
                        u1.gender,
                        u1.profile_image,
                        u1.permanent_id as medwire_id,
                        u1.mobile,
                        u1.pin_code,
                        u1.first_name as patient_name,
                        pa.member_id,
                        pa.time_interval,
                        pa.id as request_id,
                        u.id,
                        u.first_name as doctor_name,
                        pa.status 
                        FROM
                        profile_access pa
                        inner join users u on u.id = pa.doctor_id
                        inner join users u1 on u1.id = pa.patient_id 
                        WHERE
                        pa.doctor_id = '${user_id}' 
                        and u1.role_id = 2 
                        and pa.deleted_at IS NULL`, [user_id], async (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                var allData = [];
                if (res) {
                    for (const [key, item] of Object.entries(res)) {
                        var member_id = item.member_id;
                        var time_interval = item.time_interval;
                        var pin_code = item.pin_code != undefined && item.pin_code != "undefined" && item.pin_code != "" ? item.pin_code : null;
                        var mobile = item.mobile;
                        var email = item.email ?? null;
                        var doctor_name = item.doctor_name;
                        var status = item.status;
                        var request_id = item.request_id;

                        if (item.member_id != undefined && item.member_id != null) {
                            const udata = await helperQuery.First({ table: "users", where: "id=" + item.member_id + " AND role_id=2" });
                            //    console.log(udata);
                            var image = udata.profile_image != null && udata.profile_image != undefined ? udata.profile_image : "demouser.png";
                            var patient_name = udata.first_name;
                            var gender = udata.gender;

                            var medwire_id = udata.permanent_id;
                        } else {
                            var image = item.profile_image != null && item.profile_image != undefined ? item.profile_image : "demouser.png";
                            var patient_name = item.patient_name;
                            var gender = item.gender;
                            var medwire_id = item.medwire_id;
                        }

                        allData.push({ time_interval, request_id, medwire_id, doctor_name, mobile, image, email, patient_name, request_id, gender, pin_code, patient_name, status });
                    }

                    setTimeout(function () {
                        let result = allData.filter(
                            (person, index) => index === allData.findIndex(
                                other => person.request_id === other.request_id
                            )).sort((a, b) => {
                                return b.request_id - a.request_id;
                            });
                        cb(null, result);
                    }, 100);

                }

            });
        }
        else {

            db.query(`SELECT pa.member_id,pa.id as request_id,u.address,u.pin_code,pa.requested_at,
            u1.permanent_id as medwire_id,u1.pin_code,u1.first_name as patient_name,
            u.first_name as doctor_name,pa.status 
            FROM profile_access pa 
            inner join  users u on u.id = pa.doctor_id 
            inner join users u1 on u1.id = pa.patient_id 
            WHERE pa.patient_id = '${user_id}' and u1.role_id=2 and pa.deleted_at IS NULL`,
                [user_id], async (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    var allData = [];
                    if (res) {
                        for (const [key, item] of Object.entries(res)) {
                            var member_id = item.member_id;
                            var request_id = item.request_id;
                            var address = item.address;
                            var pin_code = item.pin_code;
                            var email = item.email;
                            var requested_at = item.requested_at;
                            var doctor_name = item.doctor_name;
                            var status = item.status;
                            if (item.member_id != undefined && item.member_id != null) {
                                const udata = await helperQuery.First({ table: "users", where: "id=" + item.member_id + " AND role_id=2" });
                                // console.log(udata);
                                var image = udata.profile_image != null && udata.profile_image != undefined ? udata.profile_image : "demouser.png";
                                var patient_name = udata.first_name;
                                var gender = udata.gender;
                                var medwire_id = udata.permanent_id;
                            } else {
                                var image = item.profile_image != null && item.profile_image != undefined ? item.profile_image : "demouser.png";
                                var patient_name = item.patient_name;
                                var gender = item.gender;
                                var medwire_id = item.medwire_id;
                            }
                            allData.push({ request_id, medwire_id, doctor_name, patient_name, request_id, address, pin_code, patient_name, requested_at, status, image, email, gender });
                        }
                        setTimeout(function () {
                            let result = allData.filter(
                                (person, index) => index === allData.findIndex(
                                    other => person.request_id === other.request_id
                                )).sort((a, b) => {
                                    return b.request_id - a.request_id;
                                });
                            cb(null, result);
                        }, 100);
                    }
                });
        }
    }
    static profileAccessDetail(request_id, cb) {
        var query = `SELECT u1.created_by_id,pa.id as request_id,u1.mobile,u1.id as user_id FROM profile_access pa  inner join users u1 on u1.id = pa.patient_id  WHERE pa.id = ${request_id}`;
        db.query(query, [request_id], (err, res) => {
            if (err) {
                console.log(err);
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            if (res) {
                ;
                for (const [key, item] of Object.entries(res)) {
                    var created_by_id = item.created_by_id;
                    var profile_access_id = item.request_id;
                    var user_id = item.user_id;
                    var created_by_id = item.created_by_id;
                    var mobile_number = item.mobile;
                    response.push({ created_by_id, profile_access_id, user_id, created_by_id, mobile_number });
                    var patient_id = user_id;
                    var patient_created_by_id = created_by_id;

                    db.query("select * from users WHERE id = ? ", [patient_created_by_id], (err, res1) => {
                        if (res1.length > 0) {
                            response[key]["mobile"] = res1[0].mobile;
                        } else {
                            response[key]["mobile"] = "";
                        }
                    });
                }
                setTimeout(function () {
                    cb(null, response);
                }, 100);
                return;
            }

        });

    }

    static changeProfileAccessRequestStatus(request_id, status, time_interval, cb) {
        var updated_at = helperFunction.getCurrentDateTime();
        db.query("UPDATE profile_access set status = ? , updated_at = ? , time_interval = ? WHERE id = ?", [status, updated_at, time_interval, request_id], async (err, res) => {
            if (err) {
                console.log(err);
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.affectedRows > 0) {
                const profile_access_detail = await helperQuery.Get({ table: "profile_access", where: " id=" + request_id });

                if (profile_access_detail.length > 0) {

                    var patient_id = profile_access_detail[0].member_id == null || profile_access_detail[0].member_id == "" ? profile_access_detail[0].patient_id : profile_access_detail[0].member_id;
                    var doctor_id = profile_access_detail[0].doctor_id;

                    const patient_detail = await helperQuery.Get({ table: "users", where: " id=" + patient_id });

                    var patient_name = patient_detail[0].first_name;

                    if (status == "Accept") {
                        var title = "Profile Access";
                        var type = "accept_profile_request_access";
                    } else {
                        var title = "Profile Access";
                        var type = "reject_profile_request_access";
                    }

                    const user_detail = await helperQuery.Get({ table: "users", where: " id=" + doctor_id });

                    var doctor_name = user_detail[0].first_name;

                    if (status == "Accept") {
                        var app_message = "Hello Dr. " + doctor_name + ",\n" + patient_name + " has accepted your Request to access his/her MedWire Profile.";
                        var message = "Hello Dr. " + doctor_name + ",<br> " + patient_name + " has accepted your Request to access his/her MedWire Profile.";
                    } else {
                        var app_message = "Hello Dr. " + doctor_name + ",\n" + patient_name + " has denied your Request to access his/her MedWire Profile.";
                        var message = "Hello Dr. " + doctor_name + ",<br> " + patient_name + " has denied your Request to access his/her MedWire Profile.";
                    }

                    if (user_detail.length > 0) {
                        var payload = {
                            notification: {
                                title: title,
                                body: app_message
                            }
                        };
                        if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                            await helperFunction.pushNotification(user_detail[0].device_token, payload);
                        }
                    }

                    var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                    db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)", [patient_id, doctor_id, title, type, message, created_at], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                    });
                    cb(null, res);
                    return;
                }
                else {
                    cb(err, null);
                    return;
                }
            }
            else {
                cb({ kind: "failed_to_update" }, null);
            }
        });
    }
    static updateProfileAccess(doctor_id, patient_id, member_id, request_id, length, cb) {
        var updated_at = helperFunction.getCurrentDateTime();
        if (member_id == "") {
            var query = "SELECT * FROM profile_access WHERE doctor_id = ? and patient_id = ? and member_id = ? and id!=?";
            var arr = [doctor_id, patient_id, member_id, request_id];
        } else {
            if (length > 0) {
                var query = "SELECT * FROM profile_access WHERE doctor_id = ? and member_id = ? and id!=?";
                var arr = [doctor_id, member_id, request_id];
            } else {
                var query = "SELECT * FROM profile_access WHERE doctor_id = ? and patient_id = ? and id!=?";
                var arr = [doctor_id, patient_id, request_id];
            }
        }
        db.query(query, arr, async (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length > 0) {
                cb({ kind: "already_requested" }, null);
            } else {


                const checkMemberExistence = await helperQuery.All(`SELECT id FROM users WHERE created_by_id = '${patient_id}' and id = '${member_id}'`);
                if (checkMemberExistence.length > 0) {
                    db.query("update profile_access set patient_id = ? , member_id = ?,  status = ? , updated_at = ? , requested_at = NOW() where id =?", [patient_id, member_id, "Pending", updated_at, request_id], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {
                            db.query("select first_name from users where id = ? ", [doctor_id], async (err, res1) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }
                                if (res1) {
                                    var user_name = "";
                                    db.query("select first_name from users where id = ? ", [member_id], async (err, res2) => {
                                        if (err) {
                                            logger.error(err.message);
                                            cb(err, null);
                                            return;
                                        }
                                        if (res2) {
                                            user_name = res2 != undefined && res2.length > 0 ? res2[0].first_name : "";
                                        }
                                    });
                                    var doctor_name = res1 != undefined && res1.length > 0 ? res1[0].first_name : "";
                                    var title = "Profile Access";
                                    var type = "profile_request_access";


                                    var message = "Hey " + user_name + ",<br> Dr. " + doctor_name + " has requested to access your MedWire profile.";

                                    var app_message = "Hey " + user_name + ",\nDr. " + doctor_name + " has requested to access your MedWire profile.";

                                    const user_detail = await helperQuery.Get({ table: "users", where: " id=" + patient_id });

                                    if (user_detail.length > 0) {
                                        var payload = {
                                            notification: {
                                                title: title,
                                                body: app_message
                                            }
                                        };
                                        if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                                            await helperFunction.pushNotification(user_detail[0].device_token, payload);
                                        }
                                    }

                                    var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                                    db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)", [doctor_id, patient_id, title, type, message, created_at], (err, res) => {
                                        if (err) {
                                            logger.error(err.message);
                                            cb(err, null);
                                            return;
                                        }
                                    });
                                }
                            });
                            cb(null, res);
                            return;
                        }

                    });
                } else {
                    db.query("update profile_access set patient_id = ? , member_id = ?,  status = ? , updated_at = ? , requested_at = NOW() where id =?", [patient_id, member_id, "Pending", updated_at, request_id], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if (res) {
                            db.query("select first_name from users where id = ? ", [doctor_id], async (err, res1) => {
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }
                                if (res1) {
                                    var user_name = "";
                                    db.query("select first_name from users where id = ? ", [member_id], async (err, res2) => {
                                        if (err) {
                                            logger.error(err.message);
                                            cb(err, null);
                                            return;
                                        }
                                        if (res2) {
                                            user_name = res2 != undefined && res2.length > 0 ? res2[0].first_name : "";
                                        }
                                    });
                                    var doctor_name = res1 != undefined && res1.length > 0 ? res1[0].first_name : "";
                                    var title = "Profile Access";
                                    var type = "profile_request_access";

                                    var app_message = "Hey " + user_name + ",\nDr. " + doctor_name + " has requested to access your MedWire profile.";

                                    var message = "Hey " + user_name + ",<br> Dr. " + doctor_name + " has requested to access your MedWire profile.";

                                    const user_detail = await helperQuery.Get({ table: "users", where: " id=" + patient_id });

                                    if (user_detail.length > 0) {
                                        var payload = {
                                            notification: {
                                                title: title,
                                                body: app_message
                                            }
                                        };
                                        if ((user_detail[0].device_type == "Android") || (user_detail[0].device_type == "IOS")) {
                                            await helperFunction.pushNotification(user_detail[0].device_token, payload);
                                        }
                                    }

                                    var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                                    db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)", [doctor_id, patient_id, title, type, message, created_at], (err, res) => {
                                        if (err) {
                                            logger.error(err.message);
                                            cb(err, null);
                                            return;
                                        }

                                    });
                                }
                            });
                            cb(null, res);
                            return;
                        }

                    });
                }
            }

        });
    }
    static deleteProfileAccess(request_id, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();
        db.query("UPDATE profile_access set  deleted_at= ? WHERE id = ?", [deleted_at, request_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res) {
                cb(null, res);
                return;
            }
        });
    }

    static sendMeetingNotification(cb) {
        db.query("select * from appointments WHERE type ='online' and str_to_date(appointment_date,'%Y-%m-%d') =  curdate()", [], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res) {
                const payload = {
                    iss: process.env.API_KEY, //your API KEY
                    exp: new Date().getTime() + 5000,
                };

                const token = jwt.sign(payload, process.env.API_SECRET);
                const email = "rk85783@gmail.com"; // your zoom developer email account

                for (const [key, item] of Object.entries(res)) {
                    var splited_from_time = item.from_time.split("-");
                    var start_time = splited_from_time[0];

                    let date_ob = new Date();
                    let date = ("0" + date_ob.getDate()).slice(-2);
                    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month
                    let hours = ("0" + (date_ob.getHours() % 12 || 12)).slice(-2); // current hours
                    let minutes = date_ob.getMinutes(); // current minutes

                    var ampm = (date_ob.getHours() >= 12) ? "PM" : "AM";
                    var current_day_time_after_10_minute = hours + ":" + (minutes + 10) + ampm;

                    console.log("start_time", start_time);
                    console.log("current_day_time_after_10_minute", current_day_time_after_10_minute);
                    if (start_time == current_day_time_after_10_minute) {
                        console.log("inside if");
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

                        requestPromise(options).then(function (response) {
                            var start_url = response.start_url;
                            var join_url = response.join_url;
                            var pass_code = response.password;

                            const patient_id = item.created_by_id;
                            const doctor_id = item.user_id;
                            const member_id = item.member_id;

                            // send meeting link to doctor
                            db.query(`SELECT * FROM users WHERE id = '${doctor_id}'`, [doctor_id], (err, res) => {
                                if (res.length > 0) {
                                    var doctor_email_id = res[0].email;
                                    transporter.sendMail({
                                        from: process.env.MAIL_FROM_ADDRESS,
                                        to: doctor_email_id,
                                        subject: "Appointment Schedule",
                                        html: "<b>Your appointment has been scheduled at " + item.from_time + ". Please click following zoom link " + start_url + " with pass code " + pass_code + " to start appointment</b>",
                                    }, function (error) {
                                        if (error) {
                                            return console.log(error);
                                        }
                                    });
                                }
                            });
                            // send meeting link to patient        
                            db.query(`SELECT * FROM users WHERE id = '${patient_id}'`, [patient_id], (err, res) => {
                                if (res.length > 0) {
                                    var patient_email_id = res[0].email;
                                    transporter.sendMail({
                                        from: process.env.MAIL_FROM_ADDRESS,
                                        to: patient_email_id,
                                        subject: "Appointment Schedule",
                                        html: "<b>Your appointment has been scheduled at " + item.from_time + ". Please click following zoom link " + join_url + " with pass code " + pass_code + " to start appointment</b>",
                                    }, function (error) {
                                        if (error) {
                                            return console.log(error);
                                        }
                                    });
                                }
                            });
                            // send meeting link to patient's member
                            for (var i = 0; i < member_id.length; i++) {
                                db.query(`SELECT * FROM users WHERE id = '${member_id[i]}'`, [member_id[i]], (err, res) => {
                                    if (res.length > 0) {
                                        var patient_email_id = res[0].email;
                                        transporter.sendMail({
                                            from: process.env.MAIL_FROM_ADDRESS,
                                            to: patient_email_id,
                                            subject: "Appointment Schedule",
                                            html: "<b>Your appointment has been scheduled at " + item.from_time + ". Please click following zoom link " + join_url + " with pass code " + pass_code + " to start appointment</b>",
                                        }, function (error) {
                                            if (error) {
                                                return console.log(error);
                                            }
                                        });
                                    }
                                });
                            }
                        }).catch(function (err) {
                            // API call failed...
                            console.log("API call failed, reason ", err);
                        });
                    }
                }
            }
            cb(null, res);
            return;
        });
    }

    static findByCreatedById(created_by_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE created_by_id = '${created_by_id}'`, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }

    static findByCreatedByIdWithemailVerify(email, role_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE (email='${email}' OR mobile = '${email}') AND account_verify='1' 
            `, (err, res) => {
                if (err) {
                    //AND role_id='${role_id}'
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }
    static otpSave({ email, forgot_otp, id }) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE users SET forgot_otp = ? WHERE email= ? AND id=?",
                [
                    forgot_otp,
                    email, id
                ], (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static saveOtpSave({ forgot_otp, id }) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE users SET forgot_otp = ? WHERE id=?",
                [
                    forgot_otp,
                    email, id
                ], (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static findByEmailAndMobileAndRole(email, mobile, role_id, cb) {

        db.query(`SELECT * FROM users WHERE (email = '${email}' OR mobile = '${mobile}') and role_id = '${role_id}'`, [email, mobile, role_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
                cb({ kind: "not_found" }, null);
            }

        });
    }
    static updateDoctorUser({ mobile, gender, date_of_birth, first_name, address, experience_in_year, pin_code, alternate_mobile, user_id, profile_image }) {
        if (profile_image != "") {
            var query = `UPDATE users SET  mobile ='${mobile}',profile_image='${profile_image}',gender='${gender}',date_of_birth='${date_of_birth}',
            first_name='${first_name}',address='${address}',pin_code='${pin_code}',
            experience_in_year='${experience_in_year}',	alternate_mobile='${alternate_mobile != undefined && alternate_mobile != null ? "" + alternate_mobile : null}' WHERE id ='${user_id}'`;
        } else {
            var query = `UPDATE users SET  mobile ='${mobile}',gender='${gender}',date_of_birth='${date_of_birth}',
            first_name='${first_name}',address='${address}',pin_code='${pin_code}',
            experience_in_year='${experience_in_year}', alternate_mobile='${alternate_mobile != undefined && alternate_mobile != null ? "" + alternate_mobile : null}' WHERE id ='${user_id}'`;
        }
        return new Promise((resolve, reject) => {
            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res) {
                        return resolve(res);
                    };
                });
        });
    }
    static saveLogiToken(auth_token, id) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET auth_token = '${auth_token}' WHERE id='${id}'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static logOut(id) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET auth_token = NULL,device_token = NULL, device_type = NULL WHERE id='${id}'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res) {
                        return resolve(res);
                    }
                });
        });
    }

    static getSignature(user_id, cb) {
        db.query("select signature from users WHERE id = ?", [user_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const signature = (res[0].signature) ? res[0].signature : "";
            const signature_file_path = process.env.CLOUDINARY_BASE_URL + "signature/" + signature;
            cb(null, {
                signature_file_name: signature,
                signature_file_path: signature_file_path,
            });
        });
    }
}

module.exports = User;