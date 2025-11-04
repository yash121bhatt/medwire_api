const pregnantWomen = require("../models/pregnantWomen.model");

exports.create = (req,res) => { 
    const {user_id,name,date_of_pregnancy} =req.body;
    pregnantWomen.create(user_id,name,date_of_pregnancy,(err,data)=>{
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


exports.show = (req,res) => { 
    const {user_id} =req.body;
    pregnantWomen.show(user_id,(err,data)=>{
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
                data: data
            });
            return;
        }
    });
    
};

exports.delete = (req,res) => { 
    const {id} =req.body;
    pregnantWomen.delete(id,(err,data)=>{
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
                message: "Delete Successfully"

            });
            return;
        }
    });
    
};

exports.findById = (req,res) => { 
    const {id,user_id} =req.body;
    pregnantWomen.findBYId(id,user_id,(err,data)=>{
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
                data: data
            });
            return;
        }
    });
};
