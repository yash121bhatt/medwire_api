const db = require("../config/db.config");
const { logger } = require("../utils/logger");
const helperQuery = require("../helper/helperQuery");
class OperaterPermission {
    static addPermissan(operator_id, permissions, cb) {
        helperQuery.get({ table: "operator_permission", where: "operator_id=" + operator_id + " LIMIT 1" }, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            if (data.length > 0) {
                var qu = `UPDATE operator_permission SET permissions='${permissions}',updated_at=NOW() WHERE operator_id='${operator_id}'`;
            } else {
                var qu = `INSERT INTO operator_permission(operator_id,permissions,created_at) VALUES('${operator_id}','${permissions}',NOW())`;
            }
            db.query(qu,
                [operator_id, permissions],
                (err, res) => {
                    if (err) {
                        logger.error(err.message);
                        cb(err, null);
                        return;
                    }
                    cb(null, res);
                });
        });


    }

}
module.exports = OperaterPermission;