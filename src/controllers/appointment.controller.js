const { json } = require("body-parser");
const { date } = require("joi");
const { async } = require("q");
const { log } = require("winston");
const helperQuery = require("../helper/helperQuery");
const bookApointment = require("../models/bookApointment.model");
const User = require("../models/user.model");
const Appointment = require("../models/appointment.model");
const PDFDocument = require("pdfkit-table");
const Prescription = require("../models/prescription.model");
var request = require("request");
const helperFunction = require("../helper/helperFunction");
const Notification = require("../models/stytemNotification.model");
const Document = require("../models/document.model.js");
const { resolve } = require("path");
const fs = require("fs");
const db = require("../config/db.config");
const moment = require("moment");

exports.getInsightAppointments = (req, res) => {
    const { from_date, to_date, user_id, role_id, filter_by, appointment_date, month, year, age_group, gender, pin_code } = req.body;

    var valid = helperFunction.customValidater(req, { user_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.findAllInsightAppointments(from_date, to_date, user_id, role_id, age_group, gender, pin_code, filter_by, appointment_date, month, year, (err, data) => {
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
};

// get all clinics by vineet shirdhonkar


exports.clinicList = (req, res) => {
    const { user_id } = req.body;
    User.findByIdAndRole(user_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findDoctorsClinic(user_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }

                var response_message = (data.length > 0) ? "Data Found Successfully!" : "No Data Found";

                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: response_message,
                    data: data
                });

                return;
            });
        }

    });
};


// get clinic's appointment on doctors by vineet shirdhonkar


exports.appointmentList = (req, res) => {
    const { doctor_id, clinic_id, role_id } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            User.findByIdAndRole(clinic_id, 8, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Clinic / Hospital does not exist"
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
                    Appointment.findAll(clinic_id, doctor_id, role_id, async (err, data) => {
                        if (err) {

                            if (err.kind === "not_found") {
                                res.status(404).send({
                                    status_code: 404,
                                    status: "error",
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
                        // console.log("data",data);
                        const sortData = data.slice().sort((a, b) => b.appointment_id - a.appointment_id);
                        if (data) {
                            const appointList = [];
                            for (const item of sortData) {

                                const appointment_id = item.appointment_id ?? "";
                                const prescription_pdf_name = item.prescription_pdf_name ?? "";
                                const patient_id = item.patient_id ?? "";
                                const patient_name = item.patient_name ?? "";
                                const gender = item.gender ?? "";
                                const date_of_birth = item.date_of_birth ?? "";
                                const mobile_number = item.mobile_number ?? "";
                                const appointment_date = item.appointment_date ?? "";
                                const time_slot = item.time_slot ?? "";
                                const appointment_reason = item.appointment_reason ?? "";
                                const appointment_status = item.appointment_status ?? "";
                                const profile_image_name = item.profile_image_name ?? "";
                                const profile_image_path = item.profile_image_path ?? "";
                                const appointments_user_type = item.appointments_user_type ?? "";
                                let lab_document = "";
                                let lab_document_url = "";
                                let radio_document = "";
                                let radio_document_url = "";
                                let radio_document_dcm = "";
                                let radio_document_dcm_url = "";
                                const labradio = await bookApointment.getLabRadioDoctument(appointment_id);
                                
                                if (labradio.length > 0) {
                                    for (const iterator of labradio) {
                                        if (iterator.type == 1) {
                                            lab_document = iterator.report_document;
                                            lab_document_url = iterator.report_document != null ? process.env.APP_URL + "laboratory/" + iterator.report_document : "";
                                        }
                                        if (iterator.type == 2) {
                                            radio_document = iterator.report_document;
                                            radio_document_url = iterator.report_document != null ? process.env.APP_URL + "laboratory/" + iterator.report_document : "";
                                            radio_document_dcm = iterator.dcm_document??null;
                                            radio_document_dcm_url = iterator.dcm_document!=null ? process.env.APP_URL_DCM + "/" +iterator.dcm_document:"";
                                        }
                                    }
                                }

                                appointList.push({
                                    appointments_user_type,
                                    appointment_id,
                                    prescription_pdf_name,
                                    patient_id,
                                    patient_name,
                                    gender,
                                    date_of_birth,
                                    mobile_number,
                                    appointment_date,
                                    time_slot,
                                    appointment_reason,
                                    appointment_status,
                                    profile_image_name,
                                    profile_image_path,
                                    lab_document,
                                    lab_document_url,
                                    radio_document,
                                    radio_document_url,
                                    radio_document_dcm,
                                    radio_document_dcm_url

                                });
                            }

                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: (data.length > 0) ? "Data Found Successfully!" : "No Data Found",
                                data: appointList
                            });
                            return;

                        }
                    });
                }

            });
        }

    });
};

// add Symptom by vineet shirdhonkar

exports.addSymptom = (req, res) => {

    var all_data = [];
    const sweeterArray = req.body.map(item => {
        var doctor_id = item.doctor_id;
        var appointment_id = item.appointment_id;
        var source = item.source;
        var duration = item.duration;
        var type = item.type;
        all_data.push({ "doctor_id": doctor_id, "appointment_id": appointment_id, "source": source, "type": type, "duration": duration });
    });

    Appointment.addSymptom(all_data, (err, data) => {
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
                message: err.message
            });
            return;
        }

        if (data.insertId) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Symptoms Added Successfully!",
                data: data
            });
            return;

        }
    });

};

// add Vital by vineet shirdhonkar

exports.addVital = (req, res) => {
    const { doctor_id, appointment_id, heart_rate, blood_pressure, respiratory_rate, oxygen_saturation, temperature, bmi } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findById(appointment_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Appointment does not exist"
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
                    Appointment.addVital(doctor_id, appointment_id, heart_rate, blood_pressure, respiratory_rate, oxygen_saturation, temperature, bmi, (err, data) => {
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
                                message: err.message
                            });
                            return;
                        }

                        if (data.insertId) {
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Vitals Added Successfully!",
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


// add Exam Finding by vineet shirdhonkar

exports.addExamFinding = (req, res) => {
    const { doctor_id, appointment_id, examination_finding_name } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findById(appointment_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Appointment does not exist"
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
                    Appointment.addExamFinding(doctor_id, appointment_id, examination_finding_name, (err, data) => {
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
                                message: err.message
                            });
                            return;
                        }

                        if (data.insertId) {
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Examination Finding Added Successfully!",
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


// add advice by vineet shirdhonkar

exports.addAdvice = (req, res) => {
    const { doctor_id, appointment_id, advices } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findById(appointment_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Appointment does not exist"
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
                    Appointment.addAdvice(doctor_id, appointment_id, advices, (err, data) => {
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
                                message: err.message
                            });
                            return;
                        }

                        if (data.insertId) {
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Advice Added Successfully!",
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


// add follow up by vineet shirdhonkar

exports.addFollowUp = (req, res) => {
    const { doctor_id, appointment_id, follow_up_intervals } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findById(appointment_id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Appointment does not exist"
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
                    Appointment.addFollowUp(doctor_id, appointment_id, follow_up_intervals, (err, data) => {
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
                                message: err.message
                            });
                            return;
                        }

                        if (data.insertId) {
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Follow Up Added Successfully!",
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


// add Dignostic by vineet shirdhonkar

exports.addDignostic = (req, res) => {
    const { doctor_id, appointment_id, diagnostic_names, lab_id, test_ids, is_book_lab_test, appointment_date, appointment_time } = req.body;
    const { radio_id, radio_appointment_date, radio_time_slot, radio_test_ids, is_radio_appointment, is_booK_radio_test } = req.body;
    const { lab_appointment_date, lab_time_slot, lab_test_ids, is_lab_appointment, is_booK_lab_test } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data1) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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

        if (data1) {
            Appointment.findById(appointment_id, (err, data2) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Appointment does not exist"
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
                // console.log(data2);
                // return
                if (data2) {
                    var patient_id = data2?.patient_id;
                    // console.log(data2);
                    // return
                    // console.log("is_book_lab_test",is_booK_lab_test)
                    Appointment.addDignostic(doctor_id, appointment_id, diagnostic_names, lab_id, lab_test_ids, is_booK_lab_test, radio_id, radio_test_ids, is_booK_radio_test, lab_appointment_date, lab_time_slot, radio_appointment_date, radio_time_slot, is_lab_appointment, is_radio_appointment, async (err, data) => {
                        if (err) {
                            if (err.kind === "not_inserted") {
                                res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: "Failed ! Please try again later"
                                });
                                return;
                            }else if(err.kind === "appointment")
                            {
                                return res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: err.message
                                });
                            }
                            else if(err.kind === "l_appointment")
                            {
                                return res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: err.message
                                });
                            }
                            else if(err.kind === "appointment_slot")
                            {
                                return res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: err.message
                                });
                            }
                            else if(err.kind === "appointment_slot")
                            {
                                return res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: err.message
                                });
                            }
                            res.status(500).send({
                                status_code: 500,
                                status: "error",
                                message: err.message
                            });
                            return;
                        }

                        if (data == 1) {
                            const doctorData = await helperQuery.All(`SELECT id, first_name FROM users WHERE id ='${doctor_id}'`);
                            const message = `Dr. ${doctorData[0]?.first_name ?? null} has booked an appointment for`;
                            var p_detail = await helperQuery.Get({table:"users",where:" id="+patient_id});
                            let costLabRadioMSG = `Hey ${p_detail[0].first_name} <br>Your Appointment is booked by Dr. ${doctorData[0]?.first_name ?? null} with`;
                            if (is_booK_radio_test == 1) {
                                if (is_radio_appointment == 1) {
                                    const radiValid = helperFunction.customValidater(req, { radio_id, radio_appointment_date, radio_time_slot, radio_test_ids, is_radio_appointment, is_booK_radio_test });
                                    if (radiValid) {
                                        return res.status(400).json(radiValid);
                                    }
                                    const radioJson = {
                                        doctor_id: doctor_id,
                                        user_id: radio_id,
                                        appointmentsId: req.body.appointment_id,
                                        refer_by_id: doctor_id,
                                        patient_id: patient_id,
                                        time_slot: radio_time_slot,
                                        appointment_date: radio_appointment_date,
                                        test_ids: radio_test_ids,
                                        appointments_user_type: "doctor"
                                    };
                                    bydoctorAppoinment(res, radioJson);
                                   
                                    const patient_noticData = {
                                        message: costLabRadioMSG,
                                        by: "doctor_lab_radio_patient",
                                        from_user_id: radio_id,
                                        to_user_id: patient_id,
                                        title: "Appointment Booked",
                                        type: "radio_appointment_booked",
                                        appointment_date: radio_appointment_date,
                                        time_slot: radio_time_slot,
                                    };
                                    Notification.AddNotification(patient_noticData);
                                  
                                    

                                    if (p_detail) {
                                        var payload = {
                                            notification: {
                                                title: "Appointment Booked",
                                                body: "Hey "+p_detail[0].first_name+"your appointment with "+message+helperFunction.dateFormat(radio_appointment_date,"yyyy/mm/dd")+" & "+radio_time_slot,
                                            }
                                        };
                                        if ((p_detail[0].device_type == "Android")||(p_detail[0].device_type == "IOS")) {
                                            await helperFunction.pushNotification(p_detail[0].device_token, payload);
                                        }
                                    }
                                  
                                    const noticData = {
                                        message: message,
                                        by: "doctor",
                                        from_user_id: patient_id,
                                        to_user_id: radio_id,
                                        title: "Appointment Booked",
                                        type: "radio_appointment_booked",
                                        appointment_date: radio_appointment_date,
                                        time_slot: radio_time_slot,
                                    };
                                    Notification.AddNotification(noticData);
                                    var r_detail = await helperQuery.Get({table:"users",where:" id="+radio_id});

                                    if (r_detail) {
                                        var payload = {
                                            notification: {
                                                title: "Appointment Booked",
                                                body: message + " radio"
                                            }
                                        };
                                        if (r_detail[0].device_type == "Android") {
                                            await helperFunction.pushNotification(r_detail[0].device_token, payload);
                                        }
                                    }
                                }
                            }
                            if (is_booK_lab_test == 1) {
                                if (is_lab_appointment == 1) {
                                    const labValid = helperFunction.customValidater(req, { lab_id, lab_appointment_date, lab_time_slot, lab_test_ids, is_lab_appointment, is_booK_lab_test });
                                    if (labValid) {
                                        return res.status(400).json(labValid);
                                    }
                                    const labJson = {
                                        doctor_id: doctor_id,
                                        user_id: lab_id,
                                        appointmentsId: req.body.appointment_id,
                                        refer_by_id: doctor_id,
                                        patient_id: patient_id,
                                        time_slot: lab_time_slot,
                                        appointment_date: lab_appointment_date,
                                        test_ids: lab_test_ids,
                                        appointments_user_type: "doctor"
                                    };
                                    bydoctorAppoinment(res, labJson);

                                    const patient_noticData = {
                                        message: costLabRadioMSG,
                                        by: "doctor_lab_radio_patient",
                                        from_user_id: lab_id,
                                        to_user_id: patient_id,
                                        title: "Appointment Booked",
                                        type: "lab_appointment_booked",
                                        appointment_date: lab_appointment_date,
                                        time_slot: lab_time_slot,
                                    };
                                    Notification.AddNotification(patient_noticData);
                                    const noticData = {
                                        message: message,
                                        by: "doctor",
                                        from_user_id: patient_id,
                                        to_user_id: lab_id,
                                        title: "Appointment Booked",
                                        type: "lab_appointment_booked",
                                        appointment_date: lab_appointment_date,
                                        time_slot: lab_time_slot,
                                    };
                                    Notification.AddNotification(noticData);
                                    var p_detail = await helperQuery.Get({table:"users",where:" id="+patient_id});

                                    if (p_detail) {
                                        var payload = {
                                            notification: {
                                                title: "Appointment Booked",
                                                body: "Hey "+p_detail[0].first_name+" your appointment with "+message+helperFunction.dateFormat(lab_appointment_date,"yyyy/mm/dd")+" & "+lab_time_slot,
                                            }
                                        };
                                        if ((p_detail[0].device_type == "Android")||(p_detail[0].device_type == "IOS")) {
                                            await helperFunction.pushNotification(p_detail[0].device_token, payload);
                                        }
                                    }
                                }
                            }
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Dignostic Added Successfully!",
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

async function bydoctorAppoinment(res, data) {
    try {

        const doctor_id = data.doctor_id ?? null;
        const user_id = data.user_id ?? null;
        const appointmentsId = data.appointmentsId ?? null;
        const refer_by_id = data.doctor_id ?? null;
        const patient_id = data.patient_id ?? null;
        const time_slot = data.time_slot ?? null;
        const appointment_date = data.appointment_date ?? null;
        const test_ids = data.test_ids ?? null;
        const appointments_user_type = data.appointments_user_type ?? null;

        if (Array.isArray(test_ids) != true) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "member_id must be array!",
            });
        }
        const cartItem = [];
        const userdata = await helperQuery.All(`SELECT test_id, test_category_id, lab_id, test_name, test_report, fast_time, test_recommended, image, description, amount FROM lab_tests WHERE test_id IN (${test_ids}) AND lab_id='${user_id}'`);

        const category = [];
        const catId = [];
        const sub_category = [];

        if (userdata.length > 0) {
            for (const iterator of userdata) {
                catId.push(iterator.test_category_id ?? 0);
                category.push(iterator.test_name ?? "-");
                cartItem.push({
                    test_id: iterator.test_id ?? null,
                    test_category_id: iterator.test_category_id ?? null,
                    test_name: iterator.test_name ?? null,
                    test_report: iterator.test_report ?? null,
                    time_slot: iterator.fast_time ?? null,
                    test_recommended: iterator.test_recommended ?? null,
                    image: iterator.image ?? null,
                    //description:iterator.description??null,
                    amount: iterator.amount ?? null,
                });

            }
        }

        const categoryData = await helperQuery.All(`SELECT category_name FROM test_categories WHERE  cat_id IN ('${catId}')`);
        for (const iterators of categoryData) {
            category.push(iterators.category_name);
        }

        var total = helperFunction.totalAmount(cartItem);
        //   var cart_items =''; 
        //var cart_items =cartItem;

        var cart_items = JSON.stringify(cartItem);
        //main logic appointment_id
        const AppointmentData = await helperQuery.First({ table: "appointments", where: "appointment_id=" + appointmentsId + " AND user_id=" + user_id + " AND patient_id=" + patient_id });

        if (helperFunction.isEmptyObject(AppointmentData) === false) {
            const total_amount = total;
            const grand_total = total;
            const dataUpdate = await helperQuery.All(`UPDATE user_carts SET cart_item='${cart_items}'  WHERE appointment_id='${AppointmentData.id}'  AND status='1' AND appointment_id IS NULL`);
            const resultUpdate = await bookApointment.updateAppointBydoctor({ user_id, doctor_id, appointmentsId, time_slot, appointment_date, appointments_user_type, total_amount, grand_total, patient_id });
            const visitDataUpdate = await helperQuery.All(`UPDATE new_visit SET lab_id='${user_id}',category='${category}',sub_category='${sub_category}',created_at=NOW() WHERE appointment_id='${AppointmentData.id}' AND member_id='${patient_id}'`);
        } else {
            const insertCartData = await helperQuery.All(`INSERT INTO user_carts (user_id,created_by_id,cart_item,status) VALUES('${user_id}','${patient_id}','${cart_items}','1')`);

            if (insertCartData.affectedRows == 1) {
                const total_amount = total;
                const grand_total = total;
                //     console.log(total_amount,grand_total);
                //   return 
                const result = await bookApointment.createAppointBydoctor(user_id, doctor_id, appointmentsId, time_slot, appointment_date, appointments_user_type, total_amount, grand_total, patient_id);
                if (result.affectedRows == 1) {
                    const insertId = result.insertId ?? 0;
                    const data = await helperQuery.All("UPDATE user_carts SET appointment_id=" + insertId + " WHERE user_id=" + user_id + " AND status='1' AND appointment_id IS NULL");

                    if (data.changedRows >= 1) {
                        const userdata = await helperQuery.All(`SELECT*FROM users WHERE id='${patient_id}' LIMIT 1`);
                        // console.log(userdata);
                        if (userdata != null && userdata[0] != null) {
                            if (userdata[0].mobile != null && userdata[0].mobile != undefined) {
                                var mobile_no = userdata[0].mobile;
                            } else {
                                const usermemberData = await helperQuery.All(`SELECT*FROM users WHERE id='${userdata[0].created_by_id}' LIMIT 1`);
                                if (usermemberData[0] != undefined && usermemberData[0].mobile != undefined && usermemberData[0].mobile != null) {
                                    var mobile_no = usermemberData[0].mobile;
                                } else {
                                    var mobile_no = null;
                                }
                            }
                        }


                        const visitData = await helperQuery.All(`INSERT INTO new_visit (appointment_id,lab_id,member_id,mobile,online_ofline_status,category,sub_category,created_at) VALUES('${insertId}','${user_id}','${patient_id}','${mobile_no}','1','${category}','${sub_category}',NOW())`);

                        console.log("Appointment Add Successfully!");

                    } else {
                        console.log("Opps! There is no product in your cart, Please add some product");

                    }

                }
            }
        }

    } catch (error) {
        console.log("lab/radio error=>", error);
    }
}

// add Drug by vineet shirdhonkar

exports.addDrug = (req, res) => {

    if (req.body.length == 0) {
        res.status(404).send({
            status_code: 404,
            status: "error",
            message: "Please enter atleast one drug name,duration,type,frequency,timing",
        });
        return;
    }

    // var all_data = [];
    const { 
        doctor_id,
        appointment_id,
        drugs,
        drug_duration,
        drug_type,
        drug_frequency,
        drug_timing
    }=req.body;

    // const sweeterArray = req.body.map(item => {
    //     var doctor_id = item.doctor_id;
    //     var appointment_id = item.appointment_id;
    //     var drug_names = item.drugs;
    //     var drug_duration = item.drug_duration;
    //     var drug_type = item.drug_type;
    //     var drug_frequency = item.drug_frequency;
    //     var drug_timing = item.drug_timing;

    //     all_data.push({ 'drug_names': drug_names, 'doctor_id': doctor_id, 'appointment_id': appointment_id, 'drug_duration': drug_duration, 'drug_type': drug_type, 'drug_frequency': drug_frequency, 'drug_timing': drug_timing });
    // });

    const all_data = { "drug_names": drugs, "doctor_id": doctor_id, "appointment_id": appointment_id, "drug_duration": drug_duration, "drug_type": drug_type, "drug_frequency": drug_frequency, "drug_timing": drug_timing };
    
    Appointment.addDrug(all_data, (err, data) => {
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
                message: err.message
            });
            return;
        }

        if (data.insertId) {
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Drug Added Successfully!",
                data: data
            });
            return;

        }
    });

};

// prescription detail


exports.prescriptionDetail = (req, res) => {
    const { doctor_id, appointment_id } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findById(appointment_id, async (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Appointment does not exist"
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

                    var patient_id = data.patient_id;
                    var all_data = {};

                    User.findByIdAndRole(patient_id, 2, (err, data) => {
                        if (err) {
                            if (err.kind === "not_found") {
                                res.status(404).send({
                                    status_code: 404,
                                    status: "error",
                                    message: "Patient does not exist"
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
                            all_data["patient_name"] = data.first_name + " " + data.last_name;
                        }

                    });


                    const symptomdata = await Appointment.symptomList(doctor_id, appointment_id);
                    all_data["symptom_list"] = symptomdata;

                    const vitaldata = await Appointment.vitalList(doctor_id, appointment_id);
                    all_data["health_status_list"] = vitaldata;


                    const examfindingdata = await Appointment.examFindingList(doctor_id, appointment_id);
                    all_data["exam_finding_list"] = examfindingdata;


                    const advicedata = await Appointment.adviceList(doctor_id, appointment_id);
                    all_data["advice_list"] = advicedata;

                    const dignosticdata = await Appointment.dignosticList(doctor_id, appointment_id);
                    all_data["dignostic_list"] = dignosticdata;

                    const followupdata = await Appointment.followUpList(doctor_id, appointment_id);
                    all_data["follow_up_list"] = followupdata;


                    const drugdata = await Appointment.drugList(doctor_id, appointment_id);
                    all_data["drug_list"] = drugdata;


                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Data Found Successfully!",
                        data: all_data
                    });
                    return;



                }
            });
        }
    });
};

//  lab List by vineet shirdhonkar


exports.labList = (req, res) => {
    const { doctor_id } = req.body;
    User.findByIdAndRole(doctor_id, 5, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Doctor does not exist"
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
            Appointment.findAllLabs(doctor_id, (err, data) => {
                if (err) {

                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
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

                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: (data.length > 0) ? "Data Found Successfully!" : "No Data Found",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};



// generate PDF by vineet shirdhonkar

exports.generatePDF = async (req, res) => {
    try {
        var appointment_id = req.body.appointment_id;
        const dataAppoi = await Appointment.findByIdAsync(appointment_id);
        if (dataAppoi) {
            if (dataAppoi.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Appointment does not exist"
                });
                return;
            }

            var clinic_id = dataAppoi.clinic_id;
            var doctor_id = dataAppoi.doctor_id;
            var patient_id = dataAppoi.patient_id;
            const dataClinic = await User.findByIdAndRoleAsync(clinic_id, 8,);
            if (dataClinic) {
                if (dataClinic.kind === "not_found") {
                    res.status(404).send({
                        status_code: 404,
                        status: "error",
                        message: "clinic not found."
                    });
                    return;
                }
                const dataDoctor = await User.findDoctorByIdAndRoleAsynca(doctor_id);
                if (dataDoctor) {
                  
                    if (dataDoctor.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Doctor does not exist"
                        });
                        return;
                    }
                    var signature = dataDoctor[0].signature;
                    var doctor_name = dataDoctor[0].full_name;
                    var specialities = dataDoctor[0].specialities;
                    var degrees = dataDoctor[0].degrees;
                    const data1 = await User.findByIdAndRoleAsync(patient_id, 2,);
                    if (data1.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "Patient does not exist"
                        });
                        return;
                    }

                    var all_data = {};

                    if (data1 != null && data1 != "null" && data1 != undefined) {

                        var patient_name = data1.first_name;
                        var patient_age = helperFunction.getFullAge(data1.date_of_birth ?? "00-00-0000");
                        var patient_blood_group = data1.blood_group;


                        const symptomdata = await Appointment.symptomList(doctor_id, appointment_id);
                        all_data["symptom_list"] = symptomdata;

                        const vitaldata = await Appointment.vitalList(doctor_id, appointment_id);
                        all_data["health_status_list"] = vitaldata;


                        const examfindingdata = await Appointment.examFindingList(doctor_id, appointment_id);
                        all_data["exam_finding_list"] = examfindingdata;


                        const advicedata = await Appointment.adviceList(doctor_id, appointment_id);
                        all_data["advice_list"] = advicedata;

                        const dignosticdata = await Appointment.dignosticList(doctor_id, appointment_id);
                        all_data["dignostic_list"] = dignosticdata;

                        const followupdata = await Appointment.followUpList(doctor_id, appointment_id);
                        all_data["follow_up_list"] = followupdata;


                        const drugdata = await Appointment.drugList(doctor_id, appointment_id);
                        all_data["drug_list"] = drugdata;

                        const data = await Prescription.getDetail(clinic_id);

                        if (data.length > 0) {

                            var clinic_name = data[0]?.clinic_name;
                            var clinic_logo = data[0]?.clinic_logo;
                            var mobile_number = data[0]?.mobile_number;
                            var alternate_mobile_number = data[0]?.alternate_mobile_number;
                            var email_id = data[0]?.email_id;
                            var clinic_timing = data[0]?.clinic_timing;
                            var clinic_address = data[0]?.clinic_address;

                            const today = new Date();
                            const yyyy = today.getFullYear();
                            let mm = today.getMonth() + 1; // Months start at 0!
                            let dd = today.getDate();

                            if (dd < 10) dd = "0" + dd;
                            if (mm < 10) mm = "0" + mm;

                            const current_date = dd + "/" + mm + "/" + yyyy;
                            let buffers = [];

                            var today_time = helperFunction.getCurrentTime();

                            var myDoc = new PDFDocument({
                                bufferPages: true
                            });


                            myDoc.on("data", buffers.push.bind(buffers));
                            var pdf_name = today_time + "prescription.pdf";
                            myDoc.pipe(fs.createWriteStream("public/prescription_pdfs/" + pdf_name));
                            myDoc.pipe(fs.createWriteStream("public/member/" + pdf_name));

                            var myDoc1 = new PDFDocument({
                                bufferPages: true
                            });


                            myDoc1.on("data", buffers.push.bind(buffers));
                            var pdf_name1 = today_time + "prescription_for_admin.pdf";
                            myDoc1.pipe(fs.createWriteStream("public/prescription_pdfs/" + pdf_name1));



                            const absolutePathOfLogo = resolve(process.env.APP_URL + "/member/" + clinic_logo);
                            const logo_arr = absolutePathOfLogo.split("/");

                            var index = logo_arr.indexOf(logo_arr[3]);
                            if (index >= 0) logo_arr.splice(index, 1);
                            var index = logo_arr.indexOf(logo_arr[3]);
                            if (index >= 0) logo_arr.splice(index, 1);
                            logo_arr.splice(index, 0, "public");

                            const absolutePathOfSign = resolve(process.env.APP_URL + "/public/signature/" + signature);
                            const sign_arr = absolutePathOfSign.split("/");
                            var index = sign_arr.indexOf(sign_arr[3]);
                            if (index >= 0) sign_arr.splice(index, 1);
                            var index = sign_arr.indexOf(sign_arr[3]);
                            if (index >= 0) sign_arr.splice(index, 1);

                            myDoc.font("Times-Roman").fontSize(12);
                            myDoc1.font("Times-Roman").fontSize(12);
                            if ((clinic_logo != null)&&(clinic_logo !="")&&(clinic_logo != undefined)) {

                                myDoc.image(process.env.PDF_IMG_PATH + "member/" + clinic_logo, 75, 20, { width: 50, height: 50 });
                            } 

                            if (degrees.split(",").length > 1) {
                                var degree_heading = "Degrees";
                            } else {
                                var degree_heading = "Degree";
                            }


                            if (specialities.split(",").length > 1) {
                                var speciality_heading = "Specialities";
                            } else {
                                var speciality_heading = "Speciality";
                            }

                            if (alternate_mobile_number == "undefined" || alternate_mobile_number == null) {
                                alternate_mobile_number = "";
                            }

                            if (patient_blood_group == "undefined" || patient_blood_group == null) {
                                patient_blood_group = "N/A";
                            }


                            myDoc.moveDown(0.5);
                            myDoc.font("Helvetica-Bold").text(clinic_name, {
                                align: "left"
                            })
                                .moveDown(0.5)
                                .text("Email : " + email_id, {
                                    align: "left"
                                })
                                // .text("Landline No. : " + mobile_number, {
                                //     align: 'left'
                                // })
                                .text("Mobile No. : " + (alternate_mobile_number == "" ? "N/A" : alternate_mobile_number), {
                                    align: "left"
                                })
                                .text("Clinic Timing : " + clinic_timing, {
                                    align: "left"
                                })
                                .moveUp(4)
                                .text("Doctor Name : " + doctor_name, 248, 100, {
                                    align: "right"
                                })
                                .text(speciality_heading + " : " + specialities, 348, 110, {
                                    align: "right",
                                    lineBreak: true
                                })
                                .text(degree_heading + " : " + degrees, {
                                    align: "right"
                                })

                                .font("Courier-Bold").text("Patient Details", 70, 190, {
                                    align: "left"
                                })
                                .font("Times-Roman")
                                .text("Name  : " + patient_name, {
                                    align: "left"
                                })
                                .text("Age : " + patient_age, {
                                    align: "left"
                                })
                                .text("Blood Group : " + patient_blood_group, {
                                    align: "left"
                                })
                                .text(current_date, {
                                    align: "right"
                                });

                            myDoc1.text("Doctor Name : " + doctor_name, 248, 100, {
                                align: "right"
                            })
                            .text(speciality_heading + " : " + specialities, 348, 110, {
                                    align: "right",
                                    lineBreak: true
                                })
                            .text(degree_heading + " : " + degrees, {
                                    align: "right"
                            })
                            .moveDown(1.5)
                            .text(current_date, {
                                    align: "right"
                            });



                            var cheif_complaint_data = [];

                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    cheif_complaint_data = all_data.symptom_list.filter(item => item.type === "chief_complaint");
                                }
                            }

                            var cheif_complaint_rows = [];
                            if (cheif_complaint_data) {
                                if (cheif_complaint_data.length > 0) {
                                    for (item of cheif_complaint_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        cheif_complaint_rows.push([item.source ?? ""]);
                                    }

                                    const table1 = {
                                        title: "History & Symptoms",
                                        headers: ["Chief Complaint"],
                                        rows: cheif_complaint_rows
                                    };

                                    myDoc.table(table1, {});
                                    myDoc1.table(table1, { x: 75 });
                                }
                            }

                            var illness_data = [];
                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    illness_data = all_data.symptom_list.filter(item => item.type === "illness");
                                }
                            }

                            var illness_rows = [];
                            if (illness_data) {
                                if (illness_data.length > 0) {
                                    for (item of illness_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        illness_rows.push([item.source]);
                                    }

                                    const table2 = {

                                        headers: ["History of presenting illness"],
                                        rows: illness_rows
                                    };

                                    myDoc.table(table2, {});
                                    myDoc1.table(table2, {});
                                }
                            }

                            var past_medical_history_data = [];
                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    past_medical_history_data = all_data.symptom_list.filter(item => item.type === "past_medical_history");
                                }
                            }


                            var past_medical_history_rows = [];
                            if (past_medical_history_data) {
                                if (past_medical_history_data.length > 0) {
                                    for (item of past_medical_history_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        past_medical_history_rows.push([item.source]);
                                    }

                                    const table3 = {
                                        headers: ["Past Medical History"],
                                        rows: past_medical_history_rows
                                    };

                                    myDoc.table(table3, {});
                                    myDoc1.table(table3, {});
                                }
                            }


                            var alergy_data = [];
                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    alergy_data = all_data.symptom_list.filter(item => item.type === "alergy");
                                }
                            }

                            var alergy_rows = [];
                            if (alergy_data) {
                                if (alergy_data.length > 0) {
                                    for (item of alergy_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        alergy_rows.push([item.source]);
                                    }

                                    const table4 = {
                                        headers: ["Allergy"],
                                        rows: alergy_rows
                                    };

                                    myDoc.table(table4, {});
                                    myDoc1.table(table4, {});
                                }
                            }

                            var parent_history_data = [];
                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    parent_history_data = all_data.symptom_list.filter(item => item.type === "parent_history");
                                }
                            }

                            var parent_history_rows = [];
                            if (parent_history_data) {
                                if (parent_history_data.length > 0) {
                                    for (item of parent_history_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        parent_history_rows.push([item.source]);
                                    }

                                    const table4 = {
                                        headers: ["Family History"],
                                        rows: parent_history_rows
                                    };

                                    myDoc.table(table4, {});
                                    myDoc1.table(table4, {});
                                }
                            }

                            var addiction_history_data = [];
                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    addiction_history_data = all_data.symptom_list.filter(item => item.type === "addiction_history");
                                }
                            }

                            var addiction_history_rows = [];
                            if (addiction_history_data) {
                                if (addiction_history_data.length > 0) {
                                    for (item of addiction_history_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        addiction_history_rows.push([item.source]);
                                    }

                                    const table5 = {
                                        headers: ["Addiction History"],
                                        rows: addiction_history_rows
                                    };

                                    myDoc.table(table5, {});
                                    myDoc1.table(table5, {});
                                }


                            }

                            var menstrual_data = [];
                            if (all_data.symptom_list) {
                                if (all_data.symptom_list.length > 0) {
                                    menstrual_data = all_data.symptom_list.filter(item => item.type === "menstrual");
                                }
                            }


                            var menstrual_rows = [];
                            if (menstrual_data) {
                                if (menstrual_data.length > 0) {
                                    for (item of menstrual_data) {
                                        if (item.source == null) {
                                            item.source = "";
                                        }
                                        menstrual_rows.push([item.source]);
                                    }

                                    const table6 = {
                                        headers: ["Menstrual/OBS"],
                                        rows: menstrual_rows
                                    };

                                    myDoc.table(table6, {});
                                    myDoc1.table(table6, {});
                                }
                            }

                            var health_status_list_data = [];
                            if (all_data.health_status_list) {
                                if (all_data.health_status_list.length > 0) {
                                    health_status_list_data = all_data.health_status_list;
                                }
                            }
                            
                         
                            myDoc.moveDown(3);
                            myDoc1.moveDown(3);
                            var health_status_rows = [];
                            if (health_status_list_data) {
                                if (health_status_list_data.length > 0) {
                                    for (item of health_status_list_data) {
                                        if (item.heart_rate == null) {
                                            item.heart_rate = "";
                                        }
                                        if (item.respiratory_rate == null) {
                                            item.respiratory_rate = "";
                                        }
                                        if (item.blood_pressure == null) {
                                            item.blood_pressure = "";
                                            var high_blood_pressure = "";
                                            var low_blood_pressure = "";
                                        } else {
                                            var bp = item.blood_pressure.split("/");
                                            var high_blood_pressure = bp[0];
                                            var low_blood_pressure = bp[1];
                                        }

                                        if (item.oxygen_saturation == null) {
                                            item.oxygen_saturation = "";
                                        }
                                        if (item.temperature == null) {
                                            item.temperature = "";
                                        }

                                        if (item.bmi == null) {
                                            item.bmi = "";
                                        }
                                        health_status_rows.push([item.heart_rate, item.respiratory_rate, high_blood_pressure, low_blood_pressure, item.oxygen_saturation, item.temperature]);
                                    }
                                    var text = 2;

                                    var two_number = "";
                                    const table7 = {
                                        title: "Vitals",
                                        headers: ["Heart Rate(beats/min)", "Respiratory Rate(breaths/min)", "Systolic(mmHg)", "Diastolic(mmHg)", "Oxygen Saturation(%)", "Temperature(F)"],
                                        rows: health_status_rows
                                    };

                                    myDoc.table(table7, {});
                                    myDoc1.table(table7, {});
                                }
                            }
                            
                            myDoc.fontSize(8);

                            myDoc.text("Clinic Address : " + clinic_address, 10, myDoc.page.height - 50, {
                                lineBreak: false,
                                align: "left"
                            });
                            myDoc.addPage();
                            myDoc1.addPage();

                            myDoc.font("Times-Roman").fontSize(12);
                            myDoc1.font("Times-Roman").fontSize(12);

                            if ((clinic_logo != null)&&(clinic_logo !="")&&(clinic_logo != undefined)) {
                                myDoc.image(process.env.PDF_IMG_PATH + "member/" + clinic_logo, 75, 20, { width: 50, height: 50 });
                            } 

                            myDoc.font("Helvetica-Bold").text(clinic_name, {
                                align: "left"
                            })
                            .moveDown(0.5)
                            .text("Email : " + email_id, {
                                align: "left"
                            })
                            .text("Mobile No. : " + (alternate_mobile_number == "" ? "N/A" : alternate_mobile_number), {
                                align: "left"
                                })
                            .text("Clinic Timing : " + clinic_timing, {
                                align: "left"
                            })
                            .text("Doctor Name : " + doctor_name, 248, 100, {
                                align: "right"
                                })
                                .text(speciality_heading + " : " + specialities, 348, 110, {
                                align: "right",
                                lineBreak: true
                                })
                                .text(degree_heading + " : " + degrees, {
                                align: "right"
                                })
                                .font("Courier-Bold").text("", 70, 190, {
                            });

                            
   
                               
                                

                            // pdf 2nd page content

                            var diagnostic_list_data = [];
                            if (all_data.dignostic_list) {
                                if (all_data.dignostic_list.length > 0) {
                                    diagnostic_list_data = all_data.dignostic_list;
                                }
                            }


                            var diagnostic_rows = [];
                            if (diagnostic_list_data) {
                                if (diagnostic_list_data.length > 0) {

                                    for (item of diagnostic_list_data) {
                                        if (item.dignostic_names == null) {
                                            item.dignostic_names = "";
                                        }
                                        if (item.lab_name == null) {
                                            item.lab_name = "";
                                        }
                                        if (item.test_name == null) {
                                            item.test_name = "";
                                        }

                                        if (item.appointment_date == null) {
                                            item.appointment_date = "";
                                        }
                                        if (item.appointment_time == null) {
                                            item.appointment_time = "";
                                        }
                                        diagnostic_rows.push([item.dignostic_names, item.lab_name, item.test_name, (item.appointment_date) ? moment(item.appointment_date).format("DD/MM/YYYY") : "", item.appointment_time]);

                                    }
                                    const table9 = {
                                        title: "Diagonostic Test",
                                        headers: ["Diagnostic", "Lab / Radiology Name", "Test Name", "Appointment Date", "Appointment Time"],
                                        rows: diagnostic_rows
                                    };

                                    myDoc.table(table9, {});
                                    myDoc1.table(table9, {});
                                }
                            }
                      
                            myDoc.moveDown(3);
                            myDoc1.moveDown(3);
                            var examination_finding_list_data = [];
                            if (all_data.exam_finding_list) {
                                if (all_data.exam_finding_list.length > 0) {
                                    examination_finding_list_data = all_data.exam_finding_list;
                                }
                            }
                            var examination_finding_rows = [];
                            if (examination_finding_list_data) {
                                if (examination_finding_list_data.length > 0) {
                                    for (item of examination_finding_list_data) {
                                        if (item.examination_finding_name == null) {
                                            item.examination_finding_name = "";
                                        }

                                        examination_finding_rows.push([item.examination_finding_name]);
                                    }

                                    const table8 = {
                                        // title: 'Examination Findings',
                                        headers: ["Examination Findings"],
                                        rows: examination_finding_rows
                                    };
                                    myDoc.table(table8, {});
                                    myDoc1.table(table8, {});
                                }
                            }


                            // pdf 2nd page content

                            myDoc.fontSize(8);

                            myDoc.text("Clinic Address : " + clinic_address, 10, myDoc.page.height - 50, {
                                lineBreak: false,
                                align: "left"
                            });
                                

                            myDoc.addPage();
                            myDoc1.addPage();

                           
                            myDoc.font("Times-Roman").fontSize(12);
                            myDoc1.font("Times-Roman").fontSize(12);
                            
                            if ((clinic_logo != null)&&(clinic_logo !="")&&(clinic_logo != undefined)) {
                                myDoc.image(process.env.PDF_IMG_PATH + "member/" + clinic_logo, 75, 20, { width: 50, height: 50 });
                            } 


                            myDoc.font("Helvetica-Bold").text(clinic_name, {
                                align: "left"
                            })
                            .moveDown(0.5)
                            .text("Email : " + email_id, {
                                align: "left"
                            })
                            .text("Mobile No. : " + (alternate_mobile_number == "" ? "N/A" : alternate_mobile_number), {
                                align: "left"
                                })
                            .text("Clinic Timing : " + clinic_timing, {
                                align: "left"
                            })
                            .text("Doctor Name : " + doctor_name, 248, 100, {
                                align: "right"
                                })
                                .text(speciality_heading + " : " + specialities, 348, 110, {
                                align: "right",
                                lineBreak: true
                                })
                                .text(degree_heading + " : " + degrees, {
                                align: "right"
                                })
                                .font("Courier-Bold").text("", 70, 190, {
                            });


                            // pdf 3rd page content

                            var advice_list_data = [];
                            if (all_data.advice_list) {
                                if (all_data.advice_list.length > 0) {
                                    advice_list_data = all_data.advice_list;
                                }
                            }

                            var advice_rows = [];
                            if (advice_list_data) {
                                if (advice_list_data.length > 0) {
                                    for (item of advice_list_data) {
                                        if (item.advice_name == null) {
                                            item.advice_name = "";
                                        }

                                        advice_rows.push([item.advice_name]);
                                    }

                                    const table10 = {
                                        // title: 'Advice',
                                        headers: ["Advice"],
                                        rows: advice_rows
                                    };

                                    myDoc.table(table10, {});
                                    myDoc1.table(table10, {});
                                }
                            }

                            myDoc.moveDown(3);
                            myDoc1.moveDown(3);

                            var follow_up_list_data = [];
                            if (all_data.follow_up_list) {
                                if (all_data.follow_up_list.length > 0) {
                                    follow_up_list_data = all_data.follow_up_list;
                                }
                            }

                            var follow_up_rows = [];
                            if (follow_up_list_data) {
                                if (follow_up_list_data.length > 0) {
                                    for (item of follow_up_list_data) {
                                        if (item.follow_up_interval == null) {
                                            item.follow_up_interval = "";
                                        }

                                        follow_up_rows.push([item.follow_up_interval]);
                                    }

                                    const table12 = {
                                        // title: 'Follow UP',
                                        headers: ["Follow Up"],
                                        rows: follow_up_rows
                                    };

                                    myDoc.table(table12, {});
                                    myDoc1.table(table12, {});
                                }
                            }

                            myDoc.moveDown(3);
                            myDoc1.moveDown(3);

                            var drug_list_data = [];
                            if (all_data.drug_list) {
                                if (all_data.drug_list.length > 0) {
                                    drug_list_data = all_data.drug_list;
                                }
                            }

                            var drug_rows = [];
                            if (drug_list_data) {
                                if (drug_list_data.length > 0) {
                                    for (item of drug_list_data) {
                                        if (item.drug_names == null) {
                                            item.drug_names = "";
                                        }
                                        drug_rows.push([item.drug_names ?? ""]);
                                    }



                                    const table11 = {
                                        // title: 'Drugs',
                                        headers: ["Drugs"],
                                        rows: drug_rows
                                    };

                                    myDoc.table(table11, {});
                                    myDoc1.table(table11, {});
                                }
                            }



                            // pdf 3rd page  content
                               
                            if ((signature != null)&&(signature !="")&&(signature != undefined)) {

                                myDoc.image(process.env.PDF_IMG_PATH + "signature/" + signature, 480, 650, {
                                    width: 100,
                                    height: 100
                                });
                            } else {
                                myDoc.image(process.env.PDF_IMG_PATH + "member/" + "demouser.png", 480, 650, {
                                    width: 100,
                                    height: 100
                                });
                            }
                            myDoc.fontSize(8);

                            myDoc.text("Clinic Address : " + clinic_address, 10, myDoc.page.height - 50, {
                                lineBreak: false,
                                align: "left"
                            });
                            myDoc.end();
                            myDoc1.end();

                            myDoc.on("end", async () => {

                                const appointmentComplite = await helperQuery.All(`UPDATE  appointments set status = 'Completed' , prescription_pdf_name = '${pdf_name}' , prescription_pdf_name_for_admin = '${pdf_name1}' WHERE id = '${appointment_id}'`);
                                const appointmentData = await helperQuery.All(`SELECT*FROM appointments WHERE id ='${appointment_id}'`);
                                const followUpData = await helperQuery.All(`SELECT * FROM follow_ups WHERE appointment_id ='${appointment_id}' ORDER BY id DESC LIMIT 1`);
                                const userDoc = {
                                    user_id: appointmentData[0].user_id,
                                    member_id: appointmentData[0].patient_id,
                                    appointment_id: appointment_id,
                                    document_title: "prescription pdf file",
                                    document_file: pdf_name,
                                    type: "prescription"
                                };
                                await Document.addUserPrescriptionDocument(userDoc);
                                if (followUpData.length > 0) {
                                    const patient_noticData = {
                                        message: "your next Follow up",
                                        by: "message",
                                        from_user_id: appointmentData[0].doctor_id,
                                        to_user_id: appointmentData[0].user_id,
                                        title: "Appointment Booked",
                                        type: "radio_appointment_booked",
                                        appointment_date: followUpData[0].follow_up_interval,
                                        time_slot: "",
                                    };
                                    Notification.AddNotification(patient_noticData);
                                }

                                return res.status(200).send({
                                    status_code: 200,
                                    status: "success",
                                    pdf_name: pdf_name,
                                    pdf_url: process.env.APP_URL + "prescription_pdfs/" + pdf_name,
                                    pdf_url_for_admin: process.env.APP_URL + "prescription_pdfs/" + pdf_name1,
                                    message: "PDF Generated Successfully"
                                });

                            });
                        }else{
                            return res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: "Clinic Header and Footer must be required."
                                });
                        }

                    }
                }
            }
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong"
        });
    }

};









// get appointment by vineet shirdhonkar


exports.getAppointmentList = (req, res) => {
    const { user_id, role_id } = req.body;

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {

            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "User does not exist",
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

            Appointment.findAppointmentList(user_id, role_id, (err, data) => {
                if (err) {

                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
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

                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: (data.length > 0) ? "Data Found Successfully" : "No Data Found",
                        data: data
                    });
                    return;

                }
            });

        }

    });
};