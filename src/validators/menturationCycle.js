const Joi = require("joi");
const validatorHandler = require("../middlewares/validatorHandler");

const menturationCycleAdd = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id:Joi.required(),
        start_date:Joi.required(),
        end_date:Joi.required(),
        bg_color_class:Joi.required(),
        nextDays:Joi.required(),
        
    });
    validatorHandler(req, res, next, schema);
};
const menturationCycleEdit = (req, res, next) => {
    const schema = Joi.object().keys({
        m_id:Joi.required(),
        user_id:Joi.required(),
        start_date:Joi.required(),
        end_date:Joi.required(),
        bg_color_class:Joi.required(),
        
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    menturationCycleAdd,
    menturationCycleEdit
};