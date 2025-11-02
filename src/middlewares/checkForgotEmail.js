const helperFunction = require('../helper/helperFunction');
const User = require('../models/user.model');

const checkForgotEmail =  (req, res, next) => {
    const { email } = req.body;
    User.findByEmail(email, (_, data) => {
        if (!data) {
            res.status(400).send({
                status_code: '400',
                status: 'error',
                message:helperFunction.is_mobile_number_email(email,'User does not Exist')
            });
            return;
        }
        next();
    });
}

module.exports = checkForgotEmail;