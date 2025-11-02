const { resolve, reject, Promise } = require('q');
const db = require('../config/db.config');
const { logger } = require('../utils/logger');
//Note=> use query builder in the for json for exam  
//helperquery.hasOne({table1:'users_documents',table:'users',id:'member_id',where:'users.created_by_id=users_documents.user_id'})
class helperQuery {

    // helper with callback start 
    static get(data, cb) {
        db.query(`SELECT * FROM ${data.table} WHERE ${data.where != undefined ? data.where : 1}`,
            (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });

    }
    static destroy(data, cb) {
        if (data.where != undefined) {
            db.query(`DELETE FROM ${data.table} WHERE ${data.where != undefined ? data.where : 1}`,
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

    static hasMany(data, cb) {
        db.query(`SELECT *FROM ${data.table}  JOIN ${data.table1} ON ${data.withId != undefined && data.withId != null ? data.withId : data.table + '.id'} = ${data.table1}.${data.id} WHERE ${data.where != undefined ? data.where : 1}`,
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
    static hasOne(data, cb) {
        db.query(`SELECT *FROM ${data.table}  LEFT JOIN ${data.table1} ON ${data.withId != undefined && data.withId != null ? data.withId : data.table + '.id'} = ${data.table1}.${data.id} WHERE ${data.where != undefined ? data.where : 1}`,
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
    static belongsTo(data, cb) {
        db.query(`SELECT *FROM ${data.table} RIGHT JOIN ${data.table1}  ON ${data.withId != undefined && data.withId != null ? data.withId : data.table + '.id'} = ${data.table1}.${data.id} WHERE ${data.where != undefined ? data.where : 1}`,
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
    static all(data, cb) {
        db.query(data,
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
    // helper with callback end


    // helper with promises start
    static Get(data) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${data.table} WHERE ${data.where != undefined ? data.where : 1}`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        })
    }
    static First(data) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${data.table} WHERE ${data.where != undefined ? data.where : 1} LIMIT 1`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    if (res.length > 0) {
                        return resolve(res[0]);
                    }
                    return resolve({});
                });
        })
    }
    static All(data) {
        return new Promise((resolve, reject) => {
            db.query(data,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static Destroy(data) {
        return new Promise((resolve, reject) => {
            if (data.where != undefined) {
                db.query(`DELETE FROM ${data.table} WHERE ${data.where != undefined ? data.where : 1}`,
                    (err, res) => {
                        if (err) {
                            logger.error(err.message);
                            return reject(err);
                        }
                        return resolve(res);
                    });
            }
        })
    }
    static deleleAll(data) {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM ${data.table} WHERE 1`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static TrunCate(data) {
        return new Promise((resolve, reject) => {
            db.query(`TRUNCATE TABLE ${data.table}`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        })
    }
    static HasMany(data) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT *FROM ${data.table}  JOIN ${data.table1} ON ${data.withId != undefined && data.withId != null ? data.withId : data.table + '.id'} = ${data.table1}.${data.id} WHERE ${data.where != undefined ? data.where : 1}`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static BelongsTo(data) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT *FROM ${data.table} RIGHT JOIN ${data.table1}  ON ${data.withId != undefined && data.withId != null ? data.withId : data.table + '.id'} = ${data.table1}.${data.id} WHERE ${data.where != undefined ? data.where : 1}`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static HasOne(data) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT *FROM ${data.table}  LEFT JOIN ${data.table1} ON ${data.withId != undefined && data.withId != null ? data.withId : data.table + '.id'} = ${data.table1}.${data.id} WHERE ${data.where != undefined ? data.where : 1}`,
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    // helper with promises end
}
module.exports = helperQuery;