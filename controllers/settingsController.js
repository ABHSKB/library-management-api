const { getLibrarySettings, updateLibrarySettings } = require("../models/settingsModel");

async function getLibrarySettingsController(req, res) {
    try{
        const record = await getLibrarySettings();

        if(record === null){
            return res.status(404).json({
                message: "Settings not found"
            }); 
        }

        return res.status(200).json(record);
    }  catch(err){
        console.error("Get library settings error:", err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function updateLibrarySettingsController(req, res) {
    try{
        if (
            req.body === null ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                message: "Invalid request body"
            });
        }
        const {
            max_active_borrowings: maxActiveBorrowings,
            default_loan_days: defaultLoanDays
        } = req.body;

        if(!Number.isInteger(maxActiveBorrowings)||maxActiveBorrowings<=0||
        !Number.isInteger(defaultLoanDays)||defaultLoanDays<=0){
            return res.status(400).json({
                message: "Bad request"
            });
        }

        const existingSettings = await getLibrarySettings();

        if (!existingSettings) {
            return res.status(404).json({
                message: "Settings not found"
            });
        }
        const affectedRows = await updateLibrarySettings(
            maxActiveBorrowings,
            defaultLoanDays
        );

        const record = await getLibrarySettings();

        if (!record) {
            return res.status(404).json({
                message: "Settings not found"
            });
        }

        return res.status(200).json({
            message: affectedRows === 0
                ? "Settings already have these values"
                : "Settings successfully updated",
            settings: record
        });

    }catch(err){
        console.error("Update library settings error:", err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    getLibrarySettingsController,
    updateLibrarySettingsController
};