const db = require('../config/db.config');
const { logger } = require('../utils/logger');
class PregnantWomen {
    
    
    static create(user_id,name,date_of_pregnancy, cb) {
        db.query(`INSERT INTO pregnant_women(user_id,name,date_of_pregnancy,created_at) VALUES(?,?,?,NOW())`,
            [
                user_id,name,date_of_pregnancy  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static show(user_id,cb) {
        db.query(`SELECT id,user_id,name,date_of_pregnancy,created_at, updated_at FROM pregnant_women WHERE user_id=${user_id}`, 
        (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static findBYId(id,user_id, cb) {
        db.query(`SELECT id,user_id,name,date_of_pregnancy,created_at, updated_at FROM pregnant_women WHERE id=${id} AND user_id=${user_id} `,
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static update(id,user_id, cb) {
        db.query(`UPDATE pregnant_women SET  user_id = ?, name = ?, date_of_pregnancyt=?, updated_at=NOW() WHERE id=${id} AND user_id =${user_id}`,
            [
                user_id,member_id,symtomeslist  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static delete(id, cb) {
        db.query(`DELETE FROM pregnant_women WHERE id=${id}`,
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }
    

   
}
module.exports = PregnantWomen;