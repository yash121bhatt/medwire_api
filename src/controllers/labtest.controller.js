const helperFunction = require('../helper/helperFunction');
const helperQuery = require('../helper/helperQuery');
const LabTest = require('../models/labtest.model');
exports.create = (req,res)=>{
    const test = {test_category_id,lab_id,test_name,test_report,fast_time,test_recommended,description,amount} = req.body;
     console.log(req.body);
    const user_id = req.body.user_id!=undefined ? req.body.user_id:null;
    const member_id = req.body.member_id!=undefined ? req.body.member_id:null;
    const image = req.file!=undefined && req.file.filename!=undefined ?req.file.filename:null;

    // const vali= helperFunction.customValidater(req,{test_category_id,lab_id,test_name,test_report,fast_time,test_recommended,description,amount});
    // if (vali) {
    //     return res.status(500).json(vali);
    // }
    LabTest.create(test_category_id,lab_id,user_id,member_id,test_name,test_report,fast_time,test_recommended,image,description,amount,
        (err,data)=>{
            if (err) {
                return res.status(500).json({
                    status_code:'500',
                    status:'error',
                    message:err
                });
            }
            res.status(200).json({
                status_code:'200',
                status:'success',
                message:'Added Successfully!',
            });
        });
}
exports.update = (req,res)=>{
    const test = {role_id,test_id,lab_id,test_category_id,test_name,test_report,fast_time,test_recommended,description,amount} = req.body;
     
    const user_id = req.body.user_id!=undefined ? req.body.user_id:null;
    const member_id = req.body.member_id!=undefined ? req.body.member_id:null;
    const image = req.file!=undefined && req.file.filename!=undefined ?req.file.filename:null;

    if(role_id == 3){
        var vali= helperFunction.customValidater(req,{role_id,test_id,lab_id,test_category_id,test_name,test_report,fast_time,test_recommended,description,amount});
        if (vali) {
            return res.status(500).json(vali);
        }
    }
    else if(role_id == 4){
        var vali= helperFunction.customValidater(req,{role_id,test_id,lab_id,test_category_id,test_name,description,amount});
        if (vali) {
            return res.status(500).json(vali);
        }
    }
    
    LabTest.update(test_category_id,test_name,test_report,fast_time,test_recommended,image,description,amount,test_id,lab_id,
        (err,data)=>{
            if (err) {
                return res.status(500).json({
                    status_code:'500',
                    status:'error',
                    message:'Something went to wrong!'
                });
            }
            res.status(200).json({
                status_code:'200',
                status:'success',
                message:'Edit Successfully!',
            });
        });
}
exports.show = (req,res)=>{
    const {lab_id} = req.body;
    const vali= helperFunction.customValidater(req,{lab_id});
    if (vali) {
        return res.status(500).json(vali);
    }
    LabTest.show(lab_id,(err,data)=>{
                if (err) {
                    return res.status(500).json({
                        status_code:'500',
                        status:'error',
                        message:'Something went to wrong!'
                    });
                }
                const response = [];
                data.map((item)=>{
                    const test_id = item.test_id!=undefined && item.test_id!=null ? item.test_id:'-';
                    const lab_id = item.lab_id!=undefined && item.lab_id!=null ? item.lab_id:'-';
                    const test_category_id = item.test_category_id!=undefined && item.test_category_id!=null ? item.test_category_id:'-';
                    const category_name = item.category_name!=undefined && item.category_name!=null ? item.category_name:'-';
                    const test_name = item.test_name!=undefined && item.test_name!=null ? item.test_name:'-';
                    const test_report = item.test_report!=undefined && item.test_report!=null ? item.test_report:'-';
                    const fast_time = item.fast_time!=undefined && item.fast_time!=null ? item.fast_time:'-';
                    const test_recommended = item.test_recommended!=undefined && item.test_recommended!=null ? item.test_recommended:'-';
                    const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+'laboratory/'+item.image:'-';
                    const images = item.image!=undefined && item.image!=null ? item.image:'-';
                    const description = item.description!=undefined && item.description!=null ? item.description:'-';
                    const amount = item.amount!=undefined && item.amount!=null ? item.amount:'-';
                    const created_at = item.created_at!=undefined && item.created_at!=null ? item.created_at:'-';
                    const updated_at = item.updated_at!=undefined && item.updated_at!=null ? item.updated_at:'-';
                    response.push({test_id,lab_id,test_category_id,category_name,test_name,test_report,fast_time,test_recommended,image,images,description,amount,created_at,updated_at})
                    
                })
                return res.status(200).json({
                    status_code:'200',
                    status:'success',
                    data:response
                })
    })
}
exports.delete = (req,res)=>{
    const {test_id,lab_id} = req.body;
    const vali = helperFunction.customValidater(req,{test_id,lab_id});
    if (vali) {
       return res.status(500).json(vali); 
    }
    LabTest.delete(test_id,lab_id,(err,data)=>{
        if (err) {
            return res.status(500).json({
                status_code:'500',
                status:'error',
                message:'Something went to wrong!'
            });  
        }
        return res.status(200).json({
            status_code:'200',
            status:'success',
            message:data!=undefined && data.affectedRows==1 ?'Deleted Successfully!':'There is no data valable Please check Id!',
        });
    });
}

exports.GetFirst = (req,res)=>{
    const {test_id,lab_id} = req.body;
    const vali = helperFunction.customValidater(req,{test_id,lab_id});
    if (vali) {
       return res.status(500).json(vali); 
    }

    LabTest.showOne(test_id,lab_id,(err,data)=>{
        if (err) {
            return res.status(500).json({
                status_code:'500',
                status:'error',
                message:'Something went to wrong!'
            });  
        }
        const response = [];
                data.map((item)=>{
                    const test_id = item.test_id!=undefined && item.test_id!=null ? item.test_id:'-';
                    const lab_id = item.lab_id!=undefined && item.lab_id!=null ? item.lab_id:'-';
                    const test_category_id = item.test_category_id!=undefined && item.test_category_id!=null ? item.test_category_id:'-';
                    const category_name = item.category_name!=undefined && item.category_name!=null ? item.category_name:'-';
                    const test_name = item.test_name!=undefined && item.test_name!=null ? item.test_name:'-';
                    const test_report = item.test_report!=undefined && item.test_report!=null ? item.test_report:'-';
                    const fast_time = item.fast_time!=undefined && item.fast_time!=null ? item.fast_time:'-';
                    const test_recommended = item.test_recommended!=undefined && item.test_recommended!=null ? item.test_recommended:'-';
                    const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+'laboratory/'+item.image:'-';
                    const images = item.image!=undefined && item.image!=null ? item.image:'-';
                    const description = item.description!=undefined && item.description!=null ? item.description:'-';
                    const amount = item.amount!=undefined && item.amount!=null ? item.amount:'-';
                    const created_at = item.created_at!=undefined && item.created_at!=null ? item.created_at:'-';
                    const updated_at = item.updated_at!=undefined && item.updated_at!=null ? item.updated_at:'-';
                    response.push({test_id,lab_id,test_category_id,category_name,test_name,test_report,fast_time,test_recommended,image,images,description,amount,created_at,updated_at})
                    
                })
                return res.status(200).json({
                    status_code:'200',
                    status:'success',
                    data:response
                })
    });
}
exports.findTestlist = (req,res)=>{
    const {lab_id,category_name,cat_id} = req.body;
    const vali= helperFunction.customValidater(req,{lab_id});
    if (vali) {
        return res.status(500).json(vali);
    }
    LabTest.findTestlist({lab_id,category_name,cat_id},(err,data)=>{
                if (err) {
                    return res.status(500).json({
                        status_code:'500',
                        status:'error',
                        message:'Something went to wrong!'
                    });
                }
                const response = [];
                data.map((item)=>{
                    const test_id = item.test_id!=undefined && item.test_id!=null ? item.test_id:'-';
                    const lab_id = item.lab_id!=undefined && item.lab_id!=null ? item.lab_id:'-';
                    const test_category_id = item.test_category_id!=undefined && item.test_category_id!=null ? item.test_category_id:'-';
                    const category_name = item.category_name!=undefined && item.category_name!=null ? item.category_name:'-';
                    const test_name = item.test_name!=undefined && item.test_name!=null ? item.test_name:'-';
                    const test_report = item.test_report!=undefined && item.test_report!=null ? item.test_report:'-';
                    const fast_time = item.fast_time!=undefined && item.fast_time!=null ? item.fast_time:'-';
                    const test_recommended = item.test_recommended!=undefined && item.test_recommended!=null ? item.test_recommended:'-';
                    const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+'laboratory/'+item.image:'-';
                    const description = item.description!=undefined && item.description!=null ? item.description:'-';
                    const amount = item.amount!=undefined && item.amount!=null ? item.amount:'-';
                    const created_at = item.created_at!=undefined && item.created_at!=null ? item.created_at:'-';
                    const updated_at = item.updated_at!=undefined && item.updated_at!=null ? item.updated_at:'-';
                    response.push({test_id,lab_id,test_category_id,category_name,test_name,test_report,fast_time,test_recommended,image,description,amount,created_at,updated_at})
                    
                })
                return res.status(200).json({
                    status_code:'200',
                    status:'success',
                    data:response
                })
    })
}