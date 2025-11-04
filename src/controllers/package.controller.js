const { async } = require("q");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const Package = require("../models/package.model");

exports.create = (req,res)=>{
   
    const {lab_id, test_category_id,package_name, description, amount} = req.body;
    const image = req.file!=undefined && req.file.filename!=undefined ? req.file.filename:null;
    const test_report_time = req.body.test_report_time!=undefined ? req.body.test_report_time:null;
    const tasting_time = req.body.tasting_time!=undefined ? req.body.tasting_time:null;
    const test_recommended = req.body.test_recommended!=undefined ?req.body.test_recommended:null;
    const test_id = req.body.test_id!=undefined ?req.body.test_id:null;
    const test_name = req.body.test_name!=undefined ?req.body.test_name:null;
    
    const vali = helperFunction.customValidater(req,{lab_id, test_category_id, package_name, description, amount});
    if (vali) {
        return res.status(500).json(vali);
    }
    // if (test_id) {
    //     if (Array.isArray(JSON.parse(test_id))!=true) {
    //         return res.status(500).json({
    //             status_code:500,
    //             status:"error",
    //             message:"test_id must be array and interger id!",
    //         });
    //     }
    // }
    
    Package.create(lab_id, test_category_id, test_id,test_name, package_name, test_report_time, tasting_time, test_recommended, description, image, amount,(err,data)=>{
        if (err) {
            return res.status(500).json({
                status_code:"500",
                status:"error",
                message:err
            });
        }
        res.status(200).json({
            status_code:"200",
            status:"success",
            message:"Add Successfully!",
        });
    });
};
exports.update = (req,res)=>{

    const {package_id,lab_id, test_category_id,package_name, description, amount} = req.body;
    const image = req.file!=undefined && req.file.filename!=undefined ? req.file.filename:null;
    const test_report_time = req.body.test_report_time!=undefined ? req.body.test_report_time:null;
    const tasting_time = req.body.tasting_time!=undefined ? req.body.tasting_time:null;
    const test_recommended = req.body.test_recommended!=undefined ?req.body.test_recommended:null;
    const test_id = req.body.test_id!=undefined ?req.body.test_id:null;
    const test_name = req.body.test_name!=undefined ?req.body.test_name:null;

    const vali = helperFunction.customValidater(req,{package_id,lab_id, test_category_id, package_name, description, amount});
    if (vali) {
        return res.status(500).json(vali);
    }
    // if (test_id) {
    //     if (Array.isArray(JSON.parse(test_id))!=true) {
    //         return res.status(500).json({
    //             status_code:500,
    //             status:"error",
    //             message:"test_id must be array and interger id!",
    //         });
    //     }
    // }
    
    Package.update(test_category_id, test_id,test_name, package_name, test_report_time, tasting_time, test_recommended, description, image, amount,lab_id,package_id,(err,data)=>{
        if (err) {
            return res.status(500).json({
                status_code:"500",
                status:"error",
                message:err
            });
        }
        res.status(200).json({
            status_code:"200",
            status:"success",
            message:"Package Edit Successfully!",
        });
    });
};
exports.list = async (req,res)=>{
    try {
        const {lab_id} = req.body;
        const data = await Package.list(lab_id);
        const responses = [];
         if (data.length>0) {
            
            for (const item of data) {
                const arr =JSON.parse(item.test_id);

                const package_id  = item.package_id !=undefined ? item.package_id:null;
                const lab_id  = item.lab_id !=undefined ? item.lab_id:null;
                const test_id  = item.test_id !=undefined ? item.test_id:null;
                const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
                const amount  = item.amount !=undefined ? item.amount:null;
                const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
                const category_name  = item.category_name !=undefined ? item.category_name:null;  
                const package_name  = item.	package_name !=undefined ? item.	package_name:null;
                const description  = item.description !=undefined ? item.description:null;
                const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
                const images = item.image!=undefined && item.image!=null ? item.image:"-";
                const testData = await Package.ShowWhereIn(arr); 
            

                
                responses.push({package_id,lab_id,test_id,test_category_id,test_recommended,category_name,amount,package_name,description,image,images,testData});
            }
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"Successfully!",
                data:responses,

            });
         }else{
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"Successfully!",
                data:responses,

            });
         }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status_code:"500",
            status:"success",
            message:"Something went to wrong!",
        });
    }
};
exports.Onelist = async (req,res)=>{
    
    try {
        const {lab_id,package_id} = req.body;
        const data = await Package.listOne(lab_id,package_id);
        if (data.length>0) {
            const responses = [];
            for (const item of data) {
                const arr =JSON.parse(item.test_id);

                const package_id  = item.package_id !=undefined ? item.package_id:null;
                const lab_id  = item.lab_id !=undefined ? item.lab_id:null;
                const test_id  = item.test_id !=undefined ? item.test_id:null;
                const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
                const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
                const amount  = item.amount !=undefined ? item.amount:null;
                const category_name  = item.category_name !=undefined ? item.category_name:null;   
                const package_name  = item.	package_name !=undefined ? item.	package_name:null;
                const description  = item.description !=undefined ? item.description:null;
                const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
                const images = item.image!=undefined && item.image!=null ? item.image:"-";
                const testData = await Package.ShowWhereIn(arr); 
                            
                responses.push({package_id,lab_id,test_id,test_category_id,test_recommended,amount,category_name,package_name,description,image,images,testData});
            }
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"Successfully!",
                data:responses,

            });
        }

    } catch (error) {
        res.status(200).json({
            status_code:"200",
            status:"success",
            message:"something went to wrong!",
        });
    }
};
exports.destroy = (req,res)=>{
    const {lab_id,package_id} = req.body;
    helperQuery.destroy({table:"packages",where:"lab_id ="+lab_id+" AND package_id="+package_id},(err,data)=>{
        if (err) {
            return res.status(500).json({
                status_code:"500",
                status:"error",
                message:err
            });
        }

        return res.status(200).json({
            status_code:"200",
            status:"success",
            message:data!=undefined && data.affectedRows==1 ?"Package Delete Successfully!":"There is no data valable Please check Id!",

        });        
    });
};
exports.allPackage = async (req,res)=>{
    try {
        const data = await Package.allPackage();
            const responses = [];
            for (const item of data) {
                const arr =JSON.parse(item?.test_id??"[]");

                const package_id  = item.package_id !=undefined ? item.package_id:null;
                const lab_id  = item.lab_id !=undefined ? item.lab_id:null;
                const labs = await helperQuery.All(`SELECT*FROM users where id ='${lab_id}' AND role_id=3`);
                const lab_name = labs.first_name !=undefined ? labs.first_name:null;
                const test_id  = item.test_id !=undefined ? item.test_id:null;
                const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
                const amount  = item.amount !=undefined ? item.amount:null;
                const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
                const category_name  = item.category_name !=undefined ? item.category_name:null;  
                const package_name  = item.package_name !=undefined ? item.package_name:null;
                const description  = item.description !=undefined ? item.description:null;
                const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
                const images = item.image!=undefined && item.image!=null ? item.image:"-";
                const testDatas = await Package.ShowWhereIn(arr);
                const totalTest = testDatas.length; 
                const testData = [];
                for (const iterator of testDatas) {
                    
                    const test_idA = iterator.test_id !=undefined ? iterator.test_id:null;
                    const test_name = iterator.test_name !=undefined ? iterator.test_name:null;
                    const test_category_id = iterator.test_category_id !=undefined ? iterator.test_category_id:null;
                    const cats = await helperQuery.All(`SELECT*FROM test_categories where cat_id ='${test_category_id}'`);
                    const test_category_name = cats.category_name !=undefined ? cats.category_name:null;
                    const test_report = iterator.test_report !=undefined ? iterator.test_report:null;
                    const fast_time = iterator.fast_time !=undefined ? iterator.fast_time:null;
                    const test_recommended = iterator.test_recommended !=undefined ? iterator.test_recommended:null;
                    const image = iterator.image !=undefined ? iterator.image:null;
                    const description = iterator.description !=undefined ? iterator.description:null;
                    const amount = iterator.amount !=undefined ? iterator.amount:null;
                    testData.push({test_idA,test_name,test_category_id,test_report,fast_time,test_recommended,image,description,amount,test_category_name});
                } 
                responses.push({package_id,lab_id,lab_name,test_id,test_category_id,test_recommended,amount,category_name,package_name,description,image,images,totalTest,testData});
            }
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"Successfully!",
                data:responses,

            });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status_code:"500",
            status:"error",
            message:"something went to wrong!",
        });
    }
    
};
exports.alltest = async (req,res)=>{
    try {
        const {lab_name,test_name,role_id} = req.body;
        const  pin_code=req.body.pin_code!=undefined && req.body.pin_code!="undefined" ? req.body.pin_code:"";
        const data = await Package.alltest(lab_name,test_name,pin_code,role_id);
           
        const responses = [];
            for (const item of data) {
                const arr =JSON.parse(item.test_id);

                const test_id  = item.test_id !=undefined ? item.test_id:null;
                const test_name  = item.test_name !=undefined ? item.test_name:null;
                const lab_id  = item.id !=undefined ? item.id:null;
                const lab_name = item.first_name !=undefined ? item.first_name:null;
                const test_report = item.test_report !=undefined ? item.test_report:null;
                const fast_time = item.fast_time !=undefined ? item.fast_time:null;
                const description  = item.description !=undefined ? item.description:null;
                const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
                const amount  = item.amount !=undefined ? item.amount:null;
                const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
                const category_name  = item.category_name !=undefined ? item.category_name:null;  
                const cat_id  = item.cat_id !=undefined ? item.cat_id:null;
                const address  = item.address !=undefined ? item.address:null;
                const pin_code  = item.pin_code !=undefined ? item.pin_code:null;
                const email  = item.email !=undefined ? item.email:null;
                const lab_opening_time  = item.opening_time !=undefined ? item.opening_time:null;
                const lab_closing_time  = item.closing_time !=undefined ? item.closing_time:null;
                const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
                const images = item.image!=undefined && item.image!=null ? item.image:"-";
                const created_at  = item.created_at !=undefined ? item.created_at:null;
                const updated_at  = item.updated_at !=undefined ? item.updated_at:null; 
                responses.push({test_id,test_name,lab_id,lab_name,test_report,fast_time,description,test_recommended,amount,test_recommended,amount,test_category_id,category_name,cat_id,address,pin_code,email,lab_opening_time,lab_closing_time,image,images,created_at,updated_at});
            }
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"Successfully!",
                data:responses,

            });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status_code:"500",
            status:"error",
            message:"something went to wrong!",
        });
    }
    
};
//29/11/2022 new test
exports.allPackageTest = async(req,res)=>{
    try {
        const {lab_name,test_name,package_name,role_id} = req.body;
        
        const pcode = await helperQuery.All(`SELECT*FROM users WHERE id='${req.userId??0}' LIMIT 1`);
        if ((lab_name!=undefined && lab_name!="")  || (test_name!=undefined && test_name!="") || (package_name!=undefined && package_name!="")) {

            if (package_name!=undefined && package_name!="") {
                var tpincode=req.body.pin_code!=undefined && req.body.pin_code!="undefined" && req.body.pin_code!="" ? req.body.pin_code:pcode!=undefined && pcode.length>0 && pcode[0]?.pin_code!=null ? pcode[0]?.pin_code:"null";
                var pincode=req.body.pin_code!=undefined && req.body.pin_code!="undefined" && req.body.pin_code!="" ? req.body.pin_code:"";
    
            }else if (test_name!=undefined && test_name!="") {
                var tpincode=req.body.pin_code!=undefined && req.body.pin_code!="undefined" && req.body.pin_code!="" ? req.body.pin_code:"";
                var pincode=pcode!=undefined && req.body.pin_code!="undefined" && req.body.pin_code!="" ? req.body.pin_code:pcode!=undefined && pcode.length>0 && pcode[0]?.pin_code!=null ? pcode[0]?.pin_code:"null";
         
            }
            else {

                var pincode=req.body.pin_code!=undefined && req.body.pin_code!="undefined" && req.body.pin_code!="" ? req.body.pin_code:"";
                var tpincode =pincode;

            }
        } else {
            var tpincode=req.body.pin_code!=undefined && req.body.pin_code!="undefined" && req.body.pin_code!="" ? req.body.pin_code:pcode!=undefined && pcode.length>0 && pcode[0]?.pin_code!=null ? pcode[0]?.pin_code:"null";
            var pincode=tpincode;
   
        }
        
        const data = await Package.allTests({lab_name,test_name,tpincode,role_id});
        
        const responses = [];
        for (const item of data) {
            const arr =JSON.parse(item.test_id);

            const test_id  = item.test_id !=undefined ? item.test_id:null;
            const test_name  = item.test_name !=undefined ? item.test_name:null;
            const lab_id  = item.id !=undefined ? item.id:null;
            const lab_name = item.first_name !=undefined ? item.first_name:null;
            const test_report = item.test_report !=undefined ? item.test_report:null;
            const fast_time = item.fast_time !=undefined ? item.fast_time:null;
            const description  = item.description !=undefined ? item.description:null;
            const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
            const amount  = item.amount !=undefined ? item.amount:null;
            const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
            const category_name  = item.category_name !=undefined ? item.category_name:null;  
            const cat_id  = item.cat_id !=undefined ? item.cat_id:null;
            const address  = item.address !=undefined ? item.address:null;
            const pin_code  = item.pin_code !=undefined ? item.pin_code:null;
            const email  = item.email !=undefined ? item.email:null;
            const lab_opening_time  = item.opening_time !=undefined ? item.opening_time:null;
            const lab_closing_time  = item.closing_time !=undefined ? item.closing_time:null;
            const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
            const images = item.image!=undefined && item.image!=null ? item.image:"-";
            const created_at  = item.created_at !=undefined ? item.created_at:null;
            const updated_at  = item.updated_at !=undefined ? item.updated_at:null; 
            responses.push({test_id,test_name,lab_id,lab_name,test_report,fast_time,description,test_recommended,amount,test_recommended,amount,test_category_id,category_name,cat_id,address,pin_code,email,lab_opening_time,lab_closing_time,image,images,created_at,updated_at});
        }
        const datap = await Package.allPackages({lab_name,package_name,pincode,role_id});
        const response = [];
        for (const item of datap) {
            const arr =JSON.parse(item?.test_id??"[]");

            const package_id  = item.package_id !=undefined ? item.package_id:null;
            const lab_id  = item.lab_id !=undefined ? item.lab_id:null;
            const labs = await helperQuery.All(`SELECT*FROM users where id ='${lab_id}' AND role_id=3`);
            const lab_name = labs.first_name !=undefined ? labs.first_name:null;
            const address  = item.address !=undefined ? item.address:null;
            const test_id  = item.test_id !=undefined ? item.test_id:null;
            const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
            const amount  = item.amount !=undefined ? item.amount:null;
            const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
            const category_name  = item.category_name !=undefined ? item.category_name:null;  
            const package_name  = item.package_name !=undefined ? item.package_name:null;
            const description  = item.description !=undefined ? item.description:null;
            const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
            const images = item.image!=undefined && item.image!=null ? item.image:"-";
            const testDatas = await Package.ShowWhereIn(arr);
            const totalTest = testDatas.length; 
            const testData = [];
            for (const iterator of testDatas) {
                
                const test_idA = iterator.test_id !=undefined ? iterator.test_id:null;
                const test_name = iterator.test_name !=undefined ? iterator.test_name:null;
                const test_category_id = iterator.test_category_id !=undefined ? iterator.test_category_id:null;
                const cats = await helperQuery.All(`SELECT*FROM test_categories where cat_id ='${test_category_id}'`);
                const test_category_name = cats.category_name !=undefined ? cats.category_name:null;
                const test_report = iterator.test_report !=undefined ? iterator.test_report:null;
                const fast_time = iterator.fast_time !=undefined ? iterator.fast_time:null;
                const test_recommended = iterator.test_recommended !=undefined ? iterator.test_recommended:null;
                const image = iterator.image !=undefined ? iterator.image:null;
                const description = iterator.description !=undefined ? iterator.description:null;
                const amount = iterator.amount !=undefined ? iterator.amount:null;
                testData.push({test_idA,test_name,test_category_id,test_report,fast_time,test_recommended,image,description,amount,test_category_name});
            } 
            response.push({package_id,lab_id,lab_name,test_id,test_category_id,test_recommended,amount,category_name,package_name,description,image,images,totalTest,testData,address});
        }
        res.status(200).json({
            status_code:"200",
            status:"success",
            message:responses.length>0 ? "Successfully!":"Opps! There is no tests or packages in your area. Please search",
            data:responses,
            datapackage:response

        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status_code:"500",
            status:"error",
            message:"something went to wrong!",
        });
    }
};

exports.singlePackage = async (req,res)=>{
    try {
        const {package_id} = req.body;
        const data = await Package.singlePackage(package_id);

            const responses = [];
            for (const item of data) {
                const arr =JSON.parse(item.test_id);

                const package_id  = item.package_id !=undefined ? item.package_id:null;
                const lab_id  = item.lab_id !=undefined ? item.lab_id:null;
                const labs = await helperQuery.All(`SELECT*FROM users where id ='${lab_id}' AND role_id=3`);
                const lab_name = labs.first_name !=undefined ? labs.first_name:null;
                const test_id  = item.test_id !=undefined ? item.test_id:null;
                const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
                const amount  = item.amount !=undefined ? item.amount:null;
                const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
                const category_name  = item.category_name !=undefined ? item.category_name:null;  
                const package_name  = item.	package_name !=undefined ? item.	package_name:null;
                const description  = item.description !=undefined ? item.description:null;
                const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
                const images = item.image!=undefined && item.image!=null ? item.image:"-";
                const testDatas = await Package.ShowWhereIn(arr);
                const totalTest = testDatas.length;  
                const testData = [];
                for (const iterator of testDatas) {
                    
                    const test_idA = iterator.test_id !=undefined ? iterator.test_id:null;
                    const test_name = iterator.test_name !=undefined ? iterator.test_name:null;
                    const test_category_id = iterator.test_category_id !=undefined ? iterator.test_category_id:null;
                    const cats = await helperQuery.All(`SELECT*FROM test_categories where cat_id ='${test_category_id}'`);
                    const test_category_name = cats.category_name !=undefined ? cats.category_name:null;
                    const test_report = iterator.test_report !=undefined ? iterator.test_report:null;
                    const fast_time = iterator.fast_time !=undefined ? iterator.fast_time:null;
                    const test_recommended = iterator.test_recommended !=undefined ? iterator.test_recommended:null;
                    const image = iterator.image !=undefined ? iterator.image:null;
                    const description = iterator.description !=undefined ? iterator.description:null;
                    const amount = iterator.amount !=undefined ? iterator.amount:null;
                    testData.push({test_idA,test_name,test_category_id,test_report,fast_time,test_recommended,image,description,amount,test_category_name});
                } 
                responses.push({package_id,lab_id,lab_name,test_id,test_category_id,test_recommended,amount,category_name,package_name,description,image,images,totalTest,testData});
            }
            res.status(200).json({
                status_code:"200",
                status:"success",
                message:"Successfully!",
                data:responses,

            });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status_code:"500",
            status:"error",
            message:"something went to wrong!",
        });
    }
    
};
exports.singleTest = async (req,res)=>{
    try {
        const {test_id} = req.body;
        const data = await Package.singleTest(test_id);

        const responses = [];
        for (const item of data) {
            const arr =JSON.parse(item.test_id);

            const test_id  = item.test_id !=undefined ? item.test_id:null;
            const test_name  = item.test_name !=undefined ? item.test_name:null;
            const lab_id  = item.id !=undefined ? item.id:null;
            const lab_name = item.first_name !=undefined ? item.first_name:null;
            const test_report = item.test_report !=undefined ? item.test_report:null;
            const fast_time = item.fast_time !=undefined ? item.fast_time:null;
            const description  = item.description !=undefined ? item.description:null;
            const test_recommended  = item.test_recommended !=undefined ? item.test_recommended:null;
            const amount  = item.amount !=undefined ? item.amount:null;
            const test_category_id  = item.test_category_id !=undefined ? item.test_category_id:null;
            const category_name  = item.category_name !=undefined ? item.category_name:null;  
            const cat_id  = item.cat_id !=undefined ? item.cat_id:null;
            const address  = item.address !=undefined ? item.address:null;
            const pin_code  = item.pin_code !=undefined ? item.pin_code:null;
            const email  = item.email !=undefined ? item.email:null;
            const lab_opening_time  = item.opening_time !=undefined ? item.opening_time:null;
            const lab_closing_time  = item.closing_time !=undefined ? item.closing_time:null;
            const image = item.image!=undefined && item.image!=null ? process.env.APP_URL+"laboratory/"+item.image:"-";
            const images = item.image!=undefined && item.image!=null ? item.image:"-";
            const created_at  = item.created_at !=undefined ? item.created_at:null;
            const updated_at  = item.updated_at !=undefined ? item.updated_at:null; 
            const user_role_id  = item.user_role_id !=undefined ? item.user_role_id:null;
            responses.push({test_id,test_name,lab_id,lab_name,test_report,fast_time,description,test_recommended,amount,test_recommended,amount,test_category_id,category_name,cat_id,address,pin_code,email,lab_opening_time,lab_closing_time,image,images,created_at,updated_at,user_role_id});
        }   
        res.status(200).json({
            status_code:"200",
            status:"success",
            message:"Successfully!",
            data:responses,

        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status_code:"500",
            status:"error",
            message:"something went to wrong!",
        });
    }
    
};