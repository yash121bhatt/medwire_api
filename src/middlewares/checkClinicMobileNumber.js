const User = require('../models/user.model');

const checkClinicMobileNumber =  (req, res, next) => {
    var email_id = req.body.email_id;
    var mobile_number = req.body.mobile_number;   

    User.findByEmailAndMobile(email_id,mobile_number, (_, data) => {
     
        if (data) {
            res.status(400).send({
                status_code : "400",
                status: 'error',
                message: `A clinic/hospital with mobile number '${mobile_number}' already exists`
            });
            return;
        }
        next();
    });
}

module.exports = checkClinicMobileNumber;