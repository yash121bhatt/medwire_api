const helperFunction = require("../helper/helperFunction");
const bookingHistory = require("../models/bookingHistory.model");

exports.clinicAppointmenHistory = async (req, res) => {
    try {
        const { user_id,staff_id } = req.body;
        const vali = helperFunction.customValidater(req, {user_id});
        if (vali) {
            return res.status(500).json(vali);
        }
        var added_by = (staff_id) ? staff_id : null;
       
        var result = await bookingHistory.clinicAppointmenHistory(user_id);
       
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }
}
exports.patientBillingHistoryClinic = async (req, res) => {
    try {
        const { user_id } = req.body;
        const vali = helperFunction.customValidater(req, {user_id});
        if (vali) {
            return res.status(500).json(vali);
        }
        const data = [];
        const result = await bookingHistory.patientBillingHistoryClinic(user_id);
        for (const item of result) {
            const appointment_id = item.appointment_id != undefined ? item.appointment_id : null;
            const patient_name = item.patient_name != undefined ? item.patient_name : null;
            const medwire_id = item.permanent_id != undefined ? item.permanent_id : null;
            const pin_code = item.pin_code != undefined ? item.pin_code : null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id ?? '[]') : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : "Self";
            const patient_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.time_slot != undefined ? item.time_slot : null;
            const booked_by = item.appointments_user_type??null;
            const booking_status = item.status != undefined ? item.status : null;
            const payment_status =item.payment_status!=undefined ? item.payment_status:"PANDING";
            const banking_status = "Pending";
            const medwire_status = "Pending";
            const payment_id = item.payment_txt_id!=undefined ? item.payment_txt_id:null;
            const consulting_fee = item.consulting_fee != undefined ? item.consulting_fee : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const reason_of_reschedule = item.reason_of_reschedule ?? '';
            const doctor_id = item.doctor_id != undefined ? item.doctor_id : null;
            const appointments_user_type = item.appointments_user_type != undefined ? item.appointments_user_type : null;
            const doctor = item.doctor_name != undefined ? item.doctor_name : null;
            const clinic_id = item.clinic_id != undefined ? item.clinic_id : null;
            const clinic_name = item.clinic_name != undefined ? item.clinic_name : null;
            const created_at = item.created_at??null;
            
            data.push({
                appointment_id, patient_id, patient_name, medwire_id, pin_code,
                member_id, promo_code_id, appointment_date,
                time_slot, consulting_fee, total_amount,
                payment_id, grand_total,booked_by,
                booking_status, payment_status, banking_status,
                medwire_status,appointments_user_type,
                reason_of_reschedule,
                doctor_id,doctor,
                clinic_id,clinic_name,  
                created_at, mamber_names
            });
        }
        const resultMember = await bookingHistory.patientMemberBillingHistoryClinic(user_id);
        for (const item of resultMember) {
            const appointment_id = item.appointment_id != undefined ? item.appointment_id : null;
            const patient_name = item.patient_name != undefined ? item.patient_name : null;
            const medwire_id = item.permanent_id != undefined ? item.permanent_id : null;
            const pin_code = item.pin_code != undefined ? item.pin_code : null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id ?? '[]') : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : "Self";
            const patient_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.time_slot != undefined ? item.time_slot : null;
            const booked_by = item.appointments_user_type??null;
            const booking_status = item.status != undefined ? item.status : null;
            const payment_status =item.payment_status!=undefined ? item.payment_status:"Pending";
            const banking_status = "Pending";
            const medwire_status = "Pending";
            const payment_id = item.payment_txt_id!=undefined ? item.payment_txt_id:null;
            const consulting_fee = item.consulting_fee != undefined ? item.consulting_fee : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const reason_of_reschedule = item.reason_of_reschedule ?? '';
            const doctor_id = item.doctor_id != undefined ? item.doctor_id : null;
            const appointments_user_type = item.appointments_user_type != undefined ? item.appointments_user_type : null;
            const doctor = item.doctor_name != undefined ? item.doctor_name : null;
            const clinic_id = item.clinic_id != undefined ? item.clinic_id : null;
            const clinic_name = item.clinic_name != undefined ? item.clinic_name : null;
            const created_at = item.created_at??null;
            
            data.push({
                appointment_id, patient_id, patient_name, medwire_id, pin_code,
                member_id, promo_code_id, appointment_date,
                time_slot, consulting_fee, total_amount,
                payment_id, grand_total,booked_by,
                booking_status, payment_status, banking_status,
                medwire_status,appointments_user_type,
                reason_of_reschedule,
                doctor_id,doctor,
                clinic_id,clinic_name,  
                created_at, mamber_names
            });
        }

        let sortedData = data.slice().sort((a, b) =>parseInt(b.appointment_id) - parseInt(a.appointment_id));
        
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: sortedData
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }
}
exports.clinicBookingHistory = async (req, res) => {
    try {
        const { user_id } = req.body;
        const vali = helperFunction.customValidater(req, {user_id});
        if (vali) {
            return res.status(500).json(vali);
        }
        const data = [];
        const result = await bookingHistory.clinicBookingHistory(user_id);
        for (const item of result) {
            const appointment_id = item.appointment_id != undefined ? item.appointment_id : null;
            const patient_name = item.patient_name != undefined ? item.patient_name : null;
            const medwire_id = item.permanent_id != undefined ? item.permanent_id : null;
            const pin_code = item.pin_code != undefined ? item.pin_code : null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id ?? '[]') : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : "Self";
            const patient_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.time_slot != undefined ? item.time_slot : null;
            const booked_by = item.appointments_user_type??null;
            const booking_status = item.status != undefined ? item.status : null;
            const payment_status =item.payment_status!=undefined ? item.payment_status:"Pending";
            const appointments_user_type = item.appointments_user_type != undefined ? item.appointments_user_type : null;
            const banking_status = "Pending";
            const medwire_status = "Pending";
            const payment_id = item.payment_txt_id!=undefined ? item.payment_txt_id:null;
            const consulting_fee = item.consulting_fee != undefined ? item.consulting_fee : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const reason_of_reschedule = item.reason_of_reschedule ?? '';
            const doctor_id = item.doctor_id != undefined ? item.doctor_id : null;
            const doctor = item.doctor_name != undefined ? item.doctor_name : null;
            const clinic_id = item.clinic_id != undefined ? item.clinic_id : null;
            const clinic_name = item.clinic_name != undefined ? item.clinic_name : null;
            const created_at = item.created_at??null;
            
            data.push({
                appointment_id, patient_id, patient_name, medwire_id, pin_code,
                member_id, promo_code_id, appointment_date,appointments_user_type,
                time_slot, consulting_fee, total_amount,
                payment_id, grand_total,
                booked_by,booking_status, 
                payment_status,banking_status, 
                medwire_status,
                reason_of_reschedule,
                doctor_id,doctor,
                clinic_id,clinic_name, 
                created_at, mamber_names
            });
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }
}