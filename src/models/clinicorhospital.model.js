const { date } = require("joi");
const db = require("../config/db.config");
const { createNewClinicOrHospitalQuery: createNewClinicOrHospitalQuery, findUserByEmail: findUserByEmailQuery, findUserByIdQuery:findUserByIdQuery, verifyOtp:verifyOtp, findMemberByIdQuery: findMemberByIdQuery, resetPassword : resetPassword, createMember : createMember, updateUser : updateUser, updatePassword : updatePassword, oldPassword: oldPassword, updateMember:updateMember,findClinicOrHospitalByIdAndRoleQuery:findClinicOrHospitalByIdAndRoleQuery } = require("../database/queries");
const { logger } = require("../utils/logger");

class ClinicOrHospital {
    constructor(name, email_id, mobile_number, password, type, role_id,aadhar_card_number) {
        this.name = name;
        this.email_id = email_id;
        this.password = password;
        this.mobile_number = mobile_number;
        this.aadhar_card_number = aadhar_card_number;
        this.type = type;
        this.role_id =role_id;
    }

    static create(name, email_id , mobile_number, password, type, role_id,aadhar_card_number,approve_document, cb) {

        db.query(createNewClinicOrHospitalQuery, 
            [
                name, email_id, mobile_number,password, type, role_id,aadhar_card_number,approve_document
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    full_name: name,
                    mobile_number: mobile_number,
                    aadhar_card_number: aadhar_card_number,
                    email_id: email_id,
                    password: password,
                    type : type,
                    role_id :role_id
                });
        });
    }

    static findByEmail(email_id, cb) {
        db.query(`SELECT * FROM users WHERE email = '${email_id}'`, [email_id], (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }
    static findByEmailAndMobile(email,mobile, cb) {
        console.log(email);
        db.query(`SELECT * FROM clinics_hospitals WHERE email = '${email}' OR mobile = '${mobile}'`, [email,mobile], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }
    static findByEmailAndRole(email,role_id, cb) {
        console.log(email);
        db.query(`SELECT * FROM users WHERE (email = '${email}' OR mobile = '${email}') And role_id='${role_id}'`, [email,role_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            console.log(res);
            console.log("test");
            cb({ kind: "not_found" }, null);
        });
    }
    static otpVerify(email_id, forgot_otp,cb) {
        const userData = { email_id : email_id, forgot_otp : forgot_otp };
        db.query(verifyOtp, 
            [
                forgot_otp,
                email_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null,userData);
        });
    }
    static resetPassword(email_id, forgot_otp, password,cb) {
        db.query(resetPassword, 
            [
                password,
                forgot_otp,
                email_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if(res.affectedRows==0){
                    const message = "Otp Not Matched";
                    cb(message,null);
                    return;
                }
                cb(null,email);
            });
    }
      
    static oldPasswordCheck(password,id,cb){
        db.query(oldPassword,[password,id],(err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,{
                id : id
            });
        });
    }
    static updatePassword(password,id,cb){
        db.query(updatePassword,[password,id],(err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,{
                id : id
            });
        });
    }

    static findByIdAndRole(id, cb) {
        db.query(`SELECT * FROM users WHERE id = '${id}' And role_id='8'`, [id], (err, res) => {
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
                return;    
            }
            
        });
    }

    static findByIdAndRoleforcl(id, cb) {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM users WHERE id = '${id}' And role_id='8'`, [id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                if (res.length>0) {
                    return resolve(res[0]);
                    return;
                } else {                    
                    return resolve({ kind: "not_found" });
                }
                
            });
        });
        
    }

    static findDoctorCount(id,role_id, cb) {   
        db.query(`SELECT * FROM doctors_clinic WHERE clinic_id = '${id}'`, [id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if(res.length!=0){
                if (res.length < 3) {
                    cb(null, res[0]);
                    return;
                } else {  

                    db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${id}' and status = 'active'`, [id], (err,pphres) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if(pphres.length>0){
                            var total_limit = pphres[0].total_limit;
                          
                            if(total_limit > 0){
                                cb(null, 1);
                                return;
                            } else {
                                cb({ kind: "new_doctor_limit_reached" }, null);
                                return;   
                            }
                        } else {
                            cb({ kind: "doctor_limit_reached" }, null);
                            return; 
                        }            
                        
                    });                  
                }

            } else {
                cb(null, 1);
                return;
            }            
            
        });
    }
    static findDoctorCountClinic(id,role_id) {   
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM doctors_clinic WHERE clinic_id = '${id}'`, [id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                if(res.length!=0){
                    if (res.length < 3) {
                        return resolve(res[0]);
                    } else {  
                        db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${id}' and status = 'active'`, [id], (err,pphres) => {
                            if (err) {
                                logger.error(err.message);
                                return reject(err);
                            }
                            if(pphres.length>0){
                                var total_limit = pphres[0].total_limit;
                              
                                if(total_limit > 0){
                                    return resolve(1);
                        
                                } else {
                                    return resolve({ kind: "new_doctor_limit_reached" });
                                }
                            } else {
                                return resolve({ kind: "doctor_limit_reached" });
                            }            
                            
                        });                  
                    }
    
                } else {
                    return resolve(1);
                }            
                
            });
        });
        
    }


    

}



module.exports = ClinicOrHospital;