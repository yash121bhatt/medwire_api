const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class testCategory {

    static create(lab_id, category_name, cb) {
        db.query("INSERT INTO test_categories(lab_id, category_name, created_at) VALUES(?,?,NOW())",
            [lab_id, category_name],
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }

                // TODO:: RK
                db.query("UPDATE test_categories SET cat_id = ? WHERE id = ?",
                    [res.insertId, res.insertId],
                    (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }
                        cb(null, res);
                    });
                // TODO:: RK

                // cb(null, res);
            });
    }

    static update(category_name, cat_id, lab_id, cb) {
        db.query("UPDATE test_categories SET category_name=?,updated_at=NOW() WHERE cat_id=? AND lab_id =? ",
            [category_name, cat_id, lab_id],
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }

    static delete(cat_id, lab_id, cb) {
        db.query("DELETE FROM test_categories WHERE cat_id=? AND lab_id =? ",
            [cat_id, lab_id],
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }
    static show(lab_id, cb) {
        db.query("SELECT * FROM test_categories WHERE lab_id = ? order by cat_id desc",
            [lab_id],
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
module.exports = testCategory;