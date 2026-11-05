const pool = require("../config/db");

async function createAuditLog(userId, action, entityType, entityId, connection) {
    const createdAt = new Date();
    const [result] = await connection.query(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, created_at) VALUES(?,?,?,?,?);",
        [userId, action, entityType, entityId, createdAt]
    );

    return result.insertId;
}

async function getAuditLogs() {
    const [records] = await pool.promise().query(
        "SELECT * FROM audit_logs ORDER BY created_at DESC;"
    );

    return records;
}

async function  getAuditLogsByUser(userId) {
    const [records] = await pool.promise().query(
        "SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
    );

    return records;
}

module.exports = {
    createAuditLog,
    getAuditLogs,
    getAuditLogsByUser
};