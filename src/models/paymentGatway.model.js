const db = require('../config/db.config');

class paymentGatway {
    static updateAppointmentPaymentDetail(appointment_id,payment_data){
        return new Promise((resolve,reject)=>{
            var query = `UPDATE appointments SET payment_txt_id='${payment_data.payment_txt_id}', payment_status='${payment_data.payment_status}', payment_currency='${payment_data.payment_currency}', payment_detail='${payment_data.payment_detail}', updated_at=NOW() WHERE id='${appointment_id}'`;
            // console.log(query);
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getPatientDetail(appointment_id){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT appointments.id AS appointment_id,appointments.doctor_id,appointments.user_id,appointments.patient_id,appointments.clinic_id,appointments.appointment_date,appointments.from_time,appointments.payment_order_id,appointments.reason,appointments.reason, users.first_name FROM appointments inner join users on users.id = appointments.patient_id   WHERE appointments.id='${appointment_id}'`, (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static checkLastActivePlan(user_id){
        return new Promise((resolve,reject)=>{
            var query = `SELECT * FROM plan_purchase_history WHERE user_id = '${user_id}' and  status='active'`;
            console.log(query);
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static updateLastActivePlan(active_purchase_plan_id){
        return new Promise((resolve,reject)=>{
            var query = `UPDATE plan_purchase_history SET status='expire' WHERE id='${active_purchase_plan_id}'`;
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static updatePlanPaymentDetail(purchase_plan_id,payment_data,status){
        return new Promise((resolve,reject)=>{
            var query = `UPDATE plan_purchase_history SET payment_txt_id='${payment_data.payment_txt_id}', payment_status='${payment_data.payment_status}', status='${status}', payment_currency='${payment_data.payment_currency}', payment_detail='${payment_data.payment_detail}', purchased_at=NOW() WHERE id='${purchase_plan_id}'`;
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getPlanPurchaseDetail(plan_purchase_id){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT plan_purchase_history.id AS plan_purchase_id, users.first_name, users.role_id, plans.plan_name, plans.validity, plans.price FROM plan_purchase_history inner join users on users.id = plan_purchase_history.user_id inner join plans on plans.id = plan_purchase_history.plan_id   WHERE plan_purchase_history.id='${plan_purchase_id}'`, (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static updateBillingDetail(id,payment_data){
        return new Promise((resolve,reject)=>{
            db.query(`UPDATE appointments_billing_history SET payment_txt_id='${payment_data.payment_txt_id}', payment_status='${payment_data.payment_status}', payment_currency='${payment_data.payment_currency}', payment_detail='${payment_data.payment_detail}' WHERE id='${id}'`,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static getUserBillingDetail(id){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT appointments_billing_history.id AS billing_history_id, users.first_name, users.role_id FROM appointments_billing_history inner join users on users.id = appointments_billing_history.user_id WHERE appointments_billing_history.id='${id}'`, (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static getBillingDetail(id){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT appointment_ids FROM appointments_billing_history WHERE id='${id}'`, (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static updateAppointmentBillingDetail(id){
        return new Promise((resolve,reject)=>{
            var query = `UPDATE appointments SET admin_status='Complete' WHERE id='${id}'`;
            console.log(query);
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
}
module.exports = paymentGatway;