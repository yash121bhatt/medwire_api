const promoCode = require('../models/promoCode.model');

const checkPromoCodeExistence =  (req, res, next) => {
    const { promo_code,user_id } = req.body;
    promoCode.findByCode(promo_code,user_id, (_, data) => {
        if (data) {
            res.status(500).send({
                status: 'error',
                message: `Promo Code is already exist`
            });
            return;
        }
        next();
    });
}
module.exports = checkPromoCodeExistence;