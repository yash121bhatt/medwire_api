const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');



const addUpdateBankDetailValidator = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.number().required(),
        role_id: Joi.number().optional(),
        beneficiary_name:Joi.string().required(),
        bank_name:Joi.string().required(),
        bank_account_number:Joi.required(),
        ifsc_code:Joi.string().required(),    
        account_type:Joi.string().required()
    });
    validatorHandler(req, res, next, schema);
};

const bankDetailValidator = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.number().required(),
        role_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    addUpdateBankDetailValidator,
    bankDetailValidator
};