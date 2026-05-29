const db = require('../config/database');

const create = async (reporter_id, target_cat_id) => {
    const [result] = await db.query(
        'INSERT INTO reports (reporter_id, target_cat_id) VALUES (?, ?)',
        [reporter_id, target_cat_id]
    );
    return result.insertId;
};

const hasReported = async (reporterId, catId) => {
    const [rows] = await db.query(
        'SELECT id FROM reports WHERE reporter_id = ? AND target_cat_id = ?',
        [reporterId, catId]
    );
    return rows.length > 0;
};

const getByCatId = async (catId) => {
    const [rows] = await db.query(
        `SELECT r.id, r.created_at, u.full_name AS reporter_name, u.email AS reporter_email
         FROM reports r
         JOIN users u ON u.id = r.reporter_id
         WHERE r.target_cat_id = ?
         ORDER BY r.created_at DESC`,
        [catId]
    );
    return rows;
};

module.exports = { create, hasReported, getByCatId };
