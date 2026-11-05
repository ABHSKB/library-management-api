const pool = require("../config/db");

async function getAllBooks() {
    const [books] = await pool.promise().query(
        "SELECT * FROM books;"
    );

    return books;
}

async function getBookById(id) {
    const [books] = await pool.promise().query(
        "SELECT * FROM books WHERE id = ?;", [id]
    );

    return books[0] || null;
}

async function createBook(bookData) {
    const { title, author, isbn, category, total_copies } = bookData;
    const available_copies = total_copies;

    const [books] = await pool.promise().query(
        "INSERT INTO books (title, author, isbn, category, total_copies, available_copies) VALUES (?,?,?,?,?,?);",
        [title, author, isbn, category, total_copies, available_copies]
    );

    return books.insertId;
}

async function checkIsbn(isbn) {
    const [books] = await pool.promise().query(
        "SELECT * FROM books WHERE isbn = ?;", [isbn]
    );

    return books[0] || null;
}


async function updateBook(id, bookData) {
    const connection = await pool.promise().getConnection();
    let transactionStarted = false;

    try {
        const { title, author, isbn, category, total_copies } = bookData;

        await connection.beginTransaction();
        transactionStarted = true;

        const [bookExist] = await connection.query(
            "SELECT id FROM books WHERE id = ? FOR UPDATE",
            [id]
        );

        if (bookExist.length === 0) {
            await connection.rollback();
            transactionStarted = false;
            return "not exist";
        }

        const [borrowings] = await connection.query(
            `SELECT COUNT(*) AS borrowedCount
             FROM borrowings
             WHERE book_id = ? AND status IN ('borrowed', 'overdue')`,
            [id]
        );

        const borrowedCount = Number(borrowings[0].borrowedCount);

        if (borrowedCount > total_copies) {
            await connection.rollback();
            transactionStarted = false;
            return "less than";
        }

        const available_copies = total_copies - borrowedCount;

        const [books] = await connection.query(
            `UPDATE books
             SET title = ?, author = ?, isbn = ?, category = ?,
                 total_copies = ?, available_copies = ?
             WHERE id = ?`,
            [title, author, isbn, category, total_copies, available_copies, id]
        );

        await connection.commit();
        transactionStarted = false;

        return books;
    } catch (err) {
        if (transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Rollback failed:", rollbackErr);
            }
        }

        throw err;
    } finally {
        connection.release();
    }
}


async function deleteBook(id) {
    const [books] = await pool.promise().query(
        "DELETE FROM books WHERE id = ?", [id]
    );

    if (books.affectedRows === 0) {
        return null;
    }

    return books;
}

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    checkIsbn
}