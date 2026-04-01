const User = require("../models/user.model");

const checkDoctorExistenceForUpdate =  (req, res, next) => {
    const { email_id,mobile_number,doctor_id } = req.body;
    User.findByEmailAndMobileForUpdate(email_id,mobile_number,doctor_id, (_, data) => {
   
        if (data) {         

            res.status(500).send({
                status_code : 500,
                status: "error",
                message: "Email or Mobile Number is already exist"
            });
            return;
        }
        next();
    });
};
module.exports = checkDoctorExistenceForUpdate;