const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const helperFunction = require("../helper/helperFunction");
const { query } = require("express");


class Admin {
    static findByEmail(email, cb) {
        db.query(`SELECT * FROM super_admin WHERE email = '${email}'`, [email], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }
    static saveLogiToken(auth_token, id) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE super_admin SET auth_token = '${auth_token}' WHERE id='${id}'`,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    // TODO::RK
    static dashboard_count(cb) {
        db.query(`SELECT
        (SELECT COUNT(*) FROM users 
        WHERE role_id=2 AND status='Active' 
        AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_SUB(DATE_FORMAT(NOW(),'%y-%m-%d'),INTERVAL 7 week)   
        AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) as  new_patients,
        (SELECT COUNT(*) FROM users WHERE role_id=2 AND status='Active') as  old_patients,

        (SELECT COUNT(*) FROM users WHERE role_id=3 AND status='Active' AND approve_status ='Approve' 
        AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_SUB(DATE_FORMAT(NOW(),'%y-%m-%d'),INTERVAL 7 week)   
        AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        ) as  new_lab,
        (SELECT COUNT(*) FROM users WHERE role_id=3 AND status='Active' AND approve_status ='Approve') as  old_lab,

        (SELECT COUNT(*) FROM users WHERE role_id=4 AND status='Active' 
        AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_SUB(DATE_FORMAT(NOW(),'%y-%m-%d'),INTERVAL 7 week)   
        AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        ) as  new_radio, 
        (SELECT COUNT(*) FROM users WHERE role_id=4 AND status='Active' AND approve_status ='Approve') as  old_radio,
        
        (SELECT COUNT(*) FROM users WHERE role_id=5 AND status='Active' 
        AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_SUB(DATE_FORMAT(NOW(),'%y-%m-%d'),INTERVAL 7 week)   
        AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        ) as  new_doctor, 
        (SELECT COUNT(*) FROM users WHERE role_id=5 AND status='Active' AND approve_status ='Approve') as  old_doctor,

        (SELECT COUNT(*) FROM users WHERE role_id=8 AND status='Active' 
        AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_SUB(DATE_FORMAT(NOW(),'%y-%m-%d'),INTERVAL 7 week)   
        AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        ) as  new_clinic, 
        (SELECT COUNT(*) FROM users WHERE role_id=8 AND status='Active' AND approve_status ='Approve') as  old_clinic,
        
        (SELECT COUNT(*) FROM appointments WHERE DATE_FORMAT(created_at,'%y-%m-%d') <= DATE_FORMAT(CURDATE(),'%y-%m-%d') AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_FORMAT(CURDATE()-7,'%y-%m-%d')) as new_appointment, 
        (SELECT COUNT(*) FROM appointments ) as old_appointment,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id IS NOT NULL ) as clinicTotalAppointment,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id IS NOT NULL AND DATE_FORMAT(created_at,'%y-%m-%d') <= DATE_FORMAT(CURDATE(),'%y-%m-%d') AND DATE_FORMAT(created_at,'%y-%m-%d') >= DATE_FORMAT(CURDATE(),'%y-%m-%d') ) as clinicTodayAppointment,
        (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 3) as labTotalReport,
        (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 3 AND DATE_FORMAT(new_visit.created_at,'%y-%m-%d') <= DATE_FORMAT(CURDATE(),'%y-%m-%d') AND DATE_FORMAT(new_visit.created_at,'%y-%m-%d') >= DATE_FORMAT(CURDATE(),'%y-%m-%d')) as labTodayReport,
        (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 4 AND DATE_FORMAT(new_visit.created_at,'%y-%m-%d') <= DATE_FORMAT(CURDATE(),'%y-%m-%d') AND DATE_FORMAT(new_visit.created_at,'%y-%m-%d') >= DATE_FORMAT(CURDATE(),'%y-%m-%d')) as radioTodayReport,
        (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 4) as radioTotalReport       
        `, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, res[0]);
        });
    }
    static dashboard_countNew(cb) {
        db.query(`
    SELECT
      -- Patients
      (SELECT COUNT(*) FROM users WHERE role_id=2 AND status='Active' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)) AS new_patients,
      (SELECT COUNT(*) FROM users WHERE role_id=2 AND status='Active') AS old_patients,

      -- Labs
      (SELECT COUNT(*) FROM users WHERE role_id=3 AND status='Active' AND approve_status='Approve' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)) AS new_lab,
      (SELECT COUNT(*) FROM users WHERE role_id=3 AND status='Active' AND approve_status='Approve') AS old_lab,

      -- Radiology
      (SELECT COUNT(*) FROM users WHERE role_id=4 AND status='Active' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)) AS new_radio,
      (SELECT COUNT(*) FROM users WHERE role_id=4 AND status='Active' AND approve_status='Approve') AS old_radio,

      -- Doctors
      (SELECT COUNT(*) FROM users WHERE role_id=5 AND status='Active' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)) AS new_doctor,
      (SELECT COUNT(*) FROM users WHERE role_id=5 AND status='Active' AND approve_status='Approve') AS old_doctor,

      -- Clinics
      (SELECT COUNT(*) FROM users WHERE role_id=8 AND status='Active' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)) AS new_clinic,
      (SELECT COUNT(*) FROM users WHERE role_id=8 AND status='Active' AND approve_status='Approve') AS old_clinic,

      -- Appointments
      (SELECT COUNT(*) FROM appointments WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS new_appointment,
      (SELECT COUNT(*) FROM appointments) AS old_appointment,
      (SELECT COUNT(*) FROM appointments WHERE clinic_id IS NOT NULL) AS clinicTotalAppointment,
      (SELECT COUNT(*) FROM appointments WHERE clinic_id IS NOT NULL AND DATE(created_at) = CURDATE()) AS clinicTodayAppointment,

      -- Reports
      (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 3) AS labTotalReport,
      (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 3 AND DATE(new_visit.created_at) = CURDATE()) AS labTodayReport,
      (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 4) AS radioTotalReport,
      (SELECT COUNT(*) FROM new_visit LEFT JOIN users ON new_visit.lab_id = users.id WHERE users.role_id = 4 AND DATE(new_visit.created_at) = CURDATE()) AS radioTodayReport
  `, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, res[0]);
        });
    }


    static paitentList(cb) {
        db.query("SELECT * FROM users WHERE role_id = 2  ORDER BY id DESC", (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const imgName = item.profile_image;
                const img = process.env.CLOUDINARY_BASE_URL + "member/" + imgName;
                const first_name = item.first_name;
                const email = item.email;
                const mobile = item.mobile;
                const date_of_birth = item.date_of_birth;
                const created_at = item.created_at;
                response.push({ id, first_name, email, mobile, date_of_birth, created_at, img, imgName });
            }
            cb(null, response);
        });
    }
    static paitentDetail(id, created_by_id, cb) {
        db.query("SELECT * FROM users WHERE id = ? OR created_by_id = ?", [id, created_by_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const imgName = item.profile_image;
                const img = process.env.CLOUDINARY_BASE_URL + "member/" + imgName;
                const first_name = item.first_name;
                const email = item.email;
                const mobile = item.mobile;
                const gender = item.gender;
                const date_of_birth = item.date_of_birth;
                const created_at = item.created_at;
                const adhar_card = item.adhar_card;
                response.push({ id, first_name, email, mobile, date_of_birth, created_at, img, imgName, adhar_card, gender });
            }
            cb(null, response);
        });
    }
    static labradList(role_id, cb) {
        db.query("SELECT * FROM users WHERE role_id=?  ORDER BY id DESC", role_id, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const imgName = item.profile_image;
                const img = process.env.CLOUDINARY_BASE_URL + "member/" + imgName;
                const first_name = item.first_name;
                const email = item.email;
                const mobile = item.mobile;
                const adhar_card = item.adhar_card;
                const approve_document = item.approve_document;
                const approve_status = item.approve_status;
                const status = item.status;
                const created_at = item.created_at;
                const approve_document_path = process.env.CLOUDINARY_BASE_URL + "member/" + approve_document;
                response.push({ id, first_name, email, mobile, adhar_card, approve_document, img, imgName, approve_document, approve_document_path, approve_status, status, created_at });
            }
            cb(null, response);
        });
    }
    static aprroveLabRadUser(user_id, status, cb) {
        db.query(`UPDATE new_visit SET status = '${status}' WHERE id = '${user_id}'`,
            [
                user_id, status
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    user_id: user_id,
                    status: status
                });
            });
    }
    static findById(id, cb) {
        db.query("SELECT * FROM super_admin WHERE id = ?", [id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const username = item.name;
                const email = item.email;
                const gender = item.gender;
                const image_name = item.image_name;
                const mobile_no = item.mobile_no;
                const img = process.env.CLOUDINARY_BASE_URL + "member/" + item.image_name;
                const password = item.password;
                response.push({ id, username, email, gender, image_name, mobile_no, img, password });
            }
            cb(null, response);
        });
    }
    static updatePassword(password, id, cb) {
        db.query("UPDATE super_admin SET password=? WHERE id =?", [password, id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });
    }
    static updateUser(name, email, gender, image_name, mobile_no, id, cb) {
        console.log(image_name);
        if (image_name != "") {
            db.query("UPDATE super_admin SET name = ?,gender=?,image_name=?,mobile_no=? WHERE id =?", [name, gender, image_name, mobile_no, id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: id
                });
            });
        } else {
            db.query("UPDATE super_admin SET name =?,gender=?,mobile_no=? WHERE id =?", [name, gender, mobile_no, id], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: id
                });
            });
        }
    }

    static operaterFindById(id, role, cb) {
        db.query(`SELECT * FROM super_admin WHERE id ='${id}' AND role='${role}'`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const username = item.name;
                const email = item.email;
                const gender = item.gender;
                const image_name = item.image_name;
                const mobile_no = item.mobile_no;
                const img = process.env.CLOUDINARY_BASE_URL + "member/" + item.image_name;
                response.push({ id, username, email, gender, image_name, mobile_no, img });
            }
            cb(null, response);
        });
    }

    static operaterCreate(name, email, gender, image_name, mobile_no, password, cb) {
        db.query("INSERT INTO super_admin (name,email,gender,image_name,mobile_no,password,role) VALUES(?,?,?,?,?,?,'operator')",
            [name, email, gender, image_name, mobile_no, password], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }

    static operaterShow(role, cb) {
        db.query(`SELECT * FROM super_admin WHERE role='${role}' ORDER BY id DESC`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            const response = [];
            for (const item of res) {
                const id = item.id;
                const username = item.name;
                const email = item.email;
                const gender = item.gender;
                const image_name = item.image_name;
                const mobile_no = item.mobile_no;
                const img = process.env.CLOUDINARY_BASE_URL + "member/" + item.image_name;
                response.push({ id, username, email, gender, image_name, mobile_no, img });
            }
            cb(null, response);
        });
    }
    static operaterDelete(id, role, cb) {
        db.query(`DELETE FROM super_admin WHERE id='${id}' AND role='${role}'`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, res);
        });
    }
    static operaterUpdate(name, email, gender, image_name, mobile_no, role, id, cb) {
        if (image_name == "" || image_name == null) {
            db.query(`UPDATE super_admin SET  name ='${name}',email='${email}',gender='${gender}',mobile_no='${mobile_no}',role='${role}' WHERE id ='${id}' AND role='${role}'`,
                [name, email, gender, mobile_no, role, id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, res);
                });
        } else {
            db.query(`UPDATE super_admin SET  name =?,email=?,gender=?,image_name=?,mobile_no=?,role=?,password=? WHERE id ='${id}' AND role='${role}'`,
                [name, email, gender, image_name, mobile_no, role, id], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, res);
                });
        }

    }
    static labradListApprove(user_id, approve_status, cb) {
        db.query(`UPDATE users SET approve_status = '${approve_status}' WHERE id = '${user_id}'`,
            [
                user_id, approve_status
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    user_id: user_id,
                    approve_status: approve_status
                });
            });
    }
    static getDefaultPlanFor(user_id) {
        var query = `SELECT plans.id As plan_id, users.id AS user_id, plans.price AS total_amount,plans.benefit,plans.validity 
        FROM users 
        INNER JOIN plans ON plans.plan_for = users.user_type  
        WHERE users.id = '${user_id}' 
        AND plans.set_as_default = 'Active'`;

        return new Promise((resolve, reject) => {
            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static addDefaultPlanForActive(user_id, plan_id, benefit, expired_at, total_amount, payment_order_id, payment_currency, payment_detail) {
        var query = "INSERT INTO `plan_purchase_history` SET `user_id`='" + user_id + "',`plan_id`='" + plan_id + "',`status`='active',`payment_detail`='" + payment_detail + "',`payment_currency`='" + payment_currency + "',`total_amount`='" + total_amount + "',`payment_order_id`='" + payment_order_id + "',`total_limit`='" + benefit + "',`expired_at`='" + expired_at + "',`purchased_at`= now(),`payment_status`='Success'";
        console.log(query);
        return new Promise((resolve, reject) => {
            db.query(query,
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static otpVerify(email, forgot_otp, cb) {
        const userData = { email: email, forgot_otp: forgot_otp };
        db.query("UPDATE super_admin SET forgot_otp = ? WHERE email= ?",
            [
                forgot_otp,
                email
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, userData);
            });
    }
    static resetPassword(id, password) {
        console.log(id);
        return new Promise((resolve, reject) => {
            db.query("UPDATE super_admin SET password = ? WHERE  id= ?",
                [
                    password,
                    id
                ], (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }
    static checkOtpVerify(email, forgot_otp, cb) {
        const userData = { email, forgot_otp };
        db.query("SELECT id,name,email,mobile_no,gender FROM super_admin WHERE email= ? AND forgot_otp=?",
            [
                email,
                forgot_otp
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
            });
    }


    static findAdminById(id, cb) {
        db.query("SELECT * FROM super_admin WHERE id = ?", [id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }


    static findAllClinics(cb) {
        db.query("SELECT * FROM users WHERE role_id=8 and deleted_at IS NULL ORDER BY id DESC", (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            var response = [];

            if (res) {
                for (const item of res) {
                    const id = item.id;
                    const clinic_name = item.first_name;
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const email = item.email;
                    const mobile_number = parseInt(item.mobile);
                    const approve_document = item.approve_document;
                    const status = (item.approve_status !== undefined && item.approve_status !== null) ? item.approve_status : null;
                    response.push({ id, clinic_name, profile_image_name, profile_image_path, email, mobile_number, approve_document, status });
                }
            }

            cb(null, response);
        });
    }

    static findAllDoctors(cb) {
        db.query(`SELECT distinct u.id,u.first_name,u.profile_image,u.email,u.gender,u.mobile,u.date_of_birth,u.experience_in_year 
        FROM users as u  
        INNER JOIN doctors_clinic as dc on u.id = dc.doctor_id WHERE u.role_id=5  ORDER BY dc.id DESC`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            var response = [];

            if (res) {
                for (const [key, item] of Object.entries(res)) {
                    const id = item.id;
                    const doctor_name = item.first_name;
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const email = item.email;
                    const gender = item.gender;
                    const mobile_number = parseInt(item.mobile);
                    const date_of_birth = item.date_of_birth;
                    const experience_in_year = item.experience_in_year;
                    response.push({ id, doctor_name, profile_image_name, profile_image_path, gender, email, mobile_number, date_of_birth, experience_in_year });
                    var clinic_name = "";
                    var clinic_id = item.created_by_id;
                    db.query("SELECT  GROUP_CONCAT(u.first_name) as clinic_name from users as u inner join doctors_clinic dc on u.id = dc.clinic_id where dc.doctor_id = ? ", [id], (err, res1) => {
                        if (err) {
                            logger.error(err.message);
                            cb(err, null);
                            return;
                        }

                        if (res1) {
                            clinic_name = res1[0].clinic_name;
                        }

                        response[key]["clinic_name"] = clinic_name;
                    });

                }
            }

            setTimeout(function () {
                cb(null, response);
            }, 100);
        });
    }
    static findAllDoctorsWithClinic(cb) {
        db.query(`SELECT u.id,u.first_name,u.profile_image,u.email,u.gender,u.mobile,
        u.date_of_birth,u.experience_in_year,
        c.first_name as clinic_name
        FROM  doctors_clinic dc
        INNER JOIN users u on u.id = dc.doctor_id
        INNER JOIN users c on c.id = dc.clinic_id 
        WHERE u.role_id=5 and c.role_id=8 ORDER BY dc.id DESC`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res) {
                var response = [];
                for (const [key, item] of Object.entries(res)) {
                    const id = item.id;
                    const doctor_name = item.first_name;
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const email = item.email;
                    const gender = item.gender;
                    const mobile_number = parseInt(item.mobile);
                    const date_of_birth = item.date_of_birth;
                    const experience_in_year = item.experience_in_year;

                    var clinic_name = item.clinic_name;
                    var clinic_id = item.created_by_id;
                    response.push({ id, clinic_name, clinic_id, doctor_name, profile_image_name, profile_image_path, gender, email, mobile_number, date_of_birth, experience_in_year });

                }
                cb(null, response);
                return;
            }
        });
    }


    static userListApprove(user_id, approve_status, cb) {
        db.query(`UPDATE users SET approve_status = '${approve_status}' WHERE id = '${user_id}'`,
            [
                user_id, approve_status
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    user_id: user_id,
                    approve_status: approve_status
                });
            });
    }

    // plan functions

    static addPlan(admin_id, plan_for, benefit, plan_name, price, validity, description, cb) {
        db.query("INSERT INTO plans(created_by_id,plan_for,benefit,plan_name,price,validity,description,created_at) VALUES(?,?,?,?,?,?,?,NOW())",
            [
                admin_id, plan_for, benefit, plan_name, price, validity, description
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.insertId) {
                    cb(null, res);
                    return;
                }

            });
    }


    static findAllPlans(admin_id, cb) {
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM plans WHERE created_by_id = '${admin_id}' and deleted_at ${deleted_at} order by id desc`, [admin_id, deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length > 0) {
                cb(null, res);
            } else {
                cb({ kind: "not_found" }, null);
            }

        });
    }

    static findPlanById(plan_id, cb) {
        var deleted_at = "IS NULL";
        db.query(`SELECT * FROM plans WHERE id = '${plan_id}' and deleted_at ${deleted_at}`, [plan_id, deleted_at], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length > 0) {
                cb(null, res);
            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }


    static updatePlan(plan_for, benefit, plan_name, price, validity, description, plan_id, cb) {
        var updated_at = helperFunction.getCurrentDateTime();
        db.query("update plans set plan_for = ? ,benefit = ? ,plan_name = ? ,price = ? ,validity = ? ,description = ?, updated_at = ?  where id = ?",
            [
                plan_for, benefit, plan_name, price, validity, description, updated_at, plan_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.affectedRows) {
                    cb(null, res);
                    return;
                }

            });
    }
    static getPlanHistory() {
        return new Promise((resolve, reject) => {
            var query = "SELECT `users`.`first_name`,`users`.`user_type`, `plans`.`plan_name`, `plans`.`price`,`plans`.`validity`,`plan_purchase_history`.`purchased_at`, `plan_purchase_history`.`payment_status`, `plan_purchase_history`.`expired_at` FROM `plan_purchase_history` INNER JOIN `users` ON `users`.`id` = `plan_purchase_history`.`user_id` INNER JOIN `plans`  ON `plans`.`id` = `plan_purchase_history`.`plan_id` where  `plan_purchase_history`.`payment_status` = \"Success\"";
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static softRemovePlan(plan_for, cb) {
        var updated_at = helperFunction.getCurrentDateTime();
        db.query("update plans set set_as_default = ?,updated_at = ? where plan_for = ?",
            [
                "Inactive", updated_at, plan_for
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.affectedRows) {
                    cb(null, res);
                    return;
                }

            });
    }
    static updateSetAsDefaultPlan(plan_id, status, cb) {
        var updated_at = helperFunction.getCurrentDateTime();
        db.query("update plans set set_as_default = ?,updated_at = ?   where id = ?",
            [
                status, updated_at, plan_id
            ], (err, res) => {
                if (err) {
                    console.log("this.sql", this.sql); //command/query
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.affectedRows) {
                    cb(null, res);
                    return;
                }

            });

    }

    static deletePlan(id, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();
        db.query("update plans set deleted_at = ? WHERE id= ?", [deleted_at, id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });

    }


    static findAllStaff(cb) {
        db.query("SELECT * FROM users WHERE role_id IN (6,7) and deleted_at IS NULL ORDER BY id DESC", (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            var response = [];

            if (res) {
                for (const item of res) {
                    const id = item.id;
                    const name = item.first_name;
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const email = item.email;
                    const gender = item.gender;
                    const mobile_number = parseInt(item.mobile);
                    const date_of_birth = item.date_of_birth;
                    response.push({ id, name, profile_image_name, profile_image_path, gender, email, mobile_number, date_of_birth });
                }
            }

            cb(null, response);
        });
    }


    static addCommission(all_data, cb) {

        db.query("INSERT INTO commissions(user_id,commission_for,created_by_id,commission_percent) VALUES ? ", [
            all_data.map(item => [item.user_id, item.commission_for, item.admin_id, item.commission_percent])], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.insertId > 0) {
                    cb(null, res);
                    return;
                } else {
                    cb({ kind: "not_inserted" }, null);
                }

            });
    }




    static findCommissionById(id, cb) {
        db.query(`SELECT commissions.id as commission_id,users.id as user_id,users.first_name,commissions.commission_for,commissions.commission_percent FROM commissions inner JOIN users on users.id = commissions.user_id AND commissions.id = '${id}' `, [id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            } else {
                cb({ kind: "not_found" }, null);
            }

        });
    }



    static getSpecificLabAndRadioLogyList(role_id, cb) {
        var approve_status = "Approve";
        db.query(`SELECT users.id,users.first_name  FROM commissions right JOIN users on  users.id = commissions.user_id  WHERE commissions.user_id IS NULL AND users.deleted_at IS NULL AND users.role_id = '${role_id}' AND users.approve_status = '${approve_status}'`, [role_id, approve_status], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res) {
                cb(null, res);
                return;
            }
        });
    }



    static findAllCommissions(admin_id, cb) {
        var deleted_at = "IS NULL";
        db.query(`SELECT commissions.id as commission_id,users.id,users.first_name,commissions.commission_for,commissions.commission_percent FROM commissions inner JOIN users on users.id = commissions.user_id AND commissions.created_by_id = '${admin_id}' AND commissions.deleted_at ${deleted_at} order by commissions.id desc`, [admin_id, deleted_at], (err, res) => {

            if (err) {

                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length > 0) {
                cb(null, res);

            } else {
                cb({ kind: "not_found" }, null);
            }


        });
    }


    static updateCommission(commission_id, user_id, commission_for, commission_percent, cb) {
        var updated_at = helperFunction.getCurrentDateTime();


        db.query("UPDATE commissions SET user_id = ?, commission_for = ?, commission_percent = ? ,updated_at = ?  WHERE id = ?", [user_id, commission_for, commission_percent, updated_at, commission_id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, { id: commission_id });
        });

    }


    static deleteCommission(id, cb) {
        var deleted_at = helperFunction.getCurrentDateTime();


        db.query("update commissions set deleted_at = ? WHERE id= ?", [deleted_at, id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, {
                id: id
            });
        });

    }


    static findAllAppointments(appointment_date, appointment_time, cb) {
        var filter_condition = "";
        if (appointment_date != "" && appointment_date != undefined) {
            filter_condition = " where ap.appointment_date =" + "'" + appointment_date + "'";
        }

        if (appointment_time != "" && appointment_time != undefined) {
            if (appointment_date != "" && appointment_date != undefined) {
                filter_condition += " and ap.from_time =" + "'" + appointment_time + "'";
            } else {
                filter_condition = " where ap.from_time =" + "'" + appointment_time + "'";
            }

        }
        db.query(`SELECT ap.id,ap.appointment_date,ap.from_time,ap.status,ap.grand_total,u.profile_image,u.first_name as patient_name,u1.first_name as lab_name 
        FROM appointments as ap 
        inner join users as u on ap.created_by_id = u.id 
        inner join users as u1 on ap.user_id = u1.id`+ filter_condition + ` 
                ORDER BY ap.id DESC`, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            var response = [];

            if (res) {
                for (const item of res) {
                    const order_id = item.id;
                    const booking_status = item.status;
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const grand_total = parseInt(item.grand_total);
                    const patient_name = item.patient_name;
                    const lab_name = item.lab_name;
                    const appointment_date = item.appointment_date;
                    const time_slot = item.from_time;
                    response.push({ order_id, booking_status, profile_image_name, profile_image_path, grand_total, patient_name, lab_name, appointment_date, time_slot });
                }
            }

            if (response.length > 0) {
                cb(null, response);

            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }


    static findAllLabVistedAppointments(cb) {
        db.query("SELECT * FROM appointments as ap inner join users as u on ap.created_by_id = u.id inner join users as u1 on ap.user_id = u1.id where ap.status = 'Visited' and u1.role_id = 3", (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res) {
                cb(null, res);

            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }

    static findAllInsightAppointments(from_date, to_date, lab_id, role_id, age_group, gender, pin_code, filter_by, appointment_date, week, month, year, blood_group, cb) {
        var filter_condition = "";
        if (filter_by == "day") {
            if (appointment_date != "") {
                filter_condition = " where ap.appointment_date =" + "'" + appointment_date + "'";
            }
        }

        if (filter_by == "week") {
            if (week != "") {
                filter_condition = " where WEEKDAY(ap.appointment_date) =" + "'" + week + "'";
            }
        }

        if (filter_by == "month") {
            if (month != "") {
                filter_condition = " where MONTH(ap.appointment_date) =" + "'" + month + "'";
            }
        }


        if (filter_by == "year") {
            if (year != "") {
                filter_condition = " where YEAR(ap.appointment_date) =" + "'" + year + "'";
            }
        }


        if (from_date != "" && from_date != undefined && to_date != "" && to_date != undefined) {
            filter_condition = " where ap.appointment_date BETWEEN " + "'" + from_date + "' AND " + "'" + to_date + "'";
        }



        if (gender != "" && gender != undefined) {
            filter_condition += "and u.gender=" + "'" + gender + "'";
        }

        if (pin_code != "" && pin_code != undefined) {
            filter_condition += "and u2.pin_code=" + "'" + pin_code + "'";
        }

        if (lab_id != "" && lab_id != undefined) {
            filter_condition += "and u2.id=" + "'" + lab_id + "'";
        }

        if (age_group != "" && age_group != undefined) {
            if (age_group == "below_5") {
                filter_condition += "and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) < 5";
            }
            if (age_group == "between_5_and_18") {
                filter_condition += "and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) BETWEEN 5 AND 18";
            }
            if (age_group == "above_18") {
                filter_condition += "and TIMESTAMPDIFF(YEAR,DATE_FORMAT(STR_TO_DATE(u.date_of_birth,'%a %M %D %Y'), '%Y-%m-%d'),CURDATE()) > 18";
            }
        }

        if (blood_group != "" && blood_group != undefined) {
            filter_condition += " and u.blood_group=" + "'" + blood_group + "'";
        }

        if (role_id == 3) {
            var query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males,COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females,COUNT(ap.id) as total_booking ,COUNT(CASE WHEN ap.status = 'Completed' THEN ap.id END) AS total_completed_booking,COUNT(CASE WHEN (ap.status is null OR ap.status !='Completed') THEN ap.id END) AS total_future_booking,u2.id as lab_id,u2.first_name as lab_name , u2.pin_code as pin_code FROM appointments as ap left join users as u on ap.created_by_id = u.id  inner join users u2 on ap.user_id = u2.id " + filter_condition + " and u2.role_id = 3 GROUP BY ap.user_id ORDER BY ap.id DESC";
        }

        if (role_id == 4) {
            var query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males,COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females,COUNT(ap.id) as total_booking ,COUNT(CASE WHEN ap.status = 'Completed' THEN ap.id END) AS total_completed_booking,COUNT(CASE WHEN (ap.status is null OR ap.status !='Completed') THEN ap.id END) AS total_future_booking,COUNT(u.id) as total_patients,u2.id as radiology_id,u2.first_name as radiology_name , u2.pin_code as pin_code FROM appointments as ap inner join users as u on ap.created_by_id = u.id inner join users u2 on ap.user_id = u2.id " + filter_condition + " and u2.role_id = 4 GROUP BY ap.user_id ORDER BY ap.id DESC";
        }

        if (role_id == 8) {
            var query = "SELECT COUNT(CASE WHEN u.gender = 'Male' THEN u.id END) AS total_males,COUNT(CASE WHEN u.gender = 'Female' THEN u.id END) AS total_females,COUNT(ap.id) as total_booking ,COUNT(CASE WHEN ap.status = 'Completed' THEN ap.id END) AS total_completed_booking,COUNT(CASE WHEN (ap.status is null OR ap.status !='Completed') THEN ap.id END) AS total_future_booking,COUNT(u.id) as total_patients,u2.id as clinic_id,u2.first_name as clinic_name , u2.pin_code as pin_code FROM appointments as ap left join users as u on ap.created_by_id = u.id INNER join users u2 on ap.clinic_id = u2.id " + filter_condition + " and u2.role_id = 8 GROUP BY ap.clinic_id ORDER BY ap.id DESC";
        }

        /*console.log("query",query);*/

        db.query(query, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            if (res) {
                cb(null, res);
            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }

    static findAllAppointmentsForAdmin(appointment_date, appointment_time, cb) {
        var filter_condition = "";

        if (appointment_date != "" && appointment_date != undefined) {

            filter_condition = " where ap.appointment_date =" + "'" + appointment_date + "'";
        }

        if (appointment_time != "" && appointment_time != undefined) {
            if (appointment_date != "" && appointment_date != undefined) {
                filter_condition += " and ap.from_time =" + "'" + appointment_time + "'";
            } else {
                filter_condition = " where ap.from_time =" + "'" + appointment_time + "'";
            }
        }
        if (filter_condition !== "") {
            filter_condition += " and ap.status IN ('Completed','Visited') and ap.payment_status = 'Success'";
        } else {
            filter_condition += " where ap.status IN ('Completed','Visited') and ap.payment_status = 'Success'";
        }

        const queryStr = `SELECT ap.id,ap.appointment_date,ap.from_time,ap.status,ap.grand_total,u.profile_image,u.first_name as patient_name,u1.first_name as lab_name 
        FROM appointments as ap 
        inner join users as u on ap.created_by_id = u.id 
        inner join users as u1 on ap.user_id = u1.id`+ filter_condition + ` 
          ORDER BY ap.id DESC`;

        console.log(queryStr, "---------------------- queryStr");

        db.query(queryStr, (err, res) => {

            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }

            var response = [];

            if (res) {
                for (const item of res) {
                    const order_id = item.id;
                    const booking_status = item.status;
                    const profile_image_name = (item.profile_image == null) ? "" : item.profile_image;
                    const profile_image_path = process.env.CLOUDINARY_BASE_URL + "member/" + profile_image_name;
                    const grand_total = parseInt(item.grand_total);
                    const patient_name = item.patient_name;
                    const lab_name = item.lab_name;
                    const appointment_date = item.appointment_date;
                    const time_slot = item.from_time;
                    response.push({ order_id, booking_status, profile_image_name, profile_image_path, grand_total, patient_name, lab_name, appointment_date, time_slot });
                }
            }

            if (response.length > 0) {
                cb(null, response);

            } else {
                cb({ kind: "not_found" }, null);
            }
        });
    }
}
module.exports = Admin;