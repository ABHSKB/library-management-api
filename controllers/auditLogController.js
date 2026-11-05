const { getAuditLogs, getAuditLogsByUser } = require("../models/auditLogModel");

async function getAllAuditLogsController(req, res) {
    try{
        const records = await getAuditLogs();
        return res.status(200).json({
            message: "Audit logs retrieved successfully",
            logs: records
        });

    }catch(err){
        console.error("Get all audit logs error:", err);
        return res.status(500).json({message:"Internal server error"});
    }

}

async function getUserAuditLogsController(req, res) {
    try{
        const id = Number(req.params.id);

        if(!Number.isInteger(id)|| id <= 0){
            return res.status(400).json({message: "Bad request"});
        }

        const records = await getAuditLogsByUser(id);
         return res.status(200).json({
            message: "User audit logs retrieved successfully",
            logs: records
         });
    }catch(err){
        console.error("Get user audit logs error:", err);
        return res.status(500).json({message:"Internal server error"});
    }
}

module.exports = {
    getAllAuditLogsController,
    getUserAuditLogsController
};