const { json } = require("body-parser");
const { async } = require("q");
const atob  = require('atob');
const btoa  = require('btoa');
const https = require('https')
const PaytmChecksum = require('../config/cheksum');
const querystring = require('querystring');
const paymentGatway = require('../models/paymentGatway.model');
const helperFunction = require('../helper/helperFunction');
const {transporter:transporter } = require('../helper/helper');
const helperQuery = require("../helper/helperQuery");

exports.fetchUpdatePaytmTxnDetail = async (req, res) => 
{
    var result =  await helperQuery.All(`SELECT * FROM appointments WHERE payment_status = 'PENDING' AND payment_order_id !='NULL' AND payment_detail IS NULL`);
    console.log(result[0].payment_order_id);
    if(result[0].payment_order_id){
        var paytmParams = {};
        paytmParams.body = {
            "mid" : process.env.Paytm_mid,
            "orderId" : result[0].payment_order_id,
        };
        var checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body),process.env.Paytm_key);

            paytmParams.head = {
                "signature"	: checksum
            };
            var post_data = JSON.stringify(paytmParams);

            var options = {
                hostname: 'securegw-stage.paytm.in',
                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: '/v3/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            var response = "";
            var post_req = https.request(options, function(post_res) {
                post_res.on('data',  function (chunk) {
                    response += chunk;
                });

                post_res.on('end', async function(){
                    var resp = JSON.parse(response);

                    console.log(resp.body.resultInfo.resultMsg)

                    if(resp.body.resultInfo.resultMsg !='Invalid Order Id.'){

                        var sql = "update `appointments` set `payment_txt_id` = '"+resp.body.resultInfo.resultStatus+"',`payment_detail` = '"+JSON.stringify(resp)+"', `updated_at`= NOW() where `id` = '"+result[0].id+"'";
                        await helperQuery.All(sql);
                    }
                });
            });
        
        post_req.write(post_data);
        post_req.end();
    }
}
exports.paymentAppointment = async (req, res) => {
    try {
        const detail = atob(req.query.detail);
        const querystrings = querystring.parse(detail);

        const call_back_url = process.env.APP_URL+"api/auth/payment-appointment-callback/"+querystrings.appointment_id+"/"+querystrings.email+"/"+querystrings.type;

        await helperFunction.paymentGatwayFunct(req, res, querystrings, call_back_url);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }
}
exports.paymentAppointmentCallback = async(req, res) =>{
    const data = req.body;
    const appointment_id = req.params.id;
    const payment_data = { 
        'payment_txt_id' : data.TXNID,
        'payment_status' : data.STATUS, 
        'payment_currency' : data.CURRENCY,
        'payment_detail' : JSON.stringify(data)
    }

    var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/payment-thankyou?id='+btoa(appointment_id)+'&&type=appointment';

    await paymentGatway.updateAppointmentPaymentDetail(appointment_id,payment_data);
    const patient_detail = await paymentGatway.getPatientDetail(appointment_id);

    const context  =  {
        name : patient_detail.first_name,
        context : 'Your appointment booking paytm payment has completed. Your appointment booking id is '+patient_detail.appointment_id+' . Appointment booking paytm payment is  Rs. '+data.TXNAMOUNT 
    }
    
    helperFunction.template(transporter,true);
    const mailOptions = {
        from:process.env.MAIL_FROM_ADDRESS,
        to:req.params.email,
        template:'appointment',
    }
                
    if(data.STATUS =='TXN_SUCCESS') {
        if(req.params.type == 'radio_patient_appointment'){
            mailOptions.subject = "Medwire radiologist appointment";
            mailOptions.context = context;
            redirect_url = process.env.RADIO_APPOINTMENT_URL+patient_detail.patient_id;
        }
        else if(req.params.type == 'lab_patient_appointment'){
            mailOptions.subject = "Medwire laboratory patient appointment";
            mailOptions.context = context;
            redirect_url = process.env.LABORATORY_APPOINTMENT_URL+patient_detail.patient_id;
        }
        else if(req.params.type == 'laboratory_appointment'){
            mailOptions.subject = "Medwire laboratory  appointment";
            mailOptions.context = context;
            redirect_url = process.env.APPOINTMENT_URL+'/'+patient_detail.user_id;
        }
        else{
            mailOptions.subject = "Medwire doctor appointment";
            mailOptions.context = context;
            redirect_url = process.env.APPOINTMENT_URL+'/'+patient_detail.doctor_id;
        }    
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                console.log(error);
            }
        });      

       
        res.redirect(redirect_url);
    }
    else{        
        const redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/payment-thankyou?id='+btoa(appointment_id)+'&&type=appointment';
        res.redirect(redirect_url);
    } 
}
exports.paymentPlan = async (req, res) => {
    try {
        const detail = atob(req.query.detail);
        const querystrings = querystring.parse(detail);
        const call_back_url = process.env.APP_URL+"api/auth/payment-plan-callback/"+querystrings.plan_purchase_id+"/"+querystrings.email+"/"+querystrings.type;
        await helperFunction.paymentGatwayFunct(req, res, querystrings, call_back_url);
    }
    catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }
}
exports.paymentPlanCallback = async(req, res) =>{
    const data = req.body;
    const plan_purchase_id = req.params.id;
    const payment_data = { 
        'payment_txt_id' : data.TXNID,
        'payment_status' : data.STATUS, 
        'payment_currency' : data.CURRENCY,
        'payment_detail' : JSON.stringify(data)
    }

    await paymentGatway.updatePlanPaymentDetail(plan_purchase_id,payment_data);
    const plan_user_detail = await paymentGatway.getPlanPurchaseDetail(plan_purchase_id);

    const context  =  {
        name : plan_user_detail.first_name,
        context : 'Your plan paytm payment has completed. Purchase plan payment is  Rs. '+data.TXNAMOUNT
    }
    
    helperFunction.template(transporter,true);
    const mailOptions = {
        from:process.env.MAIL_FROM_ADDRESS,
        to:req.params.email,
        template:'plan_purchase',
    }
                
    if(data.STATUS =='TXN_SUCCESS') {
        if(req.params.type == 'plan_purchase'){
            mailOptions.subject = "Medwire purchase plan";
            mailOptions.context = context;
        }    
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                return console.log(error);
            }
        });      

        if(plan_user_detail.role_id == 3){
            var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/doctor/plan-list';
        }
        else if(plan_user_detail.role_id == 4){
            var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/radiology/plan-list';
        }
        else if(plan_user_detail.role_id == 8){
            var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/clinic/plan-list';
        }
        res.redirect(redirect_url);
    }
    else{        
        if(plan_user_detail.role_id == 3){
            var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/doctor/plan-list';
        }
        else if(plan_user_detail.role_id == 4){
            var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/radiology/plan-list';
        }
        else if(plan_user_detail.role_id == 8){
            var redirect_url = ' http://medwire.wecoderelationship.com/patient_dynamic/#/clinic/plan-list';
        }
        res.redirect(redirect_url);
    } 
}
exports.paymentBilling = async (req, res) => {
    try {
        const detail = atob(req.query.detail);
        const querystrings = querystring.parse(detail);

        const call_back_url = process.env.APP_URL+"api/admin/payment-billing-callback/"+querystrings.id+"/"+querystrings.email+"/"+querystrings.type;
        
        await paymentGatwayFunct(req, res, querystrings, call_back_url);
    }
    catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        })
    }
}
exports.paymentBillingCallback = async(req, res) =>{
    const data = req.body;
    const id = req.params.id;
    const payment_data = { 
        'payment_txt_id' : data.TXNID,
        'payment_status' : data.STATUS, 
        'payment_currency' : data.CURRENCY,
        'payment_detail' : JSON.stringify(data)
    }

    var update_billing_detail = await paymentGatway.updateBillingDetail(id,payment_data);
    if(update_billing_detail.affectedRows > 0) {
       var get_billing_detail = await paymentGatway.getBillingDetail(id);
       var appointment_ids = get_billing_detail.appointment_ids;
       var all_appointment_ids = appointment_ids.split(",");

       for (var i = 0; i < all_appointment_ids.length; i++) {
           await paymentGatway.updateAppointmentBillingDetail(all_appointment_ids[i]);
       }
    }
    const user_detail = await paymentGatway.getUserBillingDetail(id);

    const context  =  {
        name : user_detail.first_name,
        context : 'Your paytm payment has completed. Billing payment is  Rs. '+data.TXNAMOUNT 
    }
    
    helperFunction.template(transporter,true);
    const mailOptions = {
        from:process.env.MAIL_FROM_ADDRESS,
        to:req.params.email,
        template:'admin_billing',
    }
                
    if(data.STATUS =='TXN_SUCCESS') {
        if(user_detail.role_id == 3){
            mailOptions.subject = "Medwire laboratories";
            mailOptions.context = context;
        }
        else if(user_detail.role_id == 4){
            mailOptions.subject = "Medwire radiology";
            mailOptions.context = context;
        }
        else if(user_detail.role_id == 8){
            mailOptions.subject = "Medwire clinic";
            mailOptions.context = context;
        }
            
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                return console.log(error);
            }
        });      

        var redirect_url = 'http://medwire.wecoderelationship.com/patient_dynamic/#/clinic/plan-list';
        res.redirect(redirect_url);
    }
    else{        
        
        var redirect_url = ' http://medwire.wecoderelationship.com/patient_dynamic/#/clinic/plan-list';
        res.redirect(redirect_url);
    } 
}