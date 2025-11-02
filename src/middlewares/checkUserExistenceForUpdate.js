const User = require('../models/user.model');

const checkUserExistenceForUpdate =  (req, res, next) => {
    const { email_id,mobile_number,user_id } = req.body;
    User.findByEmailAndMobileForUpdate(email_id,mobile_number,user_id, (_, data) => {
   
        if (data) {         

            res.status(400).send({
                status: 'error',
                message: `EmailId or Mobile Number is already exist`
            });
            return;
        }
        next();
    });
}
module.exports = checkUserExistenceForUpdate;