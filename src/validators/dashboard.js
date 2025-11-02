const Joi = require('joi');
const validatorHandler = require('../middlewares/validatorHandler');


const dashboardChart = (req, res, next) => {
    const schema = Joi.object().keys({
        lab_id : Joi.required(),
        type : Joi.required(),
    });
    validatorHandler(req, res, next, schema);
};

const latestTestReportValidate = (req, res, next) => {
    const schema = Joi.object().keys({
        member_id : Joi.required(),

    });
    validatorHandler(req, res, next, schema);
};

module.exports = {
    dashboardChart,
    latestTestReportValidate
};