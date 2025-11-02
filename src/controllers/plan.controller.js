const User = require('../models/user.model');
const Plan = require('../models/plan.model');
const helperFunction = require('../helper/helperFunction');
const helperQuery = require('../helper/helperQuery');
const { async } = require('q');

exports.userPlanPurchaseHistory = async (req,res) => { 
    const {user_id} = req.body;
    var valid = helperFunction.customValidater(req,{user_id});
    if(valid){
        return res.status(500).json(valid);
    }
    var result = await Plan.getUserPlanHistory(user_id);
    if (result) {     
        return res.status(200).send({
            status_code : 200,
            status: 'success',
            message: 'Plan purchase history are showing',
            data: result
        });
    }
    else{
        return res.status(500).send({
            status_code : 500,
            status: 'error',
            message: err.message
        });
    }        
}
exports.getAllPlans = async(req,res) => { 
    const {role,user_id} = req.body;

    var valid = helperFunction.customValidater(req,{role,user_id});
    if(valid){
        return res.status(500).json(valid);
    }
    User.findByRole(role,async(err,data) =>{
        try {

            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        status_code : 404,
                        status: 'error',
                        message: 'Role does not exist'
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
            var usrId =[];
            if (user_id!=undefined && user_id!=undefined) {
                var query = `SELECT ph.id AS plan_purchase_id,ph.*,p.* FROM plan_purchase_history ph INNER JOIN plans p on p.id=ph.plan_id  WHERE
                ph.user_id='${user_id}' AND  p.deleted_at IS NULL AND ph.status = 'active' order by ph.id desc`;
                var listdata = await helperQuery.All(query);
                for (const iterator of listdata) {
                    usrId.push(iterator.plan_id);
                }
            }
            var user_ids = usrId.length  > 0 ? usrId:0;
            if(data){  
                Plan.findAll({role,user_ids}, (err, data) => {
                    if (err) {  
                        if (err.kind === "not_found") {
                            res.status(404).send({
                                status_code : 404,
                                status: 'error',
                                message: 'No Plans Found'
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
                        res.status(200).send({
                                    status_code :200,
                                    status: 'success',
                                    message : "Plan record found Successfully",
                                    data: listdata,
                                    listdata:data
                                });
                        return;
    
                    }
                }); 
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status_code:"500",
                status:"error",
                message:"something went to wrong!"
            }); 
        }
    })       
}
exports.purchasePlan = async(req,res) => { 
    const {plan_id,user_id} = req.body;

    var valid = helperFunction.customValidater(req,{plan_id,user_id});
    if(valid){
        return res.status(500).json(valid);
    }

    Plan.findById(plan_id,async(err,data) =>{

        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: 'Plan does not exist'
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
            Plan.purchase(plan_id,user_id, async (err, data) => {  
            
                if (err) {
                     
                    if (err.kind === "already_purchased") {
                        res.status(200).send({
                            status_code : 200,
                            status: 'success',
                            message: 'You have already purchased this plan'
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
                    
                    var result =  await helperQuery.Get({table:"plan_purchase_history",where:"id ="+data.insertId});         
                    var user_detail = await helperQuery.Get({table:"users",where:"id ="+user_id});
                            

                    if(user_detail[0].email){
                       var email  = user_detail[0].email;
                    }
                    else{
                        if(user_detail.created_by_id > 0){
                           var user_detail_created_by = await helperQuery.Get({table:"users",where:"id ="+user_detail.created_by_id});
                           var email  = user_detail_created_by[0].email; 
                        }   
                    }

                    var payment_order_id = process.env.APP_NAME+'_'+new Date().getTime();

                    var detail = 'plan_purchase_id='+result[0].id+'&&total_amount='+result[0].total_amount+'&&email='+email+'&&payment_order_id='+result[0].payment_order_id+'&&type=plan&&user_id='+user_id;
        

                    var url = process.env.APP_URL+'api/auth/payment-plan?detail='+btoa(detail);

                    res.status(200).send({
                                status_code :200,
                                status: 'success',
                                message : "Plan has been purchased Successfully",
                               url : url,
                            });
                    return;

                }
            }); 
        }

    })       
}
exports.renewPlan = async(req,res) => { 
    const {plan_purchase_id} = req.body;

    var valid = helperFunction.customValidater(req,{plan_purchase_id});
    if(valid){
        return res.status(500).json(valid);
    }
    Plan.renew(plan_purchase_id, async (err, data) => {  
          
        if (err) {
            if (err.kind === "plan_purchase_not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: 'Plan Purchase Id does not exist'
                });
                return;
            }   

            if (err.kind === "plan_not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: 'Plan does not exist'
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
            var result = await helperQuery.Get({ table: "plan_purchase_history", where: "id =" + plan_purchase_id }); 

            var user_detail = await helperQuery.Get({table:"users",where:"id ="+result[0].user_id});
       
            var email  = user_detail[0].email;      
            var payment_order_id = process.env.APP_NAME+'_'+new Date().getTime();

            var detail = 'plan_purchase_id='+result[0].id+'&&total_amount='+result[0].total_amount+'&&email='+email+'&&payment_order_id='+result[0].payment_order_id+'&&type=plan&&user_id='+result[0].user_id;

            var url = process.env.APP_URL + 'api/auth/payment-plan?detail=' + btoa(detail);
            res.status(200).send({
                        status_code :200,
                        status: 'success',
                        message : "Plan has been renewed Successfully",
                        url: url
                    });
            return;
        }
    });      
}