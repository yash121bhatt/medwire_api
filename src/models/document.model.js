const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
class Document {
    static list_document(user_id,member_id,type, cb) {
        db.query("SELECT * FROM users_documents WHERE user_id = ? AND member_id = ? AND type = ?  ORDER BY id DESC ",
            [
                user_id,member_id,type  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const response = [];
                for (const item of res) {
                    const id = item.id;
                    const document_file = item.document_file;
                    const document = helperFunction.is_file_exist(item.document_file);
                    const document_title = item.document_title;
                    const document_date = item.document_date;
                    const type = item.type;
                    const lab_radio_type = helperFunction.check_file_DCM(item.document_file);
                    const scan_doc_text = item.scan_doc_text;
                    response.push({ id,user_id ,member_id,document, document_file,document_title,document_date, type,scan_doc_text,lab_radio_type});
                }
                cb(null,response);
        });
    }
    static add_document(user_id,member_id,document_title,document_file,document_date,type,scan_doc_text, cb) {
        if (scan_doc_text===undefined) {
            scan_doc_text = null;
        }
        db.query("INSERT INTO users_documents( user_id, member_id, document_title, document_file, document_date , type,scan_doc_text, created_at) VALUES(?,?,?,?,?,?,?,NOW())",
            [
                user_id,member_id,document_title,document_file,document_date,type,scan_doc_text
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                });
        });
    }
    static delete_document(id,user_id, cb) {
        db.query("DELETE FROM users_documents WHERE id = ? AND user_id = ?",
            [
                id,user_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    user_id: user_id
                });
        });
    }

    static list_document_six(user_id,member_id,cb) {
        db.query("SELECT * FROM users_documents WHERE user_id = ? AND member_id = ? AND type !='lab_report' ORDER BY id DESC LIMIT 5",
            [
                user_id,member_id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const response = [];
            for (const item of res) {
                const id = item.id;
                const document_file = item.document_file;
                const document = helperFunction.is_file_exist(document_file);
                const document_title = item.document_title;
                const document_date = item.document_date;
                const type = item.type;
                response.push({ id,user_id ,member_id,document, document_file,document_title,document_date, type});
            }
            cb(null,response);
        });
    }
    static search_document(search,user_id ,cb){
        if (search==undefined || search=="" || search==null)
        {
            var qu =`SELECT ud.id,u.profile_image,u.first_name,ud.document_title,ud.document_file,ud.document_date,ud.scan_doc_text 
            FROM users_documents ud JOIN users u ON u.id = ud.member_id
             WHERE (u.created_by_id ='${user_id}' OR ud.user_id ='${user_id}')`;
        }else{
            var qu =`SELECT ud.id,u.profile_image,u.first_name,ud.document_title,ud.document_file,ud.document_date,ud.scan_doc_text 
            FROM users_documents ud JOIN users u ON u.id = ud.member_id
            WHERE (scan_doc_text LIKE '%${search}%') AND (u.created_by_id ='${user_id}' OR ud.user_id ='${user_id}')`;
        }
        db.query(qu,[
            search,user_id
        ],(err, res) =>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null,res);
        });
    }
    static searchDocumentTimeline(date,year,month,user_id ,cb){
        // if (year!=undefined && month!=undefined) {
        //     var query =`SELECT ud.id,u.profile_image,u.first_name,ud.document_title,ud.document_file,
        //     ud.document_date,MONTHNAME(ud.document_date) as month_name,
        //     ud.scan_doc_text 
        //     FROM users_documents ud JOIN users u ON u.id = ud.member_id  
        //     WHERE (u.created_by_id ='${user_id}' OR ud.user_id ='${user_id}')
        //     AND  (MONTHNAME(STR_TO_DATE(ud.document_date,"%y-%m-d%"))='${month}' OR MONTHNAME(ud.document_date)='${month}') AND ( YEAR(STR_TO_DATE(ud.document_date,"%y-%m-d%"))='${year}' OR YEAR(ud.document_date)='${year}')`;
        // } else if(year!=undefined){
        //     var query =`SELECT ud.id,u.profile_image,u.first_name,ud.document_title,ud.document_file,
        //     ud.document_date,MONTHNAME(ud.document_date) as month_name,
        //     ud.scan_doc_text 
        //     FROM users_documents ud JOIN users u ON u.id = ud.member_id  
        //     WHERE (u.created_by_id ='${user_id}' OR ud.user_id ='${user_id}') 
        //     AND ( YEAR(STR_TO_DATE(ud.document_date,"%y-%m-d%"))='${year}' OR YEAR(ud.document_date)='${year}')`;
        // }else{
        //     var query =`SELECT ud.id,u.profile_image,u.first_name,ud.document_title,ud.document_file,
        //     ud.document_date,MONTHNAME(ud.document_date) as month_name,
        //     ud.scan_doc_text 
        //     FROM users_documents ud JOIN users u ON u.id = ud.member_id  
        //     WHERE (u.created_by_id ='${user_id}' OR ud.user_id ='${user_id}') 
        //    `;
        // }
        var query =`SELECT ud.id,u.profile_image,u.first_name,
            ud.document_title,ud.document_file,
            ud.dcm_document_file,
            ud.document_description,
            ud.document_date,
            ud.scan_doc_text,
            ud.type,ud.lab_radio_type 
            FROM users_documents ud 
            INNER JOIN users u ON u.id = ud.member_id or u.id = ud.user_id 
            WHERE u.id ='${user_id}'
           `;
        

        db.query(query,(err, res) =>{
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null,res);
        });
    }
    static latestTestDocs(user_id,member_id,type){
        return new Promise((resolve,reject)=>{
            var query = `SELECT u.id,nv.member_id,u.role_id,u.first_name,u.profile_image,
            nv.created_at,nv.document_title,nv.document_description,
            nv.dcm_document_file,nv.document_file,nv.lab_radio_type,
            nv.document_date,nv.type 
            FROM users u 
            JOIN users_documents nv on u.id=nv.member_id 
            where  nv.member_id='${member_id}' AND nv.type='${type}' 
            ORDER BY DATE_FORMAT(nv.document_date,'%y-%m-%d') DESC LIMIT 5`;
            console.log(query);
            db.query(query,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });

        });
    }
    static addUserPrescriptionDocument({user_id, member_id,appointment_id, document_title, document_file, type}){
        return new Promise((resolve,reject)=>{
            db.query(`SELECT*FROM users_documents WHERE type= '${type}' AND appointment_id='${appointment_id}'`,
            (err,fetchData)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                if (fetchData.length>0) {
                    var query=`UPDATE users_documents SET document_title='${document_title}', document_file='${document_file}', document_date=NOW(), created_at=NOW()
                    WHERE type= '${type}' AND appointment_id='${appointment_id}' AND user_id='${user_id}' AND member_id='${member_id}'`; 
                }else{
                    var query=`INSERT INTO users_documents(user_id, member_id, appointment_id, document_title, document_file, type, document_date, created_at) 
                    VALUES('${user_id}', '${member_id}', '${appointment_id}','${document_title}' ,'${document_file}' , '${type}',NOW(),NOW())`; 
                }
                console.log(query);
                db.query(query,
                    (err,res)=>{
                        if (err) {
                            logger.error(err.message);
                            return reject(err);
                        }
                        return resolve(res);
                    }); 

            });
     
        });
    }

}
module.exports = Document;