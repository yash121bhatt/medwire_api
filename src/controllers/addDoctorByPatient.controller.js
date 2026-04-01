const { async } = require("q");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const PatientsDoctor = require("../models/addDoctorByPatient.model");

exports.searchDoctor = async (req, res) => {
    try {
        const { search } = req.body;
        const result = await PatientsDoctor.searchDoctor(search);
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.addDoctor = async (req, res) => {
    try {
        const { user_id, created_by_id } = req.body;
        const checkdata = await helperQuery.All("SELECT * FROM user_doctors WHERE user_id=" + user_id + " AND created_by_id =" + created_by_id);
        if (checkdata.length > 0) {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "You have already added this doctor pleace add another one!"
            });
        }
        const vali = helperFunction.customValidater(req, { user_id, created_by_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await PatientsDoctor.addDoctor(user_id, created_by_id);

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.doctorList = async (req, res) => {
    try {
        const { user_id } = req.body;
        const result = await PatientsDoctor.doctorList(user_id);
        const data = [];

        for (const item of result) {
            const id = item.id ?? null;
            const clinic_id = item.clinic_id ?? null;
            const doctor_id = item.doctor_id ?? null;
            const experience_in_year = item.experience_in_year ?? null;
            const patient_id = item.patient_id ?? null;
            const doctor = item.doctor ?? null;
            const doctor_profile = item.doctor_profile ?? null;
            const doctor_profiles = process.env.CLOUDINARY_BASE_URL + "member/" + item.doctor_profile ?? null;
            const clinic = item.clinic ?? null;
            const clinic_profile = item.clinic_profile ?? null;
            const patient_name = item.patient_name ?? null;
            const patient_image = item.patient_image ?? null;
            const spaci = await helperQuery.All("SELECT id,speciality_name FROM doctor_specialities WHERE doctor_id=" + doctor_id);
            const spaciality = item.doctor_id != undefined && item.doctor_id != null && item.doctor_id != "" ? spaci : null;
            data.push({ id, clinic_id, patient_id, doctor, doctor_profile, experience_in_year, clinic, clinic_profile, patient_name, patient_image, spaciality, doctor_profiles });
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.Deletedoctor = async (req, res) => {
    try {
        const { user_id } = req.body;
        const result = await PatientsDoctor.Deletedoctor(user_id);
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

