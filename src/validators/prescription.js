const Joi = require("joi");
const validatorHandler = require("../middlewares/validatorHandler");


const prescriptionFooterValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        clinic_address: Joi.string().required(),
        clinic_id: Joi.number().required(),
        staff_id:Joi.optional()
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    prescriptionFooterValidation,
};