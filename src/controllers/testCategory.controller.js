const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const testCategory = require("../models/testcategory.model");

exports.create = (req, res) => {
    const { lab_id, category_name } = req.body;
    var vali = helperFunction.customValidater(req, { lab_id, category_name });
    if (vali) {
        return res.status(500).json(vali);
    }
    testCategory.create(lab_id, category_name, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Added Successfully!"
            });
            return;
        }
    });
};
exports.update = (req, res) => {
    const { cat_id, lab_id, category_name } = req.body;
    var vali = helperFunction.customValidater(req, { cat_id, lab_id, category_name });
    if (vali) {
        return res.status(500).json(vali);
    }
    testCategory.update(category_name, cat_id, lab_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Category Edit Successfully"
            });
            return;
        }
    });
};
exports.delete = (req, res) => {
    const { cat_id, lab_id } = req.body;
    var vali = helperFunction.customValidater(req, { cat_id, lab_id });
    if (vali) {
        return res.status(500).json(vali);
    }
    testCategory.delete(cat_id, lab_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Category Delete Successfully"
            });
            return;
        }
    });
};
exports.show = (req, res) => {
    const { lab_id } = req.body;
    var vali = helperFunction.customValidater(req, { lab_id });
    if (vali) {
        return res.status(500).json(vali);
    }
    testCategory.show(lab_id, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: "500",
                status: "error",
                message: "Something went wrong!"
            });
            return;
        }
        if (data) {
            res.status(200).send({
                status_code: "200",
                status: "success",
                message: "Successfully",
                data: data
            });
            return;
        }
    });
};

exports.GetFirst = (req, res) => {
    const { cat_id, lab_id } = req.body;
    const vali = helperFunction.customValidater(req, { cat_id, lab_id });
    if (vali) {
        return res.status(500).json(vali);
    }
    helperQuery.get({ table: "test_categories", where: "cat_id =" + cat_id + " AND lab_id =" + lab_id }, (err, data) => {
        if (err) {
            return res.status(500).json({
                status_code: "500",
                status: "error",
                message: "Something went to wrong!"
            });
        }
        return res.status(200).json({
            status_code: "200",
            status: "success",
            message: data
        });
    });
};