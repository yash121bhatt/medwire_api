const OperaterPermission = require("../models/operaterPermission.model");
const helperQuery = require("../helper/helperQuery");
exports.addPermission = (req, res) => {
  const myurl = req.url;
  if (myurl.charAt(0) === "/") {
    console.log("url", myurl.substring(1));
  }
  const { operator_id, permissions } = req.body;
  if (operator_id == undefined || operator_id == null) return res.status(500).json({
    status_code: "500",
    status: "error",
    message: "operator_id is required!"
  });
  if (permissions == undefined || permissions == null) return res.status(500).json({
    status_code: "500",
    status: "error",
    message: "permissions is required!"
  });
  OperaterPermission.addPermissan(operator_id, permissions, (err, data) => {
    if (err) {
      res.status(500).json({
        status_code: "500",
        status: "error",
        message: "Something went to wrong!",

      });
    }
    if (data) {
      res.status(200).json({
        status_code: "200",
        satus: "success",
        message: "Permision Added Successfully!"
      });
    }
  });
};
exports.showPermission = (req, res) => {
  const { operator_id } = req.body;
  if (operator_id == undefined || operator_id == null) return res.status(500).json({
    status_code: "500",
    status: "error",
    message: "operator_id is required!"
  });

  helperQuery.get({ table: "operator_permission", where: "operator_id=" + operator_id }, (err, data) => {
    if (err) {
      res.status(500).json({
        status_code: "500",
        status: "error",
        message: "Something went to wrong!",

      });
    }
    if (data) {
      res.status(200).json({
        status_code: "200",
        satus: "success",
        message: "Permision Added Successfully!",
        data: data,
      });
    }
  });
};