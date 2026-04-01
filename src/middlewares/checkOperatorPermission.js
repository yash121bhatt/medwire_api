const helperQuery = require("../helper/helperQuery");

const { decode } = require("../utils/token");

const checkOperatorPermission = (req, res, next) => {
    let token = req.headers["x-access-token"];
    let user_id = decode(token).id;
    let urlPermission = req.url.substring(1).replace(/-/g, "_");

    helperQuery.get({ table: "super_admin", where: "id=" + user_id + " AND role='operator'" }, (err, dataa) => {
        if (dataa.length > 0) {
            helperQuery.get({ table: "operator_permission", where: "operator_id=" + user_id }, (_, data) => {
                if (data.length > 0) {
                    const permissionData = JSON.parse(data[0].permissions);
                    if (permissionData[urlPermission] == undefined || permissionData[urlPermission] == "false" || permissionData[urlPermission] == false) {
                        return res.status(500).json({
                            status_code: "500",
                            stutus: "error",
                            message: "You are not authorized to permission for this action! rohit"
                        });
                    }
                    next();
                } else {
                    return res.status(500).json({
                        status_code: "500",
                        stutus: "error",
                        message: "You are not authorized to permission for this action!"
                    });
                }
            });
        } else {
            next();
        }
    });

};
module.exports = checkOperatorPermission;