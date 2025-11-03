const { async } = require("q");
const helperFunction = require("../helper/helperFunction");
const helperQuery = require("../helper/helperQuery");
const User = require("../models/user.model");
const { transporter: transporter } = require("../helper/helper");
const { hash: hashPassword, compare: comparePassword } = require('../utils/password');

const checkEmailVerify = (req, res, next) => {
  const { email, role_id, password } = req.body;
  // console.log({ email,role_id });
  const valid = helperFunction.customValidater(req, { email, password, role_id });
  if (valid) {
    return res.status(400).json(valid);
  }
  User.findByCreatedByIdWithemailVerify(email, role_id).then((result) => {
    // console.log(result);
    if (result.length > 0) {
      next();
    } else {
      helperQuery
        .All(
          `SELECT * FROM users WHERE (email='${email}' OR mobile = '${email}')`
        )
        .then(async (userData) => {
          // AND role_id='${role_id}'


          const forgot_otp = await helperFunction.generateOTP(6);
          const id = userData[0]?.id ?? 0;
          const token = helperFunction.genrateToken({ id }, '1d');

          if (comparePassword(password.trim(), userData[0]?.password) == true) {
            var msg = `Sorry!,Your account is not verified!.`;
          } else {
            var msg = 'Your password is incorrect.';
            return res.status(500).send({
              status_code: 500,
              status: "error",
              message: msg,
            });
          }

          const data = await User.otpSave({ email, forgot_otp, id });
          if (data) {

            const name = userData[0].first_name;
            const logo = process.env.APP_LOGO;
            const admin_login = process.env.ADMIN_LOGIN_URL;
            const app_name = process.env.APP_NAME;

            if (userData[0].mobile) {
              var message = forgot_otp + " is your OTP for Verification of your account at MedWire. Thank you.";
              var mobile_number = userData[0].mobile;
              await helperFunction.sendJapiSMS(mobile_number, message);
            }

            helperFunction.template(transporter, true);
            transporter.sendMail(
              {
                from: process.env.MAIL_FROM_ADDRESS,
                to: email,
                subject: "MedWire Confirmation Mail",
                template: "signInRoleVarification",
                context: { name, email, forgot_otp, logo, app_name },
              },
              function (error, info) {
                if (error) {
                  console.log("email", error);
                }
              }
            );

            return res.status(203).send({
              status_code: 203,
              status: "success",
              message: msg,
              token: token,
            });
          }
        });
    }
  });
};

module.exports = checkEmailVerify;
