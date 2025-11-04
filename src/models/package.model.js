const db = require("../config/db.config");
const { logger } = require("../utils/logger");

class Package {
    static create(lab_id, test_category_id, test_id, test_name, package_name, test_report_time, tasting_time, test_recommended, description, image, amount,cb)
    {

        db.query(`INSERT INTO packages(lab_id, test_category_id, test_id, test_name, package_name, test_report_time, tasting_time, test_recommended, description, image, amount, created_at) VALUES ('${lab_id}', '${test_category_id}', '${test_id}', '${test_name}' ,'${package_name}', '${test_report_time}', '${tasting_time}', '${test_recommended}', '${description}', '${image}', '${amount}',NOW())`,
        (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static update(test_category_id, test_id, test_name, package_name, test_report_time, tasting_time, test_recommended, description, image, amount,lab_id,package_id,cb)
    {
        const query = image!=undefined && image!="undefined" && image!=null?
        `UPDATE packages SET test_category_id='${test_category_id}', test_id='${test_id}', test_name='${test_name}', package_name='${package_name}', test_report_time='${test_report_time}', tasting_time='${tasting_time}', test_recommended='${test_recommended}', description='${description}', image='${image}', amount='${amount}', updated_at=NOW() WHERE lab_id='${lab_id}' AND package_id='${package_id}'`:
        `UPDATE packages SET test_category_id='${test_category_id}', test_id='${test_id}', test_name='${test_name}', package_name='${package_name}', test_report_time='${test_report_time}', tasting_time='${tasting_time}', test_recommended='${test_recommended}', description='${description}', amount='${amount}', updated_at=NOW() WHERE lab_id='${lab_id}' AND package_id='${package_id}'`; 
        db.query(query,
        (err,res)=>{
            if (err) {
                logger.error(err.message);
                cb(err,null);
                return;
            }
            cb(null,res);
        });
    }
    static list(lab_id)
    {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM packages p JOIN test_categories ct ON p.test_category_id=ct.cat_id  WHERE p.lab_id='${lab_id}' ORDER BY p.package_id desc`,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static listOne(lab_id,package_id)
    {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM packages p JOIN test_categories ct ON p.test_category_id=ct.cat_id  WHERE p.lab_id='${lab_id}' AND  p.package_id='${package_id}' ORDER BY p.package_id`,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static listFirst(lab_id,package_id)
    {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM packages p JOIN test_categories ct ON p.test_category_id=ct.cat_id  WHERE  p.package_id='${package_id}' ORDER BY p.package_id LIMIT 1`,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                if (res) {
                    return resolve(res[0]);
                }
                
            });
        });
    }
    static ShowWhereIn(test_id)
    {
        return new Promise((resolve,reject)=>{
            db.query("SELECT * FROM lab_tests WHERE test_id IN ("+test_id+")",
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static allPackage()
    {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM packages p INNER JOIN test_categories ct ON p.test_category_id=ct.cat_id 
            INNER JOIN users u ON u.id=p.lab_id where u.online_offline_status='1' ORDER BY p.package_id`,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static alltest(lab_name,test_name,pincode,roleid)
    {
        const  pin_code=pincode!=undefined && pincode!="undefined" ? pincode:"";
        const  role_id=roleid!=undefined && roleid!="undefined" && roleid!="" ? roleid:3;         

        if (lab_name!=undefined && lab_name!="" &&  test_name!=undefined &&  test_name!="" && pin_code!="") {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.first_name LIKE '%${lab_name}%') AND labt.test_name = '${test_name}' AND (u.pin_code LIKE '%${pin_code}%') 
            AND u.role_id='${role_id}' AND u.online_offline_status='1' 
            ORDER BY labt.test_id`;
        }
        else if(lab_name!=undefined && lab_name!="" && pin_code!="") {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.first_name LIKE '%${lab_name}%') AND (u.pin_code LIKE '%${pin_code}%')
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        else if(test_name!=undefined &&  test_name!="" && pin_code!="") {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where labt.test_name = '${test_name}' AND (u.pin_code LIKE '%${pin_code}%')
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }  
        else if(lab_name!=undefined && lab_name!="" &&  test_name!=undefined &&  test_name!=""){
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.first_name LIKE '%${lab_name}%') AND labt.test_name = '${test_name}'
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        else if( pin_code!="") {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.pin_code LIKE '%${pin_code}%')
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        else if(lab_name!=undefined && lab_name!=""){
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.first_name LIKE '%${lab_name}%') 
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        else if(test_name!=undefined && test_name!=""){
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where labt.test_name = '${test_name}'
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        else if(test_name!=undefined && test_name!=""){
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where labt.test_name = '${test_name}'
            AND u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        else{
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where u.role_id='${role_id}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
        }
        return new Promise((resolve,reject)=>{
            db.query(qu,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    //new 29/11/2022 package and testes
    static allTests({lab_name,test_name,tpincode,role_id})
    {
   
        const  pin_code=tpincode!=undefined && tpincode!="undefined" ? tpincode:"";
        const  roleid=role_id!=undefined && role_id!="undefined" && role_id!="" ? role_id:3;         
        
        // if ((lab_name!=undefined && lab_name!='') || (test_name!=undefined &&  test_name!='') || (pin_code!='')) {
        //     var qu =`SELECT * FROM 
        //     lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
        //     INNER JOIN users u ON labt.lab_id=u.id 
        //     where (u.first_name LIKE '%${lab_name}%') 
        //     AND (labt.test_name LIKE '%${test_name}%') 
        //     AND (u.pin_code LIKE '%${pin_code}%') 
        //     AND u.role_id='${roleid}' AND u.online_offline_status='1' 
        //     ORDER BY labt.test_id`;
        // }
        // else{
        //     var qu =`SELECT * FROM 
        //     lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
        //     INNER JOIN users u ON labt.lab_id=u.id 
        //     where u.role_id='${roleid}' AND u.online_offline_status='1'
        //     ORDER BY labt.test_id`;
        // }

        if (((lab_name!=undefined && lab_name!="") || (test_name!=undefined &&  test_name!="")) && (pin_code!="" && pin_code!="null" && pin_code!=null)) {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.first_name LIKE '%${lab_name}%') 
            AND (labt.test_name LIKE '%${test_name}%') 
            AND (u.pin_code LIKE '%${pin_code}%') 
            AND u.role_id='${roleid}' AND u.online_offline_status='1' 
            ORDER BY labt.test_id`;


        }
        else if ((lab_name!=undefined && lab_name!="")) {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.first_name LIKE '%${lab_name}%') 
            AND u.role_id='${roleid}' AND u.online_offline_status='1' 
            ORDER BY labt.test_id`;
        }
        else if ( test_name!=undefined &&  test_name!="") {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (labt.test_name LIKE '%${test_name}%') 
            AND u.role_id='${roleid}' AND u.online_offline_status='1' 
            ORDER BY labt.test_id`;

        }
        else if (pin_code!="") {
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where (u.pin_code LIKE '%${pin_code}%') 
            AND u.role_id='${roleid}' AND u.online_offline_status='1' 
            ORDER BY labt.test_id`;

        }
        else{
            var qu =`SELECT * FROM 
            lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
            INNER JOIN users u ON labt.lab_id=u.id 
            where u.role_id='${roleid}' AND u.online_offline_status='1'
            ORDER BY labt.test_id`;
            
        }

        return new Promise((resolve,reject)=>{
            db.query(qu,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static allPackages({lab_name,package_name,pincode,role_id})
    {
        const  pin_code=pincode!=undefined && pincode!="undefined" ? pincode:"";
        const  roleid=role_id!=undefined && role_id!="undefined" && role_id!="" ? role_id:3;         

        if ((lab_name!=undefined && lab_name!="") || (package_name!=undefined &&  package_name!="") || (pin_code!="")) {
            var qu =`SELECT * FROM packages p INNER JOIN 
            test_categories ct ON p.test_category_id=ct.cat_id 
            INNER JOIN users u ON u.id=p.lab_id 
            WHERE u.role_id='${roleid}' 
            AND (u.first_name LIKE '%${lab_name}%') 
            AND (p.package_name LIKE '%${package_name}%') 
            AND (u.pin_code LIKE '%${pin_code}%') 
            AND u.online_offline_status='1' ORDER BY p.package_id`;
        }
        else{
            var qu =`SELECT * FROM packages p INNER JOIN 
            test_categories ct ON p.test_category_id=ct.cat_id 
            INNER JOIN users u ON u.id=p.lab_id where u.role_id='${roleid}' 
            AND u.online_offline_status='1' ORDER BY p.package_id`;
        }
        return new Promise((resolve,reject)=>{
            db.query(qu,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    static singlePackage(package_id)
    {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT * FROM packages p INNER JOIN test_categories ct ON p.test_category_id=ct.cat_id where p.package_id='${package_id}' ORDER BY p.package_id`,
            (err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    static singleTest(test_id)
    {
        var qu =`SELECT *,u.role_id as user_role_id FROM 
        lab_tests labt INNER JOIN test_categories ct ON labt.test_category_id=ct.cat_id 
        INNER JOIN users u ON labt.lab_id=u.id where labt.test_id='${test_id}'
        ORDER BY labt.test_id`;
        return new Promise((resolve,reject)=>{
            db.query(qu,(err,res)=>{
                if (err) {
                    logger.error(err.message);
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

}
module.exports = Package;