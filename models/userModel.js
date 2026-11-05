const pool = require("../config/db");

async function findUserByEmail(email) {
    const [existEmail] = await pool.promise().query(
        "SELECT * FROM users WHERE email = ?", [email]
    );

    return existEmail[0] || null;
}

async function findUserById(id) {
    const [existId] = await pool.promise().query(
        "SELECT * FROM users WHERE id = ?", [id]
    );

    return existId[0] || null;
}

async function createUser(name, email, password, role, status) {
    const [results] = await pool.promise().query(
        "INSERT INTO users (name, email, password, role, status) VALUES (?,?,?,?,?)",
        [name, email, password, role, status]
    );

    return results.insertId;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};