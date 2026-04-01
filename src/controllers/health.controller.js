const helperFunction = require("../helper/helperFunction");
const Health = require("../models/health.model");
const moment = require("moment");

exports.addBmi = (req,res) => { 
    const {user_id,member_id,Height,Weight,BMI,createdate} =req.body;
    var todayDate = new Date().toString();
    var new_createdate = moment(createdate).format("YYYY-MM-DD HH:mm:ss"); 
    if ( helperFunction.dateFormat(todayDate,"yyyymmdd")<helperFunction.dateFormat(createdate,"yyyymmdd")) {
        return res.status(400).json({
            status_code:400,
            status:"error",
            message:"Please enter a valid date"
        });
    }
    Health.addBmi(user_id,member_id,Height,Weight,BMI,new_createdate,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.listBmi = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listBmi( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    data: data
                });
                return;
        }
    });

};

exports.heartRate = (req,res) => { 

    const {user_id,member_id,heart_rate,createdate} =req.body;

    var new_createdate = moment(createdate).format("YYYY-MM-DD HH:mm:ss"); 

    var todayDate = new Date().toString();
    if ( helperFunction.dateFormat(todayDate,"yyyymmdd")<helperFunction.dateFormat(createdate,"yyyymmdd")) {
        return res.status(400).json({
            status_code:400,
            status:"error",
            message:"Please enter a valid date"
        });
    }
    Health.heartRate(user_id,member_id,heart_rate,new_createdate,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.listHeartRate = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listHeartRate( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    data: data
                });
                return;
        }
    });

};


exports.bloodPressure = (req,res) => { 
    const {user_id,member_id,blood_pressure,createdate} =req.body;
    var new_createdate = moment(createdate).format("YYYY-MM-DD HH:mm:ss"); 
    var todayDate = new Date().toString();
    if ( helperFunction.dateFormat(todayDate,"yyyymmdd")<helperFunction.dateFormat(createdate,"yyyymmdd")) {
        return res.status(400).json({
            status_code:400,
            status:"error",
            message:"Please enter a valid date"
        });
    }
    Health.bloodPressure(user_id,member_id,blood_pressure,new_createdate,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.listBloodPressure = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listBloodPressure( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    data: data
                });
                return;
        }
    });

};

exports.respiratory = (req,res) => { 
    const {user_id,member_id,respiratory_rate,createdate} =req.body;
    var new_createdate = moment(createdate).format("YYYY-MM-DD HH:mm:ss"); 
    var todayDate = new Date().toString();
    if ( helperFunction.dateFormat(todayDate,"yyyymmdd")<helperFunction.dateFormat(createdate,"yyyymmdd")) {
        return res.status(400).json({
            status_code:400,
            status:"error",
            message:"Please enter a valid date"
        });
    }
    Health.respiratory(user_id,member_id,respiratory_rate,new_createdate,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.listRespiratory = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listRespiratory( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            
            let sortedData = data.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.createdate,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.createdate,"yyyymmdd")));
            res.status(200).send({
                status_code : "200",
                status: "success",
                data: sortedData
            });
            return;
        }
    });

};

exports.oxygen = (req,res) => { 
    const {user_id,member_id,oxygen_saturation,createdate} =req.body;
    var new_createdate = moment(createdate).format("YYYY-MM-DD HH:mm:ss"); 
    var todayDate = new Date().toString();
    if ( helperFunction.dateFormat(todayDate,"yyyymmdd")<helperFunction.dateFormat(createdate,"yyyymmdd")) {
        return res.status(400).json({
            status_code:400,
            status:"error",
            message:"Please enter a valid date"
        });
    }
    Health.oxygen(user_id,member_id,oxygen_saturation,new_createdate,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.listOxygen = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listOxygen( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            let sortedData = data.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.createdate,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.createdate,"yyyymmdd")));
            res.status(200).send({
                status_code : "200",
                status: "success",
                data: sortedData
            });
            return;
        }
    });

};

exports.temperature = (req,res) => { 
    const {user_id,member_id,temperature,createdate} =req.body;
    var todayDate = new Date().toString();
    var new_createdate = moment(createdate).format("YYYY-MM-DD HH:mm:ss"); 
    if ( helperFunction.dateFormat(todayDate,"yyyymmdd")<helperFunction.dateFormat(createdate,"yyyymmdd")) {
        return res.status(400).json({
            status_code:400,
            status:"error",
            message:"Please enter a valid date"
        });
    }
    Health.temperature(user_id,member_id,temperature,new_createdate,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.listTemperature = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listTemperature( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            let sortedData = data.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.createdate,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.createdate,"yyyymmdd")));
            res.status(200).send({
                status_code : "200",
                status: "success",
                data: sortedData
            });
            return;
        }
    });

};
exports.deletehealthreport = (req, res) => {
    const { health_report_id,member_id,user_id } = req.body;
    Health.deletehealthreport(health_report_id,member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    message:"Data Deleted Successfully"
                });
                return;
        }
    });

};

exports.listdashboard = (req, res) => {
    const { member_id,user_id } = req.body;
    Health.listdashboard( member_id,user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    data: data
                });
                return;
        }
    });

};

exports.history_notepad = (req,res) => { 
    const {user_id,member_id,type,description,created_date} =req.body;
    const created_dat =type!=undefined && type!=null && type!="current_medication" ? new Date(created_date):"";
    Health.history_notepad(user_id,member_id,type,description,created_dat ,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};

exports.update_history_notepad = (req,res) => { 
    const {hn_id,user_id,member_id,type,description,created_date} =req.body;
    const created_dat = new Date(created_date);
    Health.update_history_notepad(hn_id,user_id,member_id,type,description,created_dat,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Updated Successfully.",
                data: data
            });
            return;
        }
    });
};

exports.list_history_notepad = (req, res) => {
    const { member_id,user_id,type } = req.body;
    Health.list_history_notepad( member_id,user_id,type, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    data: data
                });
                return;
        }
    });

};

exports.single_history_notepad = (req, res) => {
    const { member_id,user_id,hn_id } = req.body;
    Health.single_history_notepad( member_id,user_id,hn_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : "200",
                    status: "success",
                    data: data
                });
                return;
        }
    });

};