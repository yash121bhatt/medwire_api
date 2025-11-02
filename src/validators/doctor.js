const { json } = require('body-parser');
const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');


const getDoctorDetailsValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.number().required(),
        staff_id:Joi.optional()
    });
    validatorHandler(req, res, next, schema);
};


const listDoctorValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        clinic_id: Joi.number().required(),
        staff_id : Joi.optional()
    });
    validatorHandler(req, res, next, schema);
};


const deleteDoctorValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.number().required(),
        created_by_id: Joi.number().required(),
        staff_id:Joi.optional()
    });
    validatorHandler(req, res, next, schema);
};


const addDoctorFeeValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.required(),
        clinic_id: Joi.number().required(),
        is_available_for_offline_visit: Joi.optional(),
        is_available_for_online_visit: Joi.optional(),
        online_consulting_fee: Joi.optional(),
        clinic_visit_consulting_fee: Joi.optional(),
    });
    validatorHandler(req, res, next, schema);
};


const updateDoctorFeeValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        fee_id: Joi.number().required(),
        doctor_id: Joi.number().required(),
        is_available_for_offline_visit: Joi.optional(),
        is_available_for_online_visit: Joi.optional(),
        online_consulting_fee: Joi.optional(),
        clinic_visit_consulting_fee: Joi.optional(),
    });
    validatorHandler(req, res, next, schema);
};


const deleteDoctorFeeValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        fee_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const getDoctorListValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        clinic_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    getDoctorDetailsValidation,
    listDoctorValidation,
    deleteDoctorValidation,
    addDoctorFeeValidation,
    deleteDoctorFeeValidation,
    getDoctorListValidation,
    updateDoctorFeeValidation
};