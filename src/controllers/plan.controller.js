const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const { async } = require("q");

exports.userPlanPurchaseHistory = async (req, res) => {
    const { user_id } = req.body;
    var valid = helperFunction.customValidater(req, { user_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    var result = await Plan.getUserPlanHistory(user_id);
    if (result) {
        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Plan purchase history are showing",
            data: result
        });
    }
    else {
        return res.status(500).send({
            status_code: 500,
            status: "error",
            message: err.message
        });
    }
};

exports.getAllPlans = async (req, res) => {
    const { role, user_id } = req.body;

    var valid = helperFunction.customValidater(req, { role, user_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    User.findByRole(role, async (err, data) => {
        try {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        status_code: 404,
                        status: "error",
                        message: "Role does not exist"
                    });
                    return;
                }
                res.status(500).send({
                    status_code: 500,
                    status: "error",
                    message: err.message
                });
                return;
            }
            var usrId = [];
            if (user_id != undefined && user_id != undefined) {
                var query = `SELECT ph.id AS plan_purchase_id,ph.*,p.* FROM plan_purchase_history ph INNER JOIN plans p on p.id=ph.plan_id  WHERE
                ph.user_id='${user_id}' AND  p.deleted_at IS NULL AND ph.status = 'active' order by ph.id desc`;
                var listdata = await helperQuery.All(query);
                for (const iterator of listdata) {
                    usrId.push(iterator.plan_id);
                }
            }
            var user_ids = usrId.length > 0 ? usrId : 0;
            if (data) {
                Plan.findAll({ role, user_ids }, (err, data) => {
                    if (err) {
                        if (err.kind === "not_found") {
                            res.status(404).send({
                                status_code: 404,
                                status: "error",
                                message: "No Plans Found"
                            });
                            return;
                        }
                        res.status(500).send({
                            status_code: 500,
                            status: "error",
                            message: err.message
                        });
                        return;
                    }
                    if (data) {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Plan record found Successfully",
                            data: listdata,
                            listdata: data
                        });
                        return;
                    }
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status_code: "500",
                status: "error",
                message: "something went to wrong!"
            });
        }
    });
};

exports.purchasePlan = async (req, res) => {
    const { plan_id, user_id } = req.body;

    var valid = helperFunction.customValidater(req, { plan_id, user_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    Plan.findById(plan_id, async (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Plan does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            Plan.purchase(plan_id, user_id, async (err, data) => {
                if (err) {
                    if (err.kind === "already_purchased") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "You have already purchased this plan"
                        });
                        return;
                    }
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: err.message
                    });
                    return;
                }
                if (data) {

                    console.log(data, "----------------");
                    /**
                    [
                        {
                            id: 1,
                            created_by_id: 1,
                            plan_for: 'clinic',
                            benefit: '2',
                            plan_name: 'Basic Hospital/Clinic Plan',
                            price: '100',
                            validity: '6 Month',
                            description: '<h2>What is Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry.</p>',
                            deleted_at: null,
                            set_as_default: null,
                            created_at: 2025-11-13T01:41:27.000Z,
                            updated_at: 2025-11-13T07:12:59.000Z
                        }
                    ]
                     */

                    var result = await helperQuery.Get({ table: "plan_purchase_history", where: "id =" + data.insertId });
                    var user_detail = await helperQuery.Get({ table: "users", where: "id =" + user_id });

                    if (user_detail[0].email) {
                        var email = user_detail[0].email;
                        var role_id = user_detail[0].role_id;
                    }
                    else {
                        if (user_detail.created_by_id > 0) {
                            var user_detail_created_by = await helperQuery.Get({ table: "users", where: "id =" + user_detail.created_by_id });
                            var email = user_detail_created_by[0].email;
                            var role_id = user_detail_created_by[0].role_id;
                        }
                    }

                    var payment_order_id = process.env.APP_URL + "_" + new Date().getTime();
                    var detail = "plan_purchase_id=" + result[0].id + "&&total_amount=" + result[0].total_amount + "&&email=" + email + "&&payment_order_id=" + result[0].payment_order_id + "&&type=plan&&user_id=" + user_id + "&&role_id=" + role_id;
                    var url = process.env.APP_URL + "api/auth/payment-plan?detail=" + btoa(detail);

                    console.log(url, "------------------ url");
                    /**
                    http://localhost:3000/api/auth/payment-plan?detail=cGxhbl9wdXJjaGFzZV9pZD02JiZ0b3RhbF9hbW91bnQ9MTAwJiZlbWFpbD1oaGgxMDBAbWFpbGluYXRvci5jb20mJnBheW1lbnRfb3JkZXJfaWQ9UmtBcHBfMTc2MzE3MzU5ODk3MSYmdHlwZT1wbGFuJiZ1c2VyX2lkPTE5
                     */

                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Plan has been purchased Successfully",
                        url: url,
                    });
                    return;
                }
            });
        }

    });
};
exports.renewPlan = async (req, res) => {
    const { plan_purchase_id } = req.body;

    var valid = helperFunction.customValidater(req, { plan_purchase_id });
    if (valid) {
        return res.status(500).json(valid);
    }
    Plan.renew(plan_purchase_id, async (err, data) => {

        if (err) {
            if (err.kind === "plan_purchase_not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Plan Purchase Id does not exist"
                });
                return;
            }

            if (err.kind === "plan_not_found") {
                res.status(404).send({
                    status_code: 404,
                    status: "error",
                    message: "Plan does not exist"
                });
                return;
            }
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: err.message
            });
            return;
        }
        if (data) {
            var result = await helperQuery.Get({ table: "plan_purchase_history", where: "id =" + plan_purchase_id });

            var user_detail = await helperQuery.Get({ table: "users", where: "id =" + result[0].user_id });

            var email = user_detail[0].email;
            var payment_order_id = process.env.APP_NAME + "_" + new Date().getTime();

            var detail = "plan_purchase_id=" + result[0].id + "&&total_amount=" + result[0].total_amount + "&&email=" + email + "&&payment_order_id=" + result[0].payment_order_id + "&&type=plan&&user_id=" + result[0].user_id;

            var url = process.env.APP_URL + "api/auth/payment-plan?detail=" + btoa(detail);
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Plan has been renewed Successfully",
                url: url
            });
            return;
        }
    });
};