const db = require('../config/database');

const getByMatchId = async (matchId) => {
    const [rows] = await db.query(
        `SELECT m.*, u.full_name AS sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.match_id = ?
         ORDER BY m.created_at ASC`,
        [matchId]
    );
    return rows;
};

const create = async ({ match_id, sender_id, content }) => {
    const [result] = await db.query(
        'INSERT INTO messages (match_id, sender_id, content) VALUES (?, ?, ?)',
        [match_id, sender_id, content]
    );
    return result.insertId;
};

const getById = async (id) => {
    const [rows] = await db.query(
        `SELECT m.*, u.full_name AS sender_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.id = ?`,
        [id]
    );
    return rows[0];
};

const markRead = async (matchId, userId) => {
    const [result] = await db.query(
        'UPDATE messages SET is_read = TRUE WHERE match_id = ? AND sender_id != ?',
        [matchId, userId]
    );
    return result.affectedRows;
};

module.exports = { getByMatchId, create, getById, markRead };
