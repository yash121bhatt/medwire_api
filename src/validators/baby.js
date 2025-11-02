const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');

const add_baby = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        baby_name: Joi.required(),
        date_of_birth: Joi.required(),
        baby_gender: Joi.required(),
        father_height: Joi.required(),
        mother_height: Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const list_baby = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
const update_baby = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        baby_name: Joi.required(),
        date_of_birth: Joi.required(),
        baby_gender: Joi.required(),
        father_height: Joi.required(),
        mother_height: Joi.required(),
        baby_id : Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};
const delete_baby = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
        baby_id: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
module.exports = {
    add_baby,
    list_baby,
    update_baby,
    delete_baby
};