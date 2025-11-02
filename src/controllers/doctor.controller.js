
const User = require('../models/user.model');
const ClinicOrHospital = require('../models/clinicorhospital.model');
const { hash: hashPassword, compare: comparePassword } = require('../utils/password');
const {transporter:transporter,mailOptions:mailOptions,autoGenPassword:autoGenPassword} = require('../helper/helper');
const helperFunction = require('../helper/helperFunction');
const db = require('../config/db.config');
const { logger } = require('../utils/logger');
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const e = require('express');
const moment = require("moment");
const { async } = require('q');
const helperQuery = require("../helper/helperQuery");
const doctorSpecialityMaster = require('../models/doctorSpecialityMaster.model');


exports.createOnlineAppointmentMeeting =  async (req, res) => {
    const {user_id,role_id} = req.body; 
    var valid = helperFunction.customValidater(req,{user_id,role_id});
    if(valid){
        return res.status(500).json(valid);
    }
    var result = await User.checkOnlineAppointmentMeeting(user_id,role_id);
   
    const payload = {
        iss: process.env.ZOOM_API_KEY, //your API KEY
        exp: new Date().getTime() + 5000,
    };
    const token = jwt.sign(payload, process.env.ZOOM_API_SECRET); 
        // your zoom developer email account
        var email = process.env.ZOOM_MEMBER_ACCOUNT;
        var options = {
            method: "POST",
            uri: "https://api.zoom.us/v2/users/me/meetings",
            body: {
                topic: "MedWire Appointment", //meeting title
                type: 2,
                settings: {
                        "host_video": true,
                        "participant_video": true,
                        "waiting_room" : false,
                        "join_before_host": 2,
                    },
            },
        auth:{
          bearer: token,
        },
        headers: {
          "User-Agent": "Zoom-api-Jwt-Request",
          "content-type": "application/json",
        },
        json: true, //Parse the JSON string in the response
    };

    var current_time = moment().format('YYYY-MM-D, hh:mm A');

    for(let [index, value] of result.entries()){
        var from_time = value.from_time.split(" ").join("");
        var from_time_split = from_time.split('-')[0];

        var from_time_match = from_time_split.match(/.{1,5}/g);
        var from_time_join = from_time_match.join(' ');
        
        var from_convert_Time12to24 = moment(from_time_join, 'hh:mm A').format('HH:mm');

        var from_date = moment(Date().now).format('YYYY-MM-D, '+from_convert_Time12to24);
        var from_then = moment(new Date(from_date)).subtract(15, "minutes").format('YYYY-MM-D, hh:mm A');       
       
        var to_time_split = from_time.split('-')[1];
        var to_time_match = to_time_split.match(/.{1,5}/g);
        var to_time_join = to_time_match.join(' ');
        var to_convert_Time12to24 = moment(to_time_join, 'hh:mm A').format('HH:mm');
        var to_date = moment(Date().now).format('YYYY-MM-D, '+to_convert_Time12to24);
        var to_then = moment(new Date(to_date)).format('YYYY-MM-D, hh:mm A');

        /* console.log(' from_then '+from_then+' current_time '+current_time+' to_then '+to_then); */

        if((current_time >= from_then)&&(current_time <= to_then)){

                var check_meeting =  await User.checkAppointmentMeeting(value.id,value.from_time,value.appointment_date, value.patient_id,value.user_id);
                
                if(check_meeting){
                    var url = JSON.parse(check_meeting.meeting_detail);
                    return res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Zoom meeting has created",
                        data : {
                            'join_url' : url.join_url
                        }
                    });
                }
                else{
                    return requestPromise(options).then(async function (response) {
                        var insert_appointment_meeting = await User.createAppointmentMeeting(value.id,value.from_time,value.appointment_date, value.patient_id,value.user_id,response.host_email,response.join_url,response.password, JSON.stringify(response));

                        if(insert_appointment_meeting.insertId > 0){

                            var check_meeting =  await User.checkAppointmentMeeting(value.id,value.from_time,value.appointment_date, value.patient_id,value.user_id);
                  
                            res.status(200).send({
                                status_code : 200,
                                status: 'success',
                                message : "Zoom meeting has created",
                                data : {
                                    'join_url' : check_meeting.join_url
                                }
                            });
                        }  
                    }).catch(function (err) {
                        res.status(200).send({
                            status_code : 200,
                            status: 'success',
                            message : "Please create a zoom account",
                        });
                    });                
                }  
        }        
    }
    return res.status(200).send({
        status_code : 200,
        status: 'success',
        message : "Currently, we don't have any appointment's meeting",
    });
}
exports.getOnlineAppointmentMeeting =  async (req, res) => {
    const {patient_id} = req.body; 
    var valid = helperFunction.customValidater(req,{patient_id});
    if(valid){
        return res.status(500).json(valid);
    }
    var result = await User.patientOnlineAppointmentMeeting(patient_id);    
    
    var current_time = moment().format('YYYY-MM-D, hh:mm A');
    for(let [index, value] of result.entries()){
        var from_time = value.from_time.split(" ").join("");
        var from_time_split = from_time.split('-')[0];

        var from_time_match = from_time_split.match(/.{1,5}/g);
        var from_time_join = from_time_match.join(' ');
        
        var from_convert_Time12to24 = moment(from_time_join, 'hh:mm A').format('HH:mm');

        var from_date = moment(Date().now).format('YYYY-MM-D, '+from_convert_Time12to24);
        var from_then = moment(new Date(from_date)).format('YYYY-MM-D, hh:mm A');       
        

        var to_time_split = from_time.split('-')[1];
        var to_time_match = to_time_split.match(/.{1,5}/g);
        var to_time_join = to_time_match.join(' ');
        var to_convert_Time12to24 = moment(to_time_join, 'hh:mm A').format('HH:mm');
        var to_date = moment(Date().now).format('YYYY-MM-D, '+to_convert_Time12to24);
        var to_then = moment(new Date(to_date)).format('YYYY-MM-D, hh:mm A');

        if((current_time >= from_then)&&(current_time <= to_then)){

            return  res.status(200).send({
                status_code : 200,
                status: 'success',
                message : "Zoom meeting has created",
                data : {
                    'join_url' : value.join_url
                }
            });   
        }      
    }
    return res.status(200).send({
        status_code : 200,
        status: 'success',
        message : "Currently, we don't have any appointment's meeting",
    });
}
// add doctor code by krishna
exports.addDoctors = async(req,res) => {
    try {
        const {staff_id,clinic_id,full_name,email_id,date_of_birth,mobile_number,alternate_mobile_number,gender,experience_in_year,specialities,degrees,role_id} = req.body; 
        var valid = helperFunction.customValidater(req,{clinic_id,full_name,email_id,date_of_birth,mobile_number,gender,experience_in_year,specialities,degrees,role_id});
        if(valid){
            return res.status(500).json(valid);
        }
        var profile_image = '';

        var password = autoGenPassword();
        var encryptedPassword = hashPassword(password.trim());    


        if (req.body.full_name.length < 3) {
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Name should be minimum 3 characters"
                });   
        }
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false){
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Please enter valid email id"
                });   
        }
        if(req.body.mobile_number.length!=10) {
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Mobile number should be 10 digit"
                });   
        }  
    

        if (req.body.role_id!=5) {
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Role id should be valid"
                });   
        }


        if(req.file == undefined){       
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Profile Image field is required"
            }); 

        } else {
            var profile_image = req.file.filename;
        }
        const data = await ClinicOrHospital.findByIdAndRoleforcl(req.body.clinic_id)
        if (data.kind === "not_found") {
            res.status(404).send({
                status_code : 404,
                status: 'error',
                message: `Clinic / Hospital does not exist`
            });
            return;
        }
        if(data){
           const dataC = await ClinicOrHospital.findDoctorCountClinic(req.body.clinic_id,5);
           if (dataC.kind === "doctor_limit_reached") {
                res.status(200).send({
                    status_code : 200,
                    status: 'error',
                    message: `You can add more doctors after purchasing plan`
                });
                return;
            }
            if (dataC.kind === "new_doctor_limit_reached") {
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: `You can add more doctors after purchasing or renewing existing plan`
                });
                return;
            }

            const dataDoct = await User.addDoctors(staff_id,clinic_id,full_name,email_id,date_of_birth,mobile_number,alternate_mobile_number,gender,experience_in_year,role_id,profile_image,password,encryptedPassword);
            
            if (dataDoct.kind === "already_added") {
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: `Email or Mobile Number Already Registered`
                });
                return;
            }
            const doctD = specialities.split(",");
            const user_id = dataDoct.id;
            await User.addClinicDoctorForAddDoctor(user_id,clinic_id);
            const DSpeciality =await doctorSpecialityMaster.deleteDoctorSpeciality(user_id);
            if (DSpeciality) {
                for (let index = 0; index < doctD.length; index++) {
                    const specialitie = doctD[index];
                    const sp = await doctorSpecialityMaster.addDoctorSpeciality(user_id,clinic_id,specialitie);
                    const doctorMaster = await doctorSpecialityMaster.findBYName(specialitie);
                    if (doctorMaster.length<=0) {
                        await doctorSpecialityMaster.add(specialitie);
                    }
                        
                }
            } 
            const doctsSp= degrees.split(",");
            const Degreed=await doctorSpecialityMaster.deleteDoctorDegrees(user_id);
            if (Degreed) {
                for (let j = 0; j < doctsSp.length; j++) {
                    const degree = doctsSp[j];
                    await doctorSpecialityMaster.addDoctorDegrees(user_id,clinic_id,degree);
                }
            }
            res.status(200).send({
                status_code : 200,
                status: 'success',
                message : "Doctor added Successfully!",
                data: dataDoct
            }); 
                
        }
    } catch (error) {
        return res.status(500)
        .send({
                status_code : 500,
                status: 'error',
                message: error.message
            });
    }
}


// get Doctor Details code by vineet shirdhonkar

exports.getDoctorDetails = (req,res) => { 
    const {user_id,staff_id} = req.body;
    if(staff_id){
        User.findStaffDoctorByIdAndRole(user_id,staff_id, (err, data) => {
        if (err) {           
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }    
        if(data[0].id == null){
            res.status(200).send({
                        status: 'success',
                        message : "Doctor does not exist",
                  
            });
            return;
        } else {
            res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor Details Found Successfully!",
                        data: data
                    });
            return;

        }

    });  
    }
    else{
        User.findDoctorByIdAndRole(user_id, (err, data) => {
        if (err) {           
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }    
        if(data[0].id == null){
            res.status(200).send({
                        status: 'success',
                        message : "Doctor does not exist",
                  
            });
            return;
        } else {
            res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor Details Found Successfully",
                        data: data
                    });
            return;

        }

    });  
    }
       
}

// get All Doctors code by vineet shirdhonkar

exports.getAllDoctors = (req,res) => { 
    const {clinic_id,staff_id} = req.body;

    ClinicOrHospital.findByIdAndRole(clinic_id,(err,data) =>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: 'Clinic / Hospital does not exist'
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }  
        if(data){ 
            var added_by = (staff_id) ? staff_id : null;
            User.findAllClinicDoctors(clinic_id, (err, data) => {
                if (err) {           
                    res.status(500).send({
                        status_code : 500,
                        status: 'error',
                        message: err.message
                    });
                    return;
                }    

                if(data.length > 0) {
                    res.status(200).send({
                                status_code :200,
                                status: 'success',
                                message : "Doctor record found Successfully",
                                data: data
                            });
                    return;

                } else {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message: 'Doctor record not found'
                    });
                    return;
                }
            
            });
        }
    })       
}
exports.updateDoctor = (req,res) => {
     
    const {staff_id,doctor_id,clinic_id,full_name,email_id,date_of_birth,mobile_number,alternate_mobile_number,gender,experience_in_year,specialities,degrees,role_id} = req.body;
    var profile_image = '';
    var valid = helperFunction.customValidater(req,{doctor_id,clinic_id,full_name,email_id,date_of_birth,mobile_number,gender,experience_in_year,specialities,degrees,role_id});
    if(valid){
        return res.status(500).json(valid);
    }

    if (req.body.full_name.length < 3) {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Name should be minimum 3 characters"
            });   
    }


    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_id) == false){
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Please enter valid email id"
            });   
    }




 

    if (isNaN(req.body.mobile_number)) {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Mobile number should be numeric"
            });   
    }

    if(req.body.mobile_number.length!=10) {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Mobile number should be 10 digit"
            });   
    }


    if(req.body.alternate_mobile_number !== '' && req.body.alternate_mobile_number!='null'  && req.body.alternate_mobile_number!=null  && req.body.alternate_mobile_number!='undefined'){
        if(req.body.alternate_mobile_number == req.body.mobile_number) {
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Alternate Mobile number should be different than Mobile Number"
                });   
        }


        if (isNaN(req.body.alternate_mobile_number)) {
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Alternate Mobile number should be numeric"
                });   
        }

        if(req.body.alternate_mobile_number.length!=10) {
            return res.status(400).json({
                    status_code : 400,
                    status: 'error',
                    message: "Alternate Mobile number should be 10 digit"
                });   
        }
    }


    if (req.body.role_id!=5) {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Role id should be valid"
            });   
    }


    if(req.file!=undefined){
        profile_image = req.file.filename;   
    }  
    




    ClinicOrHospital.findByIdAndRole(req.body.clinic_id,(err,data) =>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `Clinic / Hospital does not exist`
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }

        if(data){

            User.updateDoctor(staff_id,doctor_id,clinic_id,full_name,email_id,date_of_birth,mobile_number,alternate_mobile_number,gender,experience_in_year,specialities,degrees,profile_image,async(err,data)=>{
                if(err){
                    if (err.kind === "already_added") {
                        res.status(500).send({
                            status_code : 500,
                            status: 'error',
                            message: `Email or Mobile Number is already exist`
                        });
                        return;
                    }
                    res.status(500).send({
                        status_code : 500,
                        status: 'error',
                        message: 'Something Went Wrong'
                    });
                    return;
                }
                if (data) {
                    const doctD = specialities.split(",");
                    for (let index = 0; index < doctD.length; index++) {
                        const specialitie = doctD[index];
                        const doctorMaster = await doctorSpecialityMaster.findBYName(specialitie);
                        if (doctorMaster.length<=0) {
                            await doctorSpecialityMaster.add(specialitie);
                        }
                    }
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor updated Successfully",
                        data: data
                    });

                    transporter.sendMail({
                        from:process.env.MAIL_FROM_ADDRESS,
                        to:req.body.email_id,
                        subject:"this mail form MedWire for create account",
                        html:"<b>Following are your updated email and mobile number :-<br/> Email: "+email_id+"<br/> Mobile Number : "+mobile_number+"</b>",
                    }, function(error, info){
                        if(error){
                            return console.log(error);
                        }
                    });

                    return;
                }
            });
        }       
    });
}

// delete doctor code by vineet shirdhonkar


exports.deleteDoctor = (req,res) => { 
    const {user_id,created_by_id,staff_id} = req.body;
    User.findDoctorByIdAndRole(user_id, (err, data) => {
        if (err) {           
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }    

        if(data.length > 0) {
            if(staff_id){
                User.deleteStaffDoctor(user_id,created_by_id,staff_id,(err,data)=>{
                    if(err){
                        res.status(500).send({
                            status_code : 500,
                            status: 'error',
                            message: 'Something Went Wrong'
                        });
                        return;
                    }
                    if (data) {   
                        res.status(200).send({
                            status_code : 200,
                            status: 'success',
                            message : "Doctor Deleted Successfully",
                            data: data
                        });
                        return;
                    }
                })
            }
            else{
                User.deleteDoctor(user_id,created_by_id,(err,data)=>{
                    if(err){
                        res.status(500).send({
                            status_code : 500,
                            status: 'error',
                            message: 'Something Went Wrong'
                        });
                        return;
                    }
                    if (data) {   
                        res.status(200).send({
                            status_code : 200,
                            status: 'success',
                            message : "Doctor Deleted Successfully!",
                            data: data
                        });
                        return;
                    }
                })
            }
            

        } else {
            res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `Doctor Does Not Exist`
                });
            return;
        }
    });     
}



// upload signature code by vineet shirdhonkar


exports.uploadSignature = (req,res) => { 
    const {user_id} = req.body;
    var signature = '';

    if(req.body.user_id=='') {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "User Id field is required"
            });   
    }

    if(req.file == undefined){       
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Signature field is required"
        }); 

    } else {
        var signature = req.file.filename;
    }



    var ext = signature.split(".").pop();

    if(ext!=='jpg' && ext!=='jpeg' && ext!=='png') {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Please upload signature in jpg,jpeg or png"
            });   
    }

    User.findByIdAndRole(user_id,5, (err, data) => {
        if (err) {   
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `Doctor does not exist`
                });
                return;
            }        
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }    

        if(data) {
            
            User.uploadSignature(signature,user_id, (err, data) => {
                    if (err) {          
                        res.status(500).send({
                            status_code : 500,
                            status: 'error',
                            message: err.message
                        });
                        return;
                    }    

                    if(data) {
                        res.status(200).send({
                                    status_code : 200,
                                    status: 'success',
                                    message : "Signature Uploaded Successfully",
                                    data: data
                                });
                        return;

                    }
            });
        }
    });     
}




// get Doctor's Clinic code by vineet shirdhonkar

exports.getDoctorsClinic = (req,res) => { 
    const {doctor_id} = req.body;
    User.findByIdAndRole(doctor_id,5,(err,data) =>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: 'Doctor does not exist'
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }

   
        if(data){  
            User.findAllClinics(doctor_id, (err, data) => {
                if (err) {           
                    res.status(500).send({
                        status_code : 500,
                        status: 'error',
                        message: err.message
                    });
                    return;
                }    

                if(data.length > 0) {
                    res.status(200).send({
                                status_code :200,
                                status: 'success',
                                message : "Data found Successfully",
                                data: data
                            });
                    return;

                } else {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message: 'No Data not found',
                        data :[]
                    });
                    return;
                }
            }); 
        }

    })       
}


exports.addDoctorWeeklySchedule = (req,res) => {
    const {doctor_id,clinic_id, daysData} = req.body;
    if (doctor_id == undefined || doctor_id == null || doctor_id == "") {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "doctor_id is required"
            });   
    }
    if (daysData == undefined || daysData == null || daysData == "") {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "daysData is required"
            });   
    }
    if (clinic_id == undefined || clinic_id == null || clinic_id == "") {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "clinic_id is required"
            });   
    }
    if (daysData.length < 7 || daysData.length > 7) {
        return res.status(400).json({
                status_code : 400,
                status: 'error',
                message: "Full week data is required"
            });   
    }
    
        User.addDoctorWeeklySchedule(doctor_id,clinic_id, daysData,(err,data)=>{
            if(err){                
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: 'Something Went Wrong'
                });
                return;
            }
            if (data) {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor schedule added Successfully!"
                    });
            }
        })
                          
}

exports.addDoctorAvailability = (req,res) => {
    const {doctor_id,clinic_id,date,days_status,morning_shift_status,afternoon_shift_status,evening_shift_status} = req.body; 
    var valid = helperFunction.customValidater(req,{doctor_id,clinic_id,date,days_status,morning_shift_status,afternoon_shift_status,evening_shift_status});
    if(valid){
        return res.status(500).json(valid);
    }    
    User.addDoctorAvailability(doctor_id,clinic_id,date,days_status,morning_shift_status,afternoon_shift_status,evening_shift_status,(err,data)=>{
            if(err){                
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: 'Something Went Wrong'
                });
                return;
            }
            if (data) {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor availability added Successfully!"
                    });
            }
        })                 
}

exports.viewDoctorAvailability = (req,res) => {
    const {doctor_id,clinic_id,date} = req.body; 
    var valid = helperFunction.customValidater(req,{doctor_id,clinic_id,date});
    if(valid){
        return res.status(500).json(valid);
    }    
    User.viewDoctorAvailability(doctor_id,clinic_id,date,async(err,data)=>{
            if(err){                
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: 'Something Went Wrong'
                });
                return;
            }
            if (data) {
                    console.log(date);
                    const Ddate = helperFunction.dateFormat(date,"yyyy-mm-dd");
                    console.log(Ddate);
                    let bookedSlots=[];
                    let St = await  helperQuery.All(`SELECT * FROM appointments WHERE doctor_id ='${doctor_id}' AND DATE_FORMAT(appointment_date,"%y-%m-%d")=DATE_FORMAT('${Ddate}',"%y-%m-%d") AND status != 'Cancelled'`);
                    if (St.length>0) {
                        St.map((item)=>{
                            const Stime = item.from_time??"00:00";
                            bookedSlots.push({Stime})
                        });
                        
                    }
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor availability fetch Successfully",
                        result : data,
                        bookedSlots:bookedSlots
                    });
            }
        })                 
}

exports.viewDoctorWeeklySchedule = (req,res) => {
    const {doctor_id,clinic_id} = req.body; 
    var valid = helperFunction.customValidater(req,{doctor_id,clinic_id});
    if(valid){
        return res.status(500).json(valid);
    }    
    User.viewDoctorWeeklySchedule(doctor_id,clinic_id,(err,data)=>{
            if(err){                
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: 'Something Went Wrong'
                });
                return;
            }
            if (data) {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Doctor availability fetch Successfully",
                        result : data
                    });
            }
        })                 
}


// vineet

exports.profileAccessRequest = async(req,res) => {
    const {doctor_id,patient_id,member_id} = req.body; 
    var valid = helperFunction.customValidater(req,{doctor_id,patient_id});
    if(valid){
        return res.status(500).json(valid);
    }    

    const memberData = await User.checkPatientMemberExistence(patient_id,member_id);
    const length= memberData.length;
                

    User.requestProfileAccess(doctor_id,patient_id,member_id,length,async (err,data)=>{
            if(err){      
                if (err.kind === "already_requested") {
                    res.status(404).send({
                        status_code : 404,
                        status: 'error',
                        message: `You have already send request`
                    });
                    return;
                }          
                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: 'Something Went Wrong'
                });
                return;
            }
            if (data) {
                

                res.status(200).send({
                    status_code : 200,
                    status: 'success',
                    message : "Profile access request has been sent successfully",
                    result : data
                });
                return;
            }
    });                 
}

// vineet

exports.profileAccessList = (req,res) => {
    const {user_id,role_id} = req.body; 
    var valid = helperFunction.customValidater(req,{user_id,role_id});
    if(valid){
        return res.status(500).json(valid);
    }

    User.findByIdAndRole(user_id,role_id, (err, data) => {
        if (err) {   
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `User does not exist`
                });
                return;
            }        
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }   
        if(data){
            User.profileAccessList(user_id,role_id,(err,data)=>{
                if(err){               
                    res.status(500).send({
                        status_code : 500,
                        status: 'error',
                        message: 'Something Went Wrong'
                    });
                    return;
                }
                if (data) {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : (data.length > 0) ? "Data Found Successfully": "No Data Found",
                        data : data
                    });
                }
            });
        }  
    });
}
// vineet
exports.changeProfileAccessRequestStatus = (req,res) => {
    const {request_id,status,time_interval} = req.body; 
    var valid = helperFunction.customValidater(req,{request_id,status});
    
    if(valid){
        return res.status(500).json(valid);
    }
    User.changeProfileAccessRequestStatus(request_id,status,time_interval,(err,data)=>{
        if(err){
            if (err.kind === "failed_to_update") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `Failed ! Please try again`
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: 'Something Went Wrong'
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : 200,
                status: 'success',
                message : "Request "+ status +"ed Successfully",
                data : data
            });
        }
    });       
}
// vineet
exports.profileAccessDetail = (req,res) => {
    const {request_id} = req.body; 
    var valid = helperFunction.customValidater(req,{request_id});
    if(valid){
        return res.status(500).json(valid);
    }

    User.profileAccessDetail(request_id,(err,data)=>{
        if(err){               
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: 'Something Went Wrong'
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : 200,
                    status: 'success',
                    message : (data.length > 0) ? "Data Found Successfully": "No Data Found",
                    data : data
                });
        }
    });         
    
}
// vineet
exports.updateProfileAccess = async(req,res) => {
    const {doctor_id,patient_id,member_id,request_id} = req.body; 
    var valid = helperFunction.customValidater(req,{doctor_id,patient_id,request_id});
    if(valid){
        return res.status(500).json(valid);
    }    
    const memberData = await User.checkPatientMemberExistence(patient_id,member_id);
    const length= memberData.length;
    
    User.updateProfileAccess(doctor_id,patient_id,member_id,request_id,length,(err,data)=>{
            if(err){      
                if (err.kind === "already_requested") {
                    res.status(404).send({
                        status_code : 404,
                        status: 'error',
                        message: `You have already send request`
                    });
                    return;
                } 

                if (err.kind === "failed_to_update") {
                    res.status(404).send({
                        status_code : 404,
                        status: 'error',
                        message: `Failed ! Please try again`
                    });
                    return;
                }

                res.status(500).send({
                    status_code : 500,
                    status: 'error',
                    message: 'Something Went Wrong'
                });
                return;
            }
            if (data) {
                    res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message : "Profile access request has been sent successfully",
                        result : data
                    });
            }
    });                 
}

// vineet

exports.deleteProfileAccess = (req,res) => {
    const {request_id} = req.body; 
    var valid = helperFunction.customValidater(req,{request_id});
    if(valid){
        return res.status(500).json(valid);
    }


    User.deleteProfileAccess(request_id,(err,data)=>{
        if(err){               
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: 'Something Went Wrong'
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : 200,
                    status: 'success',
                    message : "Access deleted Successfully",
                    data : data
                });
        }
    });         
    
}



// vineet

exports.sendMeetingNotification = (req,res) => {


    User.sendMeetingNotification((err,data)=>{
        if(err){               
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: 'Something Went Wrong'
            });
            return;
        }
        if (data) {
                res.status(200).send({
                    status_code : 200,
                    status: 'success',
                    message : "Notification has been sent Successfully",
                });
        }
    });         
    
}


exports.createZoomMeeting = (req,res) => {

    const payload = {
      iss: process.env.API_KEY, //your API KEY
      exp: new Date().getTime() + 5000,
    };
    const token = jwt.sign(payload, process.env.API_SECRET); 

     email = "vineet.shirdhonkar@gmail.com"; // your zoom developer email account
      var options = {
        method: "POST",
        uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
        body: {
          topic: "Zoom Meeting Using Node JS", //meeting title
          type: 1,
          settings: {
            host_video: "true",
            participant_video: "true",
          },
        },
        auth: {
          bearer: token,
        },
        headers: {
          "User-Agent": "Zoom-api-Jwt-Request",
          "content-type": "application/json",
        },
        json: true, //Parse the JSON string in the response
      };

      requestPromise(options)
        .then(function (response) {
          console.log("response is: ", response);
          res.send("create meeting result: " + JSON.stringify(response));
        })
        .catch(function (err) {
          // API call failed...
          console.log("API call failed, reason ", err);
        });     
}

exports.getUserInfo = (req,res) => {
         const payload = {
      iss: process.env.API_KEY, //your API KEY
      exp: new Date().getTime() + 5000,
    };
    const token = jwt.sign(payload, process.env.API_SECRET); 

    //store the email address of the user in the email variable
        email = "vineet.shirdhonkar@gmail.com";
    //check if the email was stored in the console
        console.log(email);
    //Store the options for Zoom API which will be used to make an API call later.
        var options = {
    //You can use a different uri if you're making an API call to a different Zoom endpoint.
    uri: "https://api.zoom.us/v2/users/"+email,
    qs: {
        status: 'active'
    },
    auth: {
        'bearer': token
    },
    headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
    },
    json: true //Parse the JSON string in the response
    };

    //Use request-promise module's .then() method to make request calls.
    requestPromise(options)
    .then(function (response) {
    //printing the response on the console
        console.log('User has', response);
    //console.log(typeof response);
        resp = response
    //Adding html to the page
        var title1 ='Your token:';
        var result1 = title1 + token;
        var title ='Users information:';

    //Prettify the JSON format using pre tag and JSON.stringify
        var result = title + ''+JSON.stringify(resp, null, 2)+ ''
        res.send(result1 + '' + result);
    })
    .catch(function (err) {
    // API call failed...
        console.log('API call failed, reason ', err);
    });  
}


// get signature code by vineet shirdhonkar


exports.getSignature = (req,res) => { 
    const {user_id} = req.body;
    var valid = helperFunction.customValidater(req,{user_id});
    if(valid){
        return res.status(500).json(valid);
    }



    User.findByIdAndRole(user_id,5, (err, data) => {
        if (err) {   
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `Doctor does not exist`
                });
                return;
            }        
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }    

        if(data) {
            
            User.getSignature(user_id, (err, data) => {
                    if (err) {          
                        res.status(500).send({
                            status_code : 500,
                            status: 'error',
                            message: err.message
                        });
                        return;
                    }


                    if(data) {
                        res.status(200).send({
                                    status_code : 200,
                                    status: 'success',
                                    message : "Data Found Successfully",
                                    data: data
                                });
                        return;

                    }
            });
        }
    });     
}

