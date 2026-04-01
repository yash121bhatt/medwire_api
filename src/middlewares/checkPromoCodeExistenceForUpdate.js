const promoCode = require("../models/promoCode.model");

const checkPromoCodeExistenceForUpdate =  (req, res, next) => {
    const { promo_code,promo_code_id,user_id } = req.body;
    promoCode.findByCodeForUpdate(promo_code,user_id,promo_code_id, (_, data) => {
        if (data) {
            res.status(500).send({
                status: "error",
                message: "Promo Code is already exist"
            });
            return;
        }
        next();
    });
};
module.exports = checkPromoCodeExistenceForUpdate;
