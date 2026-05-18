const db = require('../config/database');

const getByCats = async (catAId, catBId) => {
    const [rows] = await db.query(
        `SELECT * FROM matches 
         WHERE (cat_a_id = ? AND cat_b_id = ?) OR (cat_a_id = ? AND cat_b_id = ?)`,
        [catAId, catBId, catBId, catAId]
    );
    return rows[0];
};

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM matches WHERE id = ?', [id]);
    return rows[0];
};

const getByUserId = async (userId) => {
    const [rows] = await db.query(
        `SELECT m.*,
                ca.name AS cat_a_name,
                cb.name AS cat_b_name,
                ua.full_name AS user_a_name,
                ub.full_name AS user_b_name,
                pa.photo_url AS cat_a_photo,
                pb.photo_url AS cat_b_photo
         FROM matches m
         JOIN cats ca ON ca.id = m.cat_a_id
         JOIN cats cb ON cb.id = m.cat_b_id
         JOIN users ua ON ua.id = m.user_a_id
         JOIN users ub ON ub.id = m.user_b_id
         LEFT JOIN cat_photos pa ON pa.cat_id = m.cat_a_id AND pa.is_primary = TRUE
         LEFT JOIN cat_photos pb ON pb.cat_id = m.cat_b_id AND pb.is_primary = TRUE
         WHERE (m.user_a_id = ? OR m.user_b_id = ?) AND m.is_active = TRUE
         ORDER BY m.matched_at DESC`,
        [userId, userId]
    );
    return rows;
};

const create = async ({ user_a_id, user_b_id, cat_a_id, cat_b_id }) => {
    const [result] = await db.query(
        'INSERT INTO matches (user_a_id, user_b_id, cat_a_id, cat_b_id) VALUES (?, ?, ?, ?)',
        [user_a_id, user_b_id, cat_a_id, cat_b_id]
    );
    return result.insertId;
};

const unmatch = async (id) => {
    const [result] = await db.query('UPDATE matches SET is_active = FALSE WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { getByCats, getById, getByUserId, create, unmatch };
