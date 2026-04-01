const db = require("../config/db.config");

class billingHistory {
    static billingHistoryPaid(user_id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT  SUM(amount) AS total_paid FROM `appointments_billing_history` WHERE `user_id`='" + user_id + "'";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }

    // TODO::RK
    static billingHistoryByRoleOld(role_id, user_type) {
        return new Promise((resolve, reject) => {
            if (user_type == "doctor") {
                var query = "SELECT clinic_users.first_name, users.created_by_id, clinic_users.mobile, clinic_users.email, clinic_users.pin_code, appointments.doctor_id AS user_id, appointments.admin_status, users.profile_image, SUM(appointments.grand_total) AS total_unpaid FROM appointments INNER JOIN users ON users.id = appointments.doctor_id INNER JOIN users AS clinic_users ON clinic_users.id = users.created_by_id WHERE appointments.status IN ('Completed', 'Visited') AND users.user_type = '" + user_type + "' AND users.role_id = '" + role_id + "'  GROUP by appointments.doctor_id";
            }
            else {
                var query = "SELECT users.first_name, users.mobile, users.email, users.pin_code,  appointments.user_id, appointments.admin_status, users.profile_image, SUM(appointments.grand_total) AS total_unpaid FROM appointments INNER JOIN users ON users.id = appointments.user_id  WHERE appointments.status  IN  ('Completed', 'Visited') AND users.user_type = '" + user_type + "' AND users.role_id = '" + role_id + "'  GROUP by appointments.user_id";
            }
            db.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static billingHistoryByRole(role_id, user_type) {
        return new Promise((resolve, reject) => {

            let query = "";

            if (user_type == "doctor") {

                query = `
                SELECT 
                    ANY_VALUE(clinic_users.first_name) AS first_name,
                    ANY_VALUE(users.created_by_id) AS created_by_id,
                    ANY_VALUE(clinic_users.mobile) AS mobile,
                    ANY_VALUE(clinic_users.email) AS email,
                    ANY_VALUE(clinic_users.pin_code) AS pin_code,
                    appointments.doctor_id AS user_id,
                    ANY_VALUE(appointments.admin_status) AS admin_status,
                    ANY_VALUE(users.profile_image) AS profile_image,
                    SUM(appointments.grand_total) AS total_unpaid
                FROM appointments 
                INNER JOIN users ON users.id = appointments.doctor_id 
                INNER JOIN users AS clinic_users ON clinic_users.id = users.created_by_id 
                WHERE appointments.status IN ('Completed', 'Visited')
                  AND users.user_type = '${user_type}'
                  AND users.role_id = '${role_id}'
                GROUP BY appointments.doctor_id
            `;
            }

            else {
                query = `
                SELECT 
                    ANY_VALUE(users.first_name) AS first_name,
                    ANY_VALUE(users.mobile) AS mobile,
                    ANY_VALUE(users.email) AS email,
                    ANY_VALUE(users.pin_code) AS pin_code,
                    appointments.user_id AS user_id,
                    ANY_VALUE(appointments.admin_status) AS admin_status,
                    ANY_VALUE(users.profile_image) AS profile_image,
                    SUM(appointments.grand_total) AS total_unpaid
                FROM appointments 
                INNER JOIN users ON users.id = appointments.user_id 
                WHERE appointments.status IN ('Completed', 'Visited')
                  AND users.user_type = '${user_type}'
                  AND users.role_id = '${role_id}'
                GROUP BY appointments.user_id
            `;
            }

            db.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    // TODO::RK
    static unpaidBillingStartDateOld(user_id, user_type) {
        return new Promise((resolve, reject) => {
            if (user_type == "doctor") {
                var query = "SELECT DATE_FORMAT(appointment_date, '%Y-%m-%d') AS starting_appointment_date FROM `appointments` WHERE `doctor_id` = '" + user_id + "'  AND `status` IN ('Completed', 'Visited') ORDER BY `appointment_date` ASC LIMIT 1";
            }
            else {
                var query = "SELECT DATE_FORMAT(appointment_date, '%Y-%m-%d') AS starting_appointment_date FROM `appointments` WHERE `user_id` = '" + user_id + "'  AND `status` IN ('Completed', 'Visited') ORDER BY `appointment_date` ASC LIMIT 1";
            }
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static unpaidBillingStartDate(user_id, user_type) {
        return new Promise((resolve, reject) => {

            let query = `
            SELECT DATE_FORMAT(appointment_date, '%Y-%m-%d') AS starting_appointment_date
            FROM appointments 
            WHERE ${user_type === "doctor" ? "doctor_id" : "user_id"} = ?
              AND status IN ('Completed', 'Visited')
            ORDER BY appointment_date ASC
            LIMIT 1
        `;

            db.query(query, [user_id], (err, res) => {
                if (err) {
                    return reject(err);
                }

                // No rows found → return safe object
                if (!res || res.length === 0) {
                    return resolve({
                        starting_appointment_date: null
                    });
                }

                return resolve(res[0]);
            });
        });
    }

    static unpaidBillingHistory(start_end, end_date, user_id, user_type) {
        return new Promise((resolve, reject) => {
            if (user_type == "doctor") {
                var query = "SELECT `clinic_users`.`first_name`,`clinic_users`.`email`, SUM(appointments.grand_total) AS total_unpaid, `appointments`.`id` AS appointment_id FROM `appointments` INNER JOIN `users` ON `users`.`id` = `appointments`.`doctor_id` INNER JOIN users AS clinic_users ON clinic_users.id = users.created_by_id  WHERE `appointments`.`doctor_id` = '" + user_id + "'  AND `appointments`.`admin_status` ='Pending' AND `appointments`.`status`  IN  ('Completed', 'Visited') AND `appointments`.`appointment_date` BETWEEN '" + start_end + "' AND '" + end_date + "'";
            }
            else {
                var query = "SELECT `users`.`first_name`,`users`.`email`, SUM(appointments.grand_total) AS total_unpaid, `appointments`.`id` AS appointment_id FROM `appointments` INNER JOIN `users` ON `users`.`id` = `appointments`.`user_id`  WHERE `appointments`.`user_id` = '" + user_id + "'  AND `appointments`.`admin_status` ='Pending' AND `appointments`.`status`  IN  ('Completed', 'Visited') AND `appointments`.`appointment_date` BETWEEN '" + start_end + "' AND '" + end_date + "'";
            }
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static paidBillingStartDate(user_id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT `users`.`first_name`,`users`.`profile_image`,`appointments_billing_history`.`start_date`,`appointments_billing_history`.`end_date`,`appointments_billing_history`.`total_commission`,`appointments_billing_history`.`appointment_ids`,`appointments_billing_history`.`amount`,`appointments_billing_history`.`payment_txt_id`,`appointments_billing_history`.`payment_status`,`appointments_billing_history`.`updated_at` FROM `appointments_billing_history` INNER JOIN `users` ON `users`.`id` = `appointments_billing_history`.`user_id` WHERE `appointments_billing_history`.`user_id` = '" + user_id + "'  AND   `appointments_billing_history`.`payment_status` = 'Success'";
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static unpaidAppointmentIds(start_end, end_date, user_id, user_type) {
        return new Promise((resolve, reject) => {
            if (user_type == "doctor") {
                var query = "SELECT  `appointments`.`id` AS appointment_id FROM `appointments` INNER JOIN `users` ON `users`.`id` = `appointments`.`doctor_id`  WHERE `appointments`.`doctor_id` = '" + user_id + "'  AND `appointments`.`admin_status` ='Pending' AND `appointments`.`status`  IN  ('Completed', 'Visited') AND `appointments`.`appointment_date` BETWEEN '" + start_end + "' AND '" + end_date + "'";
            }
            else {
                var query = "SELECT  `appointments`.`id` AS appointment_id FROM `appointments` INNER JOIN `users` ON `users`.`id` = `appointments`.`user_id`  WHERE `appointments`.`user_id` = '" + user_id + "'  AND `appointments`.`admin_status` ='Pending' AND `appointments`.`status`  IN  ('Completed', 'Visited') AND `appointments`.`appointment_date` BETWEEN '" + start_end + "' AND '" + end_date + "'";
            }

            //console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getCommission(user_id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT `commission_percent` FROM `commissions` WHERE `user_id`= '" + user_id + "'";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static addUnpaidBillingHistory(user_id, appointment_ids, email, start_date, end_date, total_unpaid, total_commission, amount) {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO `appointments_billing_history` SET `user_id`='" + user_id + "',`appointment_ids`='" + appointment_ids + "',`email`='" + email + "',`start_date`='" + start_date + "',`end_date`='" + end_date + "',`total_unpaid`='" + total_unpaid + "',`total_commission`='" + total_commission + "',`amount`='" + amount + "'";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static billingHistoryAppointments(appointment_ids, user_type) {
        return new Promise((resolve, reject) => {
            if ((user_type == "radiology") || (user_type == "laboratories")) {
                var query = "SELECT `appointments`.`id`,`appointments`.`appointment_date`,`appointments`.`status`,`appointments`.`grand_total`,`appointments`.`payment_txt_id`,`appointments`.`payment_status`,`appointments`.`admin_status`,`appointments`.`from_time`, `user_carts`.`cart_item` FROM `appointments` INNER JOIN `user_carts` ON `user_carts`.`appointment_id` = `appointments`.`id` WHERE `appointments`.`id` IN (" + appointment_ids + ")";
            }
            else {
                query = "SELECT id,appointment_date,status,grand_total,payment_txt_id,payment_status,admin_status,from_time FROM `appointments` WHERE `id` IN (" + appointment_ids + ")";
            }
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
}
module.exports = billingHistory;