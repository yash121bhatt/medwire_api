const db = require("../config/db.config");

class PatientsDoctor {
    static searchDoctor(search) {
        let query;
        if (search != undefined && search != "") {
            query = `SELECT dc.id,dc.clinic_id,u.first_name as doctor,c.first_name as clinic
            FROM doctors_clinic dc INNER JOIN users u  on dc.doctor_id=u.id 
            INNER JOIN users c on dc.clinic_id=c.id
            where (u.first_name LIKE '%${search}%') OR (c.first_name LIKE '%${search}%')`;
        } else {
            query = `SELECT dc.id,dc.clinic_id,u.first_name as doctor,c.first_name as clinic
            FROM doctors_clinic dc INNER JOIN users u  on dc.doctor_id=u.id 
            INNER JOIN users c on dc.clinic_id=c.id`;
        }
        return new Promise((resolve, reject) => {
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static addDoctor(user_id, created_by_id) {
        return new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO user_doctors (user_id,created_by_id,created_at) VALUES (?,?,NOW())",
                [user_id, created_by_id],
                (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                }
            );
        });
    }

    static doctorList(user_id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT
                    p.id,
                    dc.clinic_id,
                    p.created_by_id as patient_id,
                    u.first_name as doctor,
                    u.profile_image as doctor_profile,
                    u.id as doctor_id,
                    u.experience_in_year,
                    c.first_name as clinic,
                    c.profile_image as clinic_profile,
                    pnt.first_name as patient_name,
                    pnt.profile_image as patient_image 
                    FROM
                    doctors_clinic dc
                    INNER JOIN user_doctors p ON dc.id = p.user_id
                    INNER JOIN users u on dc.doctor_id = u.id
                    INNER JOIN users c on dc.clinic_id = c.id
                    LEFT JOIN users pnt on pnt.id = p.created_by_id 
                    WHERE
                    p.created_by_id = '${user_id}' 
                    and p.deleted_at IS NULL
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

    static Deletedoctor(user_id) {
        return new Promise((resolve, reject) => {
            var query = `Delete from user_doctors WHERE id='${user_id}'`;
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
}
module.exports = PatientsDoctor;