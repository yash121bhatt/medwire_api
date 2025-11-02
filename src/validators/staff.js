const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');


const deleteStaffValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        staff_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};


const getStaffDetailValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        staff_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const listStaffValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        clinic_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    deleteStaffValidation,
    listStaffValidation,
    getStaffDetailValidation,
};