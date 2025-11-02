const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');

const notification_pre_medicine = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        member_id: Joi.required(),
        medicine_name: Joi.required(),
        medicine_type : Joi.optional(),
        quantity: Joi.optional(),
        frequency: Joi.required(),
        take_time_one: Joi.required(),
        take_dose_one: Joi.required(),
        take_time_two: Joi.required(),
        take_dose_two: Joi.required(),
        take_time_third: Joi.required(),
        take_dose_third: Joi.required(),
        take_time_fourth: Joi.required(),
        take_dose_fourth: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
const edit_notification_pre_medicine = (req, res, next) => {
    const schema = Joi.object().keys({
        medicine_id:Joi.required(),
        user_id: Joi.required(),
        member_id: Joi.required(),
        medicine_name: Joi.required(),
        medicine_type : Joi.required(),
        quantity: Joi.required(),
        frequency: Joi.required(),
        take_time_one: Joi.required(),
        take_dose_one: Joi.required(),
        take_time_two: Joi.required(),
        take_dose_two: Joi.required(),
        take_time_third: Joi.required(),
        take_dose_third: Joi.required(),
        take_time_fourth: Joi.required(),
        take_dose_fourth: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
const list_notification_pre_medicine = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        member_id: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const pre_notification = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        member_id: Joi.required(),
        name: Joi.required(),
        date_time: Joi.required(),
        type: Joi.required(),
        time:Joi.string()
    });
    validatorHandler(req, res, next, schema);
};
const list_pre_notification = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        member_id: Joi.required(),
        type: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
module.exports = {
    notification_pre_medicine,
    list_notification_pre_medicine,
    pre_notification,
    list_pre_notification,
    edit_notification_pre_medicine
};