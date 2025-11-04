const db = require("../config/db.config");
class settingContent {
    static getSettingContent({meta_key}){
       
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM setting_contents WHERE meta_key='${meta_key}' ORDER BY id DESC LIMIT 1`,
            (err,res)=>{
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
module.exports = settingContent;