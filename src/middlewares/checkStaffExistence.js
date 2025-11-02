const User = require('../models/user.model');

const checkStaffExistence =  (req, res, next) => {
    const { email_id,mobile_number } = req.body;
    User.findByEmailAndMobile(email_id,mobile_number, (_, data) => {
        console.log("here");
        if (data) {
            res.status(400).send({
                status: 'error',
                message: `Email or Mobile Number is already exist`
            });
            return;
        }
        next();
    });
}
module.exports = checkStaffExistence;