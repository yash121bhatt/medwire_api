const helperFunction = require('../helper/helperFunction');
const User = require('../models/user.model');

const checkMemberLimit =  (req, res, next) => {
    const { created_by_id } = req.body;
    console.log(req.body);
    console.log(created_by_id);
    const valid = helperFunction.customValidater(req,{created_by_id});
    if (valid) {
        return res.status(400).json(valid);
    }

    User.findByCreatedById(created_by_id)
    .then(result=>{
        if (result.length>3) {
            return res.status(400).send({
                status_code:400,
                status: 'error',
                message: `Sorry!,You have already added 4 member befor.`
            });
        }
        next();
    })
}

module.exports = checkMemberLimit;