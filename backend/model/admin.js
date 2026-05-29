const db = require('../config/database');

const getUsers = async () => {
    const [rows] = await db.query(
        `SELECT u.id, u.email, u.full_name, u.phone, u.location, u.role, u.is_active, u.created_at,
                COUNT(r.id) AS report_count
         FROM users u
         LEFT JOIN cats c ON c.user_id = u.id
         LEFT JOIN reports r ON r.target_cat_id = c.id
         GROUP BY u.id
         ORDER BY u.created_at DESC`
    );
    return rows;
};

const updateUserStatus = async (id, isActive) => {
    const [result] = await db.query(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive, id]
    );
    return result.affectedRows;
};

const getCats = async () => {
    const [rows] = await db.query(
        `SELECT c.id, c.name, c.gender, c.color, c.is_active, c.created_at,
                b.name AS breed_name,
                u.full_name AS owner_name,
                u.email AS owner_email,
                COUNT(r.id) AS report_count
         FROM cats c
         LEFT JOIN breeds b ON b.id = c.breed_id
         LEFT JOIN users u ON u.id = c.user_id
         LEFT JOIN reports r ON r.target_cat_id = c.id
         GROUP BY c.id
         ORDER BY c.created_at DESC`
    );
    return rows;
};

const updateCatStatus = async (id, isActive) => {
    const [result] = await db.query(
        'UPDATE cats SET is_active = ? WHERE id = ?',
        [isActive, id]
    );
    return result.affectedRows;
};

const getStatistics = async () => {
    const [[users]] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [[cats]] = await db.query('SELECT COUNT(*) AS total FROM cats');
    const [[matches]] = await db.query('SELECT COUNT(*) AS total FROM matches');
    const [[messages]] = await db.query('SELECT COUNT(*) AS total FROM messages');

    return {
        users: users.total,
        cats: cats.total,
        matches: matches.total,
        messages: messages.total
    };
};

module.exports = {
    getUsers,
    updateUserStatus,
    getCats,
    updateCatStatus,
    getStatistics
};
