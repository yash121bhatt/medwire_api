const { joi } = require("joi");
const db = require("../config/db.config");
const {addStaff: addStaff,updateStaff: updateStaff} = require("../database/queries");
const { logger } = require("../utils/logger");
const helperFunction = require("../helper/helperFunction");

class Staff {

    static add(clinic_id,full_name,email_id,date_of_birth,mobile_number,gender,role_id,profile_image,password,cb){
        
        if(role_id == 6){
            var user_type = "receiptionist";
        } else {
            var user_type = "prescription_writer";
        }

        var deleted_at = "IS NULL";


        db.query(`SELECT * FROM users WHERE (email = ? OR mobile = ?) and role_id = ? and created_by_id = ? and deleted_at ${deleted_at}`, [email_id, mobile_number,role_id,clinic_id,deleted_at], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
       
            
            if (res.length > 0) {
                cb({ kind: "already_added" }, null);
                 return;
            } else {
                db.query(addStaff,
                    [full_name,email_id,mobile_number,gender,date_of_birth,role_id,clinic_id,password,user_type,profile_image],
                    (err,res)=>{
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }  

                    if(res.insertId > 0){
                        cb(null, {
                            id: res.insertId,
                            full_name: full_name,
                            role_id:parseInt(role_id),
                            date_of_birth: date_of_birth,
                            gender: gender,
                            mobile: parseInt(mobile_number),
                            email: email_id,
                            profile_image :profile_image,            
                            created_by_id:parseInt(clinic_id),
                        });
                    }        
                });
            }   
        
       });
    }


    static findAll(clinic_id,cb){
        var role_id = "6,7";
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM users WHERE created_by_id = '${clinic_id}' and role_id IN (${role_id}) and deleted_at ${deleted_at} order by id desc`, [clinic_id,role_id,deleted_at], (err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            const response = [];
            if(res.length > 0){
                for (const item of res) {
                    const id = item.id;
                    const email = item.email;
                    const mobile_number = parseInt(item.mobile);
                    const profile_image_name = (item.profile_image == null) ? "" :item.profile_image;
                    const profile_image_path =  process.env.APP_URL+"member/"+profile_image_name;
                    const full_name = item.first_name;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const role = (item.user_type == "prescription_writer" ? "Prescription Writer" : "Receptionist");
                    response.push({ id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name, profile_image_path,role});
                }
                cb(null,response);  
            } else {
                cb({ kind: "not_found" }, null);
            }
            
            
        });
    }


    static findByIdAndRole(id,cb) {
        var role_id = "6,7";
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM users WHERE id = '${id}' and role_id IN (${role_id}) and deleted_at ${deleted_at}`, [id,role_id,deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];            
            for (const item of res) {
                    const id = item.id;
                    const email = item.email;
                    const mobile_number = parseInt(item.mobile);
                    const profile_image_name = (item.profile_image == null) ? "" :item.profile_image;
                    const profile_image_path =  process.env.APP_URL+"member/"+profile_image_name;
                    const full_name = item.first_name;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const role_id = item.role_id;
                    const role = (item.user_type == "prescription_writer" ? "Prescription Writer" : "Receptionist");
                    const created_by_id = item.created_by_id;
                    response.push({ id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name, profile_image_path,role_id,role,created_by_id});
            }

            (response.length) ? cb(null,response) : cb({ kind: "not_found" }, null);          
        });
    }


    static findByEmailAndMobileForUpdate(email,mobile,staff_id, cb) {
        db.query(`SELECT * FROM users WHERE (email = '${email}' OR mobile = '${mobile}') and id!='${staff_id}'`, [email,mobile,staff_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
               cb({ kind: "not_found" }, null);  
            }
            
        });
    }


    static update(clinic_id,full_name,role_id,email_id,date_of_birth,mobile_number,gender,profile_image,staff_id,cb){

        if(role_id == 6){
            var user_type = "receiptionist";
        } else {
            var user_type = "prescription_writer";
        }
        var deleted_at = "IS NULL";

        var updated_at = helperFunction.getCurrentDateTime();

        db.query(`SELECT * FROM users WHERE (email = ? OR mobile = ?) and role_id = ? and created_by_id = ? and id!=? and deleted_at ${deleted_at}`, [email_id, mobile_number,role_id,clinic_id,staff_id,deleted_at], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }       
            
            if (res.length > 0) {
                cb({ kind: "already_added" }, null);
                 return;
            } else {

                db.query(updateStaff,
                    [full_name,role_id,email_id,mobile_number,date_of_birth,gender,user_type,profile_image,updated_at,staff_id],
                    (err,res)=>{
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }

                    if(res.affectedRows > 0){
                        cb(null, {
                            full_name: full_name,
                            role_id:parseInt(role_id),
                            date_of_birth: date_of_birth,
                            gender: gender,
                            mobile: parseInt(mobile_number),
                            email: email_id,
                            profile_image :profile_image,            
                            created_by_id:parseInt(clinic_id),
                        }); 
                    } else {
                        cb({ kind: "failed" }, null);
                    }                         
                });
            }
    
        });

    }


    static delete(id,cb){
        var deleted_at = helperFunction.getCurrentDateTime();
        
        db.query("update users set deleted_at = ? WHERE id= ?",[deleted_at,id],(err,res)=>{                  
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {id: id});
        });

    }


}
module.exports = Staff;