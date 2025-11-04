const { JOI } = require("joi");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const helperFunction = require("../helper/helperFunction");
const moment = require("moment");

class Plan {


    static getUserPlanHistory(user_id){
        return new Promise((resolve,reject)=>{
            var query = "SELECT `users`.`first_name`,`users`.`user_type`, `plans`.`plan_name`, `plans`.`price`,`plans`.`validity`,`plan_purchase_history`.`purchased_at`, `plan_purchase_history`.`payment_status`, `plan_purchase_history`.`expired_at` FROM `plan_purchase_history` INNER JOIN `users` ON `users`.`id` = `plan_purchase_history`.`user_id` INNER JOIN `plans`  ON `plans`.`id` = `plan_purchase_history`.`plan_id` where `users`.`id`='"+user_id+"'  ORDER BY plan_purchase_history.id DESC";
            db.query(query, (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static findAll({role,user_ids},cb){
        
        var query = `SELECT * FROM plans WHERE plan_for = '${role}' and deleted_at IS NULL and id NOT IN ('${user_ids}') order by id desc`;
        
        
        db.query(query, (err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            const response = [];
            if(res.length > 0){
                cb(null,res); 
            } else {
                cb({ kind: "not_found" }, null);
            }
            
        });
    }


    static findById(plan_id,cb){
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM plans WHERE id = '${plan_id}' and deleted_at ${deleted_at}`, [plan_id,deleted_at], (err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            if(res.length > 0){
                cb(null,res);  
            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }

    static purchase(plan_id,user_id,cb){
        var status = "Inactive";
        var purchased_at = helperFunction.getCurrentDateTime();
        var payment_order_id = process.env.APP_NAME+"_"+new Date().getTime();
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM plans WHERE id = '${plan_id}' and deleted_at ${deleted_at}`, [plan_id,deleted_at], (err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            if(res.length > 0){
                console.log("-----res",res);
                db.query("SELECT * FROM plan_purchase_history WHERE status = 'active' and user_id = ?", [user_id], (err,planpurchaseres)=>{
                    if(err){
                        logger.error(err.message);
                        cb(err,null);
                        return;
                    }
               // console.log("-----plan",planpurchaseres);

                    if(planpurchaseres.length > 0){
                        var price = res[0].price;
                        var active_plan_purchase_id = planpurchaseres[0].id;
                        var total_limit = planpurchaseres[0].total_limit;
                        var benefit  = parseInt(res[0].benefit);
                        benefit  +=  total_limit;
                     
                        var validity = res[0].validity;
                        validity = validity.split(" ");
                        var validity_part_1 = validity[0];
                        var validity_part_2 = validity[1];
                       
                        var date = moment(purchased_at).format("YYYY-MM-DD");
                        var expired_at = "";
                        if(validity_part_2 == "Year"){
                            expired_at = moment(date).add(parseInt(validity_part_1), "years").format("YYYY-MM-DD HH:mm:ss");
                        }
                        if(validity_part_2 == "Month"){                    
                            expired_at = moment(date).add(parseInt(validity_part_1), "months").format("YYYY-MM-DD HH:mm:ss");
                        }
                        if(validity_part_2 == "day"){
                            expired_at = moment(date).add(parseInt(validity_part_1), "days").subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
                        }

                        db.query(`SELECT * FROM plan_purchase_history WHERE plan_id = '${plan_id}' and status = 'active' and user_id =  ${user_id}`, [plan_id,user_id], (err,res)=>{
                            if(err){
                                logger.error(err.message);
                                cb(err,null);
                                return;
                            }
                            
                            if(res.length > 0){
                                cb({ kind: "already_purchased" }, null);
                            } else {

                                db.query("INSERT INTO plan_purchase_history(plan_id,user_id,status,purchased_at,total_limit,expired_at,total_amount,payment_order_id) VALUES(?,?,?,?,?,?,?,?)", [plan_id,user_id,status,purchased_at,benefit,expired_at,price,payment_order_id], (err,res)=>{
                                    if(err){
                                        logger.error(err.message);
                                        cb(err,null);
                                        return;
                                    }
                                    if(res.insertId > 0){
                                        cb(null,res);  
                                    }
                                });
                            }
                        });


                    } 

                    else {
                        var price = res[0].price;
                        var benefit  = parseInt(res[0].benefit);
                     
                        var validity = res[0].validity;
                        validity = validity.split(" ");
                        var validity_part_1 = validity[0];
                        var validity_part_2 = validity[1];
                       
                        var date = moment(purchased_at).format("YYYY-MM-DD");
                        var expired_at = "";
                        if(validity_part_2 == "Year"){
                            expired_at = moment(date).add(parseInt(validity_part_1), "years").format("YYYY-MM-DD HH:mm:ss");
                        }
                        if(validity_part_2 == "Month"){                    
                            expired_at = moment(date).add(parseInt(validity_part_1), "months").format("YYYY-MM-DD HH:mm:ss");
                        }
                        if(validity_part_2 == "day"){
                            expired_at = moment(date).add(parseInt(validity_part_1), "days").subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
                        }

                        db.query(`SELECT * FROM plan_purchase_history WHERE plan_id = '${plan_id}' and status='active' and user_id =  ${user_id}`, [plan_id,user_id], (err,res)=>{
                            if(err){
                                logger.error(err.message);
                                cb(err,null);
                                return;
                            }
                            
                            if(res.length > 0){
                                cb({ kind: "already_purchased" }, null);
                            } else {
                              /*  db.query(`update plan_purchase_history set status = ? where id = ?`, ['expire',active_plan_purchase_id], (err,res)=>{
                                    if(err){
                                        logger.error(err.message);
                                        cb(err,null);
                                        return;
                                    }
                                   
                                });*/

                                db.query("INSERT INTO plan_purchase_history(plan_id,user_id,status,purchased_at,total_limit,expired_at,total_amount,payment_order_id) VALUES(?,?,?,?,?,?,?,?)", [plan_id,user_id,status,purchased_at,benefit,expired_at,price,payment_order_id], (err,res)=>{
                                    if(err){
                                        logger.error(err.message);
                                        cb(err,null);
                                        return;
                                    }
                                    if(res.insertId > 0){
                                        cb(null,res);  
                                    }
                                });
                            }
                        });
                    }
                }); 

            } else { 
                cb({ kind: "not_found" }, null);
            }
        });
    } 
    static renew(plan_purchase_id,cb){
        var purchased_at = helperFunction.getCurrentDateTime();
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM plan_purchase_history WHERE id = '${plan_purchase_id}'`, [plan_purchase_id], (err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
        if(res.length > 0){
            var plan_id = res[0].plan_id;
            var total_limit = res[0].total_limit;

            db.query(`SELECT * FROM plans WHERE  id = '${plan_id}' `, [plan_id], (err,planres)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            if(planres.length > 0){
                var benefit  = parseInt(planres[0].benefit);
                benefit  +=  total_limit;
                var validity = planres[0].validity;
                validity = validity.split(" ");
                var validity_part_1 = validity[0];
                var validity_part_2 = validity[1];
               
                var date = new Date(purchased_at);
                var expired_at = "";
                if(validity_part_2 == "Year"){
                    var expired_at = date.setFullYear(date.getFullYear() + parseInt(validity_part_1));
                    expired_at = new Date(expired_at);
                }

                if(validity_part_2 == "Month"){                    
                    var expired_at = date.setMonth(date.getMonth() + parseInt(validity_part_1));
                    expired_at = new Date(expired_at);
                }

                db.query("update plan_purchase_history set purchased_at = ? ,total_limit =? ,expired_at = ? where id = ?", [purchased_at,benefit,expired_at,plan_purchase_id], (err,res)=>{
                    if(err){
                        logger.error(err.message);
                        cb(err,null);
                        return;
                    }
                    if(res.affectedRows > 0){
                        cb(null,res);  
                    }
                });
            } else {
                cb({ kind: "plan_not_found" }, null);
            }
        }); 

        } else {             
            cb({ kind: "plan_purchase_not_found" }, null);
        }
    });
       
       
       
    }

  
}
module.exports = Plan;