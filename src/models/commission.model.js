const { JOI } = require('joi');
const db = require('../config/db.config');
const { logger } = require('../utils/logger');

class Commission {

    // vineet
    static add(user_id,commission_for,admin_id,commission_percent,cb){
        db.query(`INSERT INTO commissions(user_id,commission_for,created_by_id,commission_percent) VALUES(?,?,?,?)`,[user_id,commission_for,admin_id,commission_percent],(err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }           
            cb(null,res);
        })
    }



    static findById(id,cb) {
        var deleted_at = 'IS NULL';
        db.query(`SELECT * FROM commissions WHERE id = '${id}' and deleted_at ${deleted_at}`, [id,deleted_at], (err, res) => {
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



    static getSpecificLabAndRadioLogyList(cb) {
        db.query(`SELECT commissions.id as commissions_id,users.id,users.first_name  FROM commissions right JOIN users on  users.id = commissions.user_id  WHERE commissions.user_id IS NULL AND  users.role_id in (3,4);`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if(res){
                cb(null,res);
                return;   
            }              
        });       
    }


    static findAll(admin_id,cb){
        var deleted_at = 'IS NULL';
        db.query(`SELECT users.id,users.first_name,commissions.commission_for,commissions.commission_percent FROM commissions inner JOIN users on users.id = commissions.user_id AND commissions.created_by_id = '${admin_id}' AND commissions.deleted_at ${deleted_at} order by commissions.id desc`, [admin_id,deleted_at], (err,res)=>{
            console.log("q",`SELECT users.id,users.first_name,commissions.commission_for,commissions.commission_percent FROM commissions inner JOIN users on users.id = commissions.user_id AND commissions.created_by_id = '${admin_id}' AND commissions.deleted_at ${deleted_at} order by commissions.id desc`, [admin_id,deleted_at]);
          //  return false;
            if(err){
                logger.error(err.message);
                cb(err,null);
                return;
            }
            
            if(res.length > 0){
              cb(null,res);
              return; 
                  
            } else {
                cb({ kind: "not_found" }, null);
            }
            
            
        })
    }


    static update(commission_id,user_id,commission_for,commission_percent,cb){
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
             

        db.query(`UPDATE commissions SET user_id = ?, commission_for = ?, commission_percent = ? ,updated_at = ?  WHERE id = ?`,[user_id,commission_for,commission_percent,updated_at,commission_id],(err,res)=>{
           if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {id: commission_id});
        });
             
    }


    static delete(id,cb){
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
        var deleted_at = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
                  

        db.query(`update commissions set deleted_at = ? WHERE id= ?`,[deleted_at,id],(err,res)=>{                  
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
module.exports = Commission;