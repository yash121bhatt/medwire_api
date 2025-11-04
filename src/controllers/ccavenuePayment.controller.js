const { json } = require("body-parser");
const { async } = require("q");
const atob  = require("atob");
const btoa  = require("btoa");
const https = require("https");
const querystring = require("querystring");
const nodeCCAvenue = require("node-ccavenue");
var ccav = new nodeCCAvenue.Configure({
    merchant_id: process.env.CCAVENUE_PROD_MERCHANT_ID,
    working_key: process.env.CCAVENUE_PROD_WORKING_KEY
});
const helperFunction = require("../helper/helperFunction");
const {transporter:transporter } = require("../helper/helper");
const helperQuery = require("../helper/helperQuery");
const paymentGatway = require("../models/paymentGatway.model");
const Notification = require("../models/stytemNotification.model");
const fetch = require("node-fetch");
const moment =require("moment");


exports.vendorPayment = async (req, res) => {
        var ccav = new nodeCCAvenue.Configure({
            merchant_id: "2021590",
            working_key: "411A3F38EC0C396E1F49FB3AC3B993F4",
        });

        const orderParams = {
                "vendor_id": "",
                "vendor_ref_id":"",
                "merchant_ref": "2021590",
                "amount": "1",
                "currency": "INR",
                "payment_mode": "NEFT",
                "bene_account_no":"587002010001649",
                "bene_ifsc_code":"UBIN0553832",
                "bene_name":"Gaurav Jain",
                "bene_upi_id":"",
                "remarks":"MedWire transaction"
            };
        const encryptedOrderData = ccav.getEncryptedOrder(orderParams);

        const form_data = {
            access_code: "AVLH30KC28BL09HLLB",
            enc_req: encryptedOrderData,
            /*req_type: 'json',
            version: 1.0*/
        };

        const settings = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            hostname: "stg.b2biz.co",
            body: form_data
        };
        console.log(settings);

        const fetchResponse = await fetch("https://stg.b2biz.co/services/makeB2BPayment/processReq", settings);
        const result = await fetchResponse.json();
        

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "working fine",
            data : result
        });
    /*}
    catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }*/
};

exports.paymentAppointment = async (req, res) => {
    try {
        const detail = atob(req.query.detail);
        const querystrings = querystring.parse(detail);
        const call_back_url = process.env.APP_URL+"api/auth/payment-appointment-callback";


        const orderParams = {
            order_id: querystrings.payment_order_id,
            currency: "INR",
            amount: querystrings.total_amount,
            redirect_url: encodeURIComponent(call_back_url),
            billing_email: querystrings.email,
            merchant_param1:querystrings.appointment_id,
            merchant_param2:querystrings.type,
            merchant_param3:querystrings.source_type
        };
        const encryptedOrderData = ccav.getEncryptedOrder(orderParams);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(`
        <html>
            <head><title>Sample Transaction File</title></head>
            <body>
                <form method="post" name="redirect"  action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/>
                    <input type="hidden" id="encRequest" name="encRequest" value="${encryptedOrderData}">
                    <input type="hidden" name="merchant_id" id="merchant_id" value="${process.env.CCAVENUE_PROD_MERCHANT_ID}">
                    <input type="hidden" name="access_code" id="access_code" value="${process.env.CCAVENUE_PROD_ACCESS_CODE}">
                    <script language='javascript'>document.redirect.submit ();</script>
                </form>
            </body>
        </html>`);
        res.end();
    }
    catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.paymentAppointmentCallback = async(req, res) =>{
    const { encResp } = req.body;
    
    const output = ccav.redirectResponseToJson(encResp);
    const data = output;
    const appointment_id = data.merchant_param1;
    const payment_data = { 
        "payment_txt_id" : data.tracking_id,
        "payment_status" : data.order_status, 
        "payment_currency" : data.currency,
        "payment_detail" : JSON.stringify(data)
    };
    var redirect_url = process.env.FRONT_URL+"payment-thankyou?id="+btoa(appointment_id)+"&&type=appointment";

    await paymentGatway.updateAppointmentPaymentDetail(appointment_id,payment_data);
    const patient_detail = await paymentGatway.getPatientDetail(appointment_id);
    
   
    const user_detail = await helperQuery.All(`SELECT*FROM users WHERE id='${patient_detail.user_id}' LIMIT 1`);

    const clinic_detail = await helperQuery.All(`SELECT*FROM users WHERE id='${patient_detail.clinic_id}' LIMIT 1`);

    const doctor_detail = await helperQuery.All(`SELECT*FROM users WHERE id='${patient_detail.doctor_id}' LIMIT 1`);   

    var radio_patient_appointment_content  =  {
        name :  patient_detail.first_name,
        context : {
            "payment_order_id" : patient_detail.payment_order_id,
            "radio_full_name" : user_detail[0].first_name,
            "address" : user_detail[0].address,
            "appointment_date_time" : moment(patient_detail.appointment_date).format("YYYY-MM-DD")+" "+patient_detail.from_time, 
            "appointment_id" : patient_detail.appointment_id
        }
    };

    var laboratory_appointment_content  =  {
        name :  patient_detail.first_name,
        context : {
            "payment_order_id" : patient_detail.payment_order_id,
            "lab_full_name" : user_detail[0].first_name,
            "address" : user_detail[0].address,
            "appointment_date_time" : moment(patient_detail.appointment_date).format("YYYY-MM-DD")+" "+patient_detail.from_time, 
            "appointment_id" : patient_detail.appointment_id
        } 
    };


    var patient_appointment_doctor_content = {
        name :  patient_detail.first_name,
        context : {
           "payment_order_id" : patient_detail.payment_order_id,
           "clinic_full_name" : (clinic_detail.length > 0 ) ? clinic_detail[0].first_name : "",
           "address" : (clinic_detail.length > 0 ) ? clinic_detail[0].address : "",
           "doctor_name" : (doctor_detail.length > 0 ) ? doctor_detail[0].first_name:"",
           "appointment_date_time" : moment(patient_detail.appointment_date).format("YYYY-MM-DD")+" "+patient_detail.from_time, 
           "appointment_id" : patient_detail.appointment_id
        }
    };
    
    var lab_patient_appointment_content  =  {
        name :  patient_detail.first_name,
        context : {
            "payment_order_id" : patient_detail.payment_order_id,
            "lab_full_name" : user_detail[0].first_name,
            "address" : user_detail[0].address,
            "appointment_date_time" : moment(patient_detail.appointment_date).format("YYYY-MM-DD")+" "+patient_detail.from_time, 
            "appointment_id" : patient_detail.appointment_id
        } 
    };
    
    helperFunction.template(transporter,true);
    const mailOptions = {
        from:process.env.MAIL_FROM_ADDRESS,
        to:data.billing_email,
        
    };   
    if(data.merchant_param3 == "APP"){
        if(data.order_status =="Success") {   
            if(data.merchant_param2 == "radio_patient_appointment"){
                mailOptions.subject = "MedWire Radiology Appointment";
                mailOptions.context = radio_patient_appointment_content;
                mailOptions.template= "radio_patient_appointment_content";

                var noticData = {
                    message:"",
                    by:"lab_radio",
                    from_user_id:patient_detail.patient_id,
                    to_user_id:patient_detail.user_id,
                    title:"MedWire Radiology Appointment",
                    type:data.merchant_param2,
                    appointment_date: patient_detail.appointment_date,
                    time_slot:patient_detail.from_time,
                };
                await Notification.AddNotification(noticData);
                
            }
            else if(data.merchant_param2 == "lab_patient_appointment"){
                mailOptions.subject = "MedWire laboratory appointment";
                mailOptions.context = lab_patient_appointment_content;
                mailOptions.template= "lab_patient_appointment_content";

                var noticData = {
                    message:"",
                    by:"lab_radio",
                    from_user_id:patient_detail.patient_id,
                    to_user_id:patient_detail.user_id,
                    title:"MedWire Laboratory  Appointment",
                    type:data.merchant_param2,
                    appointment_date: patient_detail.appointment_date,
                    time_slot:patient_detail.from_time,
                };
                await Notification.AddNotification(noticData);
            }
            else if(data.merchant_param2 == "laboratory_appointment"){
                mailOptions.subject = "MedWire laboratory  appointment";
                mailOptions.context = laboratory_appointment_content;
                mailOptions.template= "laboratory_appointment_content";
            }
            else{
                mailOptions.subject = "Doctor Appointment Booked Successfully on MedWire";
                mailOptions.context = patient_appointment_doctor_content;
                mailOptions.template= "patient_appointment_doctor_content";
            }    
            transporter.sendMail(mailOptions, function(error, info) {
                if(error){
                    console.log(error);
                }
            });  
            var redirect_url = process.env.FRONT_URL+"payment-thankyou?payment_status=Success";
            res.redirect(redirect_url);
        }
        else{
            var redirect_url = process.env.FRONT_URL+"payment-thankyou?payment_status=Aborted";
            res.redirect(redirect_url);
            
        }
    }
    else{
        if(data.order_status =="Success") {   
            if(data.merchant_param2 == "radio_patient_appointment"){
                mailOptions.subject = "MedWire Radiology Appointment";
                mailOptions.context = radio_patient_appointment_content;
                mailOptions.template= "radio_patient_appointment_content";

                
                var noticData = {
                    message:"",
                    by:"lab_radio",
                    from_user_id:patient_detail.patient_id,
                    to_user_id:patient_detail.user_id,
                    title:"MedWire Radiology Appointment",
                    type:data.merchant_param2,
                    appointment_date: patient_detail.appointment_date,
                    time_slot:patient_detail.from_time,
                };
                await Notification.AddNotification(noticData);

                redirect_url = process.env.RADIO_APPOINTMENT_URL+"/"+patient_detail.patient_id+"?payment_status="+data.order_status;
            }
            else if(data.merchant_param2 == "lab_patient_appointment"){
                mailOptions.subject = "MedWire Laboratory Patient Appointment";
                mailOptions.context = lab_patient_appointment_content;
                mailOptions.template= "lab_patient_appointment_content";

                var drData = await helperQuery.First({table:"users",where:"id="+patient_detail.doctor_id});
                var noticData = {
                    message:"",
                    by:"lab_radio",
                    from_user_id:patient_detail.patient_id,
                    to_user_id:patient_detail.user_id,
                    title:"MedWire Laboratory Appointment",
                    type:data.merchant_param2,
                    appointment_date: patient_detail.appointment_date,
                    time_slot:patient_detail.from_time,
                };
                await Notification.AddNotification(noticData);

                redirect_url = process.env.LABORATORY_APPOINTMENT_URL+"/"+patient_detail.patient_id+"?payment_status="+data.order_status;
            }
            else if(data.merchant_param2 == "laboratory_appointment"){
                mailOptions.subject = "MedWire Laboratory Appointment";
                mailOptions.context = laboratory_appointment_content;
                mailOptions.template = "laboratory_appointment_content";
                redirect_url = process.env.APPOINTMENT_URL+"/"+patient_detail.user_id+"?payment_status="+data.order_status;
            }
            else if(data.merchant_param2 == "lab_radio_booked_appointment_by_patient"){

                var drData = await helperQuery.First({table:"users",where:"id="+patient_detail.doctor_id});
                var noticData = {
                    message:"booked appointment with Dr. "+drData.first_name??"-",
                    by:"clinic",
                    from_user_id:patient_detail.patient_id,
                    to_user_id:patient_detail.clinic_id,
                    title:"Doctor Appointment Booked",
                    type:"Doctor_appointment_booked",
                    appointment_date: patient_detail.appointment_date,
                    time_slot:patient_detail.from_time,
                };
                await Notification.AddNotification(noticData);

                mailOptions.subject = "Doctor Appointment Booked Successfully on MedWire";
                mailOptions.context = patient_appointment_doctor_content;
                mailOptions.template = "patient_appointment_doctor_content";
                redirect_url = process.env.APPOINTMENT_URL+"/"+patient_detail.patient_id+"?payment_status="+data.order_status;
            }
            else{
                var drData = await helperQuery.First({table:"users",where:"id="+patient_detail.doctor_id});
                var noticData = {
                    message:"booked appointment with Dr. "+drData.first_name??"-",
                    by:"clinic",
                    from_user_id:patient_detail.patient_id,
                    to_user_id:patient_detail.clinic_id,
                    title:"Doctor Appointment Booked",
                    type:"Doctor_appointment_booked",
                    appointment_date: patient_detail.appointment_date,
                    time_slot:patient_detail.from_time,
                };
                await Notification.AddNotification(noticData);

                mailOptions.subject = "Doctor Appointment Booked Successfully on MedWire";
                mailOptions.context = patient_appointment_doctor_content;
                mailOptions.template = "patient_appointment_doctor_content";
                redirect_url = process.env.APPOINTMENT_URL+"/"+patient_detail.doctor_id+"?payment_status="+data.order_status;
            }    
            transporter.sendMail(mailOptions, function(error, info) {
                if(error){
                    console.log(error);
                }
            });   
            res.redirect(redirect_url);
        }
        else{
            if(data.merchant_param2 == "radio_patient_appointment"){
                redirect_url = process.env.RADIO_APPOINTMENT_URL+"/"+patient_detail.patient_id+"?payment_status="+data.order_status;
            }
            else if(data.merchant_param2 == "lab_patient_appointment"){
                redirect_url = process.env.LABORATORY_APPOINTMENT_URL+"/"+patient_detail.patient_id+"?payment_status="+data.order_status;
            }
            else if(data.merchant_param2 == "laboratory_appointment"){
                redirect_url = process.env.APPOINTMENT_URL+"/"+patient_detail.user_id+"?payment_status="+data.order_status;
            }
            else if(data.merchant_param2 == "lab_radio_booked_appointment_by_patient"){
                redirect_url = process.env.APPOINTMENT_URL+"/"+patient_detail.patient_id+"?payment_status="+data.order_status;
            }
            else{
                redirect_url = process.env.APPOINTMENT_URL+"/"+patient_detail.user_id+"?payment_status="+data.order_status;
            }   
            res.redirect(redirect_url);
        }
    }
};
exports.paymentPlan = async (req, res) => {
    try {
        const detail = atob(req.query.detail);
        const querystrings = querystring.parse(detail);
        const call_back_url = process.env.APP_URL+"api/auth/payment-plan-callback";

        const orderParams = {
            order_id: querystrings.payment_order_id,
            currency: "INR",
            amount: querystrings.total_amount,
            redirect_url: encodeURIComponent(call_back_url),
            billing_email: querystrings.email,
            merchant_param1:querystrings.plan_purchase_id,
            merchant_param2:querystrings.type,
            merchant_param3: querystrings.user_id

        };
        const encryptedOrderData = ccav.getEncryptedOrder(orderParams);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(`
        <html>
            <head><title>Sample Transaction File</title></head>
            <body>
                <form method="post" name="redirect"  action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/>
                    <input type="hidden" id="encRequest" name="encRequest" value="${encryptedOrderData}">
                    <input type="hidden" name="merchant_id" id="merchant_id" value="${process.env.CCAVENUE_PROD_MERCHANT_ID}">
                    <input type="hidden" name="access_code" id="access_code" value="${process.env.CCAVENUE_PROD_ACCESS_CODE}">
                    <script language='javascript'>document.redirect.submit ();</script>
                </form>
            </body>
        </html>`);
        res.end();
    }
    catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.paymentPlanCallback = async(req, res) =>{
    const { encResp } = req.body;
    const output = ccav.redirectResponseToJson(encResp);
    const data = output;

    const plan_purchase_id = data.merchant_param1;
    const payment_data = { 
        "payment_txt_id" : data.order_id,
        "payment_status" : data.order_status, 
        "payment_currency" : data.currency,
        "payment_detail" : JSON.stringify(data)
    };
    if(data.order_status == "Success"){
        var user_id = data.merchant_param3;
        var check_last_active_plan = await paymentGatway.checkLastActivePlan(user_id);
        if(check_last_active_plan.length > 0){
            var active_purchase_plan_id = check_last_active_plan[0].id;
            await paymentGatway.updateLastActivePlan(active_purchase_plan_id);
        }
        var status = "active";
    }
    else{
        var status = "Inactive";
    }

    await paymentGatway.updatePlanPaymentDetail(plan_purchase_id,payment_data,status);
    const plan_user_detail = await paymentGatway.getPlanPurchaseDetail(plan_purchase_id);
    
    helperFunction.template(transporter,true);
    const mailOptions = {
        from:process.env.MAIL_FROM_ADDRESS,
        to:data.billing_email,
        template:"plan_purchase",
    };
    if(data.order_status =="Success") {
        const context  =  {
            name : plan_user_detail.first_name,
            context : {
               "name_of_the_plan" : plan_user_detail.plan_name,
               "validity" : plan_user_detail.validity,
               "price" : plan_user_detail.price,
            }
        };

        if(data.merchant_param2 == "plan"){
            mailOptions.subject = "MedWire Subscription Successful";
            mailOptions.context = context;
        }    
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                console.log(error);
            }
        });      

        if(plan_user_detail.role_id == 3){
            var redirect_url = process.env.FRONT_URL+"doctor/plan-list?payment_status="+data.order_status;
        }
        else if(plan_user_detail.role_id == 4){
            var redirect_url = process.env.FRONT_URL+"radiology/plan-list?payment_status="+data.order_status;
        }
        else if(plan_user_detail.role_id == 8){
            var redirect_url = process.env.FRONT_URL+"clinic/plan-list?payment_status="+data.order_status;
        }
        res.redirect(redirect_url);
    }
    else{
        if(plan_user_detail.role_id == 3){
            var redirect_url = process.env.FRONT_URL+"doctor/plan-list?payment_status="+data.order_status;
        }
        else if(plan_user_detail.role_id == 4){
            var redirect_url = process.env.FRONT_URL+"radiology/plan-list?payment_status="+data.order_status;
        }
        else if(plan_user_detail.role_id == 8){
            var redirect_url = process.env.FRONT_URL+"clinic/plan-list?payment_status="+data.order_status;
        }
        res.redirect(redirect_url);
    } 
};
