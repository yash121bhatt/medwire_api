const doctorSpecialityMaster = require("../models/doctorSpecialityMaster.model");


exports.show =async(req,res)=>{
    try {
        const data = await doctorSpecialityMaster.show();
        return res.status(200).json({
            status_code:200,
            status:"success",
            data:data
        });
    } catch (error) {
        return res.status(500).json({
            status_code:500,
            status:"error",
            message:"Something went to wrong!"
        });
    }
};