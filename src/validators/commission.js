const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');


const addCommissionValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        user_ids: Joi.array().required(),
        admin_id: Joi.number().required(),
        commission_for: Joi.string().valid('lab','radiology').required(),
        commission_percent: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const updateCommissionValidation1 = (req, res, next) => {
    const schema = Joi.object().keys({
        commission_id: Joi.number().required(),
        user_id: Joi.required(),
        admin_id: Joi.number().required(),
        commission_id: Joi.number().required(),
        commission_for: Joi.string().valid('lab','radiology').required(),
        commission_percent: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const getCommissionDetailValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        commission_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const listCommissionValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        admin_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};


const deleteCommissionValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        commission_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    addCommissionValidation,
    updateCommissionValidation1,
    listCommissionValidation,
    getCommissionDetailValidation,
    deleteCommissionValidation,

};