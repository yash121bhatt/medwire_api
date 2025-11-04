const { JOI } = require("joi");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");

class BankDetail {
    static addUpdateBankDetail(beneficiary_name,bank_name,bank_account_number,ifsc_code,account_type,clinic_id,cb) {
        db.query(`SELECT * FROM bank_detail WHERE created_by_id = '${clinic_id}'`, [clinic_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length == 0) {
                db.query("INSERT into bank_detail(beneficiary_name,bank_name,bank_account_number,ifsc_code,account_type,created_by_id) values(?,?,?,?,?,?)", [beneficiary_name,bank_name,bank_account_number,ifsc_code,account_type,clinic_id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }   
                });
            } else {

                let date_ob = new Date();

                // current date
                // adjust 0 before single digit date
                let date = ("0" + date_ob.getDate()).slice(-2);

                // current month
                let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

                // current year
                let year = date_ob.getFullYear();

                // current hours
                let hours = date_ob.getHours();

                // current minutes
                let minutes = date_ob.getMinutes();

                // current seconds
                let seconds = date_ob.getSeconds();
                var updated_at = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
                db.query("UPDATE bank_detail SET beneficiary_name = ? ,bank_name = ?,bank_account_number = ? ,ifsc_code = ? ,updated_at = ? , account_type = ? where created_by_id = ?", [beneficiary_name,bank_name,bank_account_number,ifsc_code,updated_at,account_type,clinic_id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }  
                });
            } 

            cb(null, res);
            return;           
        });
    }

    static getDetail(clinic_id,cb) {
        db.query(`SELECT * FROM bank_detail WHERE created_by_id = '${clinic_id}'`,
         [clinic_id],
         (err, res) => {

            if (err) {

                logger.error(err.message);
                cb(err, null);
                return;
            }

            if(res) {
                cb(null, res[0]);
                return;                
            }            
        });
    }
    
}
module.exports = BankDetail;