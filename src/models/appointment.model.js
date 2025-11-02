const { JOI } = require('joi');
const db = require('../config/db.config');
const { logger } = require('../utils/logger');
const helperFunction = require('../helper/helperFunction');
const helperQuery = require("../helper/helperQuery");
const { async } = require('q');

class Appointment {

    static findById(id,cb) {
        var deleted_at = 'IS NULL';
        db.query(`SELECT * FROM appointments WHERE id = '${id}' and deleted_at ${deleted_at}`, [id,deleted_at], (err, res) => {
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

    static findByIdAsync(id) {
        return new Promise((resolve,reject)=>{
            var deleted_at = 'IS NULL';
            db.query(`SELECT * FROM appointments WHERE id = '${id}' and deleted_at ${deleted_at}`, [id,deleted_at], (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res.length) {
                    return resolve(res[0]);
                } else {
                    return resolve({ kind: "not_found" });
                }
                
            })
        });
    }

    static findAll(clinic_id,doctor_id,role_id,cb) {
        var deleted_at = 'IS NULL';
        if(role_id == 5){
            var query = `SELECT appointments.appointments_user_type,appointments.prescription_pdf_name,appointments.appointment_date,appointments.id as appointment_id,appointments.patient_id,appointments.reason,appointments.from_time,appointments.status FROM appointments inner join users  on users.id = appointments.doctor_id  WHERE appointments.clinic_id = '${clinic_id}' and appointments.doctor_id = '${doctor_id}' and appointments.deleted_at ${deleted_at} and (appointments.status!='Pending' and appointments.status!='' and appointments.status!='Cancelled' and appointments.payment_status='Success')  ORDER BY appointments.id DESC`;
        } else {
            var query = `SELECT appointments.appointments_user_type,appointments.prescription_pdf_name,appointments.appointment_date,appointments.id as appointment_id,appointments.patient_id,appointments.reason,appointments.from_time,appointments.status FROM appointments inner join users  on users.id = appointments.doctor_id  WHERE appointments.clinic_id = '${clinic_id}' and appointments.doctor_id = '${doctor_id}' and appointments.deleted_at = ${deleted_at} and appointments.payment_status='Success'  ORDER BY appointments.id DESC`
        }
        db.query(query,[clinic_id,doctor_id,deleted_at],
            (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            

            if(res.length > 0) {            

                    const response = [];
                        for(const item of res) {
                            var patient_id = item.patient_id;
                            db.query(`SELECT * FROM users WHERE id = '${patient_id}' `,
                             [patient_id],
                             async(err, res1) => {            
                                if (err) {
                                    logger.error(err.message);
                                    cb(err, null);
                                    return;
                                }
                                if(res1){
                                    const cid = res1[0].created_by_id!=0 && res1[0].created_by_id!=null?res1[0].created_by_id:0;
                                    const mainMember = await helperQuery.First({table:"users",where:"id="+cid});
                                    const patient_name = res1[0].first_name;
                                    const date_of_birth = res1[0].date_of_birth;
                                    const gender = res1[0].gender;
                                    const appointments_user_type =item.appointments_user_type;
                                    const mobile_number = res1[0].mobile!=null && res1[0].mobile!=undefined ? parseInt(res1[0].mobile):parseInt(mainMember.mobile);
                                    const appointment_reason = item.reason;
                                    const appointment_date =item.appointment_date;
                                    const time_slot =item.from_time;
                                    const appointment_status = item.status;
                                    const profile_image_name = res1[0].profile_image;
                                    const profile_image_path = process.env.APP_URL+"member/"+profile_image_name;                            
                                    const appointment_id = item.appointment_id;
                                    const prescription_pdf_name = item.prescription_pdf_name;
                                    response.push({ appointments_user_type,appointment_id,prescription_pdf_name,patient_id,patient_name,gender,date_of_birth,mobile_number,appointment_date,time_slot,appointment_reason,appointment_status,profile_image_name,profile_image_path});                                
                                }

                         }); 
                        }                  
                              
                    
                    setTimeout(function(){
                        cb(null, response);
                    },1000);           
               
                return;                
            }  else {
                cb({ kind: "not_found" }, null);
            }           
        })
    }

    static findDoctorsClinic(user_id,cb) {
        var deleted_at = 'IS NULL';

        db.query(`SELECT * FROM users u inner join doctors_clinic dc on u.id = dc.doctor_id WHERE dc.doctor_id = '${user_id}' `,
         [user_id,deleted_at],
         (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if(res) {
                
                var response = [];  

                for(let item of res) {
                    var clinic_id = item.clinic_id;
                    db.query(`SELECT U.id as clinic_id,U.first_name as name,U.profile_image,P.clinic_timing,U.email FROM users U  left JOIN prescriptions P on P.created_by_id = U.ID  WHERE U.id = '${clinic_id}' and U.deleted_at IS NULL`,
                     [clinic_id,deleted_at],
                     (err, res1) => {                        
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if(res1.length >0) { 
                            var clinic_id = res1[0].clinic_id;
                            var clinic_name = res1[0].name;
                            var clinic_email = res1[0].email;
                            var profile_image_name = res1[0].profile_image;
                            var profile_image_path = process.env.APP_URL+"member/"+profile_image_name;                            
                            var clinic_timing = res1[0].clinic_timing;
                            response.push({clinic_id,clinic_name,clinic_email,profile_image_name,profile_image_path,clinic_timing});
                        }            
                    }); 
                                       
                }
                setTimeout(function(){
                    cb(null, response);
                },1000); 
            }            
        })
    }
    
    static addSymptom(all_data,cb) {
        var created_at =  helperFunction.getCurrentDateTime();
        db.query(`INSERT INTO symptoms(source,duration,type,appointment_id,created_by_id,created_at) VALUES ?`,[
        all_data.map(item => [item.source.toString(), item.duration, item.type,item.appointment_id,item.doctor_id,created_at])],(err,res)=>{

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if(res.insertId > 0) {
                cb(null, res);
                return;                
            }  else {
               cb({ kind: "not_inserted" }, null); 
            }           
        });
        
    }
    

    static symptomList(doctor_id,appointment_id) {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM symptoms WHERE appointment_id = '${appointment_id}' and created_by_id = '${doctor_id}' and deleted_at IS NULL`,
             (err, res) => {

                if (err) {
                    return reject(err);
                }
                return resolve(res);            
                })
            });    
    }


    static addVital(doctor_id,appointment_id,heart_rate,blood_pressure,respiratory_rate,oxygen_saturation,temperature,bmi,cb) {       

        var created_at = helperFunction.getCurrentDateTime();
        
        
        db.query(`INSERT INTO health_status(heart_rate,blood_pressure,respiratory_rate,oxygen_saturation,temperature,bmi,appointment_id,created_by_id,created_at) 
                 VALUES('${heart_rate}','${blood_pressure}','${respiratory_rate}','${oxygen_saturation}','${temperature}','${bmi}','${appointment_id}','${doctor_id}','${created_at}')`,
         [heart_rate,blood_pressure,respiratory_rate,oxygen_saturation,temperature,bmi,appointment_id,doctor_id,created_at],
         (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

             if(res.insertId > 0) {
                cb(null, res);
                return;                
            }  else {
               cb({ kind: "not_inserted" }, null); 
            }            
        })
        
    }

    static vitalList(doctor_id,appointment_id) {

        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM health_status WHERE appointment_id = '${appointment_id}' and created_by_id = '${doctor_id}' and deleted_at IS NULL`,
             (err, res) => {

                if (err) {
                    return reject(err);
                }
                return resolve(res);            
                })
        });  
       
    }
    


    static addExamFinding(doctor_id,appointment_id,examination_finding_name,cb) {       
        var created_at = helperFunction.getCurrentDateTime();
        var examination_finding_name = examination_finding_name.toString().split(",");
       
        var all_data = [];
        for(const efn of examination_finding_name) {
           all_data.push({'examination_finding_name':efn,'appointment_id':appointment_id,'created_by_id':doctor_id,'created_at':created_at}); 
        }

        if(all_data.length > 0){
            db.query(`INSERT INTO examination_findings(examination_finding_name,appointment_id,created_by_id,created_at) VALUES ?`,[
                all_data.map(item => [item.examination_finding_name, item.appointment_id, item.created_by_id,created_at])],(err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }

                    if(res.insertId > 0) {
                        cb(null, res);
                        return;                
                    }  else {
                       cb({ kind: "not_inserted" }, null); 
                    }             
                }); 
            }
    }

    static examFindingList(doctor_id,appointment_id,cb) {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM examination_findings WHERE appointment_id = '${appointment_id}' and created_by_id = '${doctor_id}' and deleted_at IS NULL`,
             (err, res) => {

                if (err) {
                    return reject(err);
                }
                return resolve(res);            
                })
        });  
    }

    static addAdvice(doctor_id,appointment_id,advices,cb) {       

        var created_at = helperFunction.getCurrentDateTime();

        var advices = advices.toString().split(",");
       
        var all_data = [];
        for(const ad of advices) {
           all_data.push({'advices':ad,'appointment_id':appointment_id,'created_by_id':doctor_id,'created_at':created_at}); 
        }

        db.query(`INSERT INTO advices(advice_name,appointment_id,created_by_id,created_at) VALUES ?`,[
            all_data.map(item => [item.advices, item.appointment_id, item.created_by_id,created_at])],(err, res) => {

              if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if(res.insertId > 0) {
                    cb(null, res);
                    return;                
                }  else {
                   cb({ kind: "not_inserted" }, null); 
                }
        });
        
    }


    static adviceList(doctor_id,appointment_id) {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM advices WHERE appointment_id = '${appointment_id}' and created_by_id = '${doctor_id}' and deleted_at IS NULL`,
             (err, res) => {

                if (err) {
                    return reject(err);
                }
                return resolve(res);            
                })
        });  

    }

    static addFollowUp(doctor_id,appointment_id,follow_up_intervals,cb) {       

        var created_at = helperFunction.getCurrentDateTime();

        var follow_up_intervals = follow_up_intervals.toString().split(",");
        var all_data = [];
        for(const fwi of follow_up_intervals) {
          all_data.push({'follow_up_interval':fwi,'appointment_id':appointment_id,'created_by_id':doctor_id,'created_at':created_at}); 

        }

        db.query(`INSERT INTO follow_ups(follow_up_interval,appointment_id,created_by_id,created_at) VALUES?`,[
            all_data.map(item => [item.follow_up_interval, item.appointment_id, item.created_by_id,created_at])],(err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }

                if(res.insertId > 0) {
                    cb(null, res);
                    return;                
                }  else {
                   cb({ kind: "not_inserted" }, null); 
                }            
        })
    }
    
    static followUpList(doctor_id,appointment_id) {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM follow_ups WHERE appointment_id = '${appointment_id}' and created_by_id = '${doctor_id}' and deleted_at IS NULL`,
             (err, res) => {

                if (err) {
                    return reject(err);
                }
                return resolve(res);            
                })
        }); 

    }

    static addDignostic(doctor_id,appointment_id,diagnostic_names,lab_id,lab_test_ids,is_book_lab_test,radio_id,radio_test_ids,is_book_radio_test,lab_appointment_date,lab_time_slot,radio_appointment_date,radio_time_slot,is_lab_appointment,is_radio_appointment,cb) {
        var created_at = helperFunction.getCurrentDateTime();
        var l_test_ids =lab_test_ids!=undefined && lab_test_ids ? lab_test_ids:[];
        var r_test_ids =radio_test_ids!=undefined && radio_test_ids ? radio_test_ids:[];
        if(is_lab_appointment == 0){
            lab_appointment_date = '';
            lab_time_slot = '';
        }

        if(is_radio_appointment == 0){
            radio_appointment_date = '';
            radio_time_slot = '';
        }

        var all_l_data = [];

        var all_r_data = [];


       

        if(is_book_lab_test == 1){
            if (lab_appointment_date==undefined || lab_appointment_date==null) {
                cb({ kind: "l_appointment" ,message:"Lab appointment date is required"},null);
                return; 
            }
            if ( lab_time_slot==undefined || lab_time_slot==null) {
                cb({ kind: "l_appointment_slot" ,message:"Lab time slot is required"},null);
                return; 
            }

            for(const tid of l_test_ids) { 
                all_l_data.push({'lab_id':lab_id,'test_ids':tid,'appointment_id':appointment_id,'diagnostic_names':diagnostic_names.toString(),'is_book_lab_test':is_book_lab_test,'appointment_date':lab_appointment_date,'appointment_time':lab_time_slot,'doctor_id':doctor_id});
            }
            for(const item of all_l_data) {                

                db.query(`INSERT INTO dignostic(lab_id,dignostic_names,test_id,appointment_id,is_book_lab_test,appointment_date,appointment_time,created_by_id,created_at) 
                    VALUES(?,?,?,?,?,?,?,?,NOW())`,
                    [item.lab_id,item.diagnostic_names,item.test_ids, item.appointment_id, item.is_book_lab_test,item.appointment_date,item.appointment_time,item.doctor_id,created_at], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if(res.insertId > 0) {
                                        
                        }  else {
                            cb({ kind: "not_inserted" }, null); 
                        }  

                })         
            
                
            }
        }

        if(is_book_radio_test == 1){
            if (radio_appointment_date==undefined || radio_appointment_date==null) {
                cb({ kind: "appointment" ,message:"Radiology appointment date is required"},null);
                return; 
            }
            if ( radio_time_slot==undefined || radio_time_slot==null) {
                cb({ kind: "appointment_slot" ,message:"Radiology time slot is required"},null);
                return; 
            }
            for(const tid1 of r_test_ids) { 
                all_r_data.push({'radio_id':radio_id,'test_ids':tid1,'appointment_id':appointment_id,'diagnostic_names':diagnostic_names.toString(),'is_book_radio_test':is_book_radio_test,'appointment_date':radio_appointment_date,'appointment_time':radio_time_slot,'doctor_id':doctor_id});
            }
            for(const item of all_r_data) {                

                 db.query(`INSERT INTO dignostic(lab_id,dignostic_names,test_id,appointment_id,is_book_radio_test,appointment_date,appointment_time,created_by_id,created_at) 
                    VALUES(?,?,?,?,?,?,?,?,NOW())`,
                    [item.radio_id,item.diagnostic_names,item.test_ids, item.appointment_id, item.is_book_radio_test,item.appointment_date,item.appointment_time,item.doctor_id,created_at], (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        if(res.insertId > 0) {                                  
                       
                            cb(null, res);
                            return;                
                        }  else {
                            cb({ kind: "not_inserted" }, null); 
                        }  

                })     
            }
        }
        if(is_book_lab_test != 1 && is_book_radio_test !=1 ){
         
            db.query(`INSERT INTO dignostic(lab_id,dignostic_names,test_id,appointment_id,is_book_lab_test,appointment_date,appointment_time,created_by_id,created_at) 
            VALUES(?,?,?,?,?,?,?,?,NOW())`,
            [lab_id,diagnostic_names,'', appointment_id, is_book_lab_test,'','',doctor_id,created_at], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if(res.insertId > 0) {
                                
                }  else {
                    cb({ kind: "not_inserted" }, null); 
                }  

             }) 
        }


        cb(null, 1);
        return; 
    }

    
    static dignosticList(doctor_id,appointment_id) {
        // console.log("q",`SELECT dg.dignostic_names,dg.id,u.id,u.first_name as lab_name,DATE_FORMAT(STR_TO_DATE(dg.appointment_date,'%Y-%m-%d'), '%d/%m/%Y') as appointment_date,dg.appointment_time,lt.test_name as test_name FROM dignostic as dg left join users as u on u.id = dg.lab_id left join lab_tests as lt on lt.test_id = dg.test_id WHERE dg.appointment_id = '${appointment_id}' and dg.created_by_id = '${doctor_id}' and dg.deleted_at IS NULL`);
        return new Promise((resolve,reject)=>{
            // var query = `SELECT dg.dignostic_names,dg.id,u.id,u.first_name as lab_name,DATE_FORMAT(STR_TO_DATE(dg.appointment_date,'%Y-%m-%d'), '%d/%m/%Y') as appointment_date,dg.appointment_time,lt.test_name as test_name FROM dignostic as dg left join users as u on u.id = dg.lab_id left join lab_tests as lt on lt.test_id = dg.test_id WHERE dg.appointment_id = '${appointment_id}' and dg.created_by_id = '${doctor_id}' and dg.deleted_at IS NULL`;
            var query = `SELECT dg.dignostic_names,dg.id,u.id,u.first_name as lab_name,dg.appointment_date as appointment_date,dg.appointment_time,lt.test_name as test_name 
            FROM dignostic as dg left join users as u on u.id = dg.lab_id left join lab_tests as lt on lt.test_id = dg.test_id
            WHERE dg.appointment_id = '${appointment_id}' and dg.created_by_id = '${doctor_id}' and dg.deleted_at IS NULL`;
            db.query(query,
         (err, res) => {

            if (err) {
                return reject(err);
            }
            console.log("res",res);
            return resolve(res);            
            })
        });
        
    }

    static addDrug({drug_names, appointment_id, drug_duration,drug_type,drug_frequency,drug_timing,doctor_id},cb) {
        var created_at = helperFunction.getCurrentDateTime();
      
        db.query(`INSERT INTO drugs(drug_names,appointment_id,drug_duration,drug_type,drug_frequency,drug_timing,created_by_id,created_at) VALUES (?,?,?,?,?,?,?,?)`,
        [drug_names, appointment_id, drug_duration,drug_type,drug_frequency,drug_timing,doctor_id,created_at],
        // [all_data.map(item => [item.drug_names.toString(), item.appointment_id, item.drug_duration,item.drug_type,item.drug_frequency,item.drug_timing,item.doctor_id,created_at])],
        (err,res)=>{

           if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if(res.insertId > 0) {
                cb(null, res);
                return;                
            }  else {
               cb({ kind: "not_inserted" }, null); 
            }           
        })
        
        return false;        
    }    

    static drugList(doctor_id,appointment_id) {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM drugs WHERE appointment_id = '${appointment_id}' and created_by_id = '${doctor_id}' and deleted_at IS NULL`,
             (err, res) => {

                if (err) {
                    return reject(err);
                }
                return resolve(res);            
                })
        }); 

    }

    static findAllLabs(doctor_id,cb) {
        var deleted_at = 'IS NULL';
        db.query(`SELECT * FROM users WHERE created_by_id = '${doctor_id}' and approve_status = 'Approve' and deleted_at ${deleted_at}`,
         [doctor_id,deleted_at],
         (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if(res) {
                cb(null, res);
                return;                
            }            
        })
    }


    static findAppointmentList(user_id,role_id,cb) {

        var deleted_at = 'IS NULL';
        var sqlQuery = `SELECT appointments.id as appointment_id,appointments.patient_id,appointments.reason,appointments.from_time,appointments.status,appointments.reason,appointments.doctor_id,d.first_name as doctor_name,appointments.reason_of_status,appointments.appointment_date FROM appointments inner join users on users.id = appointments.clinic_id INNER JOIN users d on d.id = appointments.doctor_id WHERE appointments.clinic_id = '${user_id}' and appointments.deleted_at ${deleted_at}`;
        
         db.query(sqlQuery,
         [user_id,deleted_at],
         (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if(res.length > 0) {
                var patient_id = res[0].patient_id;                
                var doctor_id  = res[0].doctor_id; 

                helperQuery.get({table:'users',where:"id="+patient_id},(err,dataa)=>{
                    var response = [];
                    var referred_by_name = '';
                    if(dataa) {
                        for(const item of dataa) {
                            const patient_name = item.first_name;
                            const date_of_birth = item.date_of_birth;
                            const gender = item.gender;
                            const reffered_by = item.suggested_by;
                            const reffered_by_id = item.suggested_by_id;
                            const mobile_number = parseInt(item.mobile);
                            const appointment_disease = res[0].reason;
                            const appointment_date = new Date(res[0].appointment_date).toLocaleDateString();
                            const appointment_status = res[0].status;
                            const appointment_id = res[0].appointment_id;
                            const doctor_name = res[0].doctor_name;
                            const reason_of_status = res[0].reason_of_status;
                            response.push({ appointment_id,reffered_by,patient_id,patient_name,gender,date_of_birth,mobile_number,appointment_date,appointment_status,doctor_name,appointment_disease,reason_of_status});
                            
                        } 
                         setTimeout(function(){
                                cb(null, response);
                        },100); 
                    }
                });

                return;                
            }  else {
                cb({ kind: "not_found" }, null);
            }          
        })
    }
}
module.exports = Appointment;