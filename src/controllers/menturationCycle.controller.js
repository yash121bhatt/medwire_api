const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const menturationCycle = require("../models/menturationCycle.model");

exports.create = (req,res)=>{
    const{user_id, start_date, end_date, bg_color_class,nextDays} =req.body;
    menturationCycle.create(user_id, start_date, end_date, bg_color_class,nextDays,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:500,
                status:"error",
                message:"Something went to wrong"
            });
            return;
        }
        if(data)
        {
            res.status(200).json({
                status_code:200,
                status:"success",
                message:"Successfully Added"
            });
            return;
        }
    });
};
exports.update = (req,res)=>{
    const{user_id, start_date, end_date, bg_color_class,m_id} =req.body;
    menturationCycle.update(user_id, start_date, end_date, bg_color_class,m_id,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:500,
                status:"error",
                message:"Something went to wrong"
            });
        }
        if(data)
        {
            res.status(200).json({
                status_code:200,
                status:"success",
                message:"Update Successfully"
            });
        }
    });
};
exports.delete = (req,res)=>{
    const{m_id}= req.body;
    menturationCycle.delete(m_id,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:500,
                status:"error",
                message:"Something went to wrong"
            });
        }
        if(data){
            res.status(200).json({
                status_code:200,
                status:"success",
                message:"Delete Successfully"
            });
        }
    });
};
exports.show = (req,res)=>{
    const{user_id}= req.body;
    menturationCycle.show(user_id,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:500,
                status:"error",
                message:"Something went to wrong"
            });
        }
        if(data){
            const result = [];
            for (const item of data) {
                const m_id = item.m_id ?? null;
                const user_id = item.user_id ?? null;
                const title = item.title ?? null;
                const start_date =helperFunction.dateFormat(item.start_date,"yyyy-mm-dd")+"T00:00:00.000Z" ?? null;
                const end_date = 	item.end_date ?? null;
                const period_length = 	item.period_length ?? null;
                const nextDateCount = 	item.nextDateCount ?? null;
                const bg_color_class = 	item.bg_color_class ?? null;
                const status = 	item.status ?? null;
                const created_at = 	item.created_at ?? null;
                const updated_at = 	item.updated_at ?? null;
                result.push({m_id,user_id,title,start_date,end_date,period_length,nextDateCount,bg_color_class,status,created_at,updated_at});
            }
            res.status(200).json({
                status_code:200,
                status:"success",
                data:result
            });
        }
    });
};
exports.createNew = (req,res)=>{
    const{user_id,period_length,start_date, bg_color_class,nextDays} =req.body;
    const vali = helperFunction.customValidater(req,{user_id,period_length,start_date, bg_color_class,nextDays});
    if (vali) {
        return res.status(500).json(vali);
    }
    menturationCycle.createNew(user_id,period_length,start_date,nextDays,bg_color_class,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:500,
                status:"error",
                message:err
            });
            return;
        }
        if(data)
        {
            res.status(200).json({
                status_code:200,
                status:"success",
                message:"Successfully Added"
            });
            return;
        }
    });
};
exports.showNew = (req,res)=>{
    const{user_id}= req.body;
    helperQuery.get({table:"menturation_cycle", where:"user_id="+user_id+" ORDER BY m_id DESC"},(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:500,
                status:"error",
                message:"Something went to wrong!"
            });
        }
        if(data){
            const result = [];
            for (const item of data) {
                const m_id = item.m_id ?? null;
                const user_id = item.user_id ?? null;
                const title = item.title ?? null;
                const start_date =helperFunction.dateFormat(item.start_date,"yyyy-mm-dd")+"T00:00:00.000Z" ?? null;
                const end_date = 	item.end_date ?? null;
                const period_length = 	item.period_length ?? null;
                const nextDateCount = 	item.nextDateCount ?? null;
                const bg_color_class = 	item.bg_color_class ?? null;
                const status = 	item.status ?? null;
                const created_at = 	item.created_at ?? null;
                const updated_at = 	item.updated_at ?? null;
                result.push({m_id,user_id,title,start_date,end_date,period_length,nextDateCount,bg_color_class,status,created_at,updated_at});
            }
            res.status(200).json({
                status_code:200,
                status:"success",
                data:result
            });
        }
    });
};