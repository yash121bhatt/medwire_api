const { async, resolve, reject } = require("q");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class doctorSpecialityMaster {
    static show(){
        return new Promise((resolve,reject)=>{
            const data=[];
            db.query("SELECT*FROM doctor_speciality_master",(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    res.map((item)=>{
                        data.push(item.name);
                    });
                    return resolve(data);
                }
            });
        });
    }
    static add(name){
        return new Promise((resolve,reject)=>{
            db.query(`INSERT INTO doctor_speciality_master(name) VALUES ('${name}')`,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }

    static findBYName(name){
        const data=[];
        return new Promise((resolve,reject)=>{
            db.query(`SELECT*FROM doctor_speciality_master WHERE name LIKE '%${name}%'`,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    res.map((item)=>{
                        data.push(item.name);
                    });
                    return resolve(data);
                }
            });
        });
    }

    static deleteDoctorSpeciality(user_id){
        return new Promise((resolve,reject)=>{
            db.query(`DELETE FROM doctor_specialities WHERE doctor_id='${user_id}'`,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }

    static addDoctorSpeciality(user_id,created_by_id,specialitie){
        return new Promise((resolve,reject)=>{
            if (created_by_id!=undefined && created_by_id!=null) {
                var query =`INSERT INTO doctor_specialities(doctor_id,created_by_id,speciality_name)VALUES('${user_id}','${created_by_id}','${specialitie}')`;
            } else {
                var query =`INSERT INTO doctor_specialities(doctor_id,speciality_name)VALUES('${user_id}','${specialitie}')`;
            }
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }

    static deleteDoctorDegrees(user_id){
        return new Promise((resolve,reject)=>{
            db.query(`DELETE FROM doctor_degrees WHERE doctor_id='${user_id}'`,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }
    static addDoctorDegrees(user_id,created_by_id,degree){
        return new Promise((resolve,reject)=>{
            if (created_by_id!=undefined && created_by_id!=null) {
                var query =`INSERT INTO doctor_degrees(doctor_id,created_by_id,degree_name)VALUES('${user_id}','${created_by_id}','${degree}')`;
            } else {
                var query =`INSERT INTO doctor_degrees(doctor_id,degree_name)VALUES('${user_id}','${degree}')`;
            }
            db.query(query,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(res);
                }
            });
        });
    }
}
module.exports = doctorSpecialityMaster;