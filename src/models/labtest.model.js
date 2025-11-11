const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class LabTest {
    static create(test_category_id, lab_id, user_id, member_id, test_name, test_report, fast_time, test_recommended, image, description, amount, cb) {
        db.query("INSERT INTO lab_tests(test_category_id,lab_id,user_id,member_id,test_name,test_report,fast_time,test_recommended,image,description,amount,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,NOW())",
            [test_category_id, lab_id, user_id, member_id, test_name, test_report, fast_time, test_recommended, image, description, amount],
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                }
                cb(null, res);
            });
    }
    static update(test_category_id, test_name, test_report, fast_time, test_recommended, image, description, amount, test_id, lab_id, cb) {
        if (image == null || image == undefined || image == "") {
            var qu = "UPDATE lab_tests SET test_category_id=?,test_name=?,test_report=?,fast_time=?,test_recommended=?,description=?,amount=?,updated_at=NOW() WHERE test_id =? AND lab_id=?";
            var arr = [test_category_id, test_name, test_report, fast_time, test_recommended, description, amount, test_id, lab_id];
        } else {
            var qu = "UPDATE lab_tests SET test_category_id=?,test_name=?,test_report=?,fast_time=?,test_recommended=?,image=?,description=?,amount=?,updated_at=NOW() WHERE test_id =? AND lab_id=?";
            var arr = [test_category_id, test_name, test_report, fast_time, test_recommended, image, description, amount, test_id, lab_id];
        }
        db.query(qu, arr,
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                }
                cb(null, res);
            });
    }
    static show(lab_id, cb) {
        const oldQuery = `SELECT l.test_id,l.lab_id,l.test_category_id,t.category_name,l.test_name,l.test_report,l.fast_time,l.test_recommended,l.image,l.description,l.amount,l.created_at,l.updated_at FROM lab_tests l LEFT JOIN test_categories t ON l.test_category_id=t.cat_id WHERE l.lab_id='${lab_id}' order by l.test_id desc`;
        const newQeury = `SELECT
                    l.test_id,
                    l.lab_id,
                    l.test_category_id,
                    t.category_name,
                    l.test_name,
                    l.test_report,
                    l.fast_time,
                    l.test_recommended,
                    l.image,
                    l.description,
                    l.amount,
                    l.created_at,
                    l.updated_at 
                    FROM
                    lab_tests l
                    LEFT JOIN test_categories t ON l.test_category_id = t.id
                    WHERE
                    l.lab_id = '${lab_id}' 
                    order by
                    l.test_id desc`;
        db.query(oldQuery,
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    //console.log(err);
                    return;
                }
                cb(null, res);
            });
    }
    static delete(test_id, lab_id, cb) {
        db.query(`DELETE FROM lab_tests WHERE test_id='${test_id}' AND lab_id='${lab_id}'`,
            [test_id, lab_id],
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    //console.log(err);
                    return;
                }
                cb(null, res);
            });
    }
    static showOne(test_id, lab_id, cb) {
        db.query(`SELECT l.test_id,l.lab_id,l.test_category_id,t.category_name,l.test_name,l.test_report,l.fast_time,l.test_recommended,l.image,l.description,l.amount,l.created_at,l.updated_at FROM lab_tests l LEFT JOIN test_categories t ON l.test_category_id=t.cat_id WHERE l.test_id ='${test_id}' AND l.lab_id='${lab_id}'`,
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    //console.log(err);
                    return;
                }
                cb(null, res);
            });
    }
    static testList(lab_id, arr) {
        var qu = `SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct 
            ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where labt.lab_id='${lab_id}' AND labt.test_id NOT IN (` + arr + `)
            ORDER BY labt.test_id desc`;
        return new Promise((resolve, reject) => {
            db.query(qu,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static findTestlist({ lab_id, category_name, cat_id }, cb) {
        const findQuery = `SELECT
                            l.test_id,
                            l.lab_id,
                            l.test_category_id,
                            t.category_name,
                            l.test_name,
                            l.test_report,
                            l.fast_time,
                            l.test_recommended,
                            l.image,
                            l.description,
                            l.amount,
                            l.created_at,
                            l.updated_at 
                            FROM
                            lab_tests l
                            LEFT JOIN test_categories t ON l.test_category_id = t.cat_id 
                            WHERE
                            l.lab_id = '${lab_id}' 
                            AND (t.category_name = '${category_name}' OR t.cat_id = '${cat_id}') 
                            order by
                            l.test_id desc`;
        db.query(findQuery, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                //console.log(err);
                return;
            }
            cb(null, res);
        });
    }

    static showIn(test_ids, lab_id) {
        const query = `SELECT l.test_id,l.lab_id,l.test_category_id,t.category_name,l.test_name,l.test_report,l.fast_time,l.test_recommended,l.image,l.description,l.amount,l.created_at,l.updated_at 
        FROM lab_tests l LEFT JOIN test_categories t ON l.test_category_id=t.cat_id 
        WHERE l.lab_id='${lab_id}' AND l.test_id IN ('${test_ids}') order by l.test_id desc`;
        console.log(query);
        return new Promise((resolve, reject) => {
            db.query(query,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    if (res) {
                        return resolve(res);
                    }

                });
        });
    }
}

module.exports = LabTest;