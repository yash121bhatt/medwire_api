const helperFunction = require('../helper/helperFunction');
const User = require('../models/user.model');

const checkExistence =  (req, res, next) => {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const role_id  = req.body.role_id!=undefined && req.body.role_id!=null && req.body.role_id!='' ? req.body.role_id:2;
   
    User.findByEmailAndMobileAndRole(email,mobile,role_id, (_, data) => {
        if (data) {
            res.status(400).send({
                status: 'error',
                message: helperFunction.is_mobile_number_email(email,'User already registered',true)
            });
            return;
        }
        next();
    });
}

module.exports = checkExistence;