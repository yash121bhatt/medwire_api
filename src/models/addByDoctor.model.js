const db = require('../config/db.config');
class addByDoctor {

    //lab/radio list by role_id 
    static labRadio({role_id,search,ids})
    {
        return  new Promise((resolve,reject)=>{
            const cids =ids.length >0?ids:0;
            const roleId = role_id!=undefined && role_id==4 ? role_id:3;
            if (search!=undefined  && search!='') {
                var que = "SELECT * FROM users WHERE approve_status='Approve' AND role_id="+roleId+" AND (first_name LIKE '%${search}%') AND id NOT IN ("+cids+") ORDER BY id DESC";
            }else{
                var que = "SELECT * FROM users WHERE approve_status='Approve' AND role_id="+roleId+" AND id NOT IN ("+cids+") ORDER BY id DESC";
            }
            db.query(que,(err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    // add lab/radio list by role_id 
    static AddlabRadio({user_id,doctor_id})
    {
        return  new Promise((resolve,reject)=>{
            db.query(`INSERT INTO radio_lab_doctors(user_id,doctor_id,created_at) VALUES(?,?,NOW())`,
            [user_id,doctor_id],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    // show list Doctor lab/radio list by role_id 
    static showDoctorlabRadio({doctor_id,role_id})
    {
        const roleId = role_id!=undefined && role_id==4 ? role_id:3;
        return  new Promise((resolve,reject)=>{
            db.query(`SELECT rld.id,rld.status,
            d.id as doctor_id,d.first_name as doctor_name,
            rl.id as lab_Id,rl.first_name,rl.email,rl.mobile,rl.pin_code,rl.mobile,rl.address,rl.profile_image 
            FROM radio_lab_doctors rld 
            INNER JOIN users d ON d.id=rld.doctor_id
            INNER JOIN users rl ON rl.id=rld.user_id
            WHERE rl.role_id = '${roleId}' AND rld.doctor_id='${doctor_id}'`,
            [doctor_id],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    // add lab/radio list by role_id 
    static showlabRadios({user_id,doctor_id})
    {
        return  new Promise((resolve,reject)=>{
            db.query(`INSERT INTO radio_lab_doctors(user_id,doctor_id,created_at) VALUES(?,?,NOW())`,
            [user_id,doctor_id],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    // delete lab/radio list by role_id 
    static DeleteDoctorlabRadio({user_id,doctor_id})
    {
        return  new Promise((resolve,reject)=>{
            db.query(`DELETE FROM radio_lab_doctors WHERE id='${user_id}' AND doctor_id='${doctor_id}'`,
            [user_id,doctor_id],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static DoctorRequestlabRadio({user_id})
    {
        return  new Promise((resolve,reject)=>{
            db.query(`SELECT rld.id,rld.status,
            d.id as d_id,d.first_name as doctor_name,d.gender,d.experience_in_year,
            d.email,d.mobile,d.pin_code,d.mobile,d.address,d.profile_image 
            FROM radio_lab_doctors rld 
            INNER JOIN users d ON d.id=rld.doctor_id
            INNER JOIN users rl ON rl.id=rld.user_id
            WHERE rl.id='${user_id}'`,
            [user_id],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    // add lab/radio list by role_id 
    static statusDoctorlabRadio(user_id,request_status)
    {
        return  new Promise((resolve,reject)=>{
            db.query(`UPDATE radio_lab_doctors SET status='${request_status}',updated_at=NOW() WHERE id='${user_id}'`,
            [user_id,request_status],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    //doctor approve list in lab/radio 
    static DoctorlabRadioApproved({user_id})
    {
        return  new Promise((resolve,reject)=>{
            db.query(`SELECT rld.id,rld.status,
            d.id as d_id,d.first_name as doctor_name,d.gender,d.experience_in_year,
            d.email,d.mobile,d.pin_code,d.mobile,d.address,d.profile_image 
            FROM radio_lab_doctors rld 
            INNER JOIN users d ON d.id=rld.doctor_id
            INNER JOIN users rl ON rl.id=rld.user_id
            WHERE rl.id='${user_id}' AND rld.status='Approved'`,
            [user_id],
            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    
    // show single data Doctor lab/radio list by role_id 
    static DoctorlabRadio({user_id,doctor_id,role_id})
    {
        const roleId = role_id!=undefined && role_id==4 ? role_id:3;
        return  new Promise((resolve,reject)=>{
            db.query(`SELECT rld.id,rld.status,
            d.id as doctor_id,d.first_name as doctor_name,
            rl.first_name,rl.email,rl.mobile,rl.pin_code,rl.profile_image 
            FROM radio_lab_doctors rld 
            INNER JOIN users d ON d.id=rld.doctor_id
            INNER JOIN users rl ON rl.id=rld.user_id
            WHERE rl.role_id = '${roleId}' AND rld.doctor_id='${doctor_id}' AND rld.id='${user_id}'`,

            (err,res)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    //doctor approve list in lab/radio sigle data by primery id
    static DoctorlabRadioFirst(user_id) {
        return  new Promise((resolve,reject)=>{
            db.query(`SELECT rld.id,rld.status,d.user_type as d_user_type,
            rl.first_name as rl_name,rl.user_type as rl_user_type,
            d.id as d_id,d.first_name as doctor_name,d.gender,d.experience_in_year,
            d.email,d.mobile,d.pin_code,d.mobile,d.address,d.profile_image 
            FROM radio_lab_doctors rld 
            INNER JOIN users d ON d.id=rld.doctor_id
            INNER JOIN users rl ON rl.id=rld.user_id
            WHERE rld.id='${user_id}' limit 1`, [user_id],
            (err,res)=>{
                if (err) {   return reject(err); }
                if (res) {   return resolve(res[0]); } 
            });
        });
    }
}
module.exports = addByDoctor;