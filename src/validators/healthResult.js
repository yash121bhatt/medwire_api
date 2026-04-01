const Joi = require("joi");
const validatorHandler = require("../middlewares/validatorHandler");

const addBmi = (req, res, next) => {
    const schema = Joi.object().keys({
        Height: Joi.required(),
        Weight: Joi.required(),
        BMI: Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        createdate: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const heartRate = (req, res, next) => {
    const schema = Joi.object().keys({
        heart_rate: Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        createdate: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const bloodPressure = (req, res, next) => {
    const schema = Joi.object().keys({
        blood_pressure: Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        createdate: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const respiratory = (req, res, next) => {
    const schema = Joi.object().keys({
        respiratory_rate: Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        createdate: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const oxygen = (req, res, next) => {
    const schema = Joi.object().keys({
        oxygen_saturation: Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        createdate: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const temperature = (req, res, next) => {
    const schema = Joi.object().keys({
        temperature: Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        createdate: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const listdata = (req, res, next) => {
    const schema = Joi.object().keys({
        member_id: Joi.required(),
        user_id: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const historyNotepadData = (req, res, next) => {
    const schema = Joi.object().keys({
        member_id: Joi.required(),
        user_id: Joi.required(),
        type: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const historyNotepadValidator = (req, res, next) => {
    const schema = Joi.object().keys({
        member_id: Joi.required(),
        user_id: Joi.required(),
        type: Joi.required(),
        description : Joi.required(),
        created_date : Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
const historyNotepadsingleData = (req, res, next) => {
    const schema = Joi.object().keys({
        hn_id : Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const historyNotepadUpdateData = (req, res, next) => {
    const schema = Joi.object().keys({
        hn_id : Joi.required(),
        member_id: Joi.required(),
        user_id: Joi.required(),
        type: Joi.required(),
        description : Joi.required(),
        created_date : Joi.required()
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    addBmi,
    oxygen,
    temperature,
    respiratory,
    bloodPressure,
    heartRate,
    listdata,
    historyNotepadData,
    historyNotepadValidator,
    historyNotepadsingleData,
    historyNotepadUpdateData
};