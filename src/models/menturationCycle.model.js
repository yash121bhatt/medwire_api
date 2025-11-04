const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class menturationCycle {

    static create(user_id, start_date, end_date, bg_color_class,nextDays,cb){
        
        db.query(`SELECT * FROM menturation_cycle WHERE ADDDATE(start_date, INTERVAL 12 DAY) >='${start_date}' and SUBDATE(start_date, INTERVAL 12 DAY) <= '${start_date}' AND user_id = '${user_id}' limit 1`,(err,res)=>{
            if(res)
            {
                if (res.length>0) {

                    if(res[0].updated_at!=null || res[0].updated_at!="")
                    {
                        var qu = `INSERT INTO menturation_cycle(user_id, start_date, end_date, bg_color_class,created_at) VALUES
                        (?,?,?,?,NOW())`;
                       
                    }else{
                        var qu = `UPDATE menturation_cycle SET user_id=?, start_date=?, end_date=?, bg_color_class=?,updated_at=NOW() WHERE m_id='${res[0].m_id}' AND user_id='${user_id}'`;
                    }
                    
                } else {
                    var qu = `INSERT INTO menturation_cycle(user_id, start_date, end_date, bg_color_class,created_at) VALUES
                    (?,?,?,?,NOW()),
                    ('${user_id}',ADDDATE(DATE_FORMAT('${start_date}','%Y-%m-%d'), INTERVAL '${nextDays}' DAY),'${end_date}','${bg_color_class}',NOW()),
                    ('${user_id}',ADDDATE(DATE_FORMAT('${start_date}','%Y-%m-%d'), INTERVAL '${nextDays*2}' DAY),'${end_date}','${bg_color_class}',NOW()),
                    ('${user_id}',ADDDATE(DATE_FORMAT('${start_date}','%Y-%m-%d'), INTERVAL '${nextDays*3}' DAY),'${end_date}','${bg_color_class}',NOW())`;
                }
                db.query(qu,
                    [user_id, start_date, end_date, bg_color_class],
                    (err,res)=>{
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        cb(null,res);
                    });
                    
            }
            if (err) {
                console.log(err);
            }
        }); 
    }
    static update(user_id, start_date, end_date, bg_color_class,m_id,cb){
        db.query(`UPDATE menturation_cycle SET user_id=?, start_date=?, end_date=?, bg_color_class=? WHERE m_id='${m_id}' AND user_id='${user_id}'`,
        [user_id, start_date, end_date, bg_color_class,m_id],
        (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static show(user_id,cb){
        db.query(`SELECT*FROM menturation_cycle WHERE user_id='${user_id}'`,
        [user_id],
        (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static delete(m_id,cb){
        db.query("DELETE FROM menturation_cycle WHERE m_id=?",
        [m_id],
        (err,res)=>{
            if(err)
            {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static createNew(user_id,period_length,start_date,nextDays,bg_color_class,cb){
  
        var qu;
        
            var qu = `INSERT INTO menturation_cycle(user_id, start_date, end_date,period_length,nextDateCount,bg_color_class,created_at) VALUES
            ('${user_id}','${start_date}',ADDDATE(DATE_FORMAT('${start_date}','%Y-%m-%d'), INTERVAL '${period_length}' DAY),'${period_length}','${nextDays}','${bg_color_class}',NOW())`;
           
            db.query(qu,
                (err,res)=>{
                   
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null,res);
                    }
                   
                );               
    }
    static showNew(user_id,cb){
        db.query(`SELECT*FROM menturation_cycle WHERE user_id='${user_id}'`,
        [user_id],
        (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
}
module.exports = menturationCycle;