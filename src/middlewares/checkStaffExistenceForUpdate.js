const Staff = require('../models/staff.model');

const checkStaffExistenceForUpdate =  (req, res, next) => {

    const { email_id,mobile_number,staff_id } = req.body;
    Staff.findByEmailAndMobileForUpdate(email_id,mobile_number,staff_id, (_, data) => {
   
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
module.exports = checkStaffExistenceForUpdate;