const ClinicOrHospital = require("../models/clinicorhospital.model");

const checkClinicHospitalForgotEmail =  (req, res, next) => {
    const { email_id } = req.body;
   

    ClinicOrHospital.findByEmail(email_id, (_, data) => {
        if (data == null) {
            res.status(400).send({
                status: "error",
                message: `A clinic/hospital with email address '${email_id}' is not registered`
            });
            return;
        }
        next();
    });
};

module.exports = checkClinicHospitalForgotEmail;