const { logger } = require("../../utils/logger");
const { createRoles: createRolesQuery } = require("../queries");

(() => {
    require("../../config/db.config.init").query(createRolesQuery, (err) => {
        if (err) {
            logger.error(err.message);
            return;
        }
        logger.info("Roles created!");
        process.exit(0);
    });
})();
