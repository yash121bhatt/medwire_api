const dashboard = require("../models/dashboard.model");

exports.heartchart = async (req, res) => {
    try {
        const { member_id, type, filterdata, filtertype } = req.body;
        const data = await dashboard.heartchart({ member_id, type, filterdata, filtertype });
        return res.status(200).send({
            status_code: "200",
            status: "success",
            data: data
        });
    } catch (error) {
        if (error.kind === "not_found") {
            res.status(404).send({
                status_code: "404",
                status: "error",
                message: "Data not found"
            });
            return;
        }
        res.status(500).send({
            status_code: "500",
            status: "error",
            message: error.message
        });
        return;
    }
};


exports.cartdDataCount = (req, res) => {
    const { role_id } = req.body;
    dashboard.cartdDataCount(role_id, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: err
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                data: data
            });
        }
    });
};
exports.dashboardDayMonthYearCount = (req, res) => {
    const { lab_id } = req.body;
    dashboard.dashboardDayMonthYearCount(lab_id, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: err
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                data: data
            });
        }
    });
};
exports.dashboarChart = (req, res) => {
    const { lab_id, type } = req.body;
    dashboard.dashboarChart(lab_id, type, (err, data) => {
        if (err) {
            res.status(500).json({
                status_code: "500",
                status: "error",
                message: err
            });
        }
        if (data) {
            res.status(200).json({
                status_code: "200",
                status: "success",
                data: data
            });
        }
    });
};
exports.appointmentGraph = async (req, res) => {
    try {
        const data = await dashboard.appointmentGraph();
        return res.status(200).json({
            status_code: "200",
            status: "success",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went wrong"
        });
    }
};
exports.clinicCard = (req, res) => {
    const clinic_id = req.body.clinic_id;
    dashboard.clinicCard(clinic_id).then(result => {
        return res.status(200).json({
            status_code: "200",
            status: "success",
            data: result
        });
    }).catch(error => {
        console.log(error);
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went wrong"
        });
    });
};
exports.doctorCard = (req, res) => {
    const doctor_id = req.body.doctor_id;
    dashboard.doctorCard(doctor_id).then(result => {
        return res.status(200).json({
            status_code: "200",
            status: "success",
            data: result
        });
    }).catch(error => {
        console.log(error);
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went wrong"
        });
    });
};