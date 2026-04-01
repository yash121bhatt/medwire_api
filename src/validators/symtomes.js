const Joi = require("joi");
const validatorHandler = require("../middlewares/validatorHandler");


const symtomesAdd = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id : Joi.required(),
        member_id : Joi.required(),
        symtomeslist : Joi.required()
    });
    validatorHandler(req, res, next, schema);
};

const symtomesList = (req, res, next) => {
    const schema  = Joi.object().keys({
        user_id:Joi.required(),
        member_id:Joi.required()
    });
    validatorHandler(req, res, next, schema);
};

const addpregnantWomen = (req, res, next)=>{
    const schema = Joi.object().keys({
        user_id:Joi.required(),
        name:Joi.required(),
        date_of_pregnancy:Joi.required()
    });
    validatorHandler(req,res,next,schema);

};

module.exports = {
    symtomesAdd,
    symtomesList,
    addpregnantWomen
};