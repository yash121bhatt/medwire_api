const Document = require("../models/document.model");
const helperQuery = require("../helper/helperQuery");
const helperFunction = require("../helper/helperFunction");
const { async } = require("q");
const moment = require("moment");
const { uploadFileIntoCloudinary } = require("../helper/helper");

exports.add_document = async (req,res) => { 
    const {user_id,member_id,document_title,document_date,type,scan_doc_text} =req.body;
    // const document_file = req.file.filename;
    var document_file = await uploadFileIntoCloudinary(req);
    
    Document.add_document(user_id,member_id,document_title,document_file,document_date,type,scan_doc_text,(err,data)=>{
        if(err){
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code : "200",
                status: "success",
                message : "Added Successfully",
                data: data
            });
            return;
        }
    });
};
exports.list_document = (req, res) => {
    const { user_id,member_id,type} = req.body;
    Document.list_document(user_id,member_id,type, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : "404",
                    status: "error",
                    message: "Data not found"
                });
                return;
            }
            res.status(500).send({
                status_code : "500",
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            let sortedData = data.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.document_date,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.document_date,"yyyymmdd")));
            res.status(200).json({
                status_code:"200",
                status:"success",
                data:sortedData
            });
        }
    });

};
exports.delete_document = (req,res) => { 
    const {id,user_id} =req.body;
    helperQuery.get({table:"users_documents",where:"id="+id+" AND user_id="+user_id},(err,data)=>{
        if (err) {
        console.log(err);
        return;
        }
        if (data) {
            var fileName = data[0].document_file;
            Document.delete_document(id,user_id,(err,data)=>{
                if(err){
                    res.status(500).send({
                        status_code : "500",
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data) {
                    res.status(200).send({
                        status_code : "200",
                        status: "success",
                        message : "Deleted Successfully",
                        data: data
                    });
                    helperFunction.removeFileFromFolder(fileName);
                    return;
                }
            });
        }
    });
};
exports.list_document_six = (req,res)=>{
    const {user_id,member_id} = req.body;
    Document.list_document_six(user_id,member_id,(err,data)=>{
        if(err){
            res.status(500).json({
                status_code:"500",
                status:"error",
                message:"Something went to wrong"
            });
        }
        if(data){
            let sortedData = data.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.document_date,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.document_date,"yyyymmdd")));
            res.status(200).json({
                status_code:"200",
                status:"success",
                data:sortedData
            });   
        }
    });
};
exports.search_document = (req,res)=>{
    const { search,user_id } = req.body;
    if (user_id===undefined || user_id===null) {
        return res.status(500).json({
            status_code:"500",
            status:"error",
            message:"user_id is required!"
        });   
    }
    
    Document.search_document(search,user_id,(err,data)=>{
        if(err)
        {
            res.status(500).json({
                status_code:"500",
                status:"error",
                message:"somethine went to wrong"
            });
        }
        if(data)
        {
            const response = [];
            for(const item of data)
            {
                const id = item.id !=null ? item.id : "";
                const profile_image = item.profile_image !=null ? item.profile_image : "";
                const profile = item.profile_image !=null ? process.env.CLOUDINARY_BASE_URL+"member/"+item.profile_image : "";
                const first_name = item.first_name !=null ? item.first_name : "";
                const document_title = item.document_title !=null ? item.document_title : "";
                const document_file = item.document_file !=null ? item.document_file : "";
                const document = item.document_file !=null ? process.env.CLOUDINARY_BASE_URL+"member/"+item.document_file : "";
                const document_date = item.document_date !=null ? item.document_date : "";
                const scan_doc_text = item.scan_doc_text !=null ? item.scan_doc_text : "";
                const document_file_url =helperFunction.is_file_exist(item.document_file );
                const lab_radio_type = helperFunction.check_file_DCM(item.document_file);
                response.push({id,profile_image,profile,first_name,document_title,document_file,document,document_date,scan_doc_text,document_file_url,lab_radio_type});
            }

            let sortedData =[];
            if (search!=undefined && search!="") {
                sortedData = response.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.document_date,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.document_date,"yyyymmdd")));
            } 
            
            res.status(200).json({
                status_code:"200",
                status:"success",
                data:sortedData
            });
        }
    });
};
async function dateConverter(str,duration){
    var date = new Date(str),
    mnth = ("0" + (date.getMonth()+1)).slice(-2),
    day  = ("0" + date.getDate()).slice(-2);
    hours  = ("0" + date.getHours()).slice(-2);
    minutes = ("0" + date.getMinutes()).slice(-2);
    seconds  = ("0" + date.getSeconds()).slice(-2);
    if(duration == "year"){
        return date.getFullYear();
    }
    else if(duration == "month"){
        return ("0" + (date.getMonth()+1)).slice(-2);
    }
    else if(duration == "date"){
        return `${year}/${mnth}/${day} ${hours}:${minutes}:${seconds}`;
    }
 }
exports.searchDocumentTimeline = (req,res)=>{
    const { date,year,month,user_id } = req.body;
    if (user_id===undefined || user_id===null) {
        return res.status(500).json({
            status_code:"500",
            status:"error",
            message:"user_id is required!"
        });   
    }
    if (year===undefined || year===null) {
        return res.status(500).json({
            status_code:"500",
            status:"error",
            message:"year is required!"
        });   
    }
    Document.searchDocumentTimeline(date,year,month,user_id,(err,data)=>{
        if(err){
            res.status(500).json({
                status_code:"500",
                status:"error",
                message:"somethine went to wrong"
            });
        }
        if(data){
            const mapData =[];
            const response =[];
            const years =[];
            const datas = [];
               

            // const monthNames = [
            //     "January", "February", "March", "April", "May", "June",
            //     "July", "August", "September", "October", "November", "December"
            //   ];
            const monthNames = [
                "December", "November", "October", "September", "August",
                "July", "June", "May", "April", "March", "February","January"
              ];
            for (let index = 0; index < monthNames.length; index++) {

                response.push({
                    monthName:monthNames[index],
                    monthData:[]
                });
            }

            for(const item of data){
                if ((item.document_file !=null && item.document_file !="null" && item.document_file !="" && helperFunction.is_file_exist(item.document_file)!=null)|| (item.dcm_document_file!=null && item.dcm_document_file!="null" && item.dcm_document_file!="" && helperFunction.is_file_exist(item.dcm_document_file)!=null)) {
                    console.log(item.document_file !=null || item.dcm_document_file!=null);
                    const month_name = helperFunction.get_Moths(item.document_date);
                    const id = item.id !=null ? item.id : null;
                    const year = helperFunction.get_Full_Year(item.document_date);
                    const profile_image = item.profile_image !=null ? item.profile_image : null;
                    const profile = item.profile_image !=null ? process.env.CLOUDINARY_BASE_URL+"member/"+item.profile_image : null;
                    const first_name = item.first_name !=null ? item.first_name : null;
                    const document_title = item.document_title !=null && item.document_title !="" && item.document_title !="null" ? item.document_title : null;
                    const document_date = item.document_date !=null ? item.document_date : null;
                    const scan_doc_text = item.scan_doc_text !=null ? item.scan_doc_text : null;
                    const document_file_url = helperFunction.is_file_exist(item.document_file);
                    const dcm_document_file_url = item.dcm_document_file !=undefined && item.dcm_document_file !=null ? process.env.APP_URL_DCM+item.dcm_document_file:null;
                    const lab_radio_type = item.lab_radio_type??null;
                    const doc_type = item.type??null;
                    years.push(""+year);
                    mapData.push({id,month_name,year,profile_image,profile,first_name,document_title,document_date,scan_doc_text,document_file_url,dcm_document_file_url,lab_radio_type,doc_type});  
                }
            }
            const yeard = helperFunction.removeDuplicatesInArray(years).slice().sort((a,b)=>b-a);

            let sortedData = mapData.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.document_date,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.document_date,"yyyymmdd")));
            if (year!=undefined && year!=null && year!="" && month!=undefined && month!=null && month!="") {
                var filteredData = sortedData.filter((udoc) => {
                    var valid =
                    helperFunction.get_Moths(udoc.document_date)!=undefined && 
                    helperFunction.get_Moths(udoc.document_date)!=NaN &&
                    helperFunction.get_Moths(udoc.document_date)!=null && 
                    helperFunction.get_Full_Year(udoc.document_date)!=undefined && 
                    helperFunction.get_Full_Year(udoc.document_date)!=NaN &&
                    helperFunction.get_Full_Year(udoc.document_date)==year &&  
                    helperFunction.get_Moths(udoc.document_date)==month; 
                    if (valid) {
                        return true;
                    }
                });
            }else if (year!=undefined && year!=null && year!=""){
                var filteredData = sortedData.filter((udoc) =>{
                    var valid = 
                    helperFunction.get_Moths(udoc.document_date)!=undefined &&
                    helperFunction.get_Full_Year(udoc.document_date)!=NaN &&
                    helperFunction.get_Full_Year(udoc.document_date)!=undefined &&
                    helperFunction.get_Full_Year(udoc.document_date)==year;
                    if (valid) {
                       return true; 
                    }
                });
            }else{
                var filteredData = sortedData.filter((udoc) =>{
                    var valid = 
                    helperFunction.get_Moths(udoc.document_date)!=undefined &&
                    helperFunction.get_Full_Year(udoc.document_date)!=NaN &&
                    helperFunction.get_Full_Year(udoc.document_date)!=undefined;
                    if (valid) {
                       return true; 
                    }
                });
            }

            for (let yr = 0; yr < yeard.length; yr++) {
                datas.push(
                    {
                    yearName:yeard[yr],
                    yearData:[]
                });
            }

            for (const iterator of filteredData) {
                for (const rpn of response) {
                    if (rpn.monthName==iterator.month_name) {
                        rpn.monthData.push(iterator);
                    }
                }
            }
            
            for (const dataI of datas) {
                for (const iter of response) {
                    for (const m of iter.monthData) {
                        if (dataI.yearName==m.year) {
                            dataI.yearData.push(iter);
                        }
                    }
                }
            }

            // const uniqueData = [];
            // for (const iterator of datas) {
            //     const yrD = iterator.yearData.reduce((unique, o) => {
            //     if (!unique.some((obj) => obj.monthName === o.monthName)) {
            //       unique.push(o);
            //     }
            //     return unique;
            //   }, []);
            //   uniqueData.push({yearName:iterator.yearName,yearData:yrD});
            // }

            for (const iterator of datas) {
                const obj = {};

                for (let i = 0, len = iterator.yearData.length; i < len; i++) {
                obj[iterator.yearData[i]["monthName"]] = iterator.yearData[i];
                }

                iterator.yearData = new Array();

                for (const key in obj) { 
                iterator.yearData.push(obj[key]);
                }
            }
            
            
            
            res.status(200).json({
                status_code:"200",
                status:"success",
                years:yeard,
                data:datas,
                // data:uniqueData
            });
        }
    });
};
exports.latestTestDocs = async(req,res)=>{
    try {
        const {user_id,member_id,type} = req.body;
        const vali = helperFunction.customValidater(req,{user_id,member_id,type});
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await Document.latestTestDocs(user_id,member_id,type);
        const response = [];
        result.map((item)=>{
            response.push({
                created_at:item.created_at??null,
                document_date:item.document_date??null,
                document_description:item.document_description??null,
                document_file:item.document_file??null,
                document_title:item.document_title??null,
                first_name:item.first_name??null,
                id:item.id??null,
                member_id:item.member_id??null,
                profile_image:item.profile_image??null,
                role_id:item.role_id??null,
                dcm_document : item.dcm_document_file??null,
                dcm_document_url : item.dcm_document_file!=null ? process.env.APP_URL_DCM + "/" +item.dcm_document_file:"",
                document_file_url:helperFunction.is_file_exist(item.document_file),
                lab_radio_type:item.lab_radio_type??null,
                type:item.type??null,
            });
        });
        
        let sortedData = response.slice().sort((a, b) =>parseInt(helperFunction.dateFormat(b.document_date,"yyyymmdd")) - parseInt(helperFunction.dateFormat(a.document_date,"yyyymmdd")));
        
        return res.status(200).json({
            status_code:"200",
            status:"success",
            message:"Seccessfully!",
            data:sortedData
        });   

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code:"500",
            status:"errr",
            message:"something went to wrong!",
        });
    }
};