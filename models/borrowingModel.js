const pool = require("../config/db");
const { createAuditLog } = require("./auditLogModel");

async function createBorrow(userId, bookId) {

    const connection = await pool.promise().getConnection();
    let transactionStarted = false;

    try{
    
        await connection.beginTransaction();

        transactionStarted = true;
    
        const [users] = await connection.query(
            "SELECT id FROM users WHERE id = ? FOR UPDATE",
            [userId]
        );

        if (users.length === 0) {
            throw new Error("USER_NOT_FOUND");
        }

        const [settings] = await connection.query(
            "SELECT max_active_borrowings AS max FROM library_settings WHERE id = 1"
        );

        if (settings.length === 0) {
            throw new Error("LIBRARY_SETTINGS_NOT_FOUND");
        }

        const [counts] = await connection.query(
            `SELECT COUNT(*) AS total
            FROM borrowings
            WHERE user_id = ? AND status IN ('borrowed', 'overdue')`,
            [userId]
        );

        if (Number(counts[0].total) >= Number(settings[0].max)) {
            throw new Error("MAX_ACTIVE_BORROWINGS");
        }

        const [result] = await connection.query(
            "SELECT default_loan_days AS loanDuration FROM library_settings WHERE id = 1"
        );

        if (result.length === 0){
            throw new Error("LIBRARY_SETTINGS_NOT_FOUND");
        }
        
        const borrowedAT = new Date();

        const dueDate = new Date (borrowedAT);
        dueDate.setDate(dueDate.getDate() + result[0].loanDuration);

        const [books] = await connection.query(
            "SELECT * FROM books WHERE id = ? FOR UPDATE",
            [bookId]
        );

        if (books.length === 0) {

            throw new Error("BOOK_NOT_FOUND");
        }

        if (books[0].available_copies <= 0){

            throw new Error("BOOK_UNAVAILABLE");
        }

        const [existingBorrowing] = await connection.query(
            `SELECT id
            FROM borrowings
            WHERE user_id = ?
            AND book_id = ?
            AND status IN ('borrowed', 'overdue')
            LIMIT 1
            FOR UPDATE`,
            [userId, bookId]
        );

        if (existingBorrowing.length > 0) {
            const error = new Error("Member already borrowed this book");
            error.code = "ACTIVE_BORROWING_EXISTS";
            throw error;
        }

        const [borrowed] = await connection.query(
            "INSERT INTO borrowings (user_id, book_id, borrowed_at, due_date) VALUES (?,?,?,?)",
            [userId, bookId, borrowedAT, dueDate]
        );

        await connection.query(
            "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
            [bookId]
        );

        await createAuditLog(
            userId,
            "BOOK_BORROWED",
            "borrowing",
            borrowed.insertId,
            connection
        );

        await connection.commit();

        transactionStarted = false;

        return {
            message: "Book reserved successfully",
            borrowed: borrowed.insertId
        };

    }catch (err) {
        if (transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Rollback failed:", rollbackErr);
            }
        }

        throw err;
    }finally{

        connection.release();
    }
}

async function borrowedBookById(id) {
    const [borrowings] = await pool.promise().query(
        "SELECT * FROM borrowings WHERE ID = ?",
        [id]
    );

    return borrowings[0] || null;
}

async function allBorrowingHistory(){ 
    const [borrowings] = await pool.promise().query(
        "SELECT * FROM borrowings;"
    );

    return borrowings;
}

async function memberBorrowingHistory(id) {
        const [records] = await pool.promise().query(
            "SELECT books.title, books.author, borrowings.borrowed_at, borrowings.due_date, borrowings.returned_at FROM books JOIN borrowings ON books.id = borrowings.book_id WHERE borrowings.user_id = ?;",
            [id]
        );

        return records;
}

async function countActiveBorrowings(id) {
        const [records] = await pool.promise().query(
            "SELECT COUNT(*) AS count FROM borrowings WHERE status IN ('borrowed','overdue') AND user_id = ?;",
            [id]
        )

        return records[0].count ;
}

async function maxActiveBorrowings() {
        const [records] = await pool.promise().query(
            "SELECT max_active_borrowings AS max FROM library_settings WHERE id = 1;"
        );

        if(records.length === 0 ){
            throw new Error("LIBRARY_SETTINGS_NOT_FOUND");
        }
        return records[0].max ;
}

async function returnBorrowing(borrowingId) {

    const connection = await pool.promise().getConnection();
    let transactionStarted = false;

    try{
    
        await connection.beginTransaction();

        transactionStarted = true;
    
        const [initialRecords] = await connection.query(
            "SELECT book_id FROM borrowings WHERE id = ?",
            [borrowingId]
        );

        if (initialRecords.length === 0) {
            throw new Error("NOT_FOUND");
        }

        const bookId = initialRecords[0].book_id;

        const [books] = await connection.query(
            "SELECT id FROM books WHERE id = ? FOR UPDATE",
            [bookId]
        );

        if (books.length === 0) {
            throw new Error("BOOK_NOT_FOUND");
        }

        const [borrowings] = await connection.query(
            "SELECT status, book_id, user_id FROM borrowings WHERE id = ? FOR UPDATE",
            [borrowingId]
        );

        if (borrowings.length === 0) {

            throw new Error("NOT_FOUND");
        }

        if(borrowings[0].status === "returned"){
            throw new Error("ALREADY_RETURNED");
        }

        const returned_at = new Date();

        await connection.query(
            "UPDATE borrowings SET returned_at = ?, status = 'returned' WHERE id=?",
            [returned_at, borrowingId]
        );

        await connection.query(
            "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?",
            [bookId]
        );

        await createAuditLog(
            borrowings[0].user_id,
            "BOOK_RETURNED",
            "borrowing",
            borrowingId,
            connection
        );

        await connection.commit();

        transactionStarted = false;

        return {
            message: "Book returned successfully"
        };

    }catch (err) {
        if (transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Rollback failed:", rollbackErr);
            }
        }

        throw err;
    }finally{

        connection.release();
    }
}

module.exports = {
    createBorrow,
    borrowedBookById,
    memberBorrowingHistory,
    countActiveBorrowings,
    returnBorrowing,
    maxActiveBorrowings,
    allBorrowingHistory
};