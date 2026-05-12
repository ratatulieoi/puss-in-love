const db = require('../config/database');

const getByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const getById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, email, full_name, phone, location, avatar_url, role, is_active, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0];
};

const create = async ({ email, password_hash, full_name }) => {
    const [result] = await db.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
        [email, password_hash, full_name]
    );
    return result.insertId;
};

const update = async (id, { full_name, phone, location }) => {
    const [result] = await db.query(
        'UPDATE users SET full_name = ?, phone = ?, location = ? WHERE id = ?',
        [full_name, phone, location, id]
    );
    return result.affectedRows;
};

module.exports = { getByEmail, getById, create, update };
