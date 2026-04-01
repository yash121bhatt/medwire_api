const btoa = require("btoa");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const appliedCouponCodes = require("../models/applied_coupon_codes.model");
const bookApointment = require("../models/bookApointment.model");
const LabTest = require("../models/labtest.model");
const Notification = require("../models/stytemNotification.model");
const PaytmChecksum = require("../config/cheksum");
const https = require("https");
const moment = require("moment");
const Package = require("../models/package.model");

exports.CouponCodesList = async (req, res) => {
    try {

        const { created_by_id, patient_id } = req.body;
        const vali = helperFunction.customValidater(req, { created_by_id });
        if (vali) {
            return res.status(500).json(vali);
        }

        const userUsePromoId = [];
        const userid = patient_id != undefined && patient_id != "" ? patient_id : 0;
        const userUsePromo = await helperQuery.Get({ table: "appointments", where: "(patient_id =" + userid + " OR created_by_id =" + userid + ") AND promo_code_id IS NOT NULL AND promo_code_id !='0' " });

        for (const iterator of userUsePromo) {
            userUsePromoId.push(iterator.promo_code_id);
        }

        let userUsePromoIds;
        if (userUsePromoId.length > 0) {
            userUsePromoIds = userUsePromoId;
        } else {
            userUsePromoIds = [0];
        }

        const result = await helperQuery.Get({ table: "promo_code", where: "created_by_id =" + created_by_id + " AND id NOT IN (" + userUsePromoIds + ")" });

        const date = new Date;
        const couponData = result.filter((item) => {

            const endDate = item.validity_end_date.slice(3, 15);
            const startDate = item.validity_start_date.slice(3, 15);
            if (helperFunction.dateFormat(endDate, "yyyymmdd") >= helperFunction.dateFormat(date, "yyyymmdd") && helperFunction.dateFormat(startDate, "yyyymmdd") <= helperFunction.dateFormat(date, "yyyymmdd")) {

                return item;
            }
        });
        console.log(couponData,);
        return res.status(200).json({
            status_code: "200",
            status: "success",
            data: couponData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went to wrong!"
        });
    }
};

exports.addCouponCode = async (req, res) => {
    try {
        const { coupon_code } = req.body;
        const result = await helperQuery.All(`SELECT * FROM promo_code WHERE promo_code='${coupon_code}'`);
        return res.status(200).json({
            status_code: "200",
            status: "success",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: "500",
            status: "error",
            message: "something went to wrong!"
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { created_by_id, lab_id } = req.body;
        const cart_item = req.body.cart_item != undefined ? req.body.cart_item : [];
        const check = await helperQuery.All(`SELECT * FROM user_carts WHERE created_by_id='${created_by_id}' AND status='0' AND appointment_id IS NULL`);

        if (check && check[0]?.cart_item && JSON.parse(check[0]?.cart_item)?.length == 1) {
            const vali = helperFunction.customValidater(req, { created_by_id, lab_id });
            if (vali) {
                return res.status(500).json(vali);
            }
        } else {
            const vali = helperFunction.customValidater(req, { created_by_id, lab_id, cart_item });
            if (vali) {
                return res.status(500).json(vali);
            }
        }

        if (Array.isArray(cart_item) != true) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "cart_item must be array object!",
            });
        }
        let total = 0;
        for (const iterator of cart_item) {
            total = parseInt(iterator.amount) + total;
        }
        const amount = req.body.cart_name != undefined ? req.body.cart_name : null;
        const cart_name = req.body.cart_name != undefined ? req.body.cart_name : null;
        const data = await bookApointment.show(created_by_id);

        if (data.length > 0) {
            await bookApointment.update(JSON.stringify(cart_item), cart_name, total, lab_id, created_by_id);
        } else {
            await bookApointment.create(lab_id, created_by_id, JSON.stringify(cart_item), cart_name, total);
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.cartItem = async (req, res) => {
    try {
        const { created_by_id } = req.body;
        const vali = helperFunction.customValidater(req, { created_by_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const data = await bookApointment.show(created_by_id);
        console.log(data, "----------------- data");
        let result = [];
        data.map((item) => {
            const cart_id = item.cart_id != undefined ? item.cart_id : null;
            const lab_id = item.user_id != undefined ? item.user_id : null;
            const user_id = item.created_by_id != undefined ? item.created_by_id : null;
            const cart_item = item.cart_item != undefined && helperFunction.isJson(item.cart_item) == true ? JSON.parse(item.cart_item) : null;
            const totalCartItems = cart_item != undefined && cart_item != null ? cart_item.length : 0;
            const cart_name = item.cart_name != undefined ? item.cart_name : null;
            const amount = item.amount != undefined ? item.amount : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const status = item.status != undefined ? item.status : null;
            const created_at = item.created_at != undefined ? item.created_at : null;
            const updated_at = item.updated_at != undefined ? item.updated_at : null;
            result.push({ cart_id, lab_id, user_id, totalCartItems, cart_name, amount, total_amount, status, created_at, updated_at, cart_item });
        });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.cartlist = async (req, res) => {
    try {
        const { created_by_id, lab_id } = req.body;
        const vali = helperFunction.customValidater(req, { created_by_id, lab_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const data = await bookApointment.show(created_by_id);
        let arr = [];
        if (data.length > 0) {
            for (const iterator of JSON.parse(data[0].cart_item)) {
                const cid = iterator != undefined && iterator.test_id != null ? iterator.test_id : 0;
                arr.push(cid);
            }
        }
        const testdata = await LabTest.testList(lab_id, arr != undefined && arr.length > 0 ? arr : 0);
        const result = [];
        testdata.map((item) => {
            const test_id = item.test_id ?? null;
            const test_category_id = item.test_category_id ?? null;
            const lab_id = item.lab_id ?? null;
            const test_name = item.test_name ?? null;
            const test_report = item.test_report ?? null;
            const fast_time = item.fast_time ?? null;
            const test_recommended = item.test_recommended ?? null;
            const image = item.image ?? null;
            const description = item.description ?? null;
            const amount = item.amount ?? null;
            const category_name = item.category_name ?? null;
            const first_name = item.first_name ?? null;
            const status = item.status ?? null;
            const user_type = item.user_type ?? null;
            result.push({
                test_id, test_category_id, lab_id,
                test_name, test_report, fast_time,
                test_recommended, image, description,
                amount, category_name, first_name,
                status, user_type
            });
        });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.bookingSummery = async (req, res) => {
    try {
        const { created_by_id, coupon_code } = req.body;

        const vali = helperFunction.customValidater(req, { created_by_id });
        if (vali) {
            return res.status(500).json(vali);
        }

        const data = await bookApointment.show(created_by_id);

        if (coupon_code != undefined && coupon_code != "") {
            var couponExist = await helperQuery.All(`SELECT * FROM promo_code WHERE promo_code='${coupon_code}' AND created_by_id=${data[0].user_id}`);
            console.log(couponExist);
            if (couponExist.length > 0) {
                const date = new Date;
                var couponData = couponExist.filter((item) => {
                    const endDate = item.validity_end_date.slice(3, 15);
                    const startDate = item.validity_start_date.slice(3, 15);
                    if (helperFunction.dateFormat(endDate, "yyyymmdd") >= helperFunction.dateFormat(date, "yyyymmdd") && helperFunction.dateFormat(startDate, "yyyymmdd") <= helperFunction.dateFormat(date, "yyyymmdd")) {
                        return item;
                    }
                });
                // var couponData = await helperQuery.All(`SELECT * FROM promo_code WHERE promo_code='${coupon_code}' AND created_by_id='${data[0].user_id??''}' AND validity_end_date>=DATE_FORMAT(NOW(),'%d-%m-%y')`);
                if (couponData.length > 0) {
                    var percentage = couponData[0]?.discount_rate ?? 0;
                    var type = couponData[0]?.discount_type ?? "";
                    var discount_price = couponData[0]?.discount_price ?? 0;
                    var apCheck = 0;
                } else {
                    var couponCodeE = "This coupon code is expired!";
                }
            } else {
                var couponCodeE = "This coupon code is invalid!";
            }
        }

        let result = [];
        let applycouponProduct = [];

        console.log(data, "------------------ data");

        for (const item of data) {
            const cart_id = item.cart_id != undefined ? item.cart_id : null;
            const lab_id = item.user_id != undefined ? item.user_id : null;
            const user_id = item.created_by_id != undefined ? item.created_by_id : null;
            var cart_item = item.cart_item != undefined ? JSON.parse(item.cart_item) : null;
            let total = 0;
            for (const cartAmount of cart_item) {
                total = parseFloat(cartAmount.amount) + total;
            }

            for (const [key, value] of Object.entries(cart_item)) {
                if (Object.keys(value)[0] == "package_id") {
                    const pk_id = value.package_id;
                    console.log("pk1", key, cart_item, pk_id, lab_id, pk_id);

                    cart_item.splice(key, 1);
                    const pData = await Package.listFirst(lab_id, pk_id);

                    let package_id = pData.package_id;
                    let test_category_id = pData.test_category_id;
                    let test_name = pData.package_name;
                    let test_recommended = pData.test_recommended;
                    let amount = pData.amount;
                    let description = pData.description;
                    let image = pData.image;
                    let image_url = pData.image != null ? process.env.CLOUDINARY_BASE_URL + "member/" + pData.image : "";
                    const test_ids = JSON.parse(pData.test_id ?? [0]) ?? 0;

                    let test_Data = await Package.ShowWhereIn(test_ids);
                    cart_item.push({ package_id, test_category_id, test_name, amount, test_recommended, description, image, image_url, test_Data });
                    console.log("pk2", key, cart_item, test_ids);
                }
            }

            const cart_name = item.cart_name != undefined ? item.cart_name : null;
            const amount = item.amount != undefined ? item.amount : null;
            //const total_amount = item.total_amount!=undefined ? item.total_amount:null;
            const total_amount = total != undefined ? total : null;
            const coupon_data = couponData != undefined && couponData != null ? couponData : null;
            const grand_total_amount = total_amount != undefined ? total_amount : null;
            const status = item.status != undefined ? item.status : null;
            const created_at = item.created_at != undefined ? item.created_at : null;
            const updated_at = item.updated_at != undefined ? item.updated_at : null;
            const labdata = await helperQuery.First({ table: "users", where: "id=" + lab_id });
            // const lab_name =  cart_item!=undefined && cart_item[0]!=undefined && cart_item[0].first_name!=undefined && cart_item[0].first_name!=null ? cart_item[0].first_name:null;
            // const lab_image =  cart_item!=undefined && cart_item[0]!=undefined && cart_item[0].profile_image!=undefined && cart_item[0].profile_image!=undefined ? cart_item[0].profile_image:null;
            const lab_name = labdata != undefined && labdata.first_name != null ? labdata.first_name : null;
            const lab_image = labdata != undefined && labdata.profile_image != undefined ? labdata.profile_image : null;
            const lab_image_url = labdata != undefined && labdata.profile_image != undefined ? process.env.CLOUDINARY_BASE_URL + "member/" + labdata.profile_image : null;
            result.push({ cart_id, lab_id, user_id, cart_name, amount, total_amount, grand_total_amount, status, created_at, updated_at, coupon_data, lab_name, lab_image, lab_image_url, cart_item });
        };

        console.log(result, "---------------- result");

        const testId = couponData !== undefined && couponData.length > 0 && couponData[0] !== undefined && couponData[0].promo_code_for_id !== undefined && couponData[0].promo_code_for_id !== "" ? couponData[0].promo_code_for_id.split(",") : [];
        const promo_code_for = couponData !== undefined && couponData.length > 0 && couponData[0] !== undefined && couponData[0].promo_code_for !== undefined && couponData[0].promo_code_for !== "" ? couponData[0]?.promo_code_for : null;
        const promo_code_id = couponData != undefined && couponData[0]?.id ? couponData[0]?.id : 0;
        const user_id = created_by_id ?? 0;
        const object = result != undefined && result[0] != undefined && result[0].cart_item != undefined ? result[0].cart_item : [];
        var maxcoupon = await appliedCouponCodes.findBYPromocodeId(promo_code_id);
        var proCount = 0;
        await appliedCouponCodes.DeleteBYuserId(user_id);
        for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
                const cartItem = object[key];
                if (promo_code_for == "test") {
                    for (let index = 0; index < testId.length; index++) {
                        const element = testId[index];

                        if (parseInt(element) == cartItem.test_id) {

                            if (checkPouponUsesvali(proCount++, maxcoupon) == 1) {

                                const test_id = cartItem.test_id ?? 0;
                                const total_amount = cartItem.amount;
                                applycouponProduct.push(cartItem);
                                var apCheck = proCount;
                                updateValue(helperFunction.discount({ total_amount, percentage, type, discount_price }), cartItem.test_id, 0, object);
                                await appliedCouponCodes.create({ user_id, promo_code_id, test_id });
                            } else if (checkPouponUsesvali(proCount++, maxcoupon) == "expire") {
                                var couponCodeE = "This coupon code's limit expired!";
                            }
                        }
                    }
                } else if (promo_code_for == "package") {
                    for (let index = 0; index < testId.length; index++) {
                        const element = testId[index];

                        if (parseInt(element) == cartItem.package_id) {
                            if (checkPouponUsesvali(proCount++, maxcoupon) == 1) {
                                //proCount++;
                                console.log("package");
                                const package_id = cartItem.package_id ?? 0;
                                const total_amount = cartItem.amount;
                                applycouponProduct.push(cartItem);
                                var apCheck = proCount;
                                updateValue(helperFunction.discount({ total_amount, percentage, type, discount_price }), 0, cartItem.package_id, object);
                                await appliedCouponCodes.create({ user_id, promo_code_id, package_id });
                            } else if (checkPouponUsesvali(proCount++, maxcoupon) == "expire") {
                                var couponCodeE = "This coupon code's limit expired!";
                            }

                        }
                    }
                }
            }
        }

        if (apCheck != undefined && apCheck == 0) {
            if (promo_code_for == "package") {
                var couponCodeE = "This coupon code is not valid for this package!";
            } else {
                var couponCodeE = "This coupon code is not valid for these tests!";
            }
        }

        function checkPouponUsesvali(currentApply = 0, maxcoupon = []) {
            var maxUser = couponData != undefined && couponData != "" ? couponData[0].max_uses : 0;
            var total = maxcoupon.length + currentApply;
            if (maxcoupon.length >= parseInt(maxUser)) {
                console.log("expire");
                return "expire";
                //"This coupon code's limit expired! when already expired";
            }
            else if (total >= parseInt(maxUser)) {
                console.log("false");
                return 0;
                //"This coupon code's limit expired! when during applying time";
            } else {
                console.log("true");
                return 1;
                //"Successfully!";
            }
        }

        function updateValue(amount, test_id = 0, package_id = 0, object) {
            if (object != undefined && object != null && object.length > 0) {
                for (var i in object) {
                    if (object[i].test_id == test_id) {
                        object[i].amount = amount;
                        break;
                    }
                    if (object[i].package_id == package_id) {
                        object[i].amount = amount;
                        break;
                    }
                }
            }
        }

        let total = 0;
        for (const iterator of object) {
            total = parseFloat(iterator.amount) + total;
        }

        const cart_id = result != undefined && result[0] != undefined && result[0].cart_id != undefined ? result[0].cart_id : 0;
        updateBookingSummeryData(total, cart_id);

        function updateBookingSummeryData(amount, id = 0) {
            for (var i in result) {
                if (result[i].cart_id == id) {
                    console.log("updata total", amount);
                    result[i].grand_total_amount = amount;
                    break;
                }
            }
        }

        if (object == null || object == undefined || !(object.length > 0)) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "Opps! There is no product in your cart, Please add some product",
            });
        }

        return res.status(couponCodeE != undefined && couponCodeE != "" && couponCodeE != null ? 400 : 200).json({
            status_code: couponCodeE != undefined && couponCodeE != "" && couponCodeE != null ? 400 : 200,
            status: couponCodeE != undefined && couponCodeE != "" && couponCodeE != null ? "error" : "success",
            message: couponCodeE != undefined && couponCodeE != "" && couponCodeE != null ? couponCodeE : "Successfully!",
            data: result,
            applycouponProduct: applycouponProduct
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.checkAppointment = async (req, res) => {
    try {
        const { appoin_date, user_id } = req.body;
        const vali = helperFunction.customValidater(req, { appoin_date, user_id });
        if (vali) {
            return res.status(200).json(vali);
        }
        const result = await helperQuery.All(`SELECT * FROM appointments WHERE appointment_date ='${appoin_date}' AND user_id='${user_id}'`);
        const bookedSlot = [];
        result.map((item) => {
            const id = item.id != undefined ? item.id : null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const time_slot = item.from_time != undefined ? item.from_time : null;
            const date_slot = item.appointment_date != undefined ? item.appointment_date : null;
            bookedSlot.push({ id, user_id, time_slot, date_slot });
        });
        const user = await helperQuery.Get({ table: "users", where: " id=" + user_id });
        if (user[0].role_id == 4) {
            var slotInterval = 30;
            var type = "radio_appointment_booked";
        } else {
            var slotInterval = 15;
            var type = "lab_appointment_booked";
        }

        Slots = helperFunction.startToEndTimeSlot(slotInterval, user[0]?.opening_time, user[0]?.closing_time, bookedSlots = [], appoin_date);

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: Slots.length <= 0 ? "Time slots not available" : "Successfully!",
            data: bookedSlot,
            Remaining_Slots: Slots,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.createAppoint = async (req, res) => {
    try {
        const { refer_by_id, cart_id, created_by_id, from_time, appointment_date, total_amount, grand_total } = req.body;
        const user_id = req.body.user_id != undefined ? req.body.user_id : null;
        const member_id = req.body.member_id != undefined ? req.body.member_id : [];
        // const promo_code_id = req.body.promo_code_id != undefined ? req.body.promo_code_id : 0;
        const promo_code_id = 0;
        const vali = helperFunction.customValidater(req, { user_id, cart_id, created_by_id, from_time, appointment_date, total_amount, grand_total });
        if (vali) {
            return res.status(500).json(vali);
        }
        if (Array.isArray(member_id) != true) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "member_id must be array!",
            });
        }

        if (!parseInt(cart_id)) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "Please Add valid cart_id!",
            });
        }
        const checkCart = await helperQuery.All("SELECT* FROM user_carts WHERE cart_id=" + cart_id + " AND status='0' AND appointment_id IS NULL AND created_by_id=" + created_by_id);
        if (checkCart.length <= 0) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "Please Add valid cart_id!",
            });
        }

        const user = await helperQuery.Get({ table: "users", where: " id=" + user_id });
        if (user[0].role_id == 4) {
            var slotInterval = 30;
            var type = "radio_appointment_booked";
            var message = "You have been referred in the appointment in radio";
        } else {
            var slotInterval = 15;
            var type = "lab_appointment_booked";
            var message = "You have been referred in the appointment in lab";
        }
        var query = "SELECT * FROM user_carts WHERE created_by_id=" + created_by_id + " AND status='0' AND appointment_id IS NULL";
        const cartdata = await helperQuery.All(query);
        console.log(cartdata);
        if ((cartdata.length > 0) && cartdata != null && cartdata[0] != undefined && cartdata[0].cart_item != undefined && cartdata[0].cart_item != null && !(JSON.parse(cartdata[0].cart_item ?? "[]").length > 0)) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "Opps! There is no product in your cart, Please add some product",
            });
        }

        const doctorData = await helperQuery.All(`SELECT user_id FROM user_doctors WHERE id='${refer_by_id}'`);
        if (doctorData.length > 0) {
            var doctor_id = doctorData[0].user_id ?? null;
        } else {
            var doctor_id = null;
        }

        const category = [];
        const catId = [];
        const sub_category = [];

        for (const item of JSON.parse(cartdata[0].cart_item)) {
            sub_category.push(item.test_name ?? null);
            catId.push(item.test_category_id ?? 0);
        }

        const categoryData = await helperQuery.All(`SELECT category_name FROM test_categories WHERE  cat_id IN ('${catId}')`);
        for (const iterator of categoryData) {
            category.push(iterator.category_name);
        }

        var payment_order_id = process.env.APP_NAME + "_" + new Date().getTime();
        const result = await bookApointment.createAppoint(payment_order_id, user_id, JSON.stringify(member_id), refer_by_id, promo_code_id, from_time, appointment_date, total_amount, grand_total, created_by_id, doctor_id);
        if (result.affectedRows == 1) {
            const insertId = result.insertId ?? 0;
            const data = await helperQuery.All("UPDATE user_carts SET status='1',appointment_id=" + insertId + " WHERE cart_id=" + cart_id + " AND status='0' AND appointment_id IS NULL AND created_by_id=" + created_by_id);
            if (data.affectedRows == 1) {
                await appliedCouponCodes.updaTrueStatusByUserId({ created_by_id, insertId, cart_id });
                // return
                const userdata = await helperQuery.All(`SELECT*FROM users WHERE id='${created_by_id}' LIMIT 1`);
                if (userdata != null && userdata[0] != null) {
                    if (userdata[0].mobile != null && userdata[0].mobile != undefined) {
                        var mobile_no = userdata[0].mobile;
                    } else {
                        const usermemberData = await helperQuery.All(`SELECT*FROM users WHERE id='${userdata[0].created_by_id}' LIMIT 1`);
                        if (usermemberData[0] != undefined && usermemberData[0].mobile != undefined && usermemberData[0].mobile != null) {
                            var mobile_no = usermemberData[0].mobile;
                        } else {
                            var mobile_no = null;
                        }
                    }
                }
                const visitData = await helperQuery.All(`INSERT INTO new_visit (appointment_id,lab_id,member_id,mobile,online_ofline_status,category,sub_category,created_at) VALUES('${insertId}','${user_id}','${created_by_id}','${mobile_no}','1','${category}','${sub_category}',NOW())`);
                if (visitData) {
                    var queryUPDF = "insert into `users_documents` set `user_id`= '" + created_by_id + "',`member_id`= '" + created_by_id + "',`visite_id`= '" + visitData.insertId + "',`document_date`=NOW()";
                    await helperQuery.All(queryUPDF);
                }

                var user_detail = await helperQuery.Get({ table: "users", where: "id =" + created_by_id });

                if (user_detail.length > 0) {
                    var email = user_detail[0].email;
                }
                else {
                    var email = "";
                }

                var appointment_type = "lab_patient_appointment";
                if (user[0].role_id == 4) {
                    var appointment_type = "radio_patient_appointment";
                }

                var source_type = "WEB";
                if (req.body.source_type == "APP") {
                    var source_type = "APP";
                }

                var detail = "appointment_id=" + result.insertId + "&&total_amount=" + grand_total + "&&email=" + email + "&&payment_order_id=" + payment_order_id + "&&type=" + appointment_type + "&&source_type=" + source_type;

                console.log(detail);

                var url = process.env.APP_URL + "api/auth/payment-appointment?detail=" + btoa(detail);

                return res.status(200).json({
                    status_code: 200,
                    status: "success",
                    message: "Successfully!",
                    data: {
                        "id": result.insertId,
                        "amount": grand_total,
                        "email": email,
                        "payment_order_id": payment_order_id,
                        "url": url
                    }
                });


            }
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "Opps! There is no product in your cart, Please add some product",
            });
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"

        });
    }
};
exports.createAppointmentTxnToken = async (req, res) => {
    try {

        const { appointment_id, grand_total, email, payment_order_id } = req.body;


        const vali = helperFunction.customValidater(req, { appointment_id, grand_total, email, payment_order_id });
        if (vali) {
            return res.status(500).json(vali);
        }

        var call_back_url = "http://medwire.wecoderelationship.com/patient_dynamic/#/payment-thankyou?id=" + btoa(appointment_id) + "&&type=appointment";


        var paytmParams = {};
        paytmParams.body = {
            "requestType": "Payment",
            "mid": process.env.Paytm_mid,
            "websiteName": process.env.APP_NAME,
            "orderId": payment_order_id,
            "callbackUrl": call_back_url,
            "txnAmount": {
                "value": grand_total,
                "currency": "INR",
            },
            "userInfo": {
                "custId": email
            },
        };

        var response = "";
        var checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.Paytm_key);

        paytmParams.head = {
            "signature": checksum
        };
        var post_data = JSON.stringify(paytmParams);
        var options = {
            /* for Staging */
            hostname: "securegw-stage.paytm.in",
            /* for Production */
            // hostname: 'securegw.paytm.in',
            port: 443,
            path: "/theia/api/v1/initiateTransaction?mid=" + process.env.Paytm_mid + "&orderId=" + payment_order_id,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length
            }
        };
        let customTxntoken = "";
        var post_req = await https.request(options, async function (post_res) {
            await post_res.on("data", function (chunk) {
                response += chunk;
            });
            await post_res.on("end", async function () {
                var trans_token = JSON.parse(response);
                await helperQuery.All("update `appointments` set `txn_token` = '" + trans_token.body.txnToken + "' where `id` = '" + appointment_id + "'");

                console.log(trans_token);

                return trans_token;
            });
        });
        post_req.write(post_data);


        setTimeout(function () {
            helperQuery.get({ table: "appointments", where: "id=" + appointment_id }, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                return res.status(200).json({
                    status_code: 200,
                    status: "success",
                    message: "Successfully!",
                    data: {
                        "id": appointment_id,
                        "mid": process.env.Paytm_mid,
                        "order_id": payment_order_id,
                        "amount": grand_total,
                        "callback_url": call_back_url,
                        "txn_token": data[0].txn_token,
                        "is_stage": true
                    }
                });
            });
        }, 2000);
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.appointmentList = async (req, res) => {
    try {
        const { user_id, source_type } = req.body;
        const role_id = req.body.role_id ?? "";
        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.appointmentList(user_id, role_id);
        const data = [];
        for (const item of result) {
            const id = item.id != undefined ? item.id : null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const pin_code = item.pin_code != null ? item.pin_code : item.mpin_code ?? null;
            const first_name = (item.first_name) ? item.first_name : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id) : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : [];
            const created_by_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.from_time != undefined ? item.from_time : null;
            const appointment_status = item.status != undefined ? item.status : "Pending";
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const status = item.status ?? null;
            const reason_of_reschedule = item.reason_of_reschedule ?? null;
            const doctor = item.doctor != undefined ? item.doctor : null;
            const lab_name = item.lab_name != undefined ? item.lab_name : null;
            const report_document = item.report_document != undefined ? item.report_document : null;
            const report_documentApk = item.report_document != undefined ? helperFunction.is_file_exist(item.report_document) : null;
            const visit_id = item.visit_id != undefined ? item.visit_id : null;
            const cart_id = item.cart_id != undefined ? item.cart_id : null;
            const cart_item = item.cart_item != undefined && item.cart_item != "" && helperFunction.isJson(item.cart_item) == true ? JSON.parse(item.cart_item) : null;
            const created_at = item.created_at != undefined ? item.created_at : null;
            const appointments_user_type = item.appointments_user_type ?? null;
            const payment_status = item.payment_status != undefined ? item.payment_status : "PENDING";
            const lab_radio_type = helperFunction.check_file_DCM(item.report_document);
            const latitude = item.latitude ?? null;
            const longitude = item.longitude ?? null;
            const lab_address = item.lab_address ?? null;
            const dcm_document_url = item.dcm_document != null ? process.env.APP_URL_DCM + "/" + item.dcm_document : null;


            if ((item.payment_status == "Pending") || (item.payment_status == "PENDING") || (item.payment_status == null)) {
                var user_detail = await helperQuery.Get({ table: "users", where: "id =" + item.user_id });

                if (user_detail[0].email) {
                    var email = user_detail[0].email;
                }
                else {
                    if (user_detail[0].created_by_id > 0) {
                        var user_detail_created_by = await helperQuery.Get({ table: "users", where: "id =" + user_detail[0].created_by_id });
                        var email = user_detail_created_by[0].email;
                    }
                }

                if (item.payment_order_id == null) {
                    var payment_order_id = process.env.APP_NAME + "_" + new Date().getTime() + item.id;
                    await bookApointment.updatePaymentOrderId(payment_order_id, id);
                }
                else {
                    var payment_order_id = item.payment_order_id;
                }
                var detail = "appointment_id=" + item.id + "&&total_amount=" + item.grand_total + "&&email=" + email + "&&payment_order_id=" + payment_order_id + "&&type=lab_radio_booked_appointment_by_patient&&source_type=" + source_type;
                var url = process.env.APP_URL + "api/auth/payment-appointment?detail=" + btoa(detail);
            }
            else {
                var url = null;
            }

            data.push({
                id, user_id, member_id, created_by_id, first_name, pin_code, promo_code_id, appointment_date, time_slot,
                reason_of_reschedule, appointments_user_type, payment_status,
                report_document, report_documentApk, visit_id,
                appointment_status, total_amount, grand_total, doctor, lab_name, cart_id, created_at, mamber_names, cart_item, url, latitude, longitude, dcm_document_url, lab_address
            });
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.checktimeslote = async (req, res) => {
    try {

        const { user_id } = req.body;
        const appoin_date = req.body.appoin_date != undefined && req.body.appoin_date != null ? req.body.appoin_date : "0000-00-00";

        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const user = await helperQuery.Get({ table: "users", where: " id=" + user_id });
        const opentime = user[0].opening_time;
        const closetime = user[0].closing_time;
        const result = await helperQuery.All(`SELECT * FROM appointments WHERE appointment_date ='${appoin_date}' AND user_id='${user_id}'`);
        const bookedSlot = [];
        result.map((item) => {
            const id = item.id != undefined ? item.id : null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const time_slot = item.from_time != undefined ? item.from_time : null;
            const date_slot = item.appointment_date != undefined ? item.appointment_date : null;
            bookedSlot.push({ id, user_id, time_slot, date_slot });
        });

        if (opentime == undefined || opentime == null || opentime == "" || opentime == undefined || opentime == null || opentime == "") {
            return res.status(400).json({
                status_code: 400,
                status: "error",
                message: "Slot Not Found!"
            });
        }
        const slotInterval = 15;
        const Slots = helperFunction.startToEndTimeSlot(slotInterval, opentime, closetime, bookedSlot, appoin_date);

        // timeSlot({slotInterval,opentime,closetime});



        // var Solt =[];

        // for (let i =0; i<=TimeSlot.length; i++) {

        //     const from = TimeSlot[i]??null;
        //     const to = TimeSlot[i+1]??null;

        //     if (from!=null && to!=null) {
        //         const Stime =helperFunction.railwayToNormalTimeConvert(from)+'-'+helperFunction.railwayToNormalTimeConvert(to);
        //         Solt.push({Stime});
        //     }
        // }
        // const Slots = Solt.reduce((unique, o) => {
        //     if(!unique.some(obj => obj.Stime === o.Stime)) {
        //       unique.push(o);
        //     }
        //     return unique;
        // },[])


        const data = [];
        data.push({ user, Slots });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.LabRadioAppointmentList = async (req, res) => {
    try {
        const { user_id } = req.body;
        const role_id = req.body.role_id ?? "";
        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.LabRadioAppointmentList(user_id);
        const data = [];
        for (const item of result) {
            const appointment_id = item.id != undefined ? item.id : null;
            const patient_name = item.patient != undefined ? item.patient : null;
            const medwire_id = item.medwire_id != undefined ? item.medwire_id : null;
            const pin_code = item.pin_code != null ? item.pin_code : item.mpin_code ?? null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id) : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : "Self";
            const patient_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.from_time != undefined ? item.from_time : null;
            const booking_status = item.status != undefined ? item.status : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const status = item.status ?? "";
            const reason_of_reschedule = item.reason_of_reschedule ?? null;
            const doctor = item.doctor != undefined ? item.doctor : null;
            const lab_name = item.lab_name != undefined ? item.lab_name : null;
            const report_document = item.report_document != undefined ? item.report_document : null;
            const report_documentApk = item.report_document != undefined ? helperFunction.is_file_exist(item.report_document) : null;
            const lab_radio_type = helperFunction.check_file_DCM(item.report_document);
            const visit_id = item.visit_id != undefined ? item.visit_id : null;
            const cart_id = item.cart_id != undefined ? item.cart_id : null;
            const cart_item = item.cart_item != undefined && item.cart_item != "" ? JSON.parse(item.cart_item) : null;
            const created_at = item.created_at != undefined ? item.created_at : null;
            const appointments_user_type = item.appointments_user_type ?? null;
            const payment_status = item.payment_status != undefined ? item.payment_status : "PENDING";
            const dcm_document = item.dcm_document ?? null;
            const dcm_document_url = item.dcm_document != null ? process.env.APP_URL_DCM + "/" + item.dcm_document : null;
            data.push({
                user_id, appointment_id, patient_id, patient_name, medwire_id, pin_code,
                member_id, promo_code_id, appointment_date,
                time_slot, booking_status, total_amount, grand_total,
                status, reason_of_reschedule, appointments_user_type,
                doctor, lab_name, cart_id, payment_status,
                report_document, report_documentApk, visit_id,
                created_at, mamber_names, cart_item, lab_radio_type,
                dcm_document, dcm_document_url
            });
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.LabRadioAppointmentfind = async (req, res) => {
    try {
        const { appointment_id } = req.body;
        const vali = helperFunction.customValidater(req, { appointment_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.LabRadioAppointmentfind(appointment_id);
        const data = [];
        result.map((item) => {
            const appointment_id = item.appointment_id ?? "";
            const time_slot = item.from_time ?? "";
            const appointment_date = item.appointment_date ?? "";
            const user_id = item.user_id ?? "";
            const reason_of_reschedule = item.reason_of_reschedule ?? "";
            const status = item.status ?? "";
            data.push({ appointment_id, time_slot, appointment_date, user_id, reason_of_reschedule, status });
        });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.LabRadioAppointmentStatusReschedule = async (req, res) => {
    try {
        const { time_slot, appointment_date, reason_of_reschedule, appointment_id } = req.body;
        const vali = helperFunction.customValidater(req, { time_slot, appointment_date, reason_of_reschedule, appointment_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.LabRadioAppointmentStatusReschedule(time_slot, appointment_date, reason_of_reschedule, appointment_id);

        const updated_appointment = await helperQuery.Get({ table: "appointments", where: "id =" + appointment_id });

        if (updated_appointment.length > 0) {
            let data = {};

            if (updated_appointment[0].patient_id) {
                data.from_user_id = updated_appointment[0].patient_id;
                data.to_user_id = updated_appointment[0].patient_id;

                let user_result = await helperQuery.Get({ table: "users", where: "id =" + updated_appointment[0].patient_id });

                let clinicId = updated_appointment[0].clinic_id;
                let lrId = updated_appointment[0].user_id;
                let reschedulId = clinicId != null && clinicId != "" ? clinicId : lrId;

                const reschedulData = await helperQuery.First({ table: "users", where: " id=" + reschedulId });
                const userType = reschedulData.user_type.charAt(0).toUpperCase() + reschedulData.user_type.slice(1);
                var CurrentDate = moment().format("YYYY-MM-DD") + " & " + moment().format("hh:mm A");


                if (user_result.length > 0) {
                    var first_name = user_result[0].first_name;
                }
                else {
                    var first_name = "User";
                }
                data.by = "custom";
                data.title = "Appointment Rescheduled";
                data.type = "reschedule_appointment";
                data.appointment_date = updated_appointment[0].appointment_date;
                data.time_slot = updated_appointment[0].from_time;
                data.message = `Hey ${first_name} ,<br> your appointment with ${userType} ${reschedulData.first_name} on ${CurrentDate}  has been rescheduled on ${helperFunction.dateFormat(appointment_date, "yyyy/mm/dd")} & ${time_slot} `,


                    await Notification.AddNotification(data);

                var p_detail = await helperQuery.Get({ table: "users", where: " id=" + updated_appointment[0].patient_id });

                if (p_detail) {
                    var payload = {
                        notification: {
                            title: "Appointment Rescheduled",
                            body: "Hey " + first_name + ",\nyour appointment with " + userType + " " + reschedulData.first_name + `on ${CurrentDate}  has been rescheduled on ${helperFunction.dateFormat(appointment_date, "yyyy/mm/dd")} & ${time_slot} `,
                        }
                    };
                    if ((p_detail[0].device_type == "Android") || (p_detail[0].device_type == "IOS")) {
                        await helperFunction.pushNotification(p_detail[0].device_token, payload);
                    }
                }
            }
        }

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.LabRadioAppointmentStatusUpdate = async (req, res) => {
    try {
        const { status, appointment_id } = req.body;
        const vali = helperFunction.customValidater(req, { status, appointment_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.LabRadioAppointmentStatusUpdate(status, appointment_id);
        const updated_appointment = await helperQuery.Get({ table: "appointments", where: "id =" + appointment_id });

        if (updated_appointment.length > 0) {
            let data = {};
            if (updated_appointment[0].patient_id) {
                data.doctor_id = updated_appointment[0].doctor_id;
                data.clinic_id = updated_appointment[0].clinic_id;
                data.from_user_id = updated_appointment[0].user_id;
                data.to_user_id = updated_appointment[0].patient_id;
                let clinicId = updated_appointment[0].clinic_id;
                let lrId = updated_appointment[0].user_id;
                let reschedulId = clinicId != null && clinicId != "" ? clinicId : lrId;

                const reschedulData = await helperQuery.First({ table: "users", where: " id=" + reschedulId });
                const userType = reschedulData.user_type.charAt(0).toUpperCase() + reschedulData.user_type.slice(1);

                var CurrentDate = moment().format("YYYY-MM-DD") + " & " + moment().format("hh:mm A");

                let user_result = await helperQuery.Get({ table: "users", where: "id =" + updated_appointment[0].patient_id });
                if (user_result.length > 0) {
                    var first_name = user_result[0].first_name;
                }
                else {
                    var first_name = "User";
                }

                if (status == "Approved") {
                    data.title = "Appointment Approved";
                    data.by = "custom";
                    data.type = "appointment_approved";
                    data.message = "Hey " + first_name + ",<br> your appointment with " + userType + " " + reschedulData.first_name + " on " + CurrentDate + " has been approved.";
                    var app_message = "Hey " + first_name + ",\nyour appointment with " + userType + " " + reschedulData.first_name + " on " + CurrentDate + " has been approved.";
                    var payload = {
                        notification: {
                            title: data.title,
                            body: app_message
                        }
                    };
                    if (user_result[0].device_type != "undefined") {
                        if ((user_result[0].device_type == "Android") || (user_result[0].device_type == "IOS")) {
                            await helperFunction.pushNotification(user_result[0].device_token, payload);
                        }
                    }
                }
                else if (status == "Cancelled") {
                    data.title = "Appointment Cancelled";
                    data.type = "appointment_cancelled";
                    data.by = "custom";
                    data.message = "Hey " + first_name + ",<br> your appointment with " + userType + " " + reschedulData.first_name + " on " + CurrentDate + " has been cancelled.";
                    var app_message = "Hey " + first_name + ",\nyour appointment with " + userType + " " + reschedulData.first_name + `on ${CurrentDate}  has been cancelled.`;
                    var payload = {
                        notification: {
                            title: data.title,
                            body: app_message
                        }
                    };
                    if (user_result[0].device_type != "undefined") {
                        if ((user_result[0].device_type == "Android") || (user_result[0].device_type == "IOS")) {
                            await helperFunction.pushNotification(user_result[0].device_token, payload);
                        }
                    }
                }

                if (status == "Cancelled" || status == "Approved") {
                    data.appointment_date = updated_appointment[0].appointment_date;
                    data.time_slot = updated_appointment[0].from_time;
                    await Notification.AddNotification(data);
                }
            }
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Appointment " + status + " Successfully!",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.LabRadioBillingHistory = async (req, res) => {
    try {
        const { user_id } = req.body;
        const role_id = req.body.role_id ?? "";
        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.LabRadioBillingHistory(user_id);
        console.log(result);
        const data = [];
        for (const item of result) {
            const appointment_id = item.id != undefined ? item.id : null;
            const patient_name = item.patient != undefined ? item.patient : null;
            const medwire_id = item.medwire_id != undefined ? item.medwire_id : null;
            const pin_code = item.pin_code != null ? item.pin_code : item.mpin_code ?? null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id ?? "[]") : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : "Self";
            const patient_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.from_time != undefined ? item.from_time : null;
            const booking_status = item.status != undefined ? item.status : null;
            const payment_status = item.payment_status != undefined ? item.payment_status : "Pending";

            let user_bank_detail = await helperQuery.Get({ table: "bank_detail", where: "created_by_id =" + user_id });
            let banking_status = "Pending";
            if (user_bank_detail.length > 0) {
                banking_status = "Success";
            }

            const medwire_status = item.admin_status;
            const payment_id = item.payment_txt_id != undefined ? item.payment_txt_id : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const reason_of_reschedule = item.reason_of_reschedule ?? "";
            const doctor = item.doctor != undefined ? item.doctor : null;
            const lab_name = item.lab_name != undefined ? item.lab_name : null;
            const cart_id = item.cart_id != undefined ? item.cart_id : null;
            const cart_item = item.cart_item != undefined && item.cart_item != "" && helperFunction.isJson(item.cart_item) == true ? JSON.parse(item.cart_item) : item.cart_item ?? null;
            const created_at = item.created_at != undefined ? item.created_at : null;
            const appointments_user_type = item.appointments_user_type ?? null;
            data.push({
                user_id, appointment_id, patient_id, patient_name, medwire_id, pin_code,
                member_id, promo_code_id, appointment_date,
                time_slot, total_amount, appointments_user_type,
                payment_id, grand_total,
                booking_status, payment_status, banking_status, medwire_status,
                reason_of_reschedule,
                doctor, lab_name, cart_id, created_at, mamber_names, cart_item
            });
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.allDoctorSearch = async (req, res) => {
    try {
        const { user_id, doctor_name, speciality, clinic_name } = req.body;
        const pcode = await helperQuery.All(`SELECT*FROM users WHERE id='${user_id}' LIMIT 1`);

        if ((clinic_name != undefined && clinic_name != "") || (doctor_name != undefined && doctor_name != "") || (speciality != undefined && speciality != "")) {
            var pin_code = req.body.pin_code != undefined && req.body.pin_code != "undefined" && req.body.pin_code != "" ? req.body.pin_code : null;
        } else {
            var pin_code = req.body.pin_code != undefined && req.body.pin_code != "undefined" && req.body.pin_code != "" ? req.body.pin_code : pcode != undefined && pcode.length > 0 ? pcode[0]?.pin_code : "0";
        }
        console.log(pin_code, "------------------");

        const result = await bookApointment.allDoctorSearch({ doctor_name, speciality, clinic_name, pin_code });
        if (speciality != undefined && speciality != "") {
            var data = searchDataInArrayObj(speciality, doctor_name, clinic_name, pin_code, result);
        } else {
            var data = result;
        }

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: result.length > 0 ? "Successfully!" : "Opps! There is no clinic or doctor in your area",
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.doctorSpecialities = async (req, res) => {
    try {
        const result = await bookApointment.doctorSpecialities();
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.allclinicList = async (req, res) => {
    try {
        const data = [];
        const result = await bookApointment.allclinicList();
        result.map((item) => {
            data.push({
                clinic_id: item.id ?? "-",
                permanent_id: item.patient_id ?? "-",
                clinic_name: item.first_name ?? "-",
                permanent_id: item.patient_id ?? "-",
                email: item.email ?? "-",
                mobile: item.mobile ?? "-",
                address: item.address ?? "-",
                pin_code: item.pin_code ?? "-",
                online_offline_status: item.online_offline_status ?? "-",
                created_at: item.created_at ?? "-",
            });
        });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.addAppointmentForDoctor = async (req, res) => {
    try {
        const { patient_id, time_slot, type, consulting_fee, appointment_date, total_amount, grand_total } = req.body;
        var reason = req.body.reason;

        if (typeof reason === "object") {
            var reason = JSON.stringify(reason);
        } else {
            console.log("string");
        }


        if (Array.isArray(reason) != true) {
            console.log("arr");
        }
        if (helperFunction.isJson(reason) != true) {
            return res.status(500).json({
                status_code: 500,
                status: "error",
                message: "reason must be array stringfy only!",
            });
        }

        const vali = helperFunction.customValidater(req, { patient_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, grand_total });
        if (vali) {
            return res.status(500).json(vali);
        }
        const user_id = req.body.user_id != undefined && req.body.user_id != "" ? req.body.user_id : 0;
        const doctorClinic = await helperQuery.All(`SELECT*FROM doctors_clinic WHERE id='${user_id}' LIMIT 1`);

        const clinic_id = req.body.clinic_id != undefined ? req.body.clinic_id : doctorClinic[0]?.clinic_id ?? 0;
        const doctor_id = req.body.doctor_id != undefined ? req.body.doctor_id : doctorClinic[0]?.doctor_id ?? 0;

        const member_id = req.body.member_id != undefined && req.body.member_id != "" ? req.body.member_id : 0;
        const created_by_id = req.body.created_by_id != undefined && req.body.created_by_id != "" ? req.body.created_by_id : patient_id ?? 0;
        const promo_code_id = req.body.promo_code_id != undefined && req.body.promo_code_id != "" ? req.body.promo_code_id : 0;


        var payment_order_id = process.env.APP_NAME + "_" + new Date().getTime();


        var user_detail = await helperQuery.Get({ table: "users", where: "id =" + patient_id });


        if (user_detail.length > 0) {
            var email = user_detail[0].email;
        }
        else {
            if (user_detail[0].created_by_id > 0) {
                var user_detail_created_by = await helperQuery.Get({ table: "users", where: "id =" + user_detail[0].created_by_id });
                var email = user_detail_created_by[0].email;
            }

        }


        var created_at = moment().format("YYYY-MM-DD HH:mm:ss");
        const result = await bookApointment.addAppointmentForDoctor({ clinic_id, doctor_id, patient_id, user_id, member_id, created_by_id, promo_code_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, grand_total, payment_order_id, created_at });

        var source_type = "WEB";
        if (req.body.source_type == "APP") {
            var source_type = "APP";
        }

        var detail = "appointment_id=" + result.insertId + "&&total_amount=" + grand_total + "&&email=" + email + "&&payment_order_id=" + payment_order_id + "&&type=appointment&&source_type=" + source_type;
        var url = process.env.APP_URL + "api/auth/payment-appointment?detail=" + btoa(detail);

        const drData = await helperQuery.First({ table: "users", where: "id=" + doctor_id });
        const noticData = {
            message: "booked appointment with Dr. " + drData.first_name ?? "-",
            by: "clinic",
            from_user_id: patient_id,
            to_user_id: clinic_id,
            title: "Doctor Appointment Booked",
            type: "Doctor_appointment_booked",
            appointment_date: appointment_date,
            time_slot: time_slot,
        };
        Notification.AddNotification(noticData);

        const user_detail2 = await helperQuery.Get({ table: "users", where: " id=" + clinic_id });

        if (user_detail2.length > 0) {
            var payload = {
                notification: {
                    title: "Doctor Appointment Booked",
                    body: "booked appointment with Dr. " + drData.first_name ?? "-"
                }
            };
            if ((user_detail2[0].device_type == "Android") || (user_detail2[0].device_type == "IOS")) {
                await helperFunction.pushNotification(user_detail2[0].device_token, payload);
            }
        }

        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: {
                "id": result.insertId,
                "url": url

            }
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.clinicAddAppointmentForDoctor = async (req, res) => {
    try {
        const { clinic_id, doctor_id, patient_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, payment_status, grand_total } = req.body;

        const vali = helperFunction.customValidater(req, { clinic_id, doctor_id, patient_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, payment_status, grand_total });
        if (vali) {
            return res.status(500).json(vali);
        }
        const user_id = req.body.user_id != undefined && req.body.user_id != "" ? req.body.user_id : 0;
        const doctorClinic = await helperQuery.All(`SELECT*FROM doctors_clinic WHERE id='${user_id}' LIMIT 1`);

        const member_id = req.body.member_id != undefined && req.body.member_id != "" ? req.body.member_id : 0;
        const created_by_id = req.body.created_by_id != undefined && req.body.created_by_id != "" ? req.body.created_by_id : patient_id ?? 0;
        const promo_code_id = req.body.promo_code_id != undefined && req.body.promo_code_id != "" ? req.body.promo_code_id : 0;

        var created_at = moment().format("YYYY-MM-DD HH:mm:ss");

        const result = await bookApointment.clinicAddAppointmentForDoctor({ clinic_id, doctor_id, patient_id, user_id, member_id, created_by_id, promo_code_id, time_slot, type, consulting_fee, reason, appointment_date, total_amount, payment_status, grand_total, created_at });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.AppointmentForDoctorList = async (req, res) => {
    try {
        const { user_id } = req.body;
        const vali = helperFunction.customValidater(req, { user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.AppointmentForDoctor(user_id);
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.getAllAppointmentForDoctorList = async (req, res) => {
    try {
        const result = await bookApointment.AppointmentForAllDoctor();
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.doctorDetail = async (req, res) => {
    try {
        const id = req.body.id;
        console.log(id);
        const resutl = await bookApointment.doctorDetail({ id });
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: resutl
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};
exports.patientBillingHistoryLabRadio = async (req, res) => {
    try {
        const { role_id, user_id } = req.body;

        const vali = helperFunction.customValidater(req, { role_id, user_id });
        if (vali) {
            return res.status(500).json(vali);
        }
        const result = await bookApointment.patientBillingHistoryLabRadio({ role_id, user_id });
        const data = [];
        for (const item of result) {
            const appointment_id = item.id != undefined ? item.id : null;
            const patient_name = item.patient != undefined ? item.patient : null;
            const medwire_id = item.medwire_id != undefined ? item.medwire_id : null;
            const pin_code = item.pin_code != null ? item.pin_code : item.mpin_code ?? null;
            const user_id = item.user_id != undefined ? item.user_id : null;
            const member_id = item.member_id != undefined ? item.member_id : null;
            const mamber_ids = member_id != undefined && member_id != null && JSON.parse(member_id) ? JSON.parse(member_id ?? "[]") : null;
            const mamber_names = mamber_ids != undefined && mamber_ids != null && mamber_ids.length > 0 ? await helperQuery.All("SELECT first_name FROM users WHERE id IN (" + mamber_ids + ")") : "Self";
            const patient_id = item.created_by_id != undefined ? item.created_by_id : null;
            const promo_code_id = item.promo_code_id != undefined ? item.promo_code_id : null;
            const appointment_date = item.appointment_date != undefined ? item.appointment_date : null;
            const time_slot = item.from_time != undefined ? item.from_time : null;
            const booking_status = item.status != undefined ? item.status : null;
            const payment_status = item.payment_status != undefined ? item.payment_status : "PENDING";
            const appointments_user_type = item.appointments_user_type != undefined ? item.appointments_user_type : null;
            const banking_status = "Pending";
            const medwire_status = "Pending";
            const payment_id = item.payment_txt_id != undefined ? item.payment_txt_id : null;
            const total_amount = item.total_amount != undefined ? item.total_amount : null;
            const grand_total = item.grand_total != undefined ? item.grand_total : null;
            const reason_of_reschedule = item.reason_of_reschedule ?? "";
            const doctor = item.doctor != undefined ? item.doctor : null;
            const lab_name = item.lab_name != undefined ? item.lab_name : null;
            const cart_id = item.cart_id != undefined ? item.cart_id : null;
            const cart_item = item.cart_item != undefined && item.cart_item != "" && helperFunction.isJson(item.cart_item) == true ? JSON.parse(item.cart_item) : item.cart_item;
            const created_at = item.created_at != undefined ? item.created_at : null;
            const lab_address = item.lab_address ?? null;
            data.push({
                user_id, appointment_id, patient_id, patient_name, medwire_id, pin_code,
                member_id, promo_code_id, appointment_date, appointments_user_type,
                time_slot, total_amount, lab_address,
                payment_id, grand_total,
                booking_status, payment_status, banking_status, medwire_status,
                reason_of_reschedule,
                doctor, lab_name, cart_id, created_at, mamber_names, cart_item
            });
        }
        return res.status(200).json({
            status_code: 200,
            status: "success",
            message: "Successfully!",
            data: data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status_code: 500,
            status: "error",
            message: "something went wrong!"
        });
    }
};

exports.viewDoctorAvailability = async (req, res) => {
    const { doctor_id, clinic_id, date } = req.body;

    var valid = helperFunction.customValidater(req, { doctor_id, clinic_id, date });
    if (valid) {
        return res.status(500).json(valid);
    }

    let bookedSlots = [];
    let St = await helperQuery.All(`SELECT
                                        * 
                                        FROM
                                        appointments 
                                        WHERE
                                        doctor_id = '${doctor_id}' 
                                        AND status != 'Cancelled' 
                                        AND DATE_FORMAT(appointment_date, '%y-%m-%d') = DATE_FORMAT('${date}', '%y-%m-%d')`);

    console.log(St, "------------------");

    if (St.length > 0) {
        St.map((item) => {
            const Stime = item.from_time ?? "00:00";
            bookedSlots.push({ Stime });
        });
    }

    bookApointment.viewDoctorAvailability({ doctor_id, clinic_id, date, bookedSlots }, (err, data) => {
        if (err) {
            res.status(500).send({
                status_code: 500,
                status: "error",
                message: "Something Went Wrong"
            });
            return;
        }
        if (data) {
            helperFunction.check_today_current_slote();
            res.status(200).send({
                status_code: 200,
                status: "success",
                message: "Doctor availability fetch Successfully",
                totalAvlailableSlots: data.length,
                result: data,
                bookedSlots: bookedSlots
            });
        }
    });
};

function searchDataInArrayObj(search, doctor_name, clinic_name, pin_code, array) {
    let data = [];

    for (let index = 0; index < array.length; index++) {
        // console.log(array[index].speciality_name.split(','));
        let specialityData = array[index].speciality_name.split(",");
        for (let j = 0; j < specialityData.length; j++) {
            if (doctor_name != undefined && doctor_name != ""
                && clinic_name != undefined && clinic_name != ""
                && pin_code != undefined && pin_code != "") {
                if (
                    specialityData[j].trim() == search
                    && doctor_name != undefined && array[index].doctor == doctor_name
                    && clinic_name != undefined && array[index].clinic == clinic_name
                    && pin_code != undefined && array[index].clinic_pincode == pin_code
                ) {
                    data.push(array[index]);
                } else if (
                    specialityData[j].trim() == search
                    && doctor_name != undefined && array[index].doctor == doctor_name
                    && pin_code != undefined && array[index].clinic_pincode == pin_code
                ) {
                    data.push(array[index]);
                } else if (
                    specialityData[j].trim() == search
                    && doctor_name != undefined && array[index].doctor == doctor_name
                ) {
                    data.push(array[index]);
                } else if (
                    specialityData[j].trim() == search
                    && clinic_name != undefined && array[index].clinic == clinic_name
                    && pin_code != undefined && array[index].clinic_pincode == pin_code
                ) {
                    data.push(array[index]);
                } else if (
                    specialityData[j].trim() == search
                    && clinic_name != undefined && array[index].clinic == clinic_name
                ) {
                    data.push(array[index]);
                } else if (
                    specialityData[j].trim() == search
                    && doctor_name != undefined && array[index].doctor == doctor_name
                    && clinic_name != undefined && array[index].clinic == clinic_name
                ) {
                    data.push(array[index]);
                } else if (
                    specialityData[j].trim() == search
                    && array[index].clinic_pincode == pin_code && pin_code != undefined
                ) {
                    data.push(array[index]);
                }

            } else if (
                specialityData[j].trim() == search
            ) {
                data.push(array[index]);
            }
        }
    }
    return data;
}
