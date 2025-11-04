const User = require("../models/user.model");
const Prescription = require("../models/prescription.model");
const ClinicOrHospital = require("../models/clinicorhospital.model");
const helperFunction = require("../helper/helperFunction");

exports.managePrescriptionHeader = (req,res) => { 
    const {staff_id,clinic_name,email_id,clinic_timing,clinic_id} = req.body;
    var clinic_logo = ""; 
    var mobile_number = req.body.mobile_number !=undefined && req.body.mobile_number !="undefined" ? req.body.mobile_number:null;
    var alternate_mobile_number = req.body.alternate_mobile_number !=undefined && req.body.alternate_mobile_number !="undefined" ? req.body.alternate_mobile_number:null;
    var valid = helperFunction.customValidater(req,{clinic_name,alternate_mobile_number,email_id,clinic_timing,clinic_id});
    if(valid){
        return res.status(500).json(valid);
    }    



    if(req.file !== undefined){       
        var clinic_logo = req.file.filename;

    } else {
        var clinic_logo = "";
    }

    // if(req.body.alternate_mobile_number.length == '10'){ 
    //    return  res.status(500).send({
    //         status_code : 500,
    //         status: 'error',
    //         message: "Mobile number should be of 10 digit"
    //     });
    // }





    ClinicOrHospital.findByIdAndRole(req.body.clinic_id,async (err,data) =>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "error",
                    message: "Clinic / Hospital does not exist"
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
            var added_by = (staff_id) ? staff_id : null;
            if(added_by){
                const prescriptionResponse1 = await Prescription.getStaffDetail(clinic_id,added_by);
                const length_s = prescriptionResponse1.length;
            
                const newdata = Prescription.manageStaffPrescriptionHeader({added_by,clinic_name,clinic_logo,mobile_number,alternate_mobile_number,email_id,clinic_timing,clinic_id,length_s});
                if (newdata) {
                const prescriptionNewUpdatedResponse = await Prescription.getStaffDetail(clinic_id,added_by);
                    res.status(200).send({
                        status_code : 200,
                        status: "success",
                        message : "Prescription Header  Details Saved Successfully",
                        data: await Prescription.getStaffDetail(clinic_id,added_by)
                    });
                    return;
                }
                    
            }
            else{
                const prescriptionResponse = await Prescription.getDetail(clinic_id);
                const length = prescriptionResponse.length;
                const data1 = await Prescription.managePrescriptionHeader({clinic_name,clinic_logo,mobile_number,alternate_mobile_number,email_id,clinic_timing,clinic_id,length});
                if (data1) {
                    console.log("data",data1);
                   // return false;
                        const prescriptionUpdatedResponse = await Prescription.getDetail(clinic_id);
                        
                        res.status(200).send({
                            status_code : 200,
                            status: "success",
                            message : "Prescription Header Details Saved Successfully",
                            data: prescriptionUpdatedResponse
                        });
                        return;
                }

            }
           
        }

    });       
};

exports.managePrescriptionFooter = (req,res) => { 
        const {staff_id,clinic_address,clinic_id} = req.body;
        ClinicOrHospital.findByIdAndRole(clinic_id,async (err,data) =>{
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        status_code : 404,
                        status: "error",
                        message: "Clinic / Hospital does not exist"
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
                var added_by = (staff_id) ? staff_id : null;
                if(added_by){
                    const prescriptionResponse1 = await Prescription.getStaffDetail(clinic_id,added_by);
                    const length1 = prescriptionResponse1.length;
                    const newdata = Prescription.manageStaffPrescriptionFooter({clinic_address,clinic_id,added_by,length1});
                    if (newdata) {
                    const prescriptionNewUpdatedResponse = await Prescription.getStaffDetail(clinic_id,added_by);
                        res.status(200).send({
                            status_code : 200,
                            status: "success",
                            message : "Prescription Footer Details Saved Successfully",
                            data: await Prescription.getStaffDetail(clinic_id,added_by)
                        });
                        return;
                    }
                }
                else{
                    const prescriptionResponse = await Prescription.getDetail(clinic_id);
                    const length = prescriptionResponse.length;
                    const data = await Prescription.managePrescriptionFooter({clinic_address,clinic_id,length});
                    if (data) {
                            const prescriptionUpdatedResponse = await Prescription.getDetail(clinic_id);

                            res.status(200).send({
                                status_code : 200,
                                status: "success",
                                message : "Prescription Footer Details Saved Successfully",
                                data: prescriptionUpdatedResponse
                            });
                            return;
                    }
                    
                }
                

            }
        
        });
};


// get prescription detail by vineet shirdhonkar


exports.getPrescriptionDetail = (req,res) => { 
    const {clinic_id,staff_id} = req.body;


    var valid = helperFunction.customValidater(req,{clinic_id});
    if(valid){
        return res.status(500).json(valid);
    }

    User.findByIdAndRole(clinic_id,8,async (err, data) => {
        if (err) { 
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: "success",
                    message: "Clinic / Hospital does not exist"
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
            var added_by = (staff_id) ? staff_id : null;
            if(added_by){
                 var prescriptionResponse = await Prescription.getStaffDetail(clinic_id,added_by);
                 if (data) {
                        res.status(200).send({
                            status_code : 200,
                            status: "success",
                            message : "Data Found Successfully",
                            data: (prescriptionResponse[0]) ? prescriptionResponse[0] : []
                        });
                        return;
                }
            }
            else{
                  var prescriptionResponse = await Prescription.getDetail(clinic_id);
                 if (data) {
                        res.status(200).send({
                            status_code : 200,
                            status: "success",
                            message : "Data Found Successfully",
                            data: (prescriptionResponse[0]) ? prescriptionResponse[0] : []
                        });
                        return;
                }
                
            }
            
        }
    });     
};