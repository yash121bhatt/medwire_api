const { JOI } = require("joi");
const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const helperFunction = require("../helper/helperFunction");


class Prescription {



    static getDetail(clinic_id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM prescriptions WHERE created_by_id='${clinic_id}' order by id desc limit 1`,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }


    static getStaffDetail(clinic_id, added_by) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM prescriptions WHERE created_by_id='${clinic_id}' AND added_by='${added_by}'`,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static managePrescriptionHeader({ clinic_name, clinic_logo, mobile_number, alternate_mobile_number, email_id, clinic_timing, clinic_id, length }) {
        if (length == 0) {
            var query = "INSERT into prescriptions(clinic_name,clinic_logo,mobile_number,alternate_mobile_number,email_id,clinic_timing,created_by_id) values(?,?,?,?,?,?,?)";
            var arr = [clinic_name, clinic_logo, mobile_number, alternate_mobile_number, email_id, clinic_timing, clinic_id];
        } else {
            var updated_at = helperFunction.getCurrentDateTime();
            if (clinic_logo != "") {
                var query = "UPDATE prescriptions SET clinic_name = ? ,clinic_logo = ? ,mobile_number = ?,alternate_mobile_number = ? ,email_id = ?  , clinic_timing = ? , updated_at = ? where created_by_id = ?";
                var arr = [clinic_name, clinic_logo, mobile_number, alternate_mobile_number, email_id, clinic_timing, updated_at, clinic_id];

            } else {
                var query = "UPDATE prescriptions SET clinic_name = ?  ,mobile_number = ?,alternate_mobile_number = ? ,email_id = ?  , clinic_timing = ? , updated_at = ? where created_by_id = ?";
                var arr = [clinic_name, mobile_number, alternate_mobile_number, email_id, clinic_timing, updated_at, clinic_id];

            }
        }
        return new Promise((resolve, reject) => {
            db.query(query, arr,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });
    }

    static manageStaffPrescriptionHeader({ added_by, clinic_name, clinic_logo, mobile_number, alternate_mobile_number, email_id, clinic_timing, clinic_id, length_s }) {

        if (length_s == 0) {
            var query = "INSERT into prescriptions(clinic_name,clinic_logo,mobile_number,alternate_mobile_number,email_id,clinic_timing,created_by_id,added_by) values(?,?,?,?,?,?,?,?)";
            var arr = [clinic_name, clinic_logo, mobile_number, alternate_mobile_number, email_id, clinic_timing, clinic_id, added_by];
        } else {
            var updated_at = helperFunction.getCurrentDateTime();
            if (clinic_logo != "") {
                var query = "UPDATE prescriptions SET clinic_name = ? ,clinic_logo = ? ,mobile_number = ?,alternate_mobile_number = ? ,email_id = ?  , clinic_timing = ? , updated_at = ?, added_by = ? where created_by_id = ?";
                var arr = [clinic_name, clinic_logo, mobile_number, alternate_mobile_number, email_id, clinic_timing, updated_at, added_by, clinic_id];

            } else {
                var query = "UPDATE prescriptions SET clinic_name = ?  ,mobile_number = ?,alternate_mobile_number = ? ,email_id = ?  , clinic_timing = ? , updated_at = ?, added_by = ? where created_by_id = ?";
                var arr = [clinic_name, mobile_number, alternate_mobile_number, email_id, clinic_timing, updated_at, added_by, clinic_id];

            }

        }
        return new Promise((resolve, reject) => {
            db.query(query, arr,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });

    }


    static managePrescriptionFooter({ clinic_address, clinic_id, length }) {


        if (length == 0) {
            var query = "INSERT into prescriptions(clinic_address,created_by_id) values(?,?)";
            var arr = [clinic_address, clinic_id];

        } else {
            var updated_at = helperFunction.getCurrentDateTime();
            var query = "UPDATE prescriptions SET clinic_address = ? , updated_at = ? where created_by_id = ?";
            var arr = [clinic_address, updated_at, clinic_id];
        }
        return new Promise((resolve, reject) => {
            db.query(query, arr,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });

    }

    static manageStaffPrescriptionFooter({ clinic_address, clinic_id, added_by, length1 }) {

        if (length1 == 0) {
            var query = "INSERT into prescriptions(clinic_address,created_by_id,added_by) values(?,?,?)";
            var arr = [clinic_address, clinic_id, added_by];

        } else {
            var updated_at = helperFunction.getCurrentDateTime();
            var query = "UPDATE prescriptions SET clinic_address = ? , updated_at = ?, added_by = ? where created_by_id = ?";
            var arr = [clinic_address, updated_at, added_by, clinic_id];
        }
        return new Promise((resolve, reject) => {
            db.query(query, arr,
                (err, res) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
        });

    }



}
module.exports = Prescription;