const pool = require("../config/db");

async function getLibrarySettings() {
    const [records] = await pool.promise().query(
        "SELECT * FROM library_settings WHERE id=1 LIMIT 1;"
    );

    return records[0] || null;
}

async function updateLibrarySettings(maxActiveBorrowings, defaultLoanDays) {
    const [result] = await pool.promise().query(
        "UPDATE library_settings SET max_active_borrowings = ?, default_loan_days = ? WHERE id = 1;",
        [maxActiveBorrowings, defaultLoanDays]
    )

    return result.affectedRows;
}

module.exports = {
    getLibrarySettings,
    updateLibrarySettings
};