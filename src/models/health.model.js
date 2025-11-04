const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class Health {
    static addBmi(user_id,member_id,Height,Weight,BMI,createdate, cb) {
        db.query("INSERT INTO users_hwbmi_details(user_id,member_id,Height,Weight,BMI,createdate) VALUES(?,?,?,?,?,?)",
            [
                user_id,member_id,Height,Weight,BMI,createdate  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    Height: Height,
                    Weight: Weight,
                    BMI : BMI,
                    createdate : createdate
                });
        });
        
    }
    static listBmi(member_id,user_id, cb) {
        db.query("SELECT id,user_id,member_id,Height,Weight,BMI,createdate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND BMI != '' ORDER BY createdate DESC ",
            [
                member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static heartRate(user_id,member_id,heart_rate,createdate, cb) {
        db.query("INSERT INTO users_hwbmi_details(user_id,member_id,heart_rate,createdate) VALUES(?,?,?,?)",
            [
                user_id,member_id,heart_rate,createdate  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    heart_rate: heart_rate,
                    createdate : createdate
                });
        });
    }
    static listHeartRate(member_id,user_id, cb) {
        db.query("SELECT id,user_id,member_id,heart_rate,createdate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND heart_rate != '' ORDER BY createdate DESC ",
            [
                member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static bloodPressure(user_id,member_id,blood_pressure,createdate, cb) {
        db.query("INSERT INTO users_hwbmi_details(user_id,member_id,blood_pressure,createdate) VALUES(?,?,?,?)",
            [
                user_id,member_id,blood_pressure,createdate  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    blood_pressure: blood_pressure,
                    createdate : createdate
                });
        });
    }
    static listBloodPressure(member_id,user_id, cb) {
        db.query("SELECT id,user_id,member_id,blood_pressure,createdate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND blood_pressure != '' ORDER BY createdate DESC ",
            [
                member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static respiratory(user_id,member_id,respiratory_rate,createdate, cb) {
        db.query("INSERT INTO users_hwbmi_details(user_id,member_id,respiratory_rate,createdate) VALUES(?,?,?,?)",
            [
                user_id,member_id,respiratory_rate,createdate  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    respiratory_rate: respiratory_rate,
                    createdate : createdate
                });
        });
    }
    static listRespiratory(member_id,user_id, cb) {
        db.query("SELECT id,user_id,member_id,respiratory_rate,createdate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND respiratory_rate != '' ORDER BY createdate DESC ",
            [
                member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static oxygen(user_id,member_id,oxygen_saturation,createdate, cb) {
        db.query("INSERT INTO users_hwbmi_details(user_id,member_id,oxygen_saturation,createdate) VALUES(?,?,?,?)",
            [
                user_id,member_id,oxygen_saturation,createdate  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    oxygen_saturation: oxygen_saturation,
                    createdate : createdate
                });
        });
    }
    static listOxygen(member_id,user_id, cb) {
        db.query("SELECT id,user_id,member_id,oxygen_saturation,createdate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND oxygen_saturation != ''  ORDER BY createdate DESC",
            [
                member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static temperature(user_id,member_id,temperature,createdate, cb) {
        db.query("INSERT INTO users_hwbmi_details(user_id,member_id,temperature,createdate) VALUES(?,?,?,?)",
            [
                user_id,member_id,temperature,createdate  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    temperature: temperature,
                    createdate : createdate
                });
        });
    }
    static listTemperature(member_id,user_id, cb) {
        db.query("SELECT id,user_id,member_id,temperature,createdate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND temperature != '' ORDER BY createdate DESC ",
            [
                member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }
    static listdashboard(member_id,user_id, cb) {
        console.log(member_id,user_id);
        db.query(`SELECT
        (SELECT BMI FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND BMI != '' ORDER BY createdate DESC LIMIT 1) as BMI,
         (SELECT heart_rate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND heart_rate != '' ORDER BY createdate DESC LIMIT 1) as heart_rate,
         (SELECT oxygen_saturation FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND oxygen_saturation != '' ORDER BY createdate DESC LIMIT 1) as oxygen_saturation,
         (SELECT temperature FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND temperature != '' ORDER BY createdate DESC LIMIT 1) as temperature,
         (SELECT respiratory_rate FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND respiratory_rate != '' ORDER BY createdate DESC LIMIT 1) as respiratory_rate,
         (SELECT blood_pressure FROM users_hwbmi_details WHERE member_id = ? AND user_id = ? AND blood_pressure != '' ORDER BY createdate DESC LIMIT 1) as blood_pressure
         `,
            [
                member_id,user_id,member_id,user_id,member_id,user_id,member_id,user_id,member_id,user_id,member_id,user_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }
    static list_history_notepad(member_id,user_id, type, cb) {
        db.query("SELECT * FROM history_notepad WHERE member_id = ? AND user_id = ? AND type = ? ORDER BY hn_id DESC ",
            [
                member_id,user_id,type  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }
    static history_notepad(user_id,member_id,type,description,created_date, cb) {
        db.query("INSERT INTO history_notepad(user_id, member_id, type, description, created_date, created_at) VALUES(?,?,?,?,?,NOW())",
            [
                user_id,member_id,type,description,created_date
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    hn_id: res.insertId,
                    user_id: user_id,
                    member_id: member_id,
                    type: type,
                    description : description,
                    created_date : created_date
                });
        });
    }
    static update_history_notepad(hn_id,user_id,member_id,type,description,created_date, cb) {
        db.query("UPDATE history_notepad SET user_id = ?, member_id = ?, type = ?, description = ?, created_date = ? WHERE hn_id = ?",
            [
                user_id,member_id,type,description,created_date,hn_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    hn_id: hn_id,
                    user_id: user_id,
                    member_id: member_id,
                    type: type,
                    description : description,
                    created_date : created_date
                });
        });
    }
    static single_history_notepad(member_id,user_id,hn_id, cb) {
        db.query("SELECT * FROM history_notepad WHERE member_id = ? AND user_id = ? AND hn_id = ?",
            [
                member_id,user_id,hn_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res[0]);
        });
    }
    static deletehealthreport(id,member_id,user_id, cb) {
        db.query(`DELETE FROM users_hwbmi_details WHERE member_id = ${member_id}  AND id = ${id}`,
            [
                member_id,user_id,id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

   
}
module.exports = Health;