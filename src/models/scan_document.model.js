const db = require("../config/db.config");
const { logger } = require("../utils/logger");
class scanDocument {
    static create(member_id,title,doc_date,document_name,description,cb)
    {
        db.query("insert into scan_documents(member_id,title,doc_date,document_name,description,created_at) values(?,?,?,?,?,NOW())",
        [member_id,title,doc_date,document_name,description],
        (err,res)=>{
            if(err)
            {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static searchDoc(search,cb)
    {
        db.query("SELECT * FROM scan_documents where (description LIKE '%make%')",
        [search],
        (err,res)=>{
            if(err)
            {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static scanDocList(cb)
    {
        db.query("SELECT * FROM scan_documents",
        (err,res)=>{
            if(err)
            {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
}
module.exports = scanDocument;
