const User = require("../models/user.model");
const Commission = require("../models/commission.model");


// add commission code by vineet shirdhonkar


exports.addCommission = (req,res) => {
    var {admin_id,commission_for,user_ids,commission_percent} = req.body;
    User.findByIdAndRole(admin_id,1,(err,data) =>{   
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Admin does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: "error",
                message: err.message
            });
            return;
        }

        if(data){
            var uId;                
            if(user_ids.length > 0){
                for(uId of user_ids) {
                    Commission.add(uId,commission_for,admin_id,commission_percent,(err,data1)=>{
                        if(err){
                            res.status(500).send({
                                status_code : 500,
                                status: "error",
                                message: "Something Went Wrong"
                            });
                            return;
                        }
                        if(data1){   
                             res.status(200).send({
                                status_code : 200,
                                status: "success",
                                message : "Commission Added Successfully",
                                data: data1
                            }); 
                            return;                                  
                        }
                    });                                    
                }
            }
        }  
    });     
};


// get Specific Lab And RadioLogy List code by vineet shirdhonkar


exports.getSpecificLabAndRadioLogyList = (req,res) => { 
   const {admin_id} = req.body;    
   User.findByIdAndRole(admin_id,1,(err,data) =>{   
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Admin does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: "error",
                message: err.message
            });
            return;
        }  


        if(data) {                        
            Commission.getSpecificLabAndRadioLogyList((err,data)=>{
                if(err){
                    res.status(500).send({
                        status_code : 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }

                if(data){   
                    return res.status(200).send({
                        status_code : 200,
                        status: "success",
                        message : (data.length > 0) ? "Data Found Successfully" : "No Record Found",
                        data: data
                    });                                   
                }
            });

        }
    });   
};


// get all commissions code by vineet shirdhonkar


exports.getAllCommissions = (req,res) => { 
    const {admin_id} = req.body;
    User.findByIdAndRole(admin_id,1,(err,data) =>{   
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Admin does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: "error",
                message: err.message
            });
            return;
        }  


        if(data) {                        
            Commission.findAll(admin_id,(err,data)=>{
                if(err){
                    res.status(500).send({
                        status_code : 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }

                if(data){   
                    return res.status(200).send({
                        status_code : 200,
                        status: "success",
                        message :  "Data Found Successfully",
                        data: data
                    });                                   
                }
            });

        }
    });      
};

// get commission detail code by vineet shirdhonkar


exports.getCommissionDetail = (req,res) => { 
    const {commission_id} = req.body;
    Commission.findById(commission_id, (err, data) => {
        if (err) { 
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Commission Record does not exist"
                });
                return;
            }          
            res.status(500).send({
                status_code : 500,
                status: "error",
                message: err.message
            });
            return;
        }    

        if(data) {
            res.status(200).send({
                status_code : 200,
                status: "success",
                message : "Commission Details Found Successfully",
                data: data
            });
            return;

        }
    });     
};



// update commission code by vineet shirdhonkar


exports.updateCommission = (req,res) => {
    var {commission_id,admin_id,commission_for,user_id,commission_percent} = req.body;
    User.findByIdAndRole(admin_id,1,(err,data) =>{   
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Admin does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: "error",
                message: err.message
            });
            return;
        }

        if(data){
     
            Commission.update(commission_id,user_id,commission_for,commission_percent,(err,data1)=>{
                if(err){
                    res.status(500).send({
                        status_code : 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if(data1){   
                     res.status(200).send({
                        status_code : 200,
                        status: "success",
                        message : "Commission Updated Successfully",
                        data: data1
                    }); 
                    return;                                  
                }
            });                                    
             
        }  
    });     
};



// delete commission code by vineet shirdhonkar


exports.deleteCommission = (req,res) => { 
    const {commission_id} = req.body;
    Commission.findById(commission_id, (err, data) => {
        if (err) { 
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Commission record does not exist"
                });
                return;
            }

            res.status(500).send({
                status_code : 500,
                status: "error",
                message: err.message
            });
            return;
        }
            

        if(data) {
            Commission.delete(commission_id,(err,data)=>{
                if(err){
                    res.status(500).send({
                        status_code : 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }

               
                if (data) {   
                    res.status(200).send({
                        status_code : 200,
                        status: "success",
                        message : "Commission Deleted Successfully",
                        data: data
                    });
                    return;
                }
            });

        }
    });     
};