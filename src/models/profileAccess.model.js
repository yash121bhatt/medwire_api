const db = require("../config/db.config");
class profileAccess {
    constructor(req, filtertype, requestId) {
        this.filtertype = filtertype;
        this.member_id = member_id;
        this.requestId = requestId;
        console.log("hello");
    }

    static healthResult({ filtertype, menberId }) {
        return new Promise((reject, resolve) => {
            var query = `SELECT ${filtertype},createdate
                    FROM users_hwbmi_details WHERE ${filtertype} IS NOT NULL AND member_id = '${menberId}' ORDER BY createdate DESC`;
            db.query(query, (res, err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static documentAccess({ filtertype, menberId }) {
        return new Promise((reject, resolve) => {
            var query = `SELECT * FROM users_documents WHERE  member_id = '${menberId}' AND type='${filtertype}' ORDER BY document_date DESC`;
            db.query(query, (res, err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static viewProfileAccess({ requestId }) {
        return new Promise((reject, resolve) => {
            var query = `UPDATE profile_access SET view_start_time=NOW() WHERE id='${requestId}' AND view_start_time IS NULL`;
            db.query(query, (res, err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static ProfileAccessShow({ requestId, subDate }) {
        return new Promise((resolve, reject) => {
            var queryMain = `SELECT * FROM profile_access WHERE id='${requestId}' AND view_start_time IS NULL`;
            var query = `SELECT * FROM profile_access WHERE id='${requestId}' AND view_start_time > DATE_SUB(NOW(), INTERVAL ${subDate}) `;
            db.query(queryMain, (err, data) => {
                if (err) {
                    return reject(err);
                }
                if (data.length > 0) {
                    return resolve(data[0]);
                }
                db.query(query, (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res.length > 0) {
                        return resolve(res[0]);
                    }
                    return resolve({});

                });
            });

        });
    }

    static createProfileAcess({ patient_id, member_id, doctor_id }) {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO profile_access(patient_id,member_id,doctor_id) VALUES('${patient_id}','${member_id}','${doctor_id}')`
                , (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static updateProfileAcess({ requestId }) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE profile_access SET resend_status='completed', status='Pending' WHERE id='${requestId}'`
                , (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static profileAccessDetail(requestId) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM profile_access WHERE id='${requestId}' AND status ='Accept'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res.length > 0) {
                        const result = res[0];
                        const interval = result.time_interval.split(" ");

                        let subDate;
                        if (interval[1] == "Seconds" || interval[1] == "Second") {
                            subDate = interval[0] + " SECOND";
                        }
                        if (interval[1] == "Minutes" || interval[1] == "Minute") {
                            subDate = interval[0] + " MINUTE";
                        }
                        if (interval[1] == "Hours" || interval[1] == "Hour") {
                            subDate = interval[0] + " HOUR";
                        }
                        if (interval[1] == "Days" || interval[1] == "Day") {
                            subDate = interval[0] + " DAY";
                        }
                        if (interval[1] == "Weeks" || interval[1] == "Week") {
                            subDate = interval[0] + " WEEK";
                        }
                        if (interval[1] == "Years" || interval[1] == "Year") {
                            subDate = interval[0] + " YEAR";
                        }
                        if (interval[1] == "Months" || interval[1] == "Month") {
                            subDate = interval[0] + " MONTH";
                        }

                        var query = `SELECT * FROM profile_access WHERE id='${requestId}' AND view_start_time > DATE_SUB(NOW(), INTERVAL ${subDate}) AND status ='Accept'`;
                        db.query(query,
                            (err, res) => {
                                if (err) {
                                    return reject(err);
                                }
                                if (res.length > 0) {
                                    return resolve(res[0]);
                                }
                                return resolve({});
                            });
                    } else {
                        return resolve({});
                    }
                });
        });
    }
}
module.exports = profileAccess;