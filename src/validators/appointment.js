const Joi = require("joi");
const validatorHandler = require("../middlewares/validatorHandler");

const getDoctorsClinicValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const getClinicAppointmentValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        clinic_id: Joi.number().required(),
        role_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const addSymptomValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
        symptom_name: Joi.string().required(),
    });
    validatorHandler(req, res, next, schema);
};

const symptomListValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const addHealthStatusValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
        heart_rate: Joi.string().required(),
        blood_pressure: Joi.string().required(),
        respiratory_rate: Joi.string().required(),
        oxygen_saturation: Joi.string().required(),
        temperature: Joi.string().required(),
        bmi: Joi.string().required(),
    });
    validatorHandler(req, res, next, schema);
};

const healthStatusListValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};


const addExamFindingValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
        examination_finding_name: Joi.string().required(),
    });
    validatorHandler(req, res, next, schema);
};

const examFindingListValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const addAdviceValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
        advice: Joi.string().required(),
    });
    validatorHandler(req, res, next, schema);
};

const adviceListValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const addFollowUpValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
        follow_up_interval: Joi.string().required(),
    });
    validatorHandler(req, res, next, schema);
};

const followupListValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
    });
    validatorHandler(req, res, next, schema);
};

const addDiagnosticValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        doctor_id: Joi.number().required(),
        appointment_id: Joi.number().required(),
        follow_up_interval: Joi.string().required(),
    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    getDoctorsClinicValidation,
    getClinicAppointmentValidation,
    addSymptomValidation,
    symptomListValidation,
    addHealthStatusValidation,
    healthStatusListValidation,
    addExamFindingValidation,
    examFindingListValidation,
    addAdviceValidation,
    adviceListValidation,
    addFollowUpValidation,
    followupListValidation,
    addDiagnosticValidation
};