const User = require('../models/user.model');

const checkDoctorExistence =  (req, res, next) => {
    const { email_id,mobile_number } = req.body;
    User.findByEmailAndMobile(email_id,mobile_number, (_, data) => {
        if (data) {
            res.status(500).send({
                status: 'error',
                message: `Email or Mobile Number is already exist`
            });
            return;
        }
        next();
    });
}
module.exports = checkDoctorExistence;