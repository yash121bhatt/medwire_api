const { logger } = require("../../utils/logger");
const dbConnection = require("../../config/db.config");

const {
    createTableUSers,
} = require("../queries");

const tableCreationQueries = [
    { name: "users", query: createTableUSers },
];

(async () => {
    let createdCount = 0;
    let existedCount = 0;
    let errorCount = 0;
    const createdTables = [];
    const existedTables = [];
    const errorTables = [];

    try {
        for (const { name, query } of tableCreationQueries) {
            // eslint-disable-next-line no-unused-vars
            await new Promise((resolve, reject) => {
                dbConnection.query(query, (err, result) => {
                    if (err) {
                        logger.error(`Error creating table ${name}: ${err.message}`);
                        errorCount++;
                        errorTables.push(name);
                        // यहाँ हम reject नहीं करेंगे ताकि अन्य टेबल्स की क्रिएशन जारी रहे
                        return resolve(); // Resolve instead of Reject to continue the loop
                    }

                    // 'CREATE TABLE IF NOT EXISTS' के लिए लॉजिक:
                    // 1. rows.affectedRows > 0: Table created successfully (यानी, table नहीं थी)
                    // 2. rows.warningCount > 0: Table already existed (यानी, IF NOT EXISTS के कारण warning आई)

                    if (result.warningCount === 0) {
                        createdCount++;
                        createdTables.push(name);
                        logger.info(`Table ${name} created successfully! (New Table)`);
                    } else if (result.warningCount > 0) {
                        existedCount++;
                        existedTables.push(name);
                        logger.info(`Table ${name} already existed (Skipped).`);
                    } else {
                        // यदि कोई और स्थिति आती है, तो भी इसे created मान सकते हैं
                        createdCount++;
                        createdTables.push(name);
                        logger.info(`Table ${name} created successfully!`);
                    }
                    resolve();
                });
            });
        }
        
        // --- Final Summary Log ---
        logger.info("--- TABLE MIGRATION SUMMARY ---");
        logger.info(`✅ Tables Created: ${createdCount}`);
        if (createdTables.length > 0) {
            logger.info(`   Names: [${createdTables.join(", ")}]`);
        }
        
        logger.info(`🟡 Tables Already Existed: ${existedCount}`);
        if (existedTables.length > 0) {
            logger.info(`   Names: [${existedTables.join(", ")}]`);
        }
        
        logger.error(`❌ Tables Failed (Errors): ${errorCount}`);
        if (errorTables.length > 0) {
            logger.error(`   Names: [${errorTables.join(", ")}]`);
        }
        
        if (errorCount > 0) {
            process.exit(1);
        } else {
            logger.info("✅ All table migrations completed successfully!");
            process.exit(0);
        }

    } catch (error) {
        // यह catch block तब ट्रिगर होगा जब Promise के अंदर resolve/reject का लॉजिक बदल जाए
        logger.error(`❌ Unexpected Migration Failure: ${error.message}`);
        process.exit(1);
    }
})();