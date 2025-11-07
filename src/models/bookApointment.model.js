const { Promise, reject, resolve, async } = require("q");
const db = require("../config/db.config");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const moment = require("moment");
const { logger } = require("../utils/logger");
class bookApointment {
    static create(lab_id, user_id, cart_item, cart_name, total_amount) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO user_carts (user_id,created_by_id,cart_item,cart_name,total_amount,created_at) VALUES (?,?,?,?,?,NOW())",
                [lab_id, user_id, cart_item, cart_name, total_amount],
                (err, res) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static update(cart_item, cart_name, total_amount, lab_id, user_id) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE user_carts SET cart_item=?,cart_name=?,total_amount=?,user_id=?,updated_at=NOW() WHERE created_by_id='${user_id}' AND status='0' AND appointment_id IS NULL`,
                [cart_item, cart_name, total_amount, lab_id, user_id],
                (err, res) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static dalete(cart_id, user_id) {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM user_carts WHERE cart_id='${cart_id}' AND user_id='${user_id}'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static show(created_by_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM user_carts WHERE created_by_id='${created_by_id}' AND status='0' AND appointment_id IS NULL`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static createAppoint(payment_order_id, user_id, member_id, refer_by_id, promo_code_id, from_time, appointment_date, total_amount, grand_total, created_by_id, doctor_id) {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO appointments(payment_order_id,user_id,member_id, refer_by_id, promo_code_id, from_time, appointment_date, total_amount, grand_total, created_by_id, patient_id,doctor_id, created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
                [payment_order_id, user_id, member_id, refer_by_id, promo_code_id, from_time, appointment_date, total_amount, grand_total, created_by_id, created_by_id, doctor_id],
                async (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res) {

                        db.query("select first_name from users where id = ? ", [created_by_id], async (err, res) => {
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }

                            if (res) {
                                var patient_name = res[0].first_name;
                                db.query("select first_name from users where id = ? ", [user_id], async (err, res) => {
                                    if (err) {
                                        logger.error(err.message);
                                        cb(err, null);
                                        return;
                                    }
                                    if (res) {
                                        var lab_name = res[0].first_name;
                                        if (refer_by_id != undefined) {
                                            db.query("select first_name,role_id from users where id = ? ", [refer_by_id], async (err, res) => {
                                                if (res) {
                                                    // var doctor_name  =res[0]!== undefined && res[0].first_name !== undefined ? res[0].first_name: null;
                                                    var user_role_id = res[0] !== undefined && res[0].role_id !== undefined ? res[0].role_id : null;
                                                    if (user_role_id == 5) {
                                                        var from_user_id = created_by_id;
                                                        var to_user_id = refer_by_id;

                                                        var title = "Appointment Booked";
                                                        var type = "lab_appointment_booked";
                                                        var message = "You have been referred in the appointment in lab " + lab_name + " at " + appointment_date + " " + from_time + " with patient " + patient_name;

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
                                                        db.query("INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)", [from_user_id, to_user_id, title, type, message, created_at], async (err, res) => {
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
                                        var from_user_id = created_by_id;
                                        var to_user_id = user_id;

                                        var title = "Appointment Booked";
                                        var type = "lab_appointment_booked";
                                        var message = patient_name + " booked appointment in lab " + lab_name + " at " + helperFunction.dateFormat(appointment_date, "dd/mm/yyyy") + " " + from_time;

                                        var user_detail = await helperQuery.Get({ table: "users", where: " id=" + to_user_id });

                                        // if(user_detail){
                                        //     var payload = {
                                        //         notification : {
                                        //             title : title,
                                        //             body : message
                                        //         }
                                        //     }   
                                        //     if((user_detail[0].device_type == 'Android')||(user_detail[0].device_type == 'IOS')){
                                        //         await helperFunction.pushNotification(user_detail[0].device_token,payload);
                                        //     }
                                        // }

                                        var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
                                        // db.query(`INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES(?,?,?,?,?,?)`,[from_user_id,to_user_id,title,type,message,created_at],(err,res)=>{
                                        //     if (err) {
                                        //         logger.error(err.message);
                                        //         cb(err, null);
                                        //         return;
                                        //     } 

                                        // });
                                    }

                                });

                            }
                        });
                    }

                    return resolve(res);
                });
        });
    }

    static appointmentList(user_id, role_id) {
        return new Promise((resolve, reject) => {
            if (role_id == 4) {
                var query = `SELECT ap.payment_order_id,ap.payment_status,ap.id,ap.user_id,ap.member_id,ap.created_by_id,ap.promo_code_id,ap.appointments_user_type,
                ap.appointment_date,ap.from_time,ap.status,ap.total_amount,ap.grand_total,
                p.first_name,p.pin_code ,pm.pin_code as mpin_code,
                ap.status,ap.reason_of_reschedule,ap.payment_status,
                d.first_name as doctor,
                l.first_name as lab_name,l.address as lab_address,l.latitude,l.longitude,
                pd.first_name as doctors,
                uc.cart_id,uc.user_id,uc.cart_item,uc.created_at,
                nv.id as visit_id,nv.report_document,nv.dcm_document
                            FROM appointments ap 
                            INNER JOIN user_carts uc on ap.id=uc.appointment_id
                            LEFT JOIN users l on uc.user_id=l.id 
                            LEFT JOIN user_doctors u on ap.refer_by_id=u.id 
                            LEFT JOIN doctors_clinic dc ON dc.id=u.user_id
                            LEFT JOIN users d on d.id=ap.refer_by_id
                            LEFT JOIN users p on p.id=ap.created_by_id
                            LEFT JOIN users pm on pm.id=p.created_by_id
                            LEFT JOIN users pd on pd.id=ap.doctor_id
                            LEFT JOIN new_visit nv on nv.appointment_id=ap.id AND nv.online_ofline_status='1'
                            WHERE ap.created_by_id='${user_id}' AND 
                            (ap.payment_status ='Success' OR ap.payment_status ='Pending') AND 
                            l.role_id=4 ORDER BY ap.id DESC`;
            } else {
                var query = `SELECT ap.payment_order_id,ap.payment_status,ap.id,ap.user_id,ap.member_id,ap.created_by_id,ap.promo_code_id,
                p.first_name,p.pin_code ,pm.pin_code as mpin_code,
                ap.appointment_date,ap.from_time,ap.status,ap.total_amount,ap.grand_total,ap.appointments_user_type,
                ap.status,ap.reason_of_reschedule,ap.payment_status,
                d.first_name as doctor,l.first_name as lab_name,l.address as lab_address,l.latitude,l.longitude,
                pd.first_name as doctors, 
                uc.cart_id,uc.user_id,uc.cart_item,uc.created_at,
                nv.id as visit_id,nv.report_document,nv.dcm_document
                            FROM appointments ap 
                            INNER JOIN user_carts uc on ap.id=uc.appointment_id
                            LEFT JOIN users l on uc.user_id=l.id 
                            LEFT JOIN user_doctors u on ap.refer_by_id=u.id 
                            LEFT JOIN doctors_clinic dc ON dc.id=u.user_id
                            LEFT JOIN users d on d.id=ap.refer_by_id
                            LEFT JOIN users p on p.id=ap.created_by_id
                            LEFT JOIN users pd on pd.id=ap.doctor_id
                            LEFT JOIN users pm on pm.id=p.created_by_id
                            LEFT JOIN new_visit nv on nv.appointment_id=ap.id AND nv.online_ofline_status='1'
                            WHERE ap.created_by_id='${user_id}' AND 
                            (ap.payment_status ='Success' OR ap.payment_status ='Pending') AND 
                            l.role_id=3 ORDER BY ap.id DESC`;
            }
            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static LabRadioAppointmentList(user_id) {
        return new Promise((resolve, reject) => {

            var query = `SELECT ap.id,ap.user_id,ap.member_id,ap.created_by_id,ap.promo_code_id,
            ap.appointments_user_type,ap.payment_status,
            p.first_name,p.pin_code,p.address,
            ap.appointment_date,ap.from_time,ap.status,ap.total_amount,ap.grand_total,
            d.first_name as doctor,ap.status,ap.reason_of_reschedule,
            l.first_name as lab_name, 
            p.first_name as patient,p.permanent_id as medwire_id,p.pin_code ,pm.pin_code as mpin_code,
            uc.cart_id,uc.user_id,uc.cart_item,uc.created_at,
            nv.id as visit_id,nv.report_document,nv.dcm_document
                        FROM appointments ap 
                        INNER JOIN user_carts uc on ap.id=uc.appointment_id
                        LEFT JOIN users l on uc.user_id=l.id 
                        LEFT JOIN user_doctors u on ap.refer_by_id=u.id 
                        LEFT JOIN doctors_clinic dc ON dc.id=u.user_id
                        LEFT JOIN users d on d.id=ap.refer_by_id
                        LEFT JOIN users p on p.id=ap.created_by_id
                        LEFT JOIN users pm on pm.id=p.created_by_id
                        LEFT JOIN new_visit nv on nv.appointment_id=ap.id AND nv.online_ofline_status='1'
                        WHERE l.id='${user_id}' AND ap.payment_status='Success' ORDER BY ap.id DESC`;

            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static LabRadioAppointmentfind(appointment_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT*FROM appointments WHERE id='${appointment_id}' LIMIT 1`,
                [appointment_id],
                (err, res) => {
                    if (err) {

                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static LabRadioAppointmentStatusReschedule(timeslot, appointment_date, reason_of_reschedule, appointment_id) {
        return new Promise((resolve, reject) => {
            var query = `UPDATE appointments SET from_time='${timeslot}',appointment_date='${appointment_date}', status='Reschedule',reason_of_reschedule='${reason_of_reschedule}',updated_at=NOW() WHERE id='${appointment_id}' And status != 'Approved'`;
            db.query(query,
                [timeslot, appointment_date, reason_of_reschedule, appointment_id],
                (err, res) => {
                    if (err) {

                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static LabRadioAppointmentStatusUpdate(status, appointment_id) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE appointments SET status='${status}',updated_at=NOW() WHERE id='${appointment_id}'`,
                (err, res) => {
                    if (err) {

                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    // TODO::RK
    static allDoctorSearchOld({ doctor_name, speciality, clinic_name, pin_code }) {

        if ((pin_code != undefined && pin_code != null && pin_code != "")) {
            var qu = `SELECT dc.id,dc.clinic_id,
            u.first_name as doctor,u.id as doctor_id,u.profile_image,
            c.first_name as clinic,c.address as clinic_address,c.pin_code as clinic_pincode,c.profile_image as clinic_profile,
            u.experience_in_year,
            df.online_consulting_fee as online_fee,df.clinic_visit_consulting_fee as ofline_fee,
            GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') as speciality_name,
            GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ',') as degrees
            
            FROM doctors_clinic dc LEFT JOIN users u  on dc.doctor_id=u.id 
            LEFT JOIN users c on dc.clinic_id=c.id
            LEFT JOIN doctor_specialities ds on u.id=ds.doctor_id
            LEFT JOIN doctor_degrees dd on u.id=dd.doctor_id
            LEFT JOIN doctor_fees df on df.doctor_id=u.id
            WHERE (c.pin_code LIKE '%${pin_code}%') AND (df.online_consulting_fee !='null' OR df.clinic_visit_consulting_fee !='null')
            
            GROUP BY dc.id`;
            console.log("test1");
        }
        else if ((clinic_name != undefined && clinic_name != "") || (doctor_name != undefined && doctor_name != "")) {
            var qu = `SELECT dc.id,dc.clinic_id,
            u.first_name as doctor,u.id as doctor_id,u.profile_image,
            c.first_name as clinic,c.address as clinic_address,c.pin_code as clinic_pincode,c.profile_image as clinic_profile,
            u.experience_in_year,
            df.online_consulting_fee as online_fee,df.clinic_visit_consulting_fee as ofline_fee,
            GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') as speciality_name,
            GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ',') as degrees
            
            FROM doctors_clinic dc INNER JOIN users u  on dc.doctor_id=u.id 
            INNER JOIN users c on dc.clinic_id=c.id
            LEFT JOIN doctor_specialities ds on u.id=ds.doctor_id
            LEFT JOIN doctor_degrees dd on u.id=dd.doctor_id
            LEFT JOIN doctor_fees df on df.doctor_id=u.id
            where (u.first_name LIKE '%${doctor_name}%') AND (c.first_name LIKE '%${clinic_name}%') AND (df.online_consulting_fee !='null' OR df.clinic_visit_consulting_fee !='null')
            GROUP BY dc.id`;
        }
        else if (((clinic_name != undefined && clinic_name != "") || (doctor_name != undefined && doctor_name != "")) && (pin_code != undefined && pin_code != null && pin_code != "")) {
            var qu = `SELECT dc.id,dc.clinic_id,
            u.first_name as doctor,u.id as doctor_id,u.profile_image,
            c.first_name as clinic,c.address as clinic_address,c.pin_code as clinic_pincode,c.profile_image as clinic_profile,
            u.experience_in_year,
            df.online_consulting_fee as online_fee,df.clinic_visit_consulting_fee as ofline_fee,
            GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') as speciality_name,
            GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ',') as degrees
            
            FROM doctors_clinic dc INNER JOIN users u  on dc.doctor_id=u.id 
            INNER JOIN users c on dc.clinic_id=c.id
            LEFT JOIN doctor_specialities ds on u.id=ds.doctor_id
            LEFT JOIN doctor_degrees dd on u.id=dd.doctor_id
            LEFT JOIN doctor_fees df on df.doctor_id=u.id
            where (u.first_name LIKE '%${doctor_name}%') AND (c.pin_code LIKE '%${pin_code}%')  AND (c.first_name LIKE '%${clinic_name}%') AND (df.online_consulting_fee !='null' OR df.clinic_visit_consulting_fee !='null')
            GROUP BY dc.id`;

        }
        else if (speciality != undefined && speciality != "") {
            var qu = `SELECT dc.id,dc.clinic_id,
            u.first_name as doctor,u.id as doctor_id,u.profile_image,u.pin_code,
            c.first_name as clinic,c.address as clinic_address,c.pin_code as clinic_pincode,c.profile_image as clinic_profile,
            u.experience_in_year,
            df.online_consulting_fee as online_fee,df.clinic_visit_consulting_fee as ofline_fee,
            GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') as speciality_name,
            GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ',') as degrees
            
            FROM doctors_clinic dc INNER JOIN users u  on dc.doctor_id=u.id 
            INNER JOIN users c on dc.clinic_id=c.id
            LEFT JOIN doctor_specialities ds on u.id=ds.doctor_id
            LEFT JOIN doctor_degrees dd on u.id=dd.doctor_id
            LEFT JOIN doctor_fees df on df.doctor_id=u.id Where (df.online_consulting_fee !='null' OR df.clinic_visit_consulting_fee !='null')
            GROUP BY dc.id`;
        }
        else {
            var qu = `SELECT dc.id,dc.clinic_id,
            u.first_name as doctor,u.id as doctor_id,u.profile_image,
            c.first_name as clinic,c.address as clinic_address,c.pin_code as clinic_pincode,c.profile_image as clinic_profile,
            u.experience_in_year,
            df.online_consulting_fee as online_fee,df.clinic_visit_consulting_fee as ofline_fee,
            GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') as speciality_name,
            GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ',') as degrees
            
            FROM doctors_clinic dc LEFT JOIN users u  on dc.doctor_id=u.id 
            LEFT JOIN users c on dc.clinic_id=c.id
            LEFT JOIN doctor_specialities ds on u.id=ds.doctor_id
            LEFT JOIN doctor_degrees dd on u.id=dd.doctor_id
            LEFT JOIN doctor_fees df on df.doctor_id=u.id
            Where (df.online_consulting_fee !='null' OR df.clinic_visit_consulting_fee !='null')
            GROUP BY dc.id`;
        }
        return new Promise((resolve, reject) => {
            db.query(qu, (err, res) => {
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static allDoctorSearch({ doctor_name, speciality, clinic_name, pin_code }) {
        let baseQuery = `
        SELECT 
        dc.id, 
        dc.clinic_id,
        u.first_name AS doctor,
        u.id AS doctor_id,
        u.profile_image,
        c.first_name AS clinic,
        c.address AS clinic_address,
        c.pin_code AS clinic_pincode,
        c.profile_image AS clinic_profile,
        u.experience_in_year,
        MAX(df.online_consulting_fee) AS online_fee,
        MAX(df.clinic_visit_consulting_fee) AS offline_fee,
        GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') AS speciality_name,
        GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ', ') AS degrees
    FROM doctors_clinic dc
    LEFT JOIN users u ON dc.doctor_id = u.id
    LEFT JOIN users c ON dc.clinic_id = c.id
    LEFT JOIN doctor_specialities ds ON u.id = ds.doctor_id
    LEFT JOIN doctor_degrees dd ON u.id = dd.doctor_id
    LEFT JOIN doctor_fees df ON df.doctor_id = u.id
    WHERE (df.online_consulting_fee IS NOT NULL OR df.clinic_visit_consulting_fee IS NOT NULL)
    `;

        // Dynamic filters
        const filters = [];
        const params = [];

        if (doctor_name) {
            filters.push(`u.first_name LIKE ?`);
            params.push(`%${doctor_name}%`);
        }

        if (clinic_name) {
            filters.push(`c.first_name LIKE ?`);
            params.push(`%${clinic_name}%`);
        }

        if (speciality) {
            filters.push(`ds.speciality_name LIKE ?`);
            params.push(`%${speciality}%`);
        }

        if (pin_code) {
            filters.push(`c.pin_code LIKE ?`);
            params.push(`%${pin_code}%`);
        }

        // Add filters to query
        if (filters.length > 0) {
            baseQuery += " AND " + filters.join(" AND ");
        }

        baseQuery += `
        GROUP BY dc.id
        ORDER BY u.first_name ASC
    `;

        console.log(baseQuery);

        return new Promise((resolve, reject) => {
            db.query(baseQuery, params, (err, res) => {
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                resolve(res);
            });
        });
    }


    static LabRadioBillingHistory(user_id) {
        return new Promise((resolve, reject) => {

            var query = `SELECT ap.id,ap.user_id,ap.member_id,ap.created_by_id,ap.promo_code_id,ap.appointments_user_type,
            ap.appointment_date,ap.from_time,ap.status,ap.total_amount,ap.grand_total,ap.payment_txt_id,ap.payment_status,ap.admin_status,
            d.first_name as doctor,ap.status,ap.reason_of_reschedule,
            l.first_name as lab_name, 
            p.first_name as patient,p.permanent_id as medwire_id,p.pin_code ,pm.pin_code as mpin_code,
            uc.cart_id,uc.user_id,uc.cart_item,uc.created_at 
                    FROM appointments ap 
                    INNER JOIN user_carts uc on ap.id=uc.appointment_id
                    LEFT JOIN users l on uc.user_id=l.id 
                    LEFT JOIN user_doctors u on ap.refer_by_id=u.id 
                    LEFT JOIN doctors_clinic dc ON dc.id=u.user_id
                    LEFT JOIN users d on d.id=ap.refer_by_id
                    LEFT JOIN users p on p.id=ap.created_by_id
                    LEFT JOIN users pm on pm.id=p.created_by_id
                    WHERE l.id='${user_id}' AND ap.payment_status='Success' ORDER BY ap.id DESC`;

            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static doctorSpecialities() {
        return new Promise((resolve, reject) => {
            db.query("SELECT id,speciality_name FROM doctor_specialities GROUP BY speciality_name",
                (err, res) => {
                    if (err) {

                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static allclinicList() {
        return new Promise((resolve, reject) => {
            // db.query("SELECT * FROM users WHERE role_id=8 AND approve_status=\"Approve\"", (err, res) => {
            db.query("SELECT * FROM users WHERE role_id = 8 AND approve_status = ?", ["Approve"], (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static addAppointmentForDoctor({ clinic_id, doctor_id, patient_id, user_id, member_id, created_by_id, promo_code_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, grand_total, payment_order_id, created_at }) {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO appointments(	clinic_id,doctor_id,patient_id, member_id,user_id, promo_code_id, from_time, type, consulting_fee, reason, appointment_date, total_amount, grand_total, created_by_id, created_at,payment_order_id) VALUES ('${clinic_id}', '${doctor_id}', '${patient_id}','${member_id}', '${user_id}','${promo_code_id}', '${time_slot}', '${type}', '${consulting_fee}', '${reason}', '${appointment_date}', '${total_amount}', '${grand_total}', '${created_by_id}','${created_at}', '${payment_order_id}' )`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static clinicAddAppointmentForDoctor({ clinic_id, doctor_id, patient_id, user_id, member_id, created_by_id, promo_code_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, payment_status, grand_total, created_at }) {
        return new Promise((resolve, reject) => {
            var query = `INSERT INTO appointments( clinic_id,doctor_id,patient_id, member_id,user_id, promo_code_id, from_time, type, appointments_user_type, status, consulting_fee, reason, appointment_date, total_amount, payment_status, grand_total, created_by_id, created_at) VALUES ('${clinic_id}', '${doctor_id}', '${patient_id}','${member_id}', '${user_id}','${promo_code_id}', '${time_slot}', '${type}', 'clinic', 'Approved', '${consulting_fee}', '${reason}', '${appointment_date}', '${total_amount}', '${payment_status}', '${grand_total}', '${created_by_id}','${created_at}')`;
            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static AppointmentForDoctor(user_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT ap.id as appointment_id,ap.prescription_pdf_name as prescription_pdf_name,
            ap.appointment_date,ap.from_time as time_slot,ap.reason,ap.reason_of_reschedule,ap.status,
            ap.reason,ap.total_amount, ap.grand_total,ap.payment_status as payment_status,
            ap.appointments_user_type,
            u.first_name as patient_name,ap.type,
            c.first_name as clinic_name,c.address as clinic_address,
            c.pin_code as clinic_pin_code,c.latitude,c.longitude,
            d.first_name as doctor_name
            FROM appointments ap
            INNER JOIN users u ON u.id = ap.patient_id
            INNER JOIN users d ON d.id = ap.doctor_id
            INNER JOIN users c ON c.id = ap.clinic_id
            WHERE u.id='${user_id}' AND ap.payment_status ='Success' order by ap.id desc`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res) {
                        const resD = [];
                        for (const i of res) {
                            resD.push({
                                appointment_id: i.appointment_id,
                                prescription_pdf_name: i.prescription_pdf_name,
                                prescription_pdf_name_url: helperFunction.is_file_exist(i.prescription_pdf_name),
                                appointment_date: i.appointment_date,
                                time_slot: i.time_slot,
                                reason: i.reason,
                                reason_of_reschedule: i.reason_of_reschedule,
                                total_amount: i.total_amount, grand_total: i.grand_total,
                                payment_status: i.payment_status,
                                status: i.status,
                                appointments_user_type: i.appointments_user_type,
                                patient_name: i.patient_name,
                                type: i.type, clinic_name: i.clinic_name,
                                clinic_address: i.clinic_address,
                                clinic_pin_code: i.clinic_pin_code,
                                latitude: i.latitude, longitude: i.longitude,
                                doctor_name: i.doctor_name
                            });
                        }
                        return resolve(resD);
                    }

                });
        });
    }
    static AppointmentForAllDoctor() {
        return new Promise((resolve, reject) => {
            db.query(`SELECT ap.id as appointment_id,ap.prescription_pdf_name_for_admin as prescription_pdf_name_for_admin,ap.appointment_date,ap.from_time as time_slot,ap.reason_of_reschedule,ap.status,ap.reason,ap.total_amount, ap.grand_total,ap.payment_status as payment_status,ap.appointments_user_type,
            c.first_name as clinic_name,c.address as clinic_address,c.pin_code as clinic_pin_code,ap.type,
            d.first_name as doctor_name
            FROM appointments ap
            INNER JOIN users u ON u.id = ap.patient_id
            INNER JOIN users d ON d.id = ap.doctor_id
            INNER JOIN users c ON c.id = ap.clinic_id
            WHERE ap.status = 'Completed' order by ap.id desc`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static doctorDetail({ id }) {
        var qu = `SELECT dc.id,dc.clinic_id,
        u.first_name as doctor,u.id as doctor_id,u.profile_image,u.pin_code,
        c.first_name as clinic,c.address as clinic_address,c.pin_code as clinic_pincode,
        u.experience_in_year,
        df.online_consulting_fee as online_fee,df.clinic_visit_consulting_fee as ofline_fee,
        GROUP_CONCAT(DISTINCT ds.speciality_name SEPARATOR ', ') as speciality_name,
        GROUP_CONCAT(DISTINCT dd.degree_name SEPARATOR ',') as degrees
        
        FROM doctors_clinic dc INNER JOIN users u  on dc.doctor_id=u.id 
        INNER JOIN users c on dc.clinic_id=c.id
        LEFT JOIN doctor_specialities ds on u.id=ds.doctor_id
        LEFT JOIN doctor_degrees dd on u.id=dd.doctor_id
        LEFT JOIN doctor_fees df on df.doctor_id=u.id
        WHERE dc.id ='${id}' `;

        return new Promise((resolve, reject) => {
            db.query(qu,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static patientBillingHistoryLabRadio({ role_id, user_id }) {
        return new Promise((resolve, reject) => {

            var query = `SELECT ap.id,ap.user_id,ap.member_id,ap.created_by_id,ap.promo_code_id,
            ap.appointment_date,ap.from_time,ap.status,ap.total_amount,ap.grand_total,ap.payment_txt_id,ap.payment_status,ap.appointments_user_type,
            d.first_name as doctor,ap.status,ap.reason_of_reschedule,
            l.first_name as lab_name,l.address as lab_address,
            p.first_name as patient,p.permanent_id as medwire_id,p.pin_code ,pm.pin_code as mpin_code,
            uc.cart_id,uc.user_id,uc.cart_item,uc.created_at 
                        FROM appointments ap 
                        INNER JOIN user_carts uc on ap.id=uc.appointment_id
                        LEFT JOIN users l on uc.user_id=l.id 
                        LEFT JOIN user_doctors u on ap.refer_by_id=u.id 
                        LEFT JOIN doctors_clinic dc ON dc.id=u.user_id
                        LEFT JOIN users d on d.id=ap.refer_by_id
                        LEFT JOIN users p on p.id=ap.created_by_id
                        LEFT JOIN users pm on pm.id=p.created_by_id
                        WHERE l.role_id='${role_id}' AND p.id ='${user_id}' AND ap.payment_status ='Success' ORDER BY ap.id DESC`;

            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static viewDoctorAvailability({ doctor_id, clinic_id, date, bookedSlots }, cb) {
        let day_name = moment().utc(date).format("dddd");
        let dateD = moment().utc(date).format("YYYY-MM-DD");
        let result = [];
        let morningSlots = [];
        let afternoonSlots = [];
        let eveningSlots = [];
        let stime = [];
        var slotInterval = 15;

        db.query("SELECT * FROM doctor_schedule WHERE days = ? and doctor_id = ? and clinic_id=?", [day_name, doctor_id, clinic_id], async (err, res) => {
            if (res) {
                result = await helperQuery.All(`SELECT * FROM doctor_schedule_date WHERE date = '${dateD}' and doctor_id = '${doctor_id}' and clinic_id='${clinic_id}'`);
                if (res.length > 0) {
                    let data = res[0];
                    let dayStatus = data.status;
                    console.log("Data------>", data);
                    if (data.morning_shift_start && data.morning_shift_end) {
                        morningSlots = helperFunction.doctorStartToEndTimeSlot(slotInterval, data.morning_shift_start, data.morning_shift_end, bookedSlots, date, "morning");
                    }
                    if (data.afternoon_shift_start && data.afternoon_shift_end) {
                        afternoonSlots = helperFunction.doctorStartToEndTimeSlot(slotInterval, data.afternoon_shift_start, data.afternoon_shift_end, bookedSlots, date, "afternoon");
                    }
                    if (data.evening_shift_start && data.evening_shift_end) {
                        eveningSlots = helperFunction.doctorStartToEndTimeSlot(slotInterval, data.evening_shift_start, data.evening_shift_end, bookedSlots, date, "evening");
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
                } else {
                    cb(null, []);
                    return;
                }
            }
            if (err) {
                cb(err, null);
                return;
            }
        });
    }
    static updatePaymentOrderId(payment_order_id, id) {
        return new Promise((resolve, reject) => {
            var query = "update `appointments` set `payment_order_id` = '" + payment_order_id + "' where `id` = '" + id + "'";
            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static createAppointBydoctor(user_id, doctor_id, appointment_id, time_slot, appointment_date, appointments_user_type, total_amount, grand_total, patient_id) {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO appointments(user_id, doctor_id,appointment_id, refer_by_id, from_time, appointment_date, appointments_user_type, total_amount, grand_total, created_by_id, patient_id,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,NOW())`,
                [user_id, doctor_id, appointment_id, doctor_id, time_slot, appointment_date, appointments_user_type, total_amount, grand_total, patient_id, patient_id],
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static updateAppointBydoctor({ user_id, doctor_id, appointmentsId, time_slot, appointment_date, appointments_user_type, total_amount, grand_total, patient_id }) {
        return new Promise((resolve, reject) => {
            const query = `UPDATE appointments SET  from_time='${time_slot}', appointment_date='${appointment_date}', appointments_user_type='${appointments_user_type}', total_amount='${total_amount}', grand_total='${grand_total}',created_at=NOW()
            WHERE user_id='${user_id}' AND doctor_id='${doctor_id}' AND appointment_id='${appointmentsId}' AND patient_id='${patient_id}'`;

            db.query(query,

                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static getLabRadioDoctument(appointment_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT nv.id as new_visit_id,ap.id as app_id,nv.type,nv.report_document,nv.dcm_document,
            lrd.id,lrd.patient_id,lrd.user_id FROM appointments ap
            INNER JOIN appointments lrd on lrd.appointment_id=ap.id
            INNER JOIN new_visit nv on nv.appointment_id=lrd.id
            WHERE ap.id = '${appointment_id}' AND lrd.appointments_user_type='doctor'`, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }


}
module.exports = bookApointment;