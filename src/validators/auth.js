const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');

const signup = (req, res, next) => {
    const schema = Joi.object().keys({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().trim()
            .email()
            .required(),
        password: Joi.string()
            .trim()
            .min(6)
            .required(),
        mobile: Joi.string()
        .trim()
        .min(10)
        .max(10)
        .required(),
        alternate_mobile:Joi.optional(),
        user_type: Joi.string()
            .required(),
        role_id: Joi.string()
            .required(),
    });
    validatorHandler(req, res, next, schema);
};
const signupradioValidator = (req, res, next) => {
    const schema = Joi.object().keys({
        username: Joi.required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().min(6).required(),
        mobile: Joi.string().trim().min(10).max(10).required(),
        user_type: Joi.string().required(),
        role_id: Joi.string().required(),
        adhar_card: Joi.required(),
        approve_document: Joi.any(),
    });
    validatorHandler(req, res, next, schema);
};

const signin = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.required(),
        password: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
const signinRole = (req, res, next) => {
    const schema = Joi.object().keys({
        role_id:Joi.required(),
        email: Joi.required(),
        password: Joi.required()
    });
    validatorHandler(req, res, next, schema);
};
const addMember = (req, res, next) => {
    const schema = Joi.object().keys({
        first_name: Joi.string().trim().required(),
        last_name: Joi.string().trim(),
        mobile:Joi.string().trim(),
        adhar_card: Joi.required(),
        date_of_birth: Joi.string().trim().required(),
        gender: Joi.string().trim().required(),
        profile_image: Joi.any(),
        created_by_id: Joi.required(),

    });
    validatorHandler(req, res, next, schema);
};

const updatePassword = (req, res, next) => {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required(),
        password: Joi.string()
            .trim()
            .min(6)
            .required(),
        old_password: Joi.string()
            .trim()
            .required(),

    });
    validatorHandler(req, res, next, schema);
};
// vineet
const profileValidator = (req, res, next) => {
    const schema = Joi.object().keys({
        clinic_id:Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const forgotPassword = (req, res, next) => {
    const schema = Joi.object().keys({
        email_id:  Joi.string().trim().email().required(),
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    signup,
    signin,
    signinRole,
    addMember,
    updatePassword,
    signupradioValidator,
    profileValidator,
    forgotPassword
};