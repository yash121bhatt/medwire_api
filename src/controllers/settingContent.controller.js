const { async } = require("q");
const settingContent = require("../models/settingContent.model"); 

exports.getTermAndCondition = async(req,res)=>{ 
    try {
        let meta_key=req.body.meta_key=undefined && req.body.meta_key!=null?req.meta_key:"term_and_condition";
        let data = await settingContent.getSettingContent({meta_key});
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