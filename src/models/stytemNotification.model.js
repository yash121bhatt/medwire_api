const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const moment = require('moment');
class Notification{
   
    static async AddNotification(data,pushN=false)
    {
        const doctor_id = data.doctor_id??null;
        const clinic_id = data.clinic_id??null;
        const from_user_id = data.from_user_id??null;
        const to_user_id = data.to_user_id??null;
        var to_main_user_id = data.to_user_id??null;
        var from_main_user_id = data.from_user_id??null;
        const title = data.title??null;
        const type = data.type??null;
        const appointment_date = data.appointment_date??null;
        const time_slot = data.time_slot??null;
        const message = data.message??null;
        
    
        const userdata = await helperQuery.First({table:"users",where:"id="+to_user_id});
        var device_token = userdata.device_token??null;
        var device_type = userdata.device_type??null;

        if (helperFunction.isEmptyObject(userdata)===false) {
            if((userdata.mobile!=null && userdata.mobile!=undefined) || (userdata.created_by_id==null))
            {
                var mobile_no = userdata.mobile;
            }else{
                const usermemberData = await helperQuery.First({table:"users",where:"id="+userdata.created_by_id});
                if (usermemberData!=undefined && usermemberData.mobile!=undefined &&  usermemberData.mobile!=null) {
                    var mobile_no = usermemberData.mobile;
                    var to_main_user_id = usermemberData.id;
                    var device_token = usermemberData.device_token??null;
                    var device_type = usermemberData.device_type??null;
                }else{
                    var mobile_no = null;
                }
            }
        }

        const userdatas = await helperQuery.First({table:"users",where:"id="+from_user_id});
        if (helperFunction.isEmptyObject(userdatas)===false) {
            if((userdatas.mobile!=null && userdatas.mobile!=undefined) || (userdatas.created_by_id==null))
            {
                var mobile_no = userdatas.mobile;
            }else{
                const usermemberDatas = await helperQuery.First({table:"users",where:"id="+userdatas.created_by_id});
                if (usermemberDatas!=undefined && usermemberDatas.mobile!=undefined &&  usermemberDatas.mobile!=null) {
                    var mobile_no = usermemberDatas.mobile;
                    var from_main_user_id = usermemberDatas.id;
                }else{
                    var mobile_no = null;
                }
            }
        }

        helperQuery.First({table:"users", where:"id ="+from_user_id})
        .then(result=>{
            var from_name  = result.first_name??null;
            helperQuery.First({table:"users", where:"id ="+to_user_id})
            .then(result1=>{

            helperQuery.First({table:"users", where:"id ="+doctor_id})
                .then(result2=>{


            helperQuery.First({table:"users", where:"id ="+clinic_id})
                .then(result3=>{
                
                var to_name      = result1.first_name??null; 
                var uId          =result1.id??null;
                var doctor_name  = result2.first_name??''; 
                var clinic_name  = result3.first_name??''; 
                                            
                
                if (data.by=='doctor') {
                    var msg = message+" "+from_name + " for "+helperFunction.dateFormat(appointment_date,"dd/mm/yyyy") + " & "+time_slot;
                    // var msg ="Hey "+to_name+"<br> "+ message+" "+from_name + " on "+helperFunction.dateFormat(appointment_date,"dd/mm/yyyy") + " at "+time_slot;
                }else if (data.by=='doctor_lab_radio_patient') {
                    var msg = message+ " "+from_name +" for "+helperFunction.dateFormat(appointment_date,"dd/mm/yyyy")+ " & "+time_slot;
                }else if (data.by=='clinic') {
                    var msg = "Hey "+from_name+" "+message+ " on "+helperFunction.dateFormat(appointment_date,"dd/mm/yyyy")+ " at "+time_slot+" with " +to_name;
                }else if (data.by=='lab_radio') {
                    var msg = from_name+" booked an appointment in "+to_name+ " on "+helperFunction.dateFormat(appointment_date,"dd/mm/yyyy")+ " at "+time_slot;
                }else if (data.by=='lab_radio_upload') {
                    var msg = "Hey "+to_name+" "+message+" "+from_name;
                }else if (data.by=='message') {
                    // var msg = "Mr/Miss "+to_name+" "+message+ " in "+appointment_date + " "+time_slot+" with " +from_name +" "+`<a href="${process.env.APPOINTMENT_URL+"/"+uId}">Click here</a>`;
                    var msg = "Mr/Miss "+to_name+" "+message+ " on "+appointment_date + " "+time_slot+" with " +from_name;
                }else if (data.by=='custom') {
                    var msg = message;
                } else {
                    var msg = message+ " on "+helperFunction.dateFormat(appointment_date,"dd/mm/yyyy")+ " at "+time_slot +" with doctor " + doctor_name + " and clinic " + clinic_name;
                }
                var payload = {
                    notification : {
                        title : title,
                        body:msg
                    }
                } 
                var created_at = moment().format('YYYY-MM-DD HH:mm:ss'); 
                helperQuery.All(`INSERT INTO system_notifications(from_user_id,to_user_id,title,type,message,created_at) VALUES('${from_main_user_id}','${to_main_user_id}','${title}','${type}','${msg}','${created_at}')`)
                .then(result=>{
                    // if (pushN==true && device_type!=null && device_type!=undefined && device_token!=null && device_token!=undefined) {
                    //     if(device_type == 'Android' || device_type == 'IOS'){
                    //         console.log("push noti send");
                    //         helperFunction.pushNotification(device_token,payload);
                    //     }
                    // }
                    console.log("Notification Send to "+to_name+" Successfully!");
                }).catch(error=>{
                    console.log(error);
                });
                }).catch(error=>{
                    console.log(error);
                });
                }).catch(error=>{
                    console.log(error);
                });            
            }).catch(error=>{
                console.log(error);
            });
        }).catch(error=>{
            console.log(error);
        });
    }
}
module.exports=Notification;