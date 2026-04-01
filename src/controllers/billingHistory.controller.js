const billingHistory = require("../models/billingHistory.model");
const helperFunction = require("../helper/helperFunction");
const moment = require("moment");
const atob = require("atob");
const btoa = require("btoa");


exports.billingHistoryAppointments = async (req, res) => {
    try {
        const { appointment_ids, user_type } = req.body;
        var data = await billingHistory.billingHistoryAppointments(appointment_ids, user_type);
        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Billing appointments found Successfully",
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went to wrong!"
        });
    }
};

exports.billingHistoryByRoleOld = async (req, res) => {
    try {
        if (req.body.user_type == "clinic") {
            var role_id = 5;
            var user_type = "doctor";
        }
        else {
            var role_id = req.body.role_id;
            var user_type = req.body.user_type;
        }

        const billing_history = await billingHistory.billingHistoryByRole(role_id, user_type);
        console.log(billing_history);

        const result = [];
        for (let [index, value] of billing_history.entries()) {
            var history_starting_date = await billingHistory.unpaidBillingStartDate(value.user_id, user_type);

            var date1 = moment(history_starting_date.starting_appointment_date);
            var date2 = moment();
            var diffDays = date2.diff(date1, "days");

            var slot = process.env.Billing_slots;
            var days_slots = diffDays / slot;
            var start_date = date1.add(0, "days").format("Y-MM-DD");
            var end_date = moment(start_date).add(slot, "days").format("Y-MM-DD");

            if (end_date <= moment().format()) {
                var tp = await billingHistory.billingHistoryPaid(value.user_id);
                value.profile_image = (value.profile_image == null) ? "" : value.profile_image;

                result[index] = {
                    "first_name": value.first_name,
                    "mobile": value.mobile,
                    "email": value.email,
                    "pin_code": value.pin_code,
                    "user_id": value.user_id,
                    "admin_status": value.admin_status,
                    "profile_image": value.profile_image,
                    "total_unpaid": value.total_unpaid,
                    "total_paid": tp.total_paid
                };
            }
        }
        var data = result.filter(function (el) { return el != null; });
        console.log(data);

        if (data.length > 0) {
            return res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Billing history data found Successfully",
                data: data
            });
        }
        else {
            return res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Billing history no data found",
                data: data
            });
        }
    } catch (error) {
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went to wrong!"
        });
    }
};

exports.paidBillingHistory = async (req, res) => {
    try {
        const { user_id } = req.body;
        var data = await billingHistory.paidBillingStartDate(user_id);

        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Billing paid history found Successfully",
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went to wrong!"
        });
    }
};
exports.unpaidBillingHistory = async (req, res) => {
    try {
        var user_id = req.body.user_id;
        if (req.body.user_type == "clinic") {

            var user_type = "doctor";
        }
        else {

            var user_type = req.body.user_type;
        }
        var history_starting_date = await billingHistory.unpaidBillingStartDate(user_id, user_type);

        var date1 = moment(history_starting_date.starting_appointment_date);
        var date2 = moment();
        var diffDays = date2.diff(date1, "days");

        var slot = process.env.Billing_slots;
        var days_slots = diffDays / slot;
        var data = [];
        var y = 1;

        for (var i = 0; i < Math.ceil(days_slots); i++) {
            if (i == 0) {
                var start_date = date1.add(0, "days").format("Y-MM-DD");
            }
            else {
                var start_date = date1.add((slot + y), "days").format("Y-MM-DD");
            }
            var end_date = moment(start_date).add(slot, "days").format("Y-MM-DD");

            if (end_date <= moment().format()) {
                var unpaid_billing_history = await billingHistory.unpaidBillingHistory(start_date, end_date, user_id, user_type);

                var all_unpaid_appointment_ids = await billingHistory.unpaidAppointmentIds(start_date, end_date, user_id, user_type);


                var day_internal = moment(start_date).format("DD/MM/Y") + " - " + moment(end_date).format("DD/MM/Y");

                var get_user_commission = await billingHistory.getCommission(user_id);
                if (get_user_commission) {
                    var total_commission = unpaid_billing_history.total_unpaid * (get_user_commission.commission_percent / 100);
                }
                else {
                    var total_commission = 0;
                }

                var pay_now_payment = (unpaid_billing_history.total_unpaid - total_commission);

                if (pay_now_payment > 0) {
                    data[i] = {
                        "appointment_ids": all_unpaid_appointment_ids.map((list) => list.appointment_id).join(","),
                        "name": unpaid_billing_history.first_name,
                        "email": unpaid_billing_history.email,
                        "day_internal": day_internal,
                        "total_unpaid": unpaid_billing_history.total_unpaid,
                        "total_commission": total_commission.toFixed(2),
                        "start_date": moment(start_date),
                        "end_date": moment(end_date),
                        "pay_now_payment": pay_now_payment.toFixed(2),
                        "user_id": user_id
                    };
                }
            }
        }
        return res.status(200).send({
            status_code: 200,
            status: "success",
            message: "Unpaid billing history data found Successfully",
            data: data.filter(function (el) { return el != null; })
        });
    } catch (error) {
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went to wrong!"
        });
    }
};
exports.addUnpaidBillingHistory = async (req, res) => {
    try {
        const { user_id, appointment_ids, email, start_date, end_date, total_unpaid, total_commission, amount } = req.body;
        const vali = helperFunction.customValidater(req, { user_id, appointment_ids, email, start_date, end_date, total_unpaid, total_commission, amount });
        if (vali) {
            return res.status(500).json(vali);
        }

        var booking_id = new Date().getTime();

        var result = await billingHistory.addUnpaidBillingHistory(user_id, appointment_ids, email, start_date, end_date, total_unpaid, total_commission, amount);

        var detail = "id=" + result.insertId + "&&total_amount=" + amount + "&&email=" + email + "&&type=admin_billing";

        var url = process.env.APP_URL + "api/admin/payment-billing?detail=" + btoa(detail);

        if (result.affectedRows > 0) {
            return res.status(200).json({
                status_code: 200,
                status: "success",
                message: "Add Successfully!",
                data: {
                    url: url,
                }
            });
        }
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "Something Went to wrong!"
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "success",
            message: error.message
        });
    }
};