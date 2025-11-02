const db = require('../config/db.config');
class appliedCouponCodes {
    static create({user_id,promo_code_id,package_id,test_id}) {
        return new Promise((resolve,reject)=>{
            if (package_id!=undefined && package_id!=null) {
                var que =`INSERT INTO applied_coupon_codes(user_id,promo_code_id,package_id,created_at) VALUES('${user_id}','${promo_code_id}','${package_id}',NOW())`;
            }else{
                var que =`INSERT INTO applied_coupon_codes(user_id,promo_code_id,test_id,created_at) VALUES('${user_id}','${promo_code_id}','${test_id}',NOW())`;
            }
            db.query(que,
            (err,res)=>{
                if (err) {
                    return reject(err);  
                   }
                   return resolve(res);
            });
        });
    }
    static findBYuserIdPromo({user_id,promo_code_id}){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM applied_coupon_codes WHERE user_id='${user_id}' AND promo_code_id='${promo_code_id}' AND status='0'`,
            (err,res)=>{
                if (err) {
                 return reject(err);  
                }
                return resolve(res);
            });
        });
    }
    static DeleteBYuserId(user_id){
        return new Promise((resolve,reject)=>{
            db.query(`DELETE FROM applied_coupon_codes WHERE user_id='${user_id}' AND status='0'`,
            (err,res)=>{
                if (err) {
                 return reject(err);  
                }
                return resolve(res);
            });
        });
    }
    static findBYPromocodeId(promo_code_id){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM applied_coupon_codes WHERE promo_code_id='${promo_code_id}' AND status='1'`,
            (err,res)=>{
                if (err) {
                 return reject(err);  
                }
                return resolve(res);
            });
        });
    }
    static updatePromocodeIdInFalseStatus({user_id,promo_code_id}){
        return new Promise((resolve,reject)=>{
            db.query(`UPDATE applied_coupon_codes SET promo_code_id='${promo_code_id}' WHERE user_id='${user_id}' AND  status='0'`,
            (err,res)=>{
                if (err) {
                 return reject(err);  
                }
                return resolve(res);
            });
        });
    }
    static updaTrueStatusByUserId({created_by_id,insertId,cart_id}){
        return new Promise((resolve,reject)=>{
            db.query(`UPDATE applied_coupon_codes SET status='1', appointment_id='${insertId}',cart_id='${cart_id}' WHERE user_id='${created_by_id}' AND  status='0'`,
            (err,res)=>{
                if (err) {
                 return reject(err);  
                }
                return resolve(res);
            });
        });
    }
}
module.exports = appliedCouponCodes;