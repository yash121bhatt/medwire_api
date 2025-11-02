const scanDocument = require('../models/scan_document.model');
exports.create = (req,res)=>{
    const {member_id,title,doc_date,description} =req.body;
    console.log(req.body);
    if(member_id=='' || member_id==undefined) return res.status(500).json({message:"member_id is required"});
    if(title=="" || title==undefined ) return res.status(500).json({message:"title is required"});
    if(doc_date=="" || doc_date==undefined) return res.status(500).json({message:"doc_date is required"});
    if(description=="" || description==undefined) return res.status(500).json({message:"description is required"});

    const file = req.file;
    if (file==undefined) {
        var document_name = "";   
    }
    else
    {
        var document_name =req.file.filename;
    }
    scanDocument.create(member_id,title,doc_date,document_name,description,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:"500",
                status:"error",
                message:err,
            });
        }
        if(data){
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"data upload Successfully"
            });
        }
    });
}
exports.searchDoc = (req,res)=>{
    const {search} = req.body;

    if(search==undefined && search=='')
    {
        return;
    }
    scanDocument.searchDoc(search,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:"500",
                status:"error",
                message:"something went wrong"
            });
        }
        if(data)
        {
            res.status(200).json({
                status_code:"200",
                status:"success",
                data:data
            });
        }
    })
}
exports.scanDocList = (req,res)=>{
    scanDocument.scanDocList((err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:"500",
                status:"error",
                message:"something went wrong"
            });
        }
        if(data)
        {
            res.status(200).json({
                status_code:"200",
                status:"success",
                data:data
            });
        }
    })
}