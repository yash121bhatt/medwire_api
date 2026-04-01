const User = require("../models/user.model");
const ClinicOrHospital = require("../models/clinicorhospital.model");
const DoctorFee = require("../models/doctor_fee.model");
const helperFunction = require("../helper/helperFunction");

exports.addDoctorFee = (req, res) => {
    var { doctor_id, online_consulting_fee, clinic_visit_consulting_fee, is_available_for_offline_visit, is_available_for_online_visit, clinic_id } = req.body;

    ClinicOrHospital.findByIdAndRole(req.body.clinic_id, (err, data) => {
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
            DoctorFee.add(doctor_id, is_available_for_offline_visit, is_available_for_online_visit, online_consulting_fee, clinic_visit_consulting_fee, clinic_id, (err, data1) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data1) {
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Doctor's Fee Detail Added Successfully",
                        data: data1
                    });
                }
            });
        }
    });
};

exports.getFeeSpecificDoctorList = (req, res) => {
    const { clinic_id } = req.body;
    ClinicOrHospital.findByIdAndRole(clinic_id, (err, data) => {
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
            DoctorFee.findFeeSpecificDoctor(clinic_id, (err, data) => {
                console.log("err", err);
                console.log("data", data);
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "error",
                            message: "No Fee Specific Doctor found"
                        });
                        return;
                    }
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data) {
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: (data.length > 0) ? "Doctor Record Found Successfully" : "No Record Found",
                        data: data
                    });
                }
            });

        } else {
            res.status(404).send({
                status_code: 404,
                status: "error",
                message: "Clinic / Hospital does not exist"
            });
            return;
        }
    });
};


// get all fees of doctor list code by vineet shirdhonkar


exports.getAllDoctorFeeList = (req, res) => {
    const { clinic_id } = req.body;
    ClinicOrHospital.findByIdAndRole(clinic_id, (err, data) => {
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
            DoctorFee.findAllDoctorFees(clinic_id, (err, data1) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            status_code: 404,
                            status: "success",
                            message: "Doctor Fee Record does not exist"
                        });
                        return;
                    }
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data1 || data1.id != null) {
                    return res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Doctor Fee Record Found Successfully",
                        data: data1
                    });
                }
            });
        }
    });
};

// get doctor fee detail code by vineet shirdhonkar
exports.getDoctorFeeDetail = (req, res) => {
    const { fee_id } = req.body;
    var valid = helperFunction.customValidater(req, { fee_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    DoctorFee.findById(fee_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "success",
                    message: "Doctor Fee Does Not Exist"
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
                message: "Doctor Fee Details Found Successfully",
                data: data
            });
            return;
        }
    });
};


// update doctor fee code by vineet shirdhonkar


exports.updateDoctorFee = (req, res) => {
    var { doctor_id, visit_type, online_consulting_fee, clinic_visit_consulting_fee, is_available_for_offline_visit, is_available_for_online_visit, fee_id } = req.body;

    DoctorFee.findById(fee_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Fee Record does not exist"
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
            User.findDoctorByIdAndRole(doctor_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }
                if (data.length > 0) {
                    DoctorFee.update(doctor_id, visit_type, is_available_for_offline_visit, is_available_for_online_visit, online_consulting_fee, clinic_visit_consulting_fee, fee_id, (err, data1) => {
                        if (err) {
                            res.status(500).send({
                                status_code: 500,
                                status: "error",
                                message: "Something Went Wrong"
                            });
                            return;
                        }
                        if (data1) {
                            return res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Doctor's Fee Detail updated Successfully",
                                data: data1
                            });
                        }
                    });
                } else {
                    res.status(404).send({
                        status_code: 404,
                        status: "error",
                        message: "Doctor does not exist"
                    });
                    return;
                }
            });
        }
    });
};


// delete doctor fee code by vineet shirdhonkar


exports.deleteDoctorFee = (req, res) => {
    const { fee_id } = req.body;
    DoctorFee.findById(fee_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Fee record does not exist"
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
            DoctorFee.delete(fee_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }


                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Doctor's Fee Detail Deleted Successfully",
                        data: data
                    });
                    return;
                }
            });

        }
    });
};