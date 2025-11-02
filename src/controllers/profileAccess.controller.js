const { async } = require("q");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const profileAccess = require("../models/profileAccess.model");


exports.healthResult = async(req,res)=>{
    try {
        const {filtertype,requestId}=req.body;
        
        const valid = helperFunction.customValidater(req,{filtertype,requestId});
        if (valid) {
            return res.status(400).json(valid);
        }
        const profileAccessData = await helperQuery.First({table:"profile_access",where:"id="+requestId});
        if (!helperFunction.isEmptyObject(profileAccessData)) {

            const menberId = profileAccessData.member_id!=null ? profileAccessData.member_id:profileAccessData.patient_id;
            const data = await profileAccess.healthResult({filtertype,menberId});
            return res.status(200).json({
                status_code:200,
                status:"success",
                data:data
            });
        }
        
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"OOPS! profile access time out!",
        });
    } catch (error) {
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"Something went to wrong!",
            messages:error.message
        });
    }
}


exports.documentAccess = async(req,res)=>{
    try {
        const {filtertype,requestId}=req.body;
        const valid = helperFunction.customValidater(req,{filtertype,requestId});
        if (valid) {
            return res.status(400).json(valid);
        }
        const profileAccessData = await helperQuery.First({table:"profile_access",where:"id="+requestId});
        if (!helperFunction.isEmptyObject(profileAccessData)) {

            const menberId = profileAccessData.member_id!=null ? profileAccessData.member_id:profileAccessData.patient_id;
           
            const data = await profileAccess.documentAccess({filtertype,menberId});
            return res.status(200).json({
                status_code:200,
                status:"success",
                data:data
            });
        }
        
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"OOPS! profile access time out!",
        });
    } catch (error) {
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"Something went to wrong!",
        });
    }
}

exports.viewProfileAccess = async(req,res)=>{
    try {
        const {requestId}=req.body;
        const valid = helperFunction.customValidater(req,{requestId});
        if (valid) {
            return res.status(400).json(valid);
        }
        const data = await profileAccess.viewProfileAccess({requestId});
        return res.status(200).json({
            status_code:200,
            status:"success",
        });
        
    } catch (error) {
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"Something went to wrong!",
        });
    }
}

//resend profile access 
exports.resendProfileAcess = async(req,res)=>
{
    try {
        const {requestId} = req.body;
        const valid = helperFunction.customValidater(req,{requestId});
        if (valid) {
            return res.status(500).json(valid);
        }
        const requestdata =await helperQuery.First({table:"profile_access",where:"id="+requestId});
        
        if (!helperFunction.isEmptyObject(requestdata)) {
            console.log("profile access data=>",requestdata);
            // return
            if (requestdata.resend_status=="completed") {
                return res.status(200).json({
                    status_code:200,
                    status:"success",
                    message:"You have already send request before! please wait",
                });
            }
            profileAccess.updateProfileAcess({requestId})
            .then(result=>{
                profileAccess.createProfileAcess({
                    patient_id:requestdata.patient_id,
                    member_id:requestdata.member_id,
                    doctor_id:requestdata.member_id
                })
                .then(result=>{
                    return res.status(200).json({
                        status_code:200,
                        status:"success",
                        message:"Request Send Successfully!",
                    });
                });
            });
        }else{
            return res.status(200).json({
                status_code:200,
                status:"success",
                message:"Patient is not found!",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"Something went to wrong!",
        });
    }
}
//profile access accept detail 
exports.profileAccessDetail=(req,res)=>
{
    const {requestId} = req.body;
    const valid = helperFunction.customValidater(req,{requestId});
    if (valid) {
        return res.status(500).json(valid);
    }
    profileAccess.profileAccessDetail(requestId)
    .then(result=>{
        console.log(result);
        if(!helperFunction.isEmptyObject(result))
        {
            return res.status(200).json({
                status_code:200,
                status:"success",
                data:result,
            });
        }else{
            return res.status(500).json({
                status_code:500,
                status:"success",
                message:"Sorry you are not authorized!",
            });
        }
    })
    .catch(error=>{
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"Something went to wrong!",
        });
    });
}