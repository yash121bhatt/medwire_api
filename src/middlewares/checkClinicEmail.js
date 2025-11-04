const User = require("../models/user.model");

const checkClinicEmail =  (req, res, next) => {
    var email = req.body.email_id;
    User.findByEmail(email, (_, data) => {
        if (data) {
            res.status(400).send({
                status_code : "400",
                status: "error",
                message: `A clinic/hospital with email address '${email}' already exists`
            });
            return;
        }
        next();
    });
};

module.exports = checkClinicEmail;