const helperFunction = require("../helper/helperFunction");
const Laboratory = require("../models/laboratory.model");
const helperQuery = require("../helper/helperQuery");



exports.labRadioCountDetail = async (req, res) => {
	const { user_id } = req.body;

	const valid = helperFunction.customValidater(req, {user_id});
	if (valid) {
		return res.status(404).json(valid);
	}
	let data = {};
	let today_patients = await Laboratory.labRadioCountPatientDetail(user_id,'today');
	let total_patients = await Laboratory.labRadioCountPatientDetail(user_id,'');
	let today_appiontments = await Laboratory.labRadioCountAppointmentDetail(user_id,'today');
	let total_appiontments = await Laboratory.labRadioCountAppointmentDetail(user_id,'');


	data.today_patient =  today_patients.today_patients;
	data.total_patient =  total_patients.total_patients;
	data.today_appiontments =  today_appiontments.today_appiontments;
	data.total_appiontments =  total_appiontments.total_appiontments;
	return res.status(200).send({
		status_code: "200",
		status: "success",
		data: data
	});
};

exports.memberSearch = (req, res) => {
  const { mobile } = req.body;
  const role_id = 2;
  Laboratory.memberfindByMobileWithRole(
    { mobile, role_id },
    async (err, data) => {
      try {
        if (!helperFunction.isEmptyObject(data)) {
          const id = data.id;
          // console.log(id,data);
          var subuser = await helperQuery.Get({
            table: "users",
            where: "created_by_id =" + id,
          });
          const response = [];
          for (const item of subuser) {
            const id = item.id;
            const imgName = item.profile_image;
            const img = process.env.APP_URL + "member/" + imgName;
            const first_name = item.first_name;
            const last_name = item.last_name;
            const mobile = item.mobile;
            const adhar_card = item.adhar_card;
            const date_of_birth = item.date_of_birth;
            const gender = item.gender;
            response.push({
              id,
              first_name,
              last_name,
              mobile,
              adhar_card,
              date_of_birth,
              gender,
              img,
              imgName,
            });
          }
          res.status(200).send({
            status_code: "200",
            status: "success",
            message:"Patient Searched Successfully!",
            parentuser: data,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
            subuser: response,
          });
          return;
        }
        console.log(data);
        res.status(200).send({
          status_code: "200",
          status: "success",
          message:"No data found!",
          parentuser: [],
          subuser: [],
        });
      } catch (error) {
        console.log(error.message);
        res.status(500).send({
          status_code: "500",
          status: "error",
          message: "something went to wrong!",
        });
        return;
      }
    }
  );
};
exports.newVisit = (req, res) => {
  const { mobile, lab_id, member_id, category, sub_category } = req.body;

  const valid = helperFunction.customValidater(req, {
    mobile,
    lab_id,
    member_id,
    category,
    sub_category,
  });
  if (valid) {
    return res.status(404).json(valid);
  }
  if (Array.isArray(sub_category) == true) {
    var sub_categor = JSON.stringify(sub_category);
  } else {
    var sub_categor = sub_category;
  }
  Laboratory.newVisit(
    mobile,
    lab_id,
    member_id,
    category,
    sub_categor,
    async (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            status_code: "404",
            status: "error",
            message: `Data Not Exist`,
          });
          return;
        }
        res.status(500).send({
          status_code: "500",
          status: "error",
          message: err.message,
        });
        return;
      }
      if (data) {
        res.status(200).send({
          status_code: "200",
          status: "success",
          data: data,
        });
        return;
      }
    }
  );
};
exports.visitList = (req, res) => {
  const { lab_id } = req.body;
  Laboratory.visitList(lab_id, async (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          status_code: "404",
          status: "error",
          message: `Data Not Exist`,
        });
        return;
      }
      res.status(500).send({
        status_code: "500",
        status: "error",
        message: err.message,
      });
      return;
    }
    if (data) {
      res.status(200).send({
        status_code: "200",
        status: "success",
        data: data,
      });
      return;
    }
  });
};
exports.uploadReport = (req, res) => {
  const { visit_id, type } = req.body;
  const valid = helperFunction.customValidater(req, { visit_id, type });
  if (valid) {
    return res.status(404).json(valid);
  }
  const report_document = req.file.filename;

  Laboratory.uploadReport(visit_id,report_document,type,async (err, data) => {
      if (err) {
        if (err.kind) {
          if (err.kind === "not_found") {
            var message = `Data Not Exist`;
          }
          if (err.kind === "plan_limit_reached") {
            var message = `Sorry! You plan limit has been expire`;
          }
          if (err.kind === "no_plan_found") {
            var message = `Sorry! You don't have plan.please purchase plan`;
          }
          if (err.kind === "no_default_plan_found") {
            var message = `Sorry! No default plan Added yet`;
          }
          console.log(err);
          return res.status(404).send({
            status_code: "404",
            status: "error",
            message: message,
          });
        }else{
          console.log(err);
          return res.status(500).send({
            status_code: "500",
            status: "error",
            message: err.message,
          });
        }
      }
      if (data) {
        console.log(data);
        res.status(200).send({
          status_code: "200",
          status: "success",
          data: data,
          message:"Report Uploaded and Sent Successfully to Patient"
        });
        return;
      }
    }
  );
};
exports.latestTestReport = (req, res) => {
  const { member_id } = req.body;
  Laboratory.latestTestReport(member_id, (err, data) => {
    if (err) {
      res.status(500).json({
        status_code: "500",
        status: "error",
        message: err,
      });
    }
    if (data) {
      res.status(200).json({
        status_code: "200",
        status: "success",
        data: data,
      });
    }
  });
};
exports.testReport = (req, res) => {
	const { member_id } = req.body;
	Laboratory.testReport(member_id, (err, data) => {
		if (err) {
			res.status(500).json({status_code: "500",status: "error",message: err});
		}
		if (data) {
			const response = [];
			for (const item of data) {
				const id = item.id != null ? item.id : "";
				const role_id = item.role_id != null ? item.role_id : "";
				const first_name = item.first_name != null ? item.first_name : "";
				const profile_image = item.profile_image != null ? item.profile_image : "";
				const profile = item.profile_image != null	? process.env.APP_URL + "member/" + item.profile_image	: "";
				const created_at = item.created_at != null ? item.created_at : "";
				const sub_category = item.sub_category != null ? item.sub_category : "";
				const category = item.category != null ? item.category : "";
				const mobile = item.mobile != null ? item.mobile : "";
				const report_document =	item.report_document != null ? item.report_document : "";
        const dcm_document = item.dcm_document??null;
        const dcm_document_url = item.dcm_document!=null ? process.env.APP_URL_DCM + "/" +item.dcm_document:"";
				const document = item.report_document != null ? process.env.APP_URL + "laboratory/" + item.report_document	: "";
				const member_id = item.member_id != null ? item.member_id : "";
				const type = item.type != null ? item.type : "";

				response.push({id,role_id,first_name,profile_image,profile,created_at,sub_category,category,mobile,report_document,document,member_id,dcm_document,dcm_document_url,type});
			}
			res.status(200).json({status_code: "200",status: "success",	data: response});
		}
	});
};
async function fileValidate(docFiles) {
  const docFileData = [];
  const docFile = docFiles.split("_");
  if (docFile.length < 2) {
      return;
  }
  if (docFile[0].length < 10) {
      return;
  }
  const docFileName = docFile[1].split(".");
  if (docFileName.length < 2) {
      return;
  }
  const mobile_no = docFile[0];
  const user_name = docFileName[0];

  docFileData.push(mobile_no);
  docFileData.push(user_name);

  var get_user = await helperQuery.Get({table:"users",where:"mobile ="+mobile_no});
  
  if(get_user.length > 0){
      return docFileData;
  }
  else{
      return;
  }  
}
exports.uploadReportMultiple = async (req, res) => {
  const { lab_id, type } = req.body;
  const valid = helperFunction.customValidater(req, { lab_id, type });
  if (valid) {
      return res.status(400).json(valid);
  }

  if (req.files.length>0) {
      const notUpload = [];

      for (const item of req.files) 
      {
          let originalname = item.originalname;
          const docval = await fileValidate(originalname);
          if (docval != undefined && docval.length > 1)
          {
              const report_document = item.filename;
              console.log(report_document);
              const mobile_name = originalname.split("_");
              const mobile = mobile_name[0];
              let nameWithExt = mobile_name[1].split(".");
              const full_name = nameWithExt[0];
              Laboratory.memberfindByMobile(mobile, async (err, data) => 
              {
                console.log(data);
                      if (data == undefined) 
                      {
                          notUpload.push(originalname);
                      } else {
                          const id = data.id;
                          if (mobile == data.mobile) { 
                            var member_id = data.id;
                              Laboratory.findVisitId(member_id, lab_id, async (err, data) => {
                                  if (data != undefined || data != null) {
                                      const visit_id = data.id;
                                      Laboratory.uploadReport(visit_id, report_document, type, async (err, data) => { });
                                  }
                                  else {
                                      notUpload.push(originalname);
                                      //console.log("member_id is not fun");
                                  }
                              });
                          } else {
                          Laboratory.memberfindByName(full_name, id, async (err, data) => {
                              if (data) {
                              var member_id = data.id;
                              Laboratory.findVisitId(member_id,lab_id,async (err, data) => {
                                      if (data != undefined || data != null) {
                                          const visit_id = data.id;
                                          Laboratory.uploadReport(visit_id, report_document, type, async (err, data) => { });
                                      } else {
                                          notUpload.push(originalname);
                                      }
                                  });
                              } else {
                              notUpload.push(originalname);
                              }
                          });
                      }
                  }
              });
          } else {
              notUpload.push(originalname);
          }
      }
      if (req.files.length == notUpload.length) {
          return res.status(500).send({
              status_code: "500",
              status: "error",
              notUploadedFile: {
              status_code: "500",
              status: "error",
              notUploadedFile: notUpload,
              },
          });
      }
      res.status(200).send({
          status_code: "200",
          status: "File uploaded Successfully!",
          notUploadedFile: {
              status_code: "500",
              status: "error",
              notUploadedFile: notUpload,
          },
      });
      return true;
  }
};
