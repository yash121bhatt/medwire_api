const Joi = require("joi");
const validatorHandler = require("../middlewares/validatorHandler");

const memberSearch = (req, res, next) => {
    const schema = Joi.object().keys({
        mobile: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const newVisit = (req, res, next) => {
    const schema = Joi.object().keys({
        mobile: Joi.required(),
        lab_id : Joi.required(),
        member_id : Joi.required(),
        category : Joi.required(),
        sub_category : Joi.required()
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    memberSearch,
    newVisit
};