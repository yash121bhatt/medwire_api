const db = require("../config/db.config");
class bookingHistory {
    //radio/lab
    static patientBillingHistoryLabRadio({ role_id, user_id }) {
        return new Promise((resolve, reject) => {

            var query = `SELECT 
            ap.id,ap.user_id,ap.member_id,ap.created_by_id,ap.promo_code_id,ap.appointments_user_type,
            ap.appointment_date,ap.from_time,ap.status,ap.total_amount,ap.grand_total,
            ap.status,ap.reason_of_reschedule,ap.created_at,ap.updated_at,ap.payment_txt_id,ap.payment_status,
            d.first_name as doctor,
            l.first_name as lab_name, 
            p.first_name as patient,p.permanent_id as medwire_id,p.pin_code,
            uc.cart_id,uc.user_id,uc.cart_item,uc.created_at 
                        FROM appointments ap 
                        INNER JOIN user_carts uc on ap.id=uc.appointment_id
                        LEFT JOIN users l on uc.user_id=l.id 
                        LEFT JOIN user_doctors u on ap.refer_by_id=u.id 
                        LEFT JOIN doctors_clinic dc ON dc.id=u.user_id
                        LEFT JOIN users d on d.id=dc.doctor_id
                        LEFT JOIN users p on p.id=ap.created_by_id
                        WHERE l.role_id='${role_id}' AND p.id ='${user_id}'
                        AND ap.payment_status ='Success' 
                        ORDER BY ap.id DESC`;

            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static clinicStaffAppointmenHistory(user_id, added_by) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT 
         ap.id as appointment_id,ap.appointment_date,ap.from_time as time_slot,
         ap.reason_of_reschedule,ap.appointments_user_type,
         ap.status,ap.reason,ap.total_amount, ap.grand_total,
         u.id as created_by_id,u.first_name as patient_name,u.pin_code,u.permanent_id,
         c.id as clinic_id,c.first_name as clinic_name,c.address as clinic_address,c.pin_code as clinic_pin_code,
         d.id as doctor_id,d.first_name as doctor_name, ap.payment_status as payment_status
         FROM appointments ap
         INNER JOIN users u ON u.id = ap.patient_id
         INNER JOIN users d ON d.id = ap.doctor_id
         INNER JOIN users c ON c.id = ap.clinic_id
         WHERE c.id='${user_id}' AND u.added_by='${added_by}'
         AND ap.payment_status!='Aborted'
         order by ap.id`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    //clinic and doctor
    static clinicAppointmenHistory(user_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT 
         ap.id as appointment_id,ap.appointment_date,ap.from_time as time_slot,ap.appointments_user_type,
         ap.reason_of_reschedule,ap.created_at,ap.updated_at,ap.payment_txt_id,ap.payment_status,
         ap.status,ap.reason,ap.total_amount, ap.grand_total,
         u.id as created_by_id,u.first_name as patient_name,u.pin_code,u.permanent_id,
         c.id as clinic_id,c.first_name as clinic_name,c.address as clinic_address,c.pin_code as clinic_pin_code,
         d.id as doctor_id,d.first_name as doctor_name
         FROM appointments ap
         INNER JOIN users u ON u.id = ap.patient_id
         INNER JOIN users d ON d.id = ap.doctor_id
         INNER JOIN users c ON c.id = ap.clinic_id
         WHERE c.id='${user_id}'
         AND ap.payment_status='Success'
         order by ap.id DESC`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static clinicBookingHistory(user_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT 
        ap.id as appointment_id,ap.appointment_date,ap.from_time as time_slot,
        ap.reason_of_reschedule,ap.consulting_fee,ap.created_at,ap.updated_at,ap.appointments_user_type,
        ap.status,ap.reason,ap.total_amount, ap.grand_total,ap.payment_txt_id,ap.payment_status,
        u.id as created_by_id,u.first_name as patient_name,u.pin_code,u.permanent_id,
        c.id as clinic_id,c.first_name as clinic_name,c.address as clinic_address,c.pin_code as clinic_pin_code,
        d.id as doctor_id,d.first_name as doctor_name,d.address as doctor_address

        FROM appointments ap
        INNER JOIN users u ON u.id = ap.patient_id
        INNER JOIN users d ON d.id = ap.doctor_id
        INNER JOIN users c ON c.id = ap.clinic_id
        WHERE c.id='${user_id}'
        AND ap.payment_status='Success'
        order by ap.id DESC`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static patientBillingHistoryClinic(user_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT 
         ap.id as appointment_id,ap.appointment_date,ap.from_time as time_slot,ap.appointments_user_type,
         ap.reason_of_reschedule,ap.consulting_fee,ap.created_at,ap.updated_at,
         ap.status,ap.reason,ap.total_amount, ap.grand_total,ap.payment_txt_id,ap.payment_status,
         u.id as created_by_id,u.first_name as patient_name,u.pin_code,u.permanent_id,
         c.id as clinic_id,c.first_name as clinic_name,c.address as clinic_address,c.pin_code as clinic_pin_code,
         d.id as doctor_id,d.first_name as doctor_name,d.address as doctor_address

         FROM appointments ap
         INNER JOIN users u ON u.id = ap.patient_id
         INNER JOIN users d ON d.id = ap.doctor_id
         INNER JOIN users c ON c.id = ap.clinic_id
         WHERE u.id='${user_id}'
         AND ap.payment_status='Success'
         order by ap.id DESC`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static patientMemberBillingHistoryClinic(user_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT 
         ap.id as appointment_id,ap.appointment_date,ap.from_time as time_slot,ap.appointments_user_type,
         ap.reason_of_reschedule,ap.consulting_fee,ap.created_at,ap.updated_at,
         ap.status,ap.reason,ap.total_amount, ap.grand_total,ap.payment_txt_id,ap.payment_status,
         u.id as created_by_id,u.first_name as patient_name,u.pin_code,u.permanent_id,
         c.id as clinic_id,c.first_name as clinic_name,c.address as clinic_address,c.pin_code as clinic_pin_code,
         d.id as doctor_id,d.first_name as doctor_name,d.address as doctor_address

         FROM appointments ap
         INNER JOIN users u ON u.id = ap.patient_id
         INNER JOIN users d ON d.id = ap.doctor_id
         INNER JOIN users c ON c.id = ap.clinic_id
         WHERE u.created_by_id='${user_id}'
         AND ap.payment_status!='Aborted'
         order by ap.id DESC`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
}
module.exports = bookingHistory;