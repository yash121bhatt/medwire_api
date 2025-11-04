const { async } = require("q");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const Notification = require("../models/stytemNotification.model");
const helperQuery = require("../helper/helperQuery");
const moment = require("moment");
const helperFunction = require("../helper/helperFunction");

class Laboratory {
    static labRadioCountPatientDetail(user_id, much_type) {
        return new Promise((resolve, reject) => {
            if (much_type == "today") {
                var query = "SELECT COUNT(up.created_at) AS today_patients FROM users as u left join users_patient as up on u.id = up.patient_id WHERE up.user_id = '" + user_id + "' AND DATE_FORMAT(up.created_at,'%Y-%m-%d') =  DATE_FORMAT(curdate(),'%Y-%m-%d')";
            }
            else {
                var query = "SELECT COUNT(up.created_at) AS total_patients FROM users as u left join users_patient as up on u.id = up.patient_id WHERE up.user_id = '" + user_id + "'";
            }

            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }


    static labRadioCountAppointmentDetail(user_id, much_type) {
        return new Promise((resolve, reject) => {
            // if(much_type=='today'){
            //     var query = `SELECT COUNT(ap.appointment_date) AS today_appiontments 
            //     FROM appointments ap  
            //     INNER JOIN user_carts uc on ap.id=uc.appointment_id  
            //     LEFT JOIN users l on uc.user_id=l.id  
            //     LEFT JOIN user_doctors u on ap.refer_by_id=u.id   
            //     LEFT JOIN doctors_clinic dc ON dc.id=u.user_id   
            //     LEFT JOIN users d on d.id=dc.doctor_id  
            //     LEFT JOIN users p on p.id=ap.created_by_id 
            //     WHERE l.id='${user_id}' 
            //     AND DATE_FORMAT(ap.created_at,'%Y-%m-%d') =  DATE_FORMAT(curdate(),'%Y-%m-%d') 
            //     AND ap.payment_status='Success' `;
            // }
            // else{
            //     var query = `SELECT COUNT(ap.appointment_date) AS total_appiontments 
            //     FROM appointments ap  
            //     INNER JOIN user_carts uc on ap.id=uc.appointment_id  
            //     LEFT JOIN users l on uc.user_id=l.id  
            //     LEFT JOIN user_doctors u on ap.refer_by_id=u.id   
            //     LEFT JOIN doctors_clinic dc ON dc.id=u.user_id   
            //     LEFT JOIN users d on d.id=dc.doctor_id  
            //     LEFT JOIN users p on p.id=ap.created_by_id 
            //     WHERE l.id='${user_id}' AND  AND ap.payment_status='Success'  `;
            // }
            if (much_type == "today") {
                var query = `SELECT COUNT(appointment_date) AS today_appiontments 
                FROM appointments
                WHERE user_id='${user_id}' 
                AND DATE_FORMAT(created_at,'%Y-%m-%d') =  DATE_FORMAT(curdate(),'%Y-%m-%d') 
                AND payment_status='Success' `;
            }
            else {
                var query = `SELECT COUNT(appointment_date) AS total_appiontments 
                FROM appointments
                WHERE user_id='${user_id}' 
                AND payment_status='Success'`;
            }
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[0]);
            });
        });
    }
    static memberfindByMobileWithRole({ mobile, role_id }, cb) {
        if (role_id != undefined || role_id != null) {
            var query = `SELECT * FROM users WHERE mobile = '${mobile}' AND role_id='${role_id}' ORDER BY id DESC `;
            var arr = [mobile, role_id];
        } else {
            var query = `SELECT * FROM users WHERE mobile = '${mobile}' ORDER BY id DESC `;
            var arr = [mobile];
        }
        db.query(query, arr, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res.length > 0) {
                const item = res[0];
                const id = item.id;
                const role_id = item.role_id;
                const email = item.email;
                const imgName = item.profile_image;
                const img = process.env.APP_URL + "member/" + imgName;
                const first_name = item.first_name;
                const last_name = item.last_name;
                const mobile = item.mobile;
                const adhar_card = item.adhar_card;
                const date_of_birth = item.date_of_birth;
                const gender = item.gender;
                const response = { id, role_id, email, first_name, last_name, mobile, adhar_card, date_of_birth, gender, img, imgName };
                cb(null, response);
                return;
            }
            cb(null, {});
            return;
        });
    }
    static memberfindByMobile(mobile, cb) {
        db.query(`SELECT * FROM users WHERE mobile = '${mobile}'   AND role_id=2 ORDER BY id DESC`,
            [
                mobile
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                // console.log(res);
                const response = [];
                for (const item of res) {
                    const id = item.id;
                    const imgName = item.profile_image;
                    const img = process.env.APP_URL + "/member/" + imgName;
                    const first_name = item.first_name;
                    const last_name = item.last_name;
                    const mobile = item.mobile;
                    const adhar_card = item.adhar_card;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const created_by_id = item.created_by_id ?? null;
                    response.push({ id, first_name, last_name, mobile, adhar_card, date_of_birth, gender, img, imgName, created_by_id });
                }
                //console.log(response[0]);
                cb(null, response[0]);
            });

    }
    static memberfindById(id, cb) {
        db.query(`SELECT * FROM users WHERE created_by_id = '${id}' ORDER BY id DESC `,
            [
                id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const response = [];
                for (const item of res) {
                    const id = item.id;
                    const imgName = item.profile_image;
                    const img = process.env.APP_URL + "/member/" + imgName;
                    const first_name = item.first_name;
                    const last_name = item.last_name;
                    const mobile = item.mobile;
                    const adhar_card = item.adhar_card;
                    const date_of_birth = item.date_of_birth;
                    const gender = item.gender;
                    const created_by_id = item.created_by_id ?? null;
                    response.push({ id, first_name, last_name, mobile, adhar_card, date_of_birth, gender, img, imgName, created_by_id });
                }
                cb(null, response);
            });
    }
    static newVisit(mobile, lab_id, member_id, category, sub_category, cb) {
        db.query("INSERT INTO new_visit(mobile,lab_id,member_id,category,sub_category,created_at) VALUES(?,?,?,?,?,NOW())",
            [
                mobile, lab_id, member_id, category, sub_category
            ], async (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res) {
                    try {
                        var queryUPDF = "insert into `users_documents` set `user_id`= '" + member_id + "',`member_id`= '" + member_id + "',`visite_id`= '" + res.insertId + "',`document_date`=NOW()";
                        await helperQuery.All(queryUPDF);
                        cb(null, {
                            id: res.insertId,
                            mobile: mobile,
                            member_id: member_id,
                            category: category,
                            sub_category: sub_category
                        });
                    } catch (error) {

                    }

                }
            });
    }
    static visitList(lab_id, cb) {
        db.query(`SELECT u1.id as member_id,new_visit.mobile,u1.created_by_id,category,sub_category,u1.first_name as username,new_visit.created_at as visit_created_at,new_visit.id as visit_id, new_visit.lab_id as lab_id,new_visit.dcm_document ,new_visit.report_document as report_document FROM  new_visit LEFT JOIN users u1 ON new_visit.member_id = u1.id 
        WHERE lab_id = '${lab_id}' AND (online_ofline_status='0' OR online_ofline_status IS NULL )  ORDER BY visit_id DESC`,
            [
                lab_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res) {
                    const data = [];
                    res.map((item) => {
                        data.push({
                            category: item.category,
                            created_by_id: item.created_by_id,
                            lab_id: item.lab_id,
                            member_id: item.member_id,
                            mobile: item.mobile,
                            report_document: item.report_document,
                            report_document_url: helperFunction.is_file_exist(item.report_document),
                            sub_category: item.sub_category,
                            username: item.username,
                            visit_created_at: item.visit_created_at,
                            visit_id: item.visit_id,
                            dcm_document: item.dcm_document ?? null,
                            dcm_document_url: item.dcm_document != null ? process.env.APP_URL_DCM + "/" + item.dcm_document : null,
                        });
                    });
                    return cb(null, data);
                }

            });
    }
    static visitListFirst(visit_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT u1.id as member_id,new_visit.mobile,u1.created_by_id,category,sub_category,u1.first_name as username,new_visit.created_at as visit_created_at,new_visit.id as visit_id, new_visit.lab_id as lab_id,new_visit.dcm_document ,new_visit.report_document as report_document 
            FROM  new_visit 
            LEFT JOIN users u1 ON new_visit.member_id = u1.id 
            WHERE new_visit = '${visit_id}' ORDER BY visit_id DESC LIMIT 1`,
                [
                    visit_id
                ],
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    if (res) {
                        const data = [];
                        res.map((item) => {
                            data.push({
                                category: item.category,
                                created_by_id: item.created_by_id,
                                lab_id: item.lab_id,
                                member_id: item.member_id,
                                mobile: item.mobile,
                                report_document: item.report_document,
                                report_document_url: helperFunction.is_file_exist(item.report_document),
                                sub_category: item.sub_category,
                                username: item.username,
                                visit_created_at: item.visit_created_at,
                                visit_id: item.visit_id,
                                dcm_document: item.dcm_document ?? null,
                                dcm_document_url: item.dcm_document != null ? process.env.APP_URL_DCM + "/" + item.dcm_document : null,
                            });
                        });
                        return resolve(data[0]);;
                    }

                });
        });
    }

    static uploadReport(visit_id, report_document, type, cb) {

        db.query(`SELECT * FROM new_visit nv inner join users u  on u.id = nv.lab_id WHERE nv.id = '${visit_id}'`, [visit_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            // console.log("user_data=>", res);
            if (res.length > 0) {
                var lab_rad_id = res[0]?.lab_id ?? 0;
                var lab_rad_title = res[0].category;
                var visit_member_id = res[0].member_id;
                var role_id = res[0]?.role_id ?? 0;


                if (role_id == 3) {
                    var plan_for = "laboratories";
                    var report_for = "Laborartory";
                }

                if (role_id == 4) {
                    var plan_for = "radiology";
                    var report_for = "Radiology";
                }
                db.query(`SELECT * FROM plan_purchase_history WHERE user_id = '${lab_rad_id}' and status = 'active' order by id desc LIMIT 1`, (err, pphres) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }

                    if (pphres.length > 0) {
                        var total_limit = pphres[0].total_limit;
                        var plan_id = pphres[0].plan_id;
                        var id = pphres[0].id;
                        if (total_limit > 0) {
                            if (role_id == 4) {
                                var lab_rad_type = 2;
                                var report_type = "radio_report";
                                var queryPDF = `UPDATE new_visit SET report_document = '${report_document}', type = '${lab_rad_type}',updated_at=NOW() WHERE id = '${visit_id}' AND report_document IS NULL`;
                                var queryDCM = `UPDATE new_visit SET dcm_document = '${report_document}', type = '${lab_rad_type}',updated_at=NOW() WHERE id = '${visit_id}' AND dcm_document IS NULL`;
                                var query = type != null && type == 2 ? queryDCM : queryPDF;

                            } else {
                                var lab_rad_type = 1;
                                var report_type = "lab_report";
                                var query = `UPDATE new_visit SET report_document = '${report_document}', type = '${lab_rad_type}',updated_at=NOW() WHERE id = '${visit_id}' AND report_document IS NULL`;
                            }
                            db.query(query,
                                [
                                    visit_id, report_document, type
                                ], async (err, res) => {
                                    if (err) {
                                        logger.error(err.message);
                                        cb(err, null);
                                        return;
                                    }
                                    if (res) {
                                        const updated_visit = await helperQuery.First({ table: "new_visit", where: "id =" + visit_id });
                                        const data = {
                                            message: ",<br> your " + report_for + " report has been uploaded by",
                                            from_user_id: updated_visit.lab_id,
                                            to_user_id: updated_visit.member_id,
                                            by: "lab_radio_upload",
                                            title: "Uploaded Report",
                                            type: "Uploaded Report",
                                            appointment_date: updated_visit.updated_at,
                                            time_slot: moment(updated_visit.updated_at).format(" h:mm A"),
                                        };
                                        await Notification.AddNotification(data);


                                        var member_detail = await helperQuery.Get({ table: "users", where: " id=" + updated_visit.member_id });
                                        var lab_detail = await helperQuery.Get({ table: "users", where: " id=" + updated_visit.lab_id });
                                        if (member_detail) {

                                            var member_name = (member_detail[0].first_name) ? member_detail[0].first_name : "";
                                            var lab_name = (lab_detail[0].first_name) ? lab_detail[0].first_name : "";
                                            var appointment_date = updated_visit.updated_at;
                                            var time_slot = moment(updated_visit.updated_at).format(" h:mm A");

                                            var payload = {
                                                notification: {
                                                    title: "Uploaded Report"
                                                }
                                            };
                                            //    console.log("data",member_detail);
                                            if (lab_detail[0].role_id == 3) {
                                                payload.notification.body = "Hey " + member_name + " \nyour Laboratory report has been uploaded  by " + lab_name;
                                            }
                                            else if (lab_detail[0].role_id == 4) {
                                                payload.notification.body = "Hey " + member_name + " \nyour Radiology report has been uploaded  by " + lab_name;
                                            }
                                            var device_type = null;
                                            var device_token = null;
                                            if (member_detail[0].created_by_id == null || member_detail[0].created_by_id == 0) {
                                                device_type = member_detail[0].device_type;
                                                device_token = member_detail[0].device_token;
                                                console.log("member 1");
                                            } else {
                                                var member_data = await helperQuery.First({ table: "users", where: "id=" + member_detail[0].created_by_id });
                                                device_type = member_data.device_type;
                                                device_token = member_data.device_token;
                                                console.log("member 2");
                                            }
                                            if (device_type == "Android" || device_type == "IOS") {
                                                console.log("push noti send for  upload doc");
                                                await helperFunction.pushNotification(device_token, payload);
                                            }
                                        }

                                        if (role_id == 4) {
                                            var report_type = "radio_report";
                                            var queryUPDF = `UPDATE users_documents SET  type= 'lab_report',lab_radio_type= '2',document_date=NOW(),document_title= '${lab_rad_title}',document_file= '${report_document}' where visite_id='${visit_id}' AND member_id= '${visit_member_id}' AND user_id= '${visit_member_id}'`;
                                            var queryUDCM = `UPDATE users_documents SET  type= 'lab_report',lab_radio_type= '2',document_date=NOW(),document_title= '${lab_rad_title}',dcm_document_file= '${report_document}' where visite_id='${visit_id}' AND member_id= '${visit_member_id}' AND user_id= '${visit_member_id}'`;
                                            var Uquery = type != null && type == 2 ? queryUDCM : queryUPDF;
                                            var is_dcm = type != null && type == 2 ? true : false;

                                        } else {
                                            var report_type = "radio_report";
                                            var Uquery = `UPDATE users_documents SET  type= 'lab_report',lab_radio_type= '1',document_date=NOW(),document_title= '${lab_rad_title}',document_file= '${report_document}' where visite_id='${visit_id}' AND member_id= '${visit_member_id}' AND user_id= '${visit_member_id}'`;
                                            var is_dcm = true;
                                        }

                                        db.query(Uquery, [lab_rad_id, lab_rad_title, report_document], (err, res) => {
                                            if (err) {
                                                logger.error(err.message);
                                                cb(err, null);
                                                return;
                                            }
                                            if (res && is_dcm == true) {
                                                var new_total_limit = total_limit - 1;
                                                if (total_limit == 1) {
                                                    var query = `update plan_purchase_history set total_limit = NULL, status='expire', limit_expired_at=NOW() where user_id = ? and status = 'active' and plan_id='${plan_id}' and id='${id}'`;
                                                    var arr = [lab_rad_id];
                                                } else {
                                                    var query = `update plan_purchase_history set total_limit = ? where user_id = ? and status = 'active' and plan_id='${plan_id}' and id='${id}'`;
                                                    var arr = [new_total_limit, lab_rad_id];
                                                }
                                                db.query(query, arr,
                                                    (err, res) => {
                                                        if (err) {
                                                            logger.error(err.message);
                                                            cb(err, null);
                                                            return;
                                                        }
                                                        if (res) {
                                                            return cb(null, {
                                                                visit_id: visit_id,
                                                                report_document: report_document
                                                            });
                                                        }
                                                    });
                                                // cb(null, res);
                                            } else if (res) {
                                                return cb(null, {
                                                    visit_id: visit_id,
                                                    report_document: report_document
                                                });
                                            }

                                        });


                                    }
                                });
                        }
                        else {
                            cb({ kind: "plan_limit_reached" }, null);
                            return;
                        }
                    } else {
                        cb({ kind: "no_plan_found" }, null);
                        return;
                    }
                });
            } else {
                cb({ kind: "not_found" }, null);
                return;
            }
        });
    }


    static latestTestReport(member_id, cb) {

        console.log(member_id);
        db.query(`SELECT u.id,u.role_id,u.first_name,u.profile_image,nv.created_at,nv.sub_category,nv.category,nv.mobile,nv.report_document,nv.member_id FROM users u JOIN new_visit nv on u.id=nv.member_id where nv.report_document!='null' AND u.id='${member_id}' ORDER BY nv.id DESC LIMIT 6`,
            [member_id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });

    }
    static testReport(member_id, cb) {

        db.query(`SELECT nv.type,u.id,u.role_id,u.first_name,u.profile_image,
        nv.created_at,nv.sub_category,nv.category,nv.mobile,nv.report_document,nv.dcm_document,nv.member_id 
        FROM users u JOIN new_visit nv 
        on u.id=nv.member_id 
        where (nv.report_document!='null' OR nv.dcm_document!='null') 
        AND u.id='${member_id}' 
        ORDER BY nv.id DESC`,
            [member_id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });

    }

    static memberfindByName(name, id, cb) {
        db.query(`SELECT * FROM users WHERE first_name = '${name}' AND created_by_id = '${id}' AND role_id='2'`,
            [
                name, id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const response = [];
                for (const item of res) {
                    const id = item.id;
                    const first_name = item.first_name;
                    response.push({ id, first_name });
                }
                cb(null, response[0]);
            });
    }
    static findVisitId(member_id, lab_id, cb) {
        var query = `SELECT * FROM new_visit WHERE lab_id = '${lab_id}' AND updated_at IS NULL AND report_document IS NULL ORDER BY id DESC LIMIT 1`;

        db.query(query,
            [
                member_id, lab_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const response = [];
                for (const item of res) {
                    const id = item.id;
                    response.push({ id });
                }
                cb(null, response[0]);
            });
    }
}
module.exports = Laboratory;