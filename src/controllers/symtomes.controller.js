const helperQuery = require("../helper/helperQuery");
const Symtomes = require("../models/symtomes.model");

exports.createSymtomes = (req,res) => { 
    const {member_id,user_id,symtomeslist} =req.body;
    Symtomes.findSymtomesId(member_id,user_id,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            if(data!=[] && data!="")
            {
                Symtomes.updateSymtomes(member_id,user_id,symtomeslist,(err,data)=>{
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
                            message : "Saved Successfully",
                            data: data
                        });
                        return;
                    }
                });
            }else{
                Symtomes.createSymtomes(member_id,user_id,symtomeslist,(err,data)=>{
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
                            message : "Saved Successfully",
                            data: data
                        });
                        return;
                    }
                });

            }
            
            return;
        }
    });
    
};

exports.findSymtomesId = (req,res) => { 
    const {member_id,user_id} =req.body;
    Symtomes.findSymtomesId(member_id,user_id,(err,data)=>{
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
exports.defaultSymptomList = (req,res)=>{
    const {user_id,member_id} = req.body;
    Symtomes.defaultSymptomList(user_id,member_id,(err,data)=>{
        if(err){
            res.status(500).json({
                status_code:"500",
                status:"error",
                message: "Something Went Wrong"
            });
        }
        if (data) {
            const respose = [];
            for(item of data)
            {
                const id =item.id;
                const img =  item.symtom_image!=null?process.env.CLOUDINARY_BASE_URL+"symptom/"+item.symtom_image:"-";
                const symptom_name = item.symptom_name!=null ? item.symptom_name:"-";
                const category_name = item.category_name!=null ? item.category_name:"-";
                const symptom_status = item.symptom_status!=null ? item.symptom_status:0;
                const created_at = item.created_at!=null ? item.created_at:"-";
                const updated_at = item.updated_at!=null ? item.updated_at:"-";
                respose.push({id,img,symptom_name,category_name,symptom_status,created_at,updated_at});
            }
            res.status(200).json({
                status_code : "200",
                status: "success",
                message : "Successfully",
                data: respose
            });
        }
    });
 };
 exports.addUserSymptom = (req,res)=>{
    const {user_id,member_id,symptom_id,status} = req.body;
    Symtomes.addUserSymptom(user_id,member_id,symptom_id,status,(err,data)=>{
        if(err){
            res.status(500).json({
                status_code:"500",
                status:"error",
                message: err
            });
        }
        if (data) {
            res.status(200).json({
                status_code : "200",
                status: "success",
                message : "Successfully",
            });
        }
    });
 };
exports.DefaultSymptomListWeb = (req,res)=>{
    const {user_id,member_id} = req.body;
    Symtomes.defaultSymptomList(user_id,member_id,(err,data)=>{
        if(err){
            res.status(500).json({
                status_code:"500",
                status:"error",
                message: "Something Went Wrong"
            });
        }
        if (data.length>0) {
            helperQuery.get({table:"symtomes_category"},(err,catdata)=>{
                const response = [];
                if (catdata.length>0) {
                    
                    for(cat of catdata)
                    {
                        var newObject = {category: cat.category_name, symptomList:[]};
                        // console.log('name',cat.category_name);
                        var i=1;
                        data.map(function(item){
                            
                            if (cat.category_name == item.category_name) {
                                const Sno = i++;
                                const id =item.id;
                                const img =  item.symtom_image!=null?process.env.CLOUDINARY_BASE_URL+"symptom/"+item.symtom_image:"-";
                                const symptom_name = item.symptom_name!=null ? item.symptom_name:"-";
                                const category_name = item.category_name!=null ? item.category_name:"-";
                                const symptom_status = item.symptom_status!=null ? item.symptom_status:0;
                                const created_at = item.created_at!=null ? item.created_at:"-";
                                const updated_at = item.updated_at!=null ? item.updated_at:"-";
                                newObject.symptomList.push({Sno,id,img,symptom_name,category_name,symptom_status,created_at,updated_at});
                            }
                            return newObject;
                        });
                        response.push(newObject);
                    }
                    // console.log(response);
                    res.status(200).json({
                        status_code : "200",
                        status: "success",
                        message : "Successfully",
                        data: response
                    });
                }
                
            });
        }
    });
};

