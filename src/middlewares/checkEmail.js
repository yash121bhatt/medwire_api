const helperFunction = require('../helper/helperFunction');
const User = require('../models/user.model');

const checkEmail =  (req, res, next) => {
    const { email } = req.body;
    User.findByEmail(email, (_, data) => {
        if (data) {
            res.status(400).send({
                status: 'error',
                // message:helperFunction.is_mobile_number_email(email,'Please ignore if you are already a registered user',true)
                message:helperFunction.is_mobile_number_email(email)

            });
            return;
        }
        next();
    });
}

module.exports = checkEmail;