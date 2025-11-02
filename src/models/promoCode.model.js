const { joi } = require('joi');
const db = require('../config/db.config');
const {addPromoCode: addPromoCode,updatePromoCode: updatePromoCode} = require('../database/queries');
const { logger } = require('../utils/logger');
const helperFunction = require('../helper/helperFunction');


class promoCode {

    static add(user_id,promo_code_for,promo_code_for_id,discount_type,promo_code,discount_rate,discount_price,validity_start_date,validity_end_date,max_uses,price,banner_image,description,cb){
        db.query(addPromoCode,
            [promo_code_for,promo_code_for_id,discount_type,promo_code,discount_rate,discount_price,validity_start_date,validity_end_date,max_uses,price,banner_image,description,user_id],
            (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }  

            if(res.insertId > 0){
                cb(null, {
                    id: res.insertId,
                    discount_type: discount_type,
                    promo_code: promo_code,
                    discount_rate: parseInt(discount_rate),
                    discount_price: parseInt(discount_price),
                    validity_start_date: validity_start_date,
                    validity_end_date: validity_end_date,
                    max_uses: parseInt(max_uses),
                    banner_image :banner_image,            
                    price :parseInt(price), 
                    description :description,       
                    created_by_id:parseInt(user_id),
                    promo_code_for:promo_code_for,
                    promo_code_for_id:promo_code_for_id,
                });
            }  else {
                cb({ kind: "not_inserted" }, null);
                return;
            }           
            
            
        })
    }


    static findAll(user_id,cb){
        var deleted_at = 'IS NULL';
      
        db.query(`SELECT * FROM promo_code WHERE created_by_id = '${user_id}' and deleted_at ${deleted_at} order by id desc`, [user_id,deleted_at], (err,res)=>{
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            const response = [];

            if(res.length > 0){
                for (const [key, item] of Object.entries(res)) {
                    const id = item.id;
                    const promo_code = item.promo_code;
                    const banner_image_name = (item.banner_image == null) ? '' :item.banner_image;
                    const banner_image_path =  process.env.APP_URL+"member/"+banner_image_name;
                    var max_uses = parseInt(item.max_uses);
                    var description = item.description;
                    var discount_rate = item.discount_rate;
                    var discount_price = parseInt(item.discount_price);
                    var validity_start_date = item.validity_start_date;
                    var validity_end_date = item.validity_end_date;
                    var price = item.price;
                    const discount_type = item.discount_type;
                    const promo_code_for = item.promo_code_for;
                    response.push({ id,promo_code,discount_type,discount_rate,discount_price,max_uses,validity_start_date,validity_end_date,price,banner_image_name, banner_image_path,description,promo_code_for});
                    const promo_code_for_id = item.promo_code_for_id;
                    if(promo_code_for_id!=null){
                        if(promo_code_for == 'package'){                      
                            db.query(`SELECT GROUP_CONCAT(package_name) AS package_name FROM packages WHERE package_id IN (${promo_code_for_id})`, [promo_code_for_id], (err1,res1)=>{
                                if(res1){
                                    response[key]['packages'] = res1[0].package_name;
                                }                                  
                            });
                        } else {
                             response[key]['packages'] = '';
                        } 
                        if(promo_code_for == 'test'){ 
                            db.query(`SELECT GROUP_CONCAT(test_name) as test_name FROM lab_tests WHERE test_id IN (${promo_code_for_id})`, [promo_code_for_id], (err2,res2)=>{
                                  if(res2){
                                    response[key]['tests'] = res2[0].test_name;
                                } 
                                  
                            });                         
                        } else {
                            response[key]['tests'] = '';
                        }
                    } else {
                        response[key]['packages'] = '';
                        response[key]['tests'] = '';
                    }            
                 
                }
                setTimeout(function(){
                    cb(null,response);  

                },100); 
            } else {
                cb({ kind: "not_found" }, null);
            }
            
            
        })
    }


    static findById(id,cb) {
        var deleted_at = 'IS NULL';
        db.query(`SELECT * FROM promo_code WHERE id = '${id}' and deleted_at ${deleted_at}`, [id,deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];   

            if(res.length > 0){
                for (const [key, item] of Object.entries(res)) {
                    const id = item.id;
                    const promo_code = item.promo_code;
                    const banner_image_name = (item.banner_image == null) ? '' :item.banner_image;
                    const banner_image_path =  process.env.APP_URL+"member/"+banner_image_name;
                    var max_uses = parseInt(item.max_uses);
                    var description = item.description;
                    var discount_rate = item.discount_rate;
                    var discount_price = parseInt(item.discount_price);
                    var validity_start_date = item.validity_start_date;
                    var validity_end_date = item.validity_end_date;
                    var price = item.price;
                    const discount_type = item.discount_type;
                    const promo_code_for = item.promo_code_for; 
                    const promo_code_for_id = item.promo_code_for_id;                   
                    response.push({ id,promo_code,discount_type,discount_rate,discount_price,max_uses,validity_start_date,validity_end_date,price,banner_image_name, banner_image_path,description,promo_code_for,promo_code_for_id});
                   
                    if(promo_code_for_id!=null){
                        if(promo_code_for == 'package'){                      
                            db.query(`SELECT GROUP_CONCAT(package_name) AS package_name FROM packages WHERE package_id IN (${promo_code_for_id})`, [promo_code_for_id], (err1,res1)=>{
                                if(res1){
                                    response[key]['packages'] = res1[0].package_name;
                                }                                  
                            });
                        } else {
                             response[key]['packages'] = '';
                        } 
                        if(promo_code_for == 'test'){ 
                            db.query(`SELECT GROUP_CONCAT(test_name) as test_name FROM lab_tests WHERE test_id IN (${promo_code_for_id})`, [promo_code_for_id], (err2,res2)=>{
                                  if(res2){
                                    response[key]['tests'] = res2[0].test_name;
                                } 
                                  
                            });                         
                        } else {
                            response[key]['tests'] = '';
                        }
                    } else {
                        response[key]['packages'] = '';
                        response[key]['tests'] = '';
                    }                                                    
                 
                }
                 setTimeout(function(){
                    cb(null,response);  

                },100);  
            } else {
                cb({ kind: "not_found" }, null);
            }
        })   

    }


    static findByCode(promo_code,user_id,cb) {
        var deleted_at = 'IS NULL';
        db.query(`SELECT * FROM promo_code WHERE promo_code ='${promo_code}' and created_by_id = '${user_id}'  and deleted_at ${deleted_at}`, [promo_code,user_id,deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        })
    }


    static findByCodeForUpdate(promo_code,user_id,promo_code_id, cb) {
        var deleted_at = 'IS NULL';
        db.query(`SELECT * FROM promo_code WHERE promo_code ='${promo_code}' and created_by_id = '${user_id}' and id !='${promo_code_id}' and deleted_at ${deleted_at}`, [promo_code,user_id,promo_code_id,deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
               cb({ kind: "not_found" }, null); 
            }
            
        })
    }




    static update(promo_code_for,promo_code_for_id,promo_code_id,user_id,discount_type,promo_code,discount_rate,discount_price,validity_start_date,validity_end_date,max_uses,price,banner_image,description,cb){
      
        var updated_at = helperFunction.getCurrentDateTime();


        db.query(updatePromoCode,
            [promo_code_for,promo_code_for_id,discount_type,promo_code,discount_rate,discount_price,validity_start_date,validity_end_date,max_uses,price,banner_image,description,updated_at,promo_code_id],
            (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            ; 
            if(res.affectedRows > 0){
                cb(null, {
                    discount_type: discount_type,
                    promo_code: promo_code,
                    discount_rate: parseInt(discount_rate),
                    discount_price: parseInt(discount_price),
                    validity_start_date: validity_start_date,
                    validity_end_date: validity_end_date,
                    max_uses: parseInt(max_uses),
                    banner_image :banner_image,            
                    price :parseInt(price),            
                    description :description, 
                    promo_code_for:promo_code_for,
                    promo_code_for_id:promo_code_for_id,           
                });
            } else {
                cb({ kind: "not_updated" }, null);
                return;
            }
                         
        })
    }


    static delete(id,cb){
        var deleted_at = helperFunction.getCurrentDateTime();
        
        db.query(`update promo_code set deleted_at = ? WHERE id= ?`,[deleted_at,id],(err,res)=>{                  
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        })

    }
}
module.exports = promoCode;