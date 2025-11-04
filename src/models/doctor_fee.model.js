const { JOI } = require("joi");
const db = require("../config/db.config");
const {addDoctorFeeQuery : addDoctorFeeQuery} = require("../database/queries");
const { logger } = require("../utils/logger");

class DoctorFee {

    // vineet
    static add(doctor_id,is_available_for_offline_visit,is_available_for_online_visit,online_consulting_fee,clinic_visit_consulting_fee,created_by_id,cb){

        db.query("INSERT INTO doctor_fees(doctor_id,is_available_for_offline_visit,is_available_for_online_visit,online_consulting_fee,clinic_visit_consulting_fee,created_by_id) VALUES(?,?,?,?,?,?)",[doctor_id,is_available_for_offline_visit,is_available_for_online_visit,online_consulting_fee,clinic_visit_consulting_fee,created_by_id],(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if(res){
              cb(null,res);   
            }           
            
        });
    }


    static findByDoctorId(doctor_id,cb) {
        db.query(`SELECT * FROM doctor_fees WHERE doctor_id = '${doctor_id}'`, [doctor_id], (err, res) => {
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


    static findFeeSpecificDoctor(clinic_id,cb) {
        db.query(`SELECT d.id,d.first_name AS name 
                FROM doctors_clinic dc
                INNER JOIN users d ON d.id = dc.doctor_id
                INNER JOIN users c ON c.id = dc.clinic_id
                LEFT JOIN doctor_fees ON doctor_fees.doctor_id = d.id and 
                doctor_fees.created_by_id = dc.clinic_id
                WHERE d.role_id = 5 AND d.deleted_at IS NULL  
                AND doctor_fees.doctor_id IS NULL
                AND c.role_id = 8 AND c.deleted_at IS NULL
                AND dc.clinic_id = '${clinic_id}'`, 
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    if(res.length > 0){
                        cb(null,res);
                        return;
                    }  else {
                        cb({ kind: "not_found" }, null);
                        return; 
                    }
                });
    }


    static findAllDoctorFees(clinic_id,cb) {
        var clinic_role_id = 8;
        var deleted_at = "IS NULL";

        db.query(`SELECT doctor_fees.id,users.id as doctor_id,users.profile_image, users.first_name as doctor_name,doctor_fees.visit_type,doctor_fees.is_available_for_offline_visit,doctor_fees.is_available_for_online_visit,doctor_fees.online_consulting_fee,doctor_fees.clinic_visit_consulting_fee,users.experience_in_year FROM doctor_fees INNER JOIN users on doctor_fees.doctor_id = users.id WHERE users.role_id = 5 AND doctor_fees.created_by_id = '${clinic_id}' AND users.deleted_at IS NULL AND doctor_fees.deleted_at IS NULL order by doctor_fees.id DESC`, [clinic_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            var response = [];
            if(res){
                for(const item of res){
                    var doctor_id = item.doctor_id;
                    db.query(`SELECT GROUP_CONCAT(DISTINCT doctor_specialities.speciality_name) as specialities FROM doctor_specialities  WHERE doctor_specialities.doctor_id = '${doctor_id}'  AND doctor_specialities.deleted_at IS NULL order by id DESC`, [doctor_id], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if(res){
                            item["specialities"] = res[0].specialities;
                            response.push(item); 
                        }                                    
                        
                    });                
                }

                                
                setTimeout(function() {
                    if(response.length > 0){
                        cb(null,response);
                        return;                                         
                    } 
                    else {
                        cb({ kind: "not_found" }, null);
                        return; 
                     }
                 }, 100);
            }         
        });         
    }


    static findById(id,cb) {
        var deleted_at = "IS NULL";
        db.query(`SELECT doctor_fees.id,users.id as doctor_id,users.profile_image,  users.first_name,doctor_fees.visit_type,doctor_fees.is_available_for_offline_visit,doctor_fees.is_available_for_online_visit,doctor_fees.online_consulting_fee,doctor_fees.clinic_visit_consulting_fee,users.experience_in_year FROM doctor_fees LEFT JOIN users on doctor_fees.doctor_id = users.id  WHERE users.role_id = 5 AND doctor_fees.id = '${id}' AND users.deleted_at IS NULL AND doctor_fees.deleted_at IS NULL order by id desc`, [id], (err, res) => {

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



    static findByClinicId(clinic_id,cb) {
        db.query(`SELECT * FROM doctor_fees WHERE created_by_id = '${clinic_id}'`, [clinic_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res);
                return;
            }
        });
    }

    static update(doctor_id,visit_type,is_available_for_offline_visit,is_available_for_online_visit,online_consulting_fee,clinic_visit_consulting_fee,fee_id,cb){
        db.query(`UPDATE doctor_fees SET doctor_id = ?, visit_type = ?, is_available_for_offline_visit = ?, is_available_for_online_visit = ?, online_consulting_fee = ? ,clinic_visit_consulting_fee = ?  WHERE id = ?
        `,[doctor_id,visit_type,is_available_for_offline_visit,is_available_for_online_visit,online_consulting_fee,clinic_visit_consulting_fee,fee_id],(err,res)=>{
            
          
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: fee_id
            });
        });
             
    }


    static delete(id,cb){
        let date_ob = new Date();
        // current date
        // adjust 0 before single digit date
        let date = ("0" + date_ob.getDate()).slice(-2);

        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        // current year
        let year = date_ob.getFullYear();

        // current hours
        let hours = date_ob.getHours();

        // current minutes
        let minutes = date_ob.getMinutes();

        // current seconds
        let seconds = date_ob.getSeconds();
        var deleted_at = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
                  

        db.query("update doctor_fees set deleted_at = ? WHERE id= ?",[deleted_at,id],(err,res)=>{                  
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });

    }


}
module.exports = DoctorFee;