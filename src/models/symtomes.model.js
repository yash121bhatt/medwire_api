const db = require('../config/db.config');
const helperQuery = require('../helper/helperQuery');
const { logger } = require('../utils/logger');
class Symtomes {
    
    
    static createSymtomes(user_id,member_id,symtomeslist, cb) {
        db.query(`INSERT INTO symtomes(member_id, user_id,symtomeslist) VALUES(?,?,?) `,
            [
                user_id,member_id,symtomeslist  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static findSymtomesId(user_id,member_id, cb) {
        db.query(`SELECT id, member_id, user_id, symtomeslist, created_at, updated_at FROM symtomes WHERE member_id=${user_id} AND user_id =${member_id} `,
            [
                user_id,member_id  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }

    static updateSymtomes(user_id,member_id,symtomeslist, cb) {
        db.query(`UPDATE symtomes SET  member_id = ?, user_id = ?, symtomeslist=?, updated_at=NOW() WHERE member_id=${user_id} AND user_id =${member_id}`,
            [
                user_id,member_id,symtomeslist  
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, res);
        });
    }
   //new api
   static defaultSymptomList(user_id,member_id,cb)
   {
       db.query(`SELECT symtomes_item.id,symtomes_item.symtom_image,symtomes_item.symptom_name,symtomes_category.category_name,symptom_user.status as symptom_status,symptom_user.created_at,symptom_user.updated_at FROM symtomes_item JOIN symtomes_category on symtomes_item.category_id = symtomes_category.id
       LEFT JOIN symptom_user on symptom_user.user_id='${user_id}' and symptom_user.member_id='${member_id}' and symtomes_item.id=symptom_user.symptom_id
       ORDER BY symtomes_category.category_name DESC`,
       [user_id,member_id],(err,res)=>{
           if (err) {
               logger.error(err.message);
               cb(err,null);
               return;
           }
           cb(null,res);
       })
   }
   static addUserSymptom(user_id,member_id,symptom_id,status,cb)
    {
        helperQuery.get({table:'symptom_user',where:'user_id='+user_id+' AND member_id='+member_id+' AND symptom_id ='+symptom_id},(err,data)=>{
            if(data)
            {
                if (data.length>0) {
                    var qu =`UPDATE symptom_user SET status ='${status}', updated_at=NOW() WHERE user_id='${user_id}' AND member_id='${member_id}' AND symptom_id='${symptom_id}'`;
                }else{
                    var qu =`INSERT INTO symptom_user( user_id, member_id, symptom_id, status, created_at,updated_at) VALUES(?,?,?,'${status}',NOW(),NOW())`;
                }
                db.query(qu,
                [user_id,member_id,symptom_id,status],(err,res)=>{
                    if (err) {
                        logger.error(err.message);
                        cb(err,null);
                        return;
                    }
                    cb(null,res);
                })
            }
        })
        
    }

   
}
module.exports = Symtomes;