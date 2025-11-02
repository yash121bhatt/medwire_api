const db = require('../config/db.config');
const { logger } = require('../utils/logger');
const {dateFormat:dateFormat} = require('../helper/helper');
class Baby {
    static list_baby(user_id, cb) {
        db.query(`SELECT *, CONCAT ( 
            FLOOR((TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) / 12)), if(FLOOR((TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) / 12)) < 2,' year ',' years '), 
            MOD(TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()), 12) , if( MOD(TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()), 12) < 2,' month ',' months '), 
            FLOOR( TIMESTAMPDIFF( DAY, date_of_birth, now() ) % 30.4375 ) ,if(FLOOR( TIMESTAMPDIFF( DAY, date_of_birth, now() ) % 30.4375 ) < 2,' day ',' days ') 
       ) AS age_count FROM user_baby WHERE user_id = ?  ORDER BY baby_id DESC;`,
            [
                user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }
    static add_baby(baby_name,date_of_birth,baby_gender,father_height,mother_height, user_id, cb) {
        db.query(`INSERT INTO user_baby(user_id,baby_name,date_of_birth,baby_gender,father_height,mother_height, created_at) VALUES(?,?,?,?,?,?,NOW())`,
            [
                user_id,baby_name,date_of_birth,baby_gender,father_height,mother_height, 
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
            
                var date_of_birth_c = dateFormat(date_of_birth, 'yyyy-MM-dd');
                
                db.query(`INSERT INTO user_baby_vaccination(baby_id, vaccination_name, duration, due_date, dose_date, status, created_at)VALUES
                ('${res.insertId}','BCG, OPV-0, Hepatitis - B', 'At Birth',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 1 DAY),'','Pending',NOW()),
                ('${res.insertId}','DTP - 1, OPV - 1, Hepatitis - B1', '06 weeks age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 42 DAY),'','Pending',NOW()),
                ('${res.insertId}','DTP - 2, OPV - 2, Hepatitis - B2', '10 weeks age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 70 DAY),'','Pending',NOW()),
                ('${res.insertId}','DTP - 3, OPV - 3, Hepatitis - B3', '14 weeks age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 98 DAY),'','Pending',NOW()),
                ('${res.insertId}','Measles, Vitamin A — first dose', '9 months age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 270 DAY),'','Pending',NOW()),
                ('${res.insertId}','DPT — first Booster, \nOPV booster, \nMeasles 2 dose, \nVitamin A— second dose\nfollowed by every 6 months till 5 yr. age\n JE (in endemic districts only)', '16 - 24 months age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 730 DAY),'','Pending',NOW()),
                ('${res.insertId}','DPT second booster', '5 — 6 years of age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 2190 DAY),'','Pending',NOW()),
                ('${res.insertId}','TT', '10  years of age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 3560 DAY),'','Pending',NOW()),
                ('${res.insertId}','TT', '16 years of age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 5840 DAY),'','Pending',NOW())`,
                [date_of_birth_c]);
                cb(null, {
                    baby_id: res.insertId,
                    user_id: user_id,
                    baby_name: baby_name,
                    date_of_birth: date_of_birth,
                    baby_gender : baby_gender,
                    father_height:father_height,
                    mother_height:mother_height, 
                });
        });
    }
    static update_baby(baby_name,date_of_birth,baby_gender,father_height,mother_height,user_id,baby_id, cb) {
        db.query(`SELECT * FROM user_baby WHERE baby_id = '${baby_id}'`,
            [
              baby_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if(res)
                {
                    var old_date_of_birth = dateFormat(res[0].date_of_birth,'yyyy-MM-dd');
                    var date_of_birth_c = dateFormat(date_of_birth, 'yyyy-MM-dd');
                    
                    if(old_date_of_birth != date_of_birth_c){
                        db.query(`DELETE FROM user_baby_vaccination WHERE baby_id = '${baby_id}' `,
                                [
                                    baby_id
                                ], (err, res) => {
                                    if (err) {
                                        logger.error(err.message);
                                        cb(err, null);
                                        return;
                                    }
                                    if(res){
                                        console.log("baby_id",baby_id)
                                        db.query(`INSERT INTO user_baby_vaccination(baby_id, vaccination_name, duration, due_date, dose_date, status, created_at)VALUES
                                        ('${baby_id}','BCG, OPV-0, Hepatitis - B', 'At Birth',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 1 DAY),'','Pending',NOW()),
                                        ('${baby_id}','DTP - 1, OPV - 1, Hepatitis - B1', '06 weeks age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 42 DAY),'','Pending',NOW()),
                                        ('${baby_id}','DTP - 2, OPV - 2, Hepatitis - B2', '10 weeks age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 70 DAY),'','Pending',NOW()),
                                        ('${baby_id}','DTP - 3, OPV - 3, Hepatitis - B3', '14 weeks age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 98 DAY),'','Pending',NOW()),
                                        ('${baby_id}','Measles, Vitamin A — first dose', '9 months age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 270 DAY),'','Pending',NOW()),
                                        ('${baby_id}','DPT — first Booster, \nOPV booster, \nMeasles 2 dose, \nVitamin A— second dose\nfollowed by every 6 months till 5 yr. age\n JE (in endemic districts only)', '16 - 24 months age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 730 DAY),'','Pending',NOW()),
                                        ('${baby_id}','DPT second booster', '5 — 6 years of age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 2190 DAY),'','Pending',NOW()),
                                        ('${baby_id}','TT', '10  years of age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 3560 DAY),'','Pending',NOW()),
                                        ('${baby_id}','TT', '16 years of age',ADDDATE(DATE_FORMAT('${date_of_birth_c}','%Y-%m-%d'), INTERVAL 5840 DAY),'','Pending',NOW())`,
                                        [date_of_birth_c]);
                
                                    }
                        });
                    }
                }       
        });


             

        db.query(`UPDATE user_baby SET baby_name = ?, date_of_birth = ?, baby_gender = ? , father_height=?,mother_height=? WHERE user_id = ? AND baby_id = ?`,
    [
        baby_name,date_of_birth,baby_gender,father_height,mother_height,user_id,baby_id
    ], (err, res) => {
        if (err) {
            logger.error(err.message);
            cb(err, null);
            return;
        }

            


        cb(null, {
            baby_id: baby_id,
            user_id: user_id,
            baby_name: baby_name,
            date_of_birth: date_of_birth,
            baby_gender : baby_gender,
            father_height:father_height,
            mother_height:mother_height, 
        });
    });
    }
    static delete_baby(baby_id,user_id, cb) {
        db.query(`DELETE FROM user_baby WHERE baby_id = ? AND user_id = ?`,
            [
                baby_id,user_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    user_id: user_id
                });
        });
    }
    static single_baby(user_id,baby_id, cb) {
        db.query(`SELECT * FROM user_baby WHERE user_id = ? AND baby_id = ?`,
            [
               user_id,baby_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res[0]);
        });
    }
    
    static user_baby_vaccination(baby_id,cb){
        db.query(`SELECT * FROM user_baby_vaccination WHERE baby_id = ?`,
            [
               baby_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static single_baby_vaccination(v_id,baby_id, cb) {
        console.log(v_id);
        db.query(`SELECT * FROM user_baby_vaccination WHERE v_id = ? AND baby_id = ?`,
            [
                v_id,baby_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res[0]);
        });
    }

    static update_baby_vaccination(v_id,baby_id,dose_date,status, cb) {
        db.query(`UPDATE user_baby_vaccination SET dose_date = ?, status = ? WHERE v_id = ? AND baby_id = ?`,
            [
                dose_date,status,v_id,baby_id,
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    baby_id: baby_id,
                    v_id : v_id
                });
        });
    }

}
module.exports = Baby;