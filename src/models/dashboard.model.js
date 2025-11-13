const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class dashboard {
    // TODO::RK
    static heartchartOld({ member_id, type, filterdata, filtertype }) {
        return new Promise((resolve, reject) => {
            if (type == "weekly" && filtertype != "" && filtertype != null) {
                console.log("-------------- 1");

                var query = `SELECT DATE_FORMAT(max_date, '%Y-%m-%d') as createdate,
                DAYNAME(a.createdate) as DayName,
                a.${filtertype}
                FROM users_hwbmi_details a 
                inner join 
                (SELECT DATE_FORMAT(createdate,'%y-%m-%d') as bdate,MAX(createdate) as max_date,${filtertype},createdate as createdates
                FROM users_hwbmi_details
                WHERE member_id = '${member_id}' AND ${filtertype} IS NOT NULL 
                AND date(createdate) > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND YEAR(createdate) = YEAR(CURDATE()) 
                GROUP BY DATE_FORMAT(createdate,'%y-%m-%d')
                ) b
                on DATE_FORMAT(a.createdate,'%y-%m-%d') = bdate and b.max_date = createdate and a.${filtertype} IS NOT NULL and b.${filtertype} IS NOT NULL
                GROUP BY DAYNAME(b.createdates) 
                ORDER BY max_date DESC`;
                var arr = [filterdata, member_id, filtertype];
                /*db.query(query, arr,
                            (err, res) => {
                                if (err) {
                                    logger.error(err.message);
                                    return reject(err);
                                }
                                if (res) {
        
                                    const dataD = [];
                                    const data = [];
                                    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                    for (let i of dayNames) {
                                        const JStringData = `{"DayName": "${i}","${filtertype}": ${null},"createdate": ${null}}`;
                                        data.push(JSON.parse(JStringData));
        
                                    }
                                    for (let j of data) {
                                        for (let d of res) {
        
                                            if (j.DayName == d['DayName']) {
                                                j['createdate']=d.createdate;
                                                j['DayName']=d.DayName;
                                                const key = Object.keys(d).pop()
                                                console.log(key);
                                                j[key]=d[key];
                                            }
                                        }
                                    }
                                    return resolve(data);
                                }
                            }
                        );
                        return;*/
            } else if (type == "monthly" && filtertype != "" && filtertype != null) {
                console.log("-------------- 2");

                var query = `SELECT DATE_FORMAT(max_date, '%Y-%m-%d') as createdate,
                MONTHNAME(a.createdate) as MonthName,
                a.${filtertype}
                FROM users_hwbmi_details a 
                inner join 
                (SELECT DATE_FORMAT(createdate,'%y-%m-%d') as bdate,MAX(createdate) as max_date,${filtertype}
                FROM users_hwbmi_details
                WHERE member_id = '${member_id}' AND ${filtertype} IS NOT NULL AND MONTH(createdate) = MONTH(NOW())
                GROUP BY DATE_FORMAT(createdate,'%y-%m-%d')) b
                on DATE_FORMAT(a.createdate,'%y-%m-%d') = bdate and b.max_date = createdate and a.${filtertype} IS NOT NULL and b.${filtertype} IS NOT NULL

                ORDER BY max_date DESC`;

                var arr = [filterdata, member_id, filtertype];
            } else if (
                type != "" &&
                type != null &&
                (filterdata == "" || filterdata == null || filterdata == undefined)
            ) {
                console.log("-------------- 3");

                var query = `SELECT DATE_FORMAT(max_date, '%Y-%m-%d') as createdate,
                MONTHNAME(a.createdate) as MonthName,
                a.${filtertype}
                FROM users_hwbmi_details a 
                inner join 
                (SELECT DATE_FORMAT(createdate,'%y-%m-%d') as bdate,MAX(createdate) as max_date,${filtertype}
                FROM users_hwbmi_details
                WHERE member_id = '${member_id}' AND ${filtertype} IS NOT NULL AND MONTHNAME(createdate)='${type}' 
                AND DATE_FORMAT(createdate,'%y-%m-%d') <= DATE_FORMAT(CURDATE(),'%y-%m-%d') 
                AND DATE_FORMAT(createdate,'%y-%m-%d') >=DATE_SUB(DATE_FORMAT(CURDATE(),'%y-%m-%d'),INTERVAL 1 YEAR)
                GROUP BY DATE_FORMAT(createdate,'%y-%m-%d')) b
                on DATE_FORMAT(a.createdate,'%y-%m-%d') = bdate and b.max_date = createdate and a.${filtertype} IS NOT NULL and b.${filtertype} IS NOT NULL
                WHERE YEAR(max_date) = YEAR(CURDATE())
                GROUP BY DATE_FORMAT(max_date,'%y-%m-%d')
                ORDER BY max_date DESC`;

                var arr = [filterdata, member_id, filtertype];
            } else {
                console.log("-------------- 4");

                var query = `SELECT DATE_FORMAT(max_date, '%Y-%m-%d') as createdate,
                MONTHNAME(a.createdate) as MonthName,
                a.${filtertype}
                
                FROM users_hwbmi_details a 
                inner join 
                (SELECT DATE_FORMAT(createdate,'%y-%m-%d') as bdate,MAX(createdate) as max_date,${filtertype},createdate as createdates
                FROM users_hwbmi_details
                WHERE member_id = '${member_id}' AND ${filtertype} IS NOT NULL
                AND DATE_FORMAT(createdate,'%y-%m-%d') <= DATE_FORMAT(CURDATE(),'%y-%m-%d') 
                AND DATE_FORMAT(createdate,'%y-%m-%d') >=DATE_SUB(DATE_FORMAT(CURDATE(),'%y-%m-%d'),INTERVAL 1 YEAR)
                
                GROUP BY MONTH(createdate)
                
                ) b
                on b.max_date = createdate and a.${filtertype} IS NOT NULL and b.${filtertype} IS NOT NULL
                WHERE YEAR(max_date) = YEAR(CURDATE())
                GROUP BY MONTHNAME(max_date)
                ORDER BY max_date DESC`;
                var arr = [filterdata, member_id, filtertype];
            }
            db.query(query, arr, (err, res) => {
                console.log(query);
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static heartchart({ member_id, type, filterdata, filtertype }) {
        return new Promise((resolve, reject) => {
            let query = "";
            const arr = [filterdata, member_id, filtertype];

            if (type === "weekly" && filtertype) {
                console.log("-------------- 1");

                query = `
                            SELECT 
                            DATE_FORMAT(MAX(b.max_date), '%Y-%m-%d') AS createdate,
                            DAYNAME(a.createdate) AS DayName,
                            MAX(a.${filtertype}) AS ${filtertype}
                            FROM users_hwbmi_details a
                            INNER JOIN (
                            SELECT 
                                DATE_FORMAT(createdate, '%y-%m-%d') AS bdate,
                                MAX(createdate) AS max_date
                            FROM users_hwbmi_details
                            WHERE member_id = '${member_id}'
                                AND ${filtertype} IS NOT NULL
                                AND DATE(createdate) > DATE_SUB(NOW(), INTERVAL 1 WEEK)
                                AND YEAR(createdate) = YEAR(CURDATE())
                            GROUP BY DATE_FORMAT(createdate, '%y-%m-%d')
                            ) b 
                            ON DATE_FORMAT(a.createdate, '%y-%m-%d') = b.bdate 
                            AND b.max_date = a.createdate
                            WHERE a.${filtertype} IS NOT NULL
                            GROUP BY DAYNAME(a.createdate)
                            ORDER BY MAX(b.max_date) DESC;
                        `;
            } else if (type === "monthly" && filtertype) {
                console.log("-------------- 2");

                query = `
                            SELECT 
                            DATE_FORMAT(MAX(b.max_date), '%Y-%m-%d') AS createdate,
                            MONTHNAME(a.createdate) AS MonthName,
                            MAX(a.${filtertype}) AS ${filtertype}
                            FROM users_hwbmi_details a
                            INNER JOIN (
                            SELECT 
                                DATE_FORMAT(createdate, '%y-%m-%d') AS bdate,
                                MAX(createdate) AS max_date
                            FROM users_hwbmi_details
                            WHERE member_id = '${member_id}'
                                AND ${filtertype} IS NOT NULL
                                AND MONTH(createdate) = MONTH(NOW())
                            GROUP BY DATE_FORMAT(createdate, '%y-%m-%d')
                            ) b
                            ON DATE_FORMAT(a.createdate, '%y-%m-%d') = b.bdate 
                            AND b.max_date = a.createdate
                            WHERE a.${filtertype} IS NOT NULL
                            GROUP BY MONTHNAME(a.createdate)
                            ORDER BY MAX(b.max_date) DESC;
                        `;
            } else if (type && (!filterdata || filterdata === undefined)) {
                console.log("-------------- 3");

                query = `
                            SELECT 
                            DATE_FORMAT(MAX(b.max_date), '%Y-%m-%d') AS createdate,
                            ANY_VALUE(MONTHNAME(a.createdate)) AS MonthName,
                            MAX(a.${filtertype}) AS ${filtertype}
                            FROM users_hwbmi_details a
                            INNER JOIN (
                            SELECT 
                                DATE_FORMAT(createdate, '%y-%m-%d') AS bdate,
                                MAX(createdate) AS max_date
                            FROM users_hwbmi_details
                            WHERE member_id = '${member_id}'
                                AND ${filtertype} IS NOT NULL
                                AND MONTHNAME(createdate) = '${type}'
                                AND DATE_FORMAT(createdate, '%y-%m-%d') <= DATE_FORMAT(CURDATE(), '%y-%m-%d')
                                AND DATE_FORMAT(createdate, '%y-%m-%d') >= DATE_SUB(DATE_FORMAT(CURDATE(), '%y-%m-%d'), INTERVAL 1 YEAR)
                            GROUP BY DATE_FORMAT(createdate, '%y-%m-%d')
                            ) b 
                            ON DATE_FORMAT(a.createdate, '%y-%m-%d') = b.bdate 
                            AND b.max_date = a.createdate
                            WHERE YEAR(b.max_date) = YEAR(CURDATE())
                            GROUP BY DATE_FORMAT(b.max_date, '%y-%m-%d')
                            ORDER BY MAX(b.max_date) DESC;
                        `;
            } else {
                console.log("-------------- 4");

                query = `
                            SELECT
                            DATE_FORMAT(MAX(b.max_date), '%Y-%m-%d') AS createdate,
                            ANY_VALUE(MONTHNAME(a.createdate)) AS MonthName,
                            MAX(a.${filtertype}) AS ${filtertype}
                            FROM users_hwbmi_details a
                            INNER JOIN (
                            SELECT
                                MONTH(createdate) AS monthnum,
                                MAX(createdate) AS max_date
                            FROM users_hwbmi_details
                            WHERE member_id = '${member_id}'
                                AND ${filtertype} IS NOT NULL
                                AND DATE_FORMAT(createdate, '%y-%m-%d') <= DATE_FORMAT(CURDATE(), '%y-%m-%d')
                                AND DATE_FORMAT(createdate, '%y-%m-%d') >= DATE_SUB(DATE_FORMAT(CURDATE(), '%y-%m-%d'), INTERVAL 1 YEAR)
                            GROUP BY MONTH(createdate)
                            ) b
                            ON MONTH(a.createdate) = b.monthnum
                            AND b.max_date = a.createdate
                            WHERE YEAR(b.max_date) = YEAR(CURDATE())
                            GROUP BY MONTHNAME(b.max_date)
                            ORDER BY MAX(b.max_date) DESC;
                        `;
            }

            db.query(query, arr, (err, res) => {
                console.log(query);
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    // TODO::RK
    static cartdDataCountOld(role_id, cb) {
        if (role_id == 2) {
            var que = `SELECT Date,DayName,current_total,SUM(current_total) OVER (ORDER BY CurrentDate) rtotal,
            (select count(*) as total from users where created_at < date_sub(curdate(),INTERVAL 7 day) AND role_id = '${role_id}') as total,
            (select count(*) as total from users where role_id='${role_id}' ) gtotal,
            count(current_total) OVER (ORDER BY CurrentDate) sno
            FROM ( SELECT DATE_FORMAT(created_at,"%d-%m-%y") AS CurrentDate, COUNT(DATE_FORMAT(created_at,"%d-%m-%y")) AS current_total, created_at AS Date, DAYNAME(created_at) AS DayName 
                 FROM users 
                 WHERE DATE(created_at) > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND role_id = '${role_id}' AND status='Active' 
                 GROUP BY DATE_FORMAT(created_at,"%d-%m-%y") )r`;
        } else {
            var que = `SELECT Date,DayName,current_total,SUM(current_total) OVER (ORDER BY CurrentDate) rtotal,
            (select count(*) as total from users where created_at < date_sub(curdate(),INTERVAL 7 day) AND role_id = '${role_id}') as total,
            (select count(*) as total from users where role_id='${role_id}' ) gtotal,
            count(current_total) OVER (ORDER BY CurrentDate) sno
            FROM ( SELECT DATE_FORMAT(created_at,"%d-%m-%y") AS CurrentDate, COUNT(DATE_FORMAT(created_at,"%d-%m-%y")) AS current_total, created_at AS Date, DAYNAME(created_at) AS DayName 
                 FROM users 
                 WHERE DATE(created_at) > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND role_id = '${role_id}' AND status='Active' AND approve_status ='Approve' 
                 GROUP BY DATE_FORMAT(created_at,"%d-%m-%y") )r`;
        }

        db.query(que, [role_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const day_name = item.DayName;
                const date = item.Date;
                const current_total = item.current_total;
                const tt = item.total;
                const sno = item.sno;
                if (item.sno == 1) {
                    var runing_total = current_total + item.total;
                } else {
                    var runing_total = current_total + runing_total;
                }
                const before_week_total = item.total;
                const grandtotal = item.gtotal;

                response.push({
                    sno,
                    day_name,
                    date,
                    current_total,
                    runing_total,
                    before_week_total,
                    grandtotal,
                });
            }
            var lengths = response.length;
            if (lengths > 0 && lengths != null && response != null) {
                cb(null, response);
            } else {
                if (role_id == 2) {
                    var que = `SELECT count(*) as total FROM users WHERE role_id='${role_id}' AND status='Active'`;
                } else {
                    var que = `SELECT count(*) as total FROM users WHERE role_id='${role_id}' AND status='Active' AND approve_status ='Approve'`;
                }
                db.query(que, [role_id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    for (const item of res) {
                        const day_name = "";
                        const date = "";
                        const current_total = "";
                        const tt = "";
                        const sno = "";

                        const runing_total = item.total;

                        const before_week_total = "";
                        const grandtotal = "";

                        response.push({
                            sno,
                            day_name,
                            date,
                            current_total,
                            runing_total,
                            before_week_total,
                            grandtotal,
                        });
                    }
                    cb(null, response);
                });
            }
        });
    }
    static cartdDataCount(role_id, cb) {
        let baseCondition = "role_id = ? AND status = 'Active'";
        if (role_id != 2) baseCondition += " AND approve_status = 'Approve'";

        const que = `
        SELECT 
            d.CurrentDate,
            d.DayName,
            d.current_total,
            SUM(d.current_total) OVER (ORDER BY d.sort_date) AS rtotal,
            (
                SELECT COUNT(*) 
                FROM users 
                WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                AND ${baseCondition}
            ) AS before_week_total,
            (
                SELECT COUNT(*) 
                FROM users 
                WHERE ${baseCondition}
            ) AS grand_total,
            ROW_NUMBER() OVER (ORDER BY d.sort_date) AS sno
        FROM (
            SELECT 
                sort_date,
                DATE_FORMAT(sort_date, '%d-%m-%Y') AS CurrentDate,
                DAYNAME(sort_date) AS DayName,
                COUNT(*) AS current_total
            FROM (
                SELECT DATE(created_at) AS sort_date
                FROM users
                WHERE DATE(created_at) > DATE_SUB(NOW(), INTERVAL 1 WEEK)
                AND MONTH(created_at) = MONTH(CURDATE())
                AND YEAR(created_at) = YEAR(CURDATE())
                AND ${baseCondition}
            ) AS sub
            GROUP BY sort_date
            ORDER BY sort_date
        ) AS d
        ORDER BY d.sort_date;
    `;

        db.query(que, [role_id, role_id, role_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                return cb(err, null);
            }

            if (res && res.length > 0) {
                const response = res.map((item) => ({
                    sno: item.sno,
                    day_name: item.DayName,
                    date: item.CurrentDate,
                    current_total: item.current_total,
                    runing_total: item.rtotal,
                    before_week_total: item.before_week_total,
                    grandtotal: item.grand_total,
                }));
                return cb(null, response);
            }

            // Fallback if no results
            const totalQuery = `
            SELECT COUNT(*) AS total 
            FROM users 
            WHERE ${baseCondition};
        `;
            db.query(totalQuery, [role_id], (err, totalRes) => {
                if (err) {
                    logger.error(err.message);
                    return cb(err, null);
                }

                const total = totalRes[0]?.total || 0;
                const response = [
                    {
                        sno: "",
                        day_name: "",
                        date: "",
                        current_total: "",
                        runing_total: total,
                        before_week_total: "",
                        grandtotal: total,
                    },
                ];

                cb(null, response);
            });
        });
    }

    static dashboardDayMonthYearCount(lab_id, cb) {
        db.query(
            `SELECT 
        ( select COUNT(*) from new_visit 
             where lab_id = '${lab_id}' and DATE(DATE_FORMAT(updated_at,'%y-%m-%d')) = DATE(DATE_FORMAT(NOW(),'%y-%m-%d')) 
             ) as ToDay,
        
        ( select COUNT(*) from new_visit 
             WHERE lab_id = '${lab_id}' and DATE_FORMAT(updated_at,'%y-%m-%d') > DATE_SUB(NOW(), INTERVAL 2 MONTH) 
             AND MONTH(updated_at) = MONTH(CURDATE()) 
             AND YEAR(updated_at) = YEAR(CURDATE()) 
        ) as ToMonth,
        
        (select count(YEAR(updated_at)) from new_visit WHERE lab_id = '${lab_id}' 
        AND DATE_FORMAT(updated_at,'%y-%m-%d') > DATE_SUB(CURDATE(), INTERVAL 1 YEAR) 
        AND MONTH(updated_at) = MONTH(CURDATE()) 
        AND YEAR(updated_at) = YEAR(CURDATE())) as ToYear`,
            [lab_id],
            (err, res) => {
                if (err) {
                    logger.err.message;
                    cb(err, null);
                    return;
                }
                cb(null, res);
            }
        );
    }

    static dashboarChart(lab_id, type, cb) {
        if (type == "Today") {
            db.query(
                `select COUNT(*) as todayCount from new_visit 
     where lab_id = '${lab_id}' and DATE(DATE_FORMAT(updated_at,'%y-%m-%d')) = DATE(DATE_FORMAT(NOW(),'%y-%m-%d')) 
     `,
                [lab_id],
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, res);
                }
            );
        } else if (type == "Monthly") {
            db.query(
                `SELECT DAYNAME(Month_Date) as Day_name,Month_Date,total,updated_at from ( 
                select DATE_FORMAT(updated_at,'%y-%m-%d') as Month_Date,updated_at as updated_at, count(updated_at) as total 
                from new_visit WHERE lab_id = '${lab_id}' and DATE_FORMAT(updated_at,'%y-%m-%d') > DATE_SUB(NOW(), INTERVAL 1 MONTH) 
                AND YEAR(updated_at) = YEAR(CURDATE()) 
                GROUP BY DATE_FORMAT(updated_at,'%y-%m-%d') )r
            `,
                [lab_id],
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, res);
                }
            );
        } else {
            db.query(
                `SELECT Month,monthName,total from 
        ( select DATE_FORMAT(updated_at,'%y-%m-%d') as Month, MONTHNAME(updated_at) as monthName,count(updated_at) as total from new_visit 
             WHERE lab_id = '${lab_id}' and YEAR(updated_at) = YEAR(CURDATE()) 
             GROUP BY MONTH(updated_at)
             )r`,
                [lab_id],
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, res);
                }
            );
        }
    }
    static appointmentGraph() {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT Date,DayName,current_total,SUM(current_total) OVER (ORDER BY CurrentDate) rtotal,
            (select count(*) as total from appointments where created_at < date_sub(curdate(),INTERVAL 7 day)) as total,
            (select count(*) as total from appointments ) gtotal,
            count(current_total) OVER (ORDER BY CurrentDate) sno
            FROM ( SELECT DATE_FORMAT(created_at,"%d-%m-%y") AS CurrentDate, COUNT(DATE_FORMAT(created_at,"%d-%m-%y")) AS current_total, created_at AS Date, DAYNAME(created_at) AS DayName 
                 FROM appointments 
                 WHERE DATE(created_at) > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
                 GROUP BY DATE_FORMAT(created_at,"%d-%m-%y") )r;`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                }
            );
        });
    }

    // TODO::RK
    static clinicCardOld(clinic_id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT
            (SELECT count(*) FROM users as u INNER JOIN users_patient as up on u.id = up.patient_id WHERE up.user_id = '${clinic_id}' AND DATE_FORMAT(up.created_at,"%y-%m-%d") = DATE_FORMAT(NOW(),"%y-%m-%d")) as todays_patient,
            (SELECT count(*) FROM users as u INNER JOIN users_patient as up on u.id = up.patient_id WHERE up.user_id = '${clinic_id}') as total_patient,
            (SELECT COUNT(*) FROM appointments WHERE clinic_id='${clinic_id}' AND payment_status='Success') as total_apppintment,
            (SELECT COUNT(*) FROM appointments WHERE clinic_id='${clinic_id}' AND status='Completed') as completed_apppintment,
            (SELECT COUNT(*) FROM appointments WHERE clinic_id='${clinic_id}' AND DATE_FORMAT(created_at,"%y-%m-%d")=DATE_FORMAT(NOW(),"%y-%m-%d") AND payment_status='Success') as todays_apppintment`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                }
            );
        });
    }
    static clinicCard(clinic_id) {
        return new Promise((resolve, reject) => {
            const query = `
                            SELECT
                                (SELECT COUNT(*) 
                                FROM users AS u 
                                INNER JOIN users_patient AS up ON u.id = up.patient_id 
                                WHERE up.user_id = ? 
                                AND DATE_FORMAT(up.created_at, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d')
                                ) AS todays_patient,

                                (SELECT COUNT(*) 
                                FROM users AS u 
                                INNER JOIN users_patient AS up ON u.id = up.patient_id 
                                WHERE up.user_id = ?
                                ) AS total_patient,

                                (SELECT COUNT(*) 
                                FROM appointments 
                                WHERE clinic_id = ? 
                                AND payment_status = 'Success'
                                ) AS total_appointment,

                                (SELECT COUNT(*) 
                                FROM appointments 
                                WHERE clinic_id = ? 
                                AND status = 'Completed'
                                ) AS completed_appointment,

                                (SELECT COUNT(*) 
                                FROM appointments 
                                WHERE clinic_id = ? 
                                AND DATE_FORMAT(created_at, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d') 
                                AND payment_status = 'Success'
                                ) AS todays_appointment
                            `;

            db.query(
                query,
                [clinic_id, clinic_id, clinic_id, clinic_id, clinic_id],
                (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                }
            );
        });
    }

    // TODO::RK
    // static doctorCard(doctor_id) {
    //     return new Promise((resolve, reject) => {
    //         db.query(`SELECT
    //         (SELECT COUNT(DISTINCT(patient_id)) FROM appointments WHERE doctor_id='${doctor_id}' AND DATE_FORMAT(created_at,"%y-%m-%d")=DATE_FORMAT(NOW(),"%y-%m-%d") AND patient_id IS NOT NULL) as todays_patient,
    //         (SELECT COUNT(DISTINCT(patient_id)) FROM appointments WHERE doctor_id='${doctor_id}' AND patient_id IS NOT NULL ) as total_patient,
    //         (SELECT COUNT(*) FROM appointments WHERE doctor_id='${doctor_id}' AND (status ='Reschedule' OR status ='Approved' OR status='Completed') ) as total_apppintment,
    //         (SELECT COUNT(*) FROM appointments WHERE doctor_id='${doctor_id}' AND status='Completed') as completed_apppintment,
    //         (SELECT COUNT(*) FROM appointments WHERE doctor_id='${doctor_id}' AND DATE_FORMAT(created_at,"%y-%m-%d")=DATE_FORMAT(NOW(),"%y-%m-%d") AND (status ='Reschedule' OR status ='Approved' OR status='Completed')) as todays_apppintment`, (err, res) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             return resolve(res);
    //         });
    //     });
    // }
    static doctorCard(doctor_id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT
            (SELECT COUNT(DISTINCT(patient_id)) FROM appointments 
                WHERE doctor_id='${doctor_id}' 
                AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(NOW(),'%Y-%m-%d') 
                AND patient_id IS NOT NULL) AS todays_patient,

            (SELECT COUNT(DISTINCT(patient_id)) FROM appointments 
                WHERE doctor_id='${doctor_id}' 
                AND patient_id IS NOT NULL) AS total_patient,

            (SELECT COUNT(*) FROM appointments 
                WHERE doctor_id='${doctor_id}' 
                AND (status='Reschedule' OR status='Approved' OR status='Completed')) AS total_apppintment,

            (SELECT COUNT(*) FROM appointments 
                WHERE doctor_id='${doctor_id}' 
                AND status='Completed') AS completed_apppintment,

            (SELECT COUNT(*) FROM appointments 
                WHERE doctor_id='${doctor_id}' 
                AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(NOW(),'%Y-%m-%d') 
                AND (status='Reschedule' OR status='Approved' OR status='Completed')) AS todays_apppintment
        `,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                }
            );
        });
    }
}
module.exports = dashboard;
