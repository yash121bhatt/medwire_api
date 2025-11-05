const { logger } = require("../../utils/logger");
const { createAdmin: createAdminQuery } = require("../queries");

(() => {
    require("../../config/db.config.init").query(createAdminQuery, (err, _) => {
        if (err) {
            logger.error(err.message);
            return;
        }
        logger.info("Admin created!");
        process.exit(0);
    });
})();
