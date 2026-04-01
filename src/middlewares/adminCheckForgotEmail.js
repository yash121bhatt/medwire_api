const Admin = require("../models/admin.model");
const adminCheckForgotEmail = (req, res, next)=>{
    const { email } = req.body;
    Admin.findByEmail(email, (_, data) => {
        if (!data) {
            res.status(400).send({
                status: "error",
                message: `A user with email address '${email}' not exits`
            });
            return;
        }
        next();
    });
};
module.exports = adminCheckForgotEmail;