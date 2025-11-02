const { JOI } = require('joi');
const { addPatient: addPatient,updatePatient:updatePatient} = require('../database/queries');
const User = require('./user.model');
const db = require('../config/db.config');
const { logger } = require('../utils/logger');
const helperFunction = require('../helper/helperFunction');
const { base64encode, base64decode } = require('nodejs-base64');
const { async } = require('q');
const helperQuery = require('../helper/helperQuery');
class Patient {

    // vineet

    static addForClinic(added_by,alternate_mobile_number,full_name,email_id,date_of_birth,mobile_number,sex,role_id,pin_code,address,created_by_id,suggested_by,suggested_by_id,appointment_date,profile_image,password,cb){
        var user_type  = "patient";
    
        db.query(addPatient, [added_by,alternate_mobile_number,full_name,email_id,date_of_birth,mobile_number,sex,role_id,pin_code,address,created_by_id,suggested_by,suggested_by_id,user_type,appointment_date,profile_image,password],(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if(res.insertId){
                var permanent_id = "MW" + mobile_number + "/" + "01";
                // var permanent_id = "MED"+mobile_number+"/"+"0"+res.insertId
                db.query("UPDATE users set permanent_id = ? where id = ? ", [permanent_id,res.insertId],(err,res)=>{
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    
                });
                const suggested_id = suggested_by_id!=undefined && suggested_by_id!='undefined' && suggested_by_id!=created_by_id ? suggested_by_id:null;
                const added_by_id = added_by!=undefined && added_by!='undefined' ? added_by:null;
                db.query("Insert into users_patient(patient_id,user_id,suggested_by_id,added_by) values(?,?,?,?)",[res.insertId,created_by_id,suggested_id,added_by_id],(err,res)=>{

                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                });
                cb(null,res);
            }
            
        });
    }
    static add(added_by,alternate_mobile_number,full_name,email_id,date_of_birth,mobile_number,sex,role_id,pin_code,address,created_by_id,suggested_by,suggested_by_id,appointment_date,profile_image,password,cb){
        var user_type  = "patient";
    
        db.query(addPatient, [added_by,alternate_mobile_number,full_name,email_id,date_of_birth,mobile_number,sex,role_id,pin_code,address,created_by_id,suggested_by,suggested_by_id,user_type,appointment_date,profile_image,password],(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if(res.insertId){
                var permanent_id = "MED"+mobile_number+"/"+"0"+res.insertId
                db.query("UPDATE users set permanent_id = ? where id = ? ", [permanent_id,res.insertId],(err,res)=>{
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    
                });
                const suggested_by_ids = suggested_by_id!=undefined && suggested_by_id!='undefined' ? suggested_by_id:null;
                const added_by_id = added_by!=undefined && added_by!='undefined' ? added_by:null;
                db.query("Insert into users_patient(patient_id,user_id) values(?,?)",[res.insertId,created_by_id],(err,res)=>{

                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                });
                cb(null,res);
            }
            
        });
    }


    static findAll(user_id,login_role_id,cb){
        var staff_name = '';
        db.query(`SELECT u.id,u.email,u.mobile,u.alternate_mobile,u.profile_image,u.first_name,u.suggested_by,u.suggested_by_id,u.pin_code,u.permanent_id,u.gender,u.date_of_birth,u.address,u.enquiry_date,u.added_by,u.role_id 
        FROM users as u 
        left join users_patient as up on u.id = up.patient_id 
        WHERE up.user_id = ?  order by up.id desc`, 
        [user_id], (err,res)=>{
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
                    const profile_image_name = (item.profile_image == null) ? '' :item.profile_image;
                    const profile_image_path =  process.env.APP_URL+"member/"+profile_image_name;
                    const full_name = item.first_name;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const suggested_by = item.suggested_by;
                    const suggested_by_id = item.suggested_by_id;
                    const pin_code = parseInt(item.pin_code);
                    const address = item.address;
                    var suggested_by_name = '';
                    const medwire_id = item.permanent_id;
                    const enquiry_date = item.enquiry_date;
                    var added_by = item.added_by;
                    var role_id = item.role_id;

                    if(added_by){
                        db.query(`SELECT * FROM users WHERE id = '${added_by}'`, [added_by], (err,data)=>{
                            if(err){
                                cb(err,null);
                                return 0;
                            }
                            if(data){
                                staff_name = data[0].first_name
                            }
                        });   
                    }
                    if(login_role_id == '2' || login_role_id == '3'){
                        db.query(`SELECT u.first_name from users u inner join radio_lab_doctors rld on rld.doctor_id = u.id where rld.id = ? `,[item.suggested_by_id],(err,res1)=>{                  
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                           
                            if(suggested_by == 'self'){
                                suggested_by_name = 'Self';
                            } else {
                                suggested_by_name =  (res1.length > 0)  ? res1[0].first_name : '';
                            } 
                            
                            response.push({id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,suggested_by_name,suggested_by_id,pin_code,address,medwire_id,enquiry_date,staff_name});

                        })

                    } else {
                        db.query(`SELECT first_name from users where id = ?`,[item.suggested_by_id],(err,res1)=>{                  
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                            
                            if(suggested_by == 'self'){
                                suggested_by_name = 'Self';
                            } else {
                                suggested_by_name =  (res1.length > 0)  ? res1[0].first_name : '';
                            } 
                             
                         response.push({id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,suggested_by_name,suggested_by_id,pin_code,address,medwire_id,enquiry_date,staff_name});
                        });

                    }
                }
                setTimeout(function(){
                        cb(null, response);
                    },100);  
            } else {
                cb({ kind: "not_found" }, null);
            }
            
        })
    }
    static findAllClinicData(user_id){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT u.id,u.email,u.created_by_id,u.mobile,u.alternate_mobile,u.profile_image,u.first_name,u.pin_code,u.permanent_id,u.gender,u.date_of_birth,u.address,u.enquiry_date,
            u.added_by,u.suggested_by,u.suggested_by_id,
            c.role_id,
            s.first_name as suggested_by_name,
            aBy.first_name as staff_name
            FROM users_patient as up
            inner join users c on c.id = up.user_id 
            left join users u on u.id = up.patient_id
            left join users s on s.id = up.suggested_by_id
            left join users aBy on aBy.id = up.added_by
            WHERE up.user_id = '${user_id}'  order by up.id desc`, 
            async(err,res)=>{
                if(err){
                    logger.error(err.message);
                    cb(err,null);
                    return reject(err);
                }
                const response = [];
                if(res.length > 0){
                    for (const item of res) {
                        if (item.email==null && item.created_by_id!=undefined && item.created_by_id!=null && item.created_by_id!=0) {
                            const mainUser = await helperQuery.First({table:"users",where:"id="+item.created_by_id});
                            var mobile_number = parseInt(mainUser.mobile);
                            var email = mainUser.email;
                            var pin_code = parseInt(mainUser.pin_code);
                        } else {
                            var mobile_number = parseInt(item.mobile);
                            var email = item.email;
                            var pin_code = parseInt(item.pin_code);
                        }
                        
                        const id = item.id;
                        const profile_image_name = (item.profile_image == null) ? '' :item.profile_image;
                        const profile_image_path =  process.env.APP_URL+"member/"+profile_image_name;
                        const full_name = item.first_name;
                        const date_of_birth = item.date_of_birth;
                        const gender = item.gender;
                        const suggested_by = item.suggested_by;
                        const suggested_by_id = item.suggested_by_id;
                        const address = item.address;
                        const medwire_id = item.permanent_id;
                        const enquiry_date = item.enquiry_date;
                        var added_by = item.added_by??null;
                        var role_id = item.role_id;
                        var staff_name = item.staff_name??null;
                        var suggested_by_name = item.suggested_by_name!=null && item.suggested_by_name!='' ? item.suggested_by_name:'Self';
            
                        response.push({id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,suggested_by_name,suggested_by_id,pin_code,address,medwire_id,enquiry_date,staff_name,added_by,role_id});
                    
                    }
                    return resolve(response);
                } else if(res.length <=0) {
                    return resolve({ kind: "not_found" });
                }
                
            })
        });
    }

    static findStaffPatientAll(user_id,added_by, cb){
        var query = `SELECT distinct u.id,u.added_by,u.email,u.mobile,u.alternate_mobile,u.profile_image,u.first_name,u.suggested_by,u.suggested_by_id,u.pin_code,u.permanent_id,u.gender,u.date_of_birth,u.address,u.enquiry_date FROM users as u left join users_patient as up on u.id = up.patient_id WHERE up.user_id = ${user_id} AND u.added_by = ${added_by}  order by u.id desc`;

        db.query(query, (err,res)=>{
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
                    const profile_image_name = (item.profile_image == null) ? '' :item.profile_image;
                    const profile_image_path =  process.env.APP_URL+"member/"+profile_image_name;
                    const full_name = item.first_name;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const suggested_by = item.suggested_by;
                    const suggested_by_id = item.suggested_by_id;
                    const pin_code = parseInt(item.pin_code);
                    const address = item.address;
                    var suggested_by_name = '';
                    const medwire_id = item.permanent_id;
                    const enquiry_date = item.enquiry_date;

                     db.query(`SELECT first_name from users where id = ?`,[item.suggested_by_id],(err,res1)=>{                  
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        
                        if(suggested_by == 'self'){
                            suggested_by_name = 'Self';
                        } else {
                            suggested_by_name =  (res1.length > 0)  ? res1[0].first_name : '';
                        } 
                         
                     response.push({id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,suggested_by_name,suggested_by_id,pin_code,address,medwire_id,enquiry_date});
                    }); 
                                      
                    
                }
                setTimeout(function(){
                        cb(null, response);
                    },100);  
            } else {
                cb({ kind: "not_found" }, null);
            }
        })
    }

    static findByMobileNumber(mobile_number,cb) {
        var role_id = 2;
        var deleted_at = 'IS NULL'
        db.query(`SELECT * FROM users WHERE mobile = '${mobile_number}' and role_id = '${role_id}' and deleted_at ${deleted_at}`, [mobile_number,role_id,deleted_at], (err, res) => {
            
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
        })
    }



    static findByIdAndRole(user_id,role_id, cb) {  
     
        var deleted_at = 'IS NULL'
        db.query(`SELECT * FROM users WHERE id = '${user_id}' and role_id = ${role_id} and deleted_at ${deleted_at} order by id desc`, [user_id,role_id,deleted_at], (err,res)=>{
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
                    const profile_image_name = (item.profile_image == null) ? '' :item.profile_image;
                    const profile_image_path = process.env.APP_URL+"member/"+profile_image_name;
                    const full_name = item.first_name;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const suggested_by = item.suggested_by;
                    const suggested_by_id = item.suggested_by_id;
                    const enquiry_date = item.enquiry_date;
                    const pin_code = parseInt(item.pin_code);
                    const medwire_id = item.permanent_id;
                    const address = item.address;
                    

                    db.query(`SELECT first_name from users where id = ?`,[item.suggested_by_id],(err,res1)=>{                  
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        
                        if(suggested_by == 'self'){
                            suggested_by_name = 'self';
                        } else {
                            var suggested_by_name =  (res1.length > 0)  ? res1[0].first_name : '';
                        }
                        response.push({id,full_name,gender,date_of_birth,email,mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,suggested_by_name,suggested_by_id,pin_code,medwire_id,enquiry_date,address});
                    });                    
                    
                }
                setTimeout(function(){
                    cb(null, response);
                },100);
            } else {
                cb({ kind: "not_found" }, null);
            }
            
        })
    }


    // vineet
    
    static update(primary_user_id,alternate_mobile_number,first_name,email_id,mobile_number,
        date_of_birth,sex,pin_code,
        address,profile_image,suggested_by,suggested_by_id,
        enquiry_date,user_id,created_by_id,cb){

    
        var deleted_at = 'IS NULL';
        var updated_at = helperFunction.getCurrentDateTime();

        if(suggested_by == 'self'){
            suggested_by_id = created_by_id;
        } 

  
        db.query(`SELECT * FROM users WHERE created_by_id = '${primary_user_id}'  and deleted_at ${deleted_at}`, [user_id,deleted_at], (err, res) => {
             
          
            if(res.length > 0){

                if(profile_image!='' && profile_image!=undefined){
                    db.query(`update users SET profile_image = ? , alternate_mobile = ?, first_name = ?,  date_of_birth = ?,  gender = ?  ,pin_code = ? ,address = ? , suggested_by = ?,suggested_by_id = ?, enquiry_date = ? ,updated_at = ?  WHERE id = ?`,[profile_image,alternate_mobile_number,first_name,date_of_birth,sex,pin_code,address,suggested_by,suggested_by_id,enquiry_date,updated_at,user_id],(err,res)=>{
            
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }

                    });
                } else {
                   db.query(`update users SET alternate_mobile = ?, first_name = ?,  date_of_birth = ?,  gender = ?  ,pin_code = ? ,address = ? , suggested_by = ?,suggested_by_id = ?, enquiry_date = ? ,updated_at = ?  WHERE id = ?`,[alternate_mobile_number,first_name,date_of_birth,sex,pin_code,address,suggested_by,suggested_by_id,enquiry_date,updated_at,user_id],(err,res)=>{
            
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }

                    }); 
                }



                db.query("Insert into users_patient(patient_id,user_id) values(?,?)",[user_id,created_by_id],(err,res2)=>{
        
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }

                    if(res2.affectedRows <= 0){
                        cb({ kind: "failed_to_update" }, null);
                    }
                    cb(null,res2);
                    
                });
                  

            } else {
                if(suggested_by == 'self'){
                    suggested_by_id = created_by_id;
                }   
        
            
                
                if(profile_image!='' && profile_image!=undefined){
                    db.query(`update users SET alternate_mobile = ?, first_name = ?, email = ?, mobile = ?, date_of_birth = ?,  gender = ?  ,pin_code = ? ,address = ? , suggested_by = ?,suggested_by_id = ?, enquiry_date = ? ,updated_at = ?  WHERE id = ?`,[alternate_mobile_number,first_name,email_id,mobile_number,date_of_birth,sex,pin_code,address,suggested_by,suggested_by_id,enquiry_date,updated_at,user_id],(err,res)=>{
        
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    if(res.affectedRows > 0){
                        var permanent_id = "MED"+mobile_number+"/"+"0"+user_id;
                        db.query("UPDATE users set permanent_id = ? where id = ? ", [permanent_id,user_id],(err,res1)=>{
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                            if(res1.affectedRows <= 0){
                                cb({ kind: "failed_to_update" }, null);
                            }
                        });
        
        
                        db.query("Insert into users_patient(patient_id,user_id) values(?,?)",[user_id,created_by_id],(err,res2)=>{
        
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
        
                            if(res2.affectedRows <= 0){
                                cb({ kind: "failed_to_update" }, null);
                            }
                            
                            
                        });
                            cb(null,res);  
                    } else {
                        cb({ kind: "failed_to_update" }, null);
                    }              
                }) 


                } else {
                    db.query(updatePatient,[alternate_mobile_number,first_name,email_id,mobile_number,date_of_birth,sex,pin_code,address,profile_image,suggested_by,suggested_by_id,enquiry_date,updated_at,user_id],(err,res)=>{
        
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    if(res.affectedRows > 0){
                        var permanent_id = "MED"+mobile_number+"/"+"0"+user_id;
                        db.query("UPDATE users set permanent_id = ? where id = ? ", [permanent_id,user_id],(err,res1)=>{
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
                            if(res1.affectedRows <= 0){
                                cb({ kind: "failed_to_update" }, null);
                            }
                        });
        
        
                        db.query("Insert into users_patient(patient_id,user_id) values(?,?)",[user_id,created_by_id],(err,res2)=>{
        
                            if (err) {
                                logger.error(err.message);
                                cb(err, null);
                                return;
                            }
        
                            if(res2.affectedRows <= 0){
                                cb({ kind: "failed_to_update" }, null);
                            }
                            
                            
                        });
                            cb(null,res);  
                    } else {
                        cb({ kind: "failed_to_update" }, null);
                    }              
                }) 

                }              
            }           

        })  
    }
    static deleteStaffPatient(id,added_by, cb){
        var added_by = null;
        var query = `update  users set added_by = ${added_by}  WHERE id = ${id}`;
        db.query(query,(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });
        cb(null, {id: id});
    }
    static delete(id,created_by_id,cb){
        db.query(`delete from users_patient WHERE patient_id = ? and user_id = ? `,[id,created_by_id],(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
        });

        cb(null, {id: id});
    }

    static search(search_key,cb) {
        var deleted_at = 'IS NULL';
        var role_id = 2;
        var approve_status = 'Approve';

        db.query(`SELECT * FROM users WHERE (mobile = '${search_key}' OR permanent_id = '${search_key}')  and role_id = '${role_id}'  and deleted_at ${deleted_at}`, [search_key,role_id,deleted_at], (err, res) => {
     
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res.length) {
                var response = [];
                for (const item of res) {
                    const id = item.id;
                    const role_id = item.role_id;
                    const email = item.email;
                    const mobile_number = parseInt(item.mobile);
                    const alternate_mobile_number = parseInt(item.alternate_mobile);
                    const profile_image_name = (item.profile_image == null) ? '' :item.profile_image;
                    const  profile_image_path = process.env.APP_URL+"member/"+profile_image_name;
                    const full_name = item.first_name;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const pin_code = parseInt(item.pin_code);
                    const address = item.address;
                    db.query(`SELECT * FROM users WHERE created_by_id = '${id}' and role_id = '${role_id}'  and deleted_at ${deleted_at}`, [id,role_id,deleted_at], (err, memres) => {
                        for (const item1 of memres) {
                            const id = item1.id;
                            const role_id = item1.role_id;
                            const email = item1.email;
                            const mobile_number = parseInt(item1.mobile);
                            const alternate_mobile_number = parseInt(item1.alternate_mobile);
                            const profile_image_name = (item1.profile_image == null) ? '' :item1.profile_image;
                            const  profile_image_path = process.env.APP_URL+"member/"+profile_image_name;
                            const full_name = item1.first_name;
                            const date_of_birth = item1.date_of_birth;
                            const gender = item1.gender;
                            const pin_code = parseInt(item1.pin_code);
                            const address = item1.address;
                            response.push({role_id, id,full_name,gender,date_of_birth,email,mobile_number,alternate_mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,pin_code,address});
                        }
                    });
                    response.push({role_id, id,full_name,gender,date_of_birth,email,mobile_number,alternate_mobile_number,date_of_birth,gender,profile_image_name,profile_image_path,pin_code,address});
                }
                setTimeout(function(){
                        cb(null, response);
                },100); 
            } else {
                cb({ kind: "not_found" }, null);
            }
        })
    }

    static checkExistence(patient_id,created_by_id,cb){
        db.query(`select * from users_patient WHERE patient_id = ? and user_id = ? `,[patient_id,created_by_id],(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }            
            cb(null,res);
        });       
    }

}
module.exports = Patient;