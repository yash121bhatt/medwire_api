const { async } = require("q");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const addByDoctor = require("../models/addByDoctor.model");
const Notification = require("../models/stytemNotification.model");
const moment = require("moment");

exports.labRadiolist = async (req, res) => {
    try {
        const { role_id, search, doctor_id } = req.body;
        const vali = helperFunction.customValidater(req, { role_id, doctor_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const check = await helperQuery.All(`SELECT*FROM radio_lab_doctors WHERE doctor_id='${doctor_id}'`);
        var ids = [];
        check.map((cid) => {
            ids.push(cid.user_id != "null" && cid.user_id != null && cid.user_id != undefined ? cid.user_id : 0);
        });
        console.log(ids, check);
        const result = await addByDoctor.labRadio({ role_id, search, ids });
        const data = [];
        result.map((item) => {
            data.push({
                id: item.id ?? "-",
                role_id: item.role_id ?? "-",
                first_name: item.first_name ?? "-",
                email: item.email ?? "-",
                mobile: item.mobile ?? "-",
                profile_image: item.profile_image ?? "-",
                profile: item.profile_image != undefined && item.profile_image != "" ? process.env.CLOUDINARY_BASE_URL + "member/" + item.profile_image : "-",
                opening_time: item.opening_time ?? "-",
                closing_time: item.closing_time ?? "-",
                approve_status: item.approve_status ?? "-",
                created_at: item.created_at ?? "-",
                updated_at: item.updated_at ?? "-",
            });
        });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};

exports.AddlabRadio = async (req, res) => {
    try {
        const { user_ids, doctor_id } = req.body;

        const vali = helperFunction.customValidater(req, { user_ids, doctor_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        console.log(user_ids);

        const user_id = user_ids;
        //const check = await helperQuery.All(`SELECT*FROM radio_lab_doctors WHERE user_id='${user_id}' AND doctor_id='${doctor_id}'`);
        // for (let index = 0; index < user_ids.length; index++) {
        //     const user_id = user_ids[index];
        //     var result = await addByDoctor.AddlabRadio({user_id,doctor_id});    
        // }

        var result = await addByDoctor.AddlabRadio({ user_id, doctor_id });

        if (result.affectedRows > 0) {
            return res.status(200).json({
                status_code: 200,
                status: "success",
                message: "Added Successfully!"
            });
        }
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "Something Went to wrong!"
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};

exports.showDoctorlabRadio = async (req, res) => {
    try {
        const { doctor_id, role_id } = req.body;
        const vali = helperFunction.customValidater(req, { doctor_id, role_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await addByDoctor.showDoctorlabRadio({ doctor_id, role_id });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};
exports.DeleteDoctorlabRadio = async (req, res) => {
    try {
        const { user_id, doctor_id } = req.body;
        const vali = helperFunction.customValidater(req, { user_id, doctor_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await addByDoctor.DeleteDoctorlabRadio({ user_id, doctor_id });

        if (result.affectedRows == 1) {
            return res.status(200).json({
                status_code: 200,
                status: "success",
                message: "Deleted Successfully!"
            });
        }
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "Oops! No record found!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "Something Went to wrong!"
        });
    }
};
exports.DoctorRequestlabRadio = async (req, res) => {
    try {
        const { user_id } = req.body;
        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await addByDoctor.DoctorRequestlabRadio({ user_id });
        const data = [];
        for (const item of result) {
            const user_id = item.id ?? null;
            const doctor_name = item.doctor_name ?? null;
            const gender = item.gender ?? null;
            const experience_in_year = item.experience_in_year ?? null;
            const email = item.email ?? null;
            const mobile = item.mobile ?? null;
            const pin_code = item.pin_code ?? null;
            const request_status = item.status ?? "Pending";
            const address = item.address ?? null;
            const profile_image = item.profile_image ?? null;

            const d_id = item.d_id ?? 0;
            const degree = await helperQuery.All("SELECT degree_name FROM doctor_degrees WHERE doctor_id=" + d_id);
            const speciality = await helperQuery.All("SELECT speciality_name FROM doctor_specialities WHERE doctor_id=" + d_id);
            data.push({
                user_id, profile_image, address, pin_code, mobile, email,
                experience_in_year, doctor_name, gender,
                request_status, speciality, degree
            });
        }

        return res.status(200).json({
            status_code: 200,
            status: "success",
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};
exports.statusDoctorlabRadio = async (req, res) => {
    try {
        const { user_id, request_status } = req.body;
        const vali = helperFunction.customValidater(req, { user_id, request_status });
        if (vali) {
            return res.status(500).json(vali);
        }
        await addByDoctor.statusDoctorlabRadio(user_id, request_status);

        let requestData = await addByDoctor.DoctorlabRadioFirst(user_id);
        const userType = requestData.d_user_type.charAt(0).toUpperCase() + requestData.d_user_type.slice(1);
        var CurrentDate = moment().format("YYYY-MM-DD HH:mm:ss");

        var data = {
            "by": "custom",
            "from_user_id": requestData.id,
            "to_user_id": requestData.d_id,
            "title": userType + " " + request_status + " Confirmation",
            "type": userType + "_" + request_status + "_Conformation",
            "appointment_date": CurrentDate,
            "time_slot": moment().format("hh:mm A"),
            "message": "Hello Dr. " + requestData.doctor_name + ",<br> " + requestData.rl_name + " has " + request_status + " your request " + moment().format("YYYY-MM-DD") + " & " + moment().format("hh:mm A"),
        };
        await Notification.AddNotification(data);

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: request_status + " Successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: "Something Went to wrong!"
        });
    }
};
exports.DoctorlabRadioApproved = async (req, res) => {
    try {
        const { user_id } = req.body;
        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await addByDoctor.DoctorlabRadioApproved({ user_id });
        const data = [];
        for (const item of result) {
            const user_id = item.id ?? null;
            const doctor_name = item.doctor_name ?? null;
            const experience_in_year = item.experience_in_year ?? null;
            const email = item.email ?? null;
            const mobile = item.mobile ?? null;
            const pin_code = item.pin_code ?? null;
            const status = item.status ?? null;
            const address = item.address ?? null;
            const profile_image = item.profile_image ?? null;

            const d_id = item.d_id ?? 0;
            const speciality = await helperQuery.All("SELECT degree_name FROM doctor_degrees WHERE doctor_id=" + d_id);
            const degree = await helperQuery.All("SELECT speciality_name FROM doctor_specialities WHERE doctor_id=" + d_id);
            data.push({
                user_id, profile_image, address, pin_code, mobile, email,
                experience_in_year, doctor_name,
                status, speciality, degree
            });
        }

        return res.status(200).json({
            status_code: 200,
            status: "success",
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};
exports.DoctorlabRadio = async (req, res) => {
    try {
        const { user_id, doctor_id, role_id } = req.body;
        const vali = helperFunction.customValidater(req, { user_id, doctor_id, role_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await addByDoctor.DoctorlabRadio({ user_id, doctor_id, role_id });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};