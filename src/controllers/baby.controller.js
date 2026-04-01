const Baby = require("../models/baby.model");
exports.add_baby = (req,res) => { 
    const {baby_name,date_of_birth,baby_gender,father_height,mother_height,user_id} =req.body;
    Baby.add_baby(baby_name,date_of_birth,baby_gender,father_height,mother_height,user_id,(err,data)=>{
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
exports.list_baby = (req, res) => {
    const { user_id} = req.body;
    Baby.list_baby(user_id, (err, data) => {
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
exports.update_baby = (req,res) => { 
    const {baby_name,date_of_birth,baby_gender,father_height,mother_height,user_id,baby_id} =req.body;
    Baby.update_baby(baby_name,date_of_birth,baby_gender,father_height,mother_height,user_id,baby_id,(err,data)=>{
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
                message : "Updated Successfully",
                data: data
            });
            return;
        }
    });
};
exports.delete_baby = (req,res) => { 
    const {baby_id,user_id} =req.body;
    Baby.delete_baby(baby_id,user_id,(err,data)=>{
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
                message : "Deleted Successfully",
                data: data
            });
            return;
        }
    });
};
exports.single_baby = (req, res) => {
    const { user_id,baby_id} = req.body;
    Baby.single_baby(user_id,baby_id, (err, data) => {
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

exports.user_baby_vaccination = (req, res) => {
    const { baby_id} = req.body;
    Baby.user_baby_vaccination(baby_id, (err, data) => {
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

exports.single_baby_vaccination = (req, res) => {
    const { v_id,baby_id} = req.body;
    Baby.single_baby_vaccination(v_id,baby_id, (err, data) => {
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

exports.update_baby_vaccination = (req,res) => { 
    const {v_id,baby_id,dose_date,status} =req.body;
    Baby.update_baby_vaccination(v_id,baby_id,dose_date,status,(err,data)=>{
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
                message : "Update Successfully",
                data: data
            });
            return;
        }
    });
};