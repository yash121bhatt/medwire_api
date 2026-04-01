const User = require("../models/user.model");
const PromoCode = require("../models/promoCode.model");
const helperFunction = require("../helper/helperFunction");
const { uploadFileIntoCloudinary } = require("../helper/helper");


// add promo code by vineet shirdhonkar


exports.addPromoCode = async (req, res) => {
    var { user_id, role_id, promo_code_for, promo_code_for_id, discount_type, promo_code, discount_rate, discount_price, validity_start_date, validity_end_date, max_uses, price, description } = req.body;
    var banner_image = "";
    var valid = helperFunction.customValidater(req, { user_id, role_id, discount_type, promo_code, validity_start_date, validity_end_date, max_uses, price, description });

    if (valid) {
        return res.status(500).json(valid);
    }


    if (req.file != undefined) {
        // var banner_image = req.file.filename;
        var banner_image = await uploadFileIntoCloudinary(req);
    }


    if (new Date(validity_start_date) > new Date(validity_end_date)) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Validity start date should be less than validity end date"
        });
    }



    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "User does not exist"
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


            PromoCode.add(user_id, promo_code_for, promo_code_for_id, discount_type, promo_code, discount_rate, discount_price, validity_start_date, validity_end_date, max_uses, price, banner_image, description, (err, data1) => {
                if (err) {
                    if (err.kind === "not_inserted") {
                        res.status(500).send({
                            status_code: 500,
                            status: "error",
                            message: "Failed ! Please try again"
                        });
                        return;
                    }
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data1) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Promo Code Added Successfully",
                        data: data1
                    });
                    return;
                }
            });

        }
    });
};


// get all promo code by vineet shirdhonkar


exports.getAllPromoCode = (req, res) => {
    const { user_id, role_id } = req.body;

    var valid = helperFunction.customValidater(req, { user_id, role_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "User does not exist"
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
            PromoCode.findAll(user_id, (err, data) => {
                if (err) {

                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "No Record Found",
                            data: []
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

                if (data.length > 0) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Data Found Successfully",
                        data: data
                    });
                    return;

                }
            });
        }

    });
};


// get promo code detail code by vineet shirdhonkar


exports.getPromoCodeDetail = (req, res) => {
    const { promo_code_id } = req.body;

    var valid = helperFunction.customValidater(req, { promo_code_id });
    if (valid) {
        return res.status(500).json(valid);
    }

    PromoCode.findById(promo_code_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Promo code does not exist"
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
                message: "Promo Code Details Found Successfully",
                data: data
            });
            return;

        }
    });
};

// update promo code by vineet shirdhonkar

exports.updatePromoCode = (req, res) => {
    var { promo_code_id, user_id, role_id, promo_code_for, promo_code_for_id, discount_type, promo_code, discount_rate, discount_price, validity_start_date, validity_end_date, max_uses, price, description } = req.body;

    var banner_image = "";

    var valid = helperFunction.customValidater(req, { promo_code_id, user_id, role_id, role_id, promo_code, discount_type, validity_start_date, validity_end_date, max_uses, price, description });
    if (valid) {
        return res.status(500).json(valid);
    }

    if (new Date(validity_start_date) > new Date(validity_end_date)) {
        return res.status(400).json({
            status_code: 400,
            status: "error",
            message: "Validity start date should be less than validity end date"
        });
    }



    User.findByIdAndRole(user_id, role_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "User does not exist"
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

            PromoCode.findById(promo_code_id, async (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(200).send({
                            status_code: 200,
                            status: "success",
                            message: "Promo code does not exist"
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
                    if (req.file != undefined) {
                        var banner_image = req.file.filename;

                    } else {
                        // var banner_image = data[0].banner_image_name;
                        var banner_image = await uploadFileIntoCloudinary(req);
                    }

                    PromoCode.update(promo_code_for, promo_code_for_id, promo_code_id, user_id, discount_type, promo_code, discount_rate, discount_price, validity_start_date, validity_end_date, max_uses, price, banner_image, description, (err, data1) => {
                        if (err) {
                            if (err.kind === "not_updated") {
                                res.status(500).send({
                                    status_code: 500,
                                    status: "error",
                                    message: "Failed ! Please try again"
                                });
                                return;
                            }
                            res.status(500).send({
                                status_code: 500,
                                status: "error",
                                message: "Something Went Wrong"
                            });
                            return;
                        }

                        if (data1) {
                            res.status(200).send({
                                status_code: 200,
                                status: "success",
                                message: "Promo Code Updated Successfully",
                                data: data1
                            });
                            return;
                        }
                    });

                }
            });

        }
    });
};


// delete promo code  by vineet shirdhonkar


exports.deletePromoCode = (req, res) => {
    const { promo_code_id } = req.body;

    var valid = helperFunction.customValidater(req, { promo_code_id });
    if (valid) {
        return res.status(500).json(valid);
    }


    PromoCode.findById(promo_code_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({
                    status_code: 200,
                    status: "success",
                    message: "Promo code does not exist"
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

        if (data.length > 0) {
            PromoCode.delete(promo_code_id, (err, data) => {
                if (err) {
                    res.status(500).send({
                        status_code: 500,
                        status: "error",
                        message: "Something Went Wrong"
                    });
                    return;
                }
                if (data) {
                    res.status(200).send({
                        status_code: 200,
                        status: "success",
                        message: "Promo code Deleted Successfully",
                        data: data
                    });
                    return;
                }
            });

        }
    });
};