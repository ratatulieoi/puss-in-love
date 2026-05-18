const db = require('../config/database');

const getByCatId = async (catId) => {
    const [rows] = await db.query(
        'SELECT * FROM cat_photos WHERE cat_id = ? ORDER BY is_primary DESC, created_at DESC',
        [catId]
    );
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM cat_photos WHERE id = ?', [id]);
    return rows[0];
};

const countByCatId = async (catId) => {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM cat_photos WHERE cat_id = ?', [catId]);
    return rows[0].total;
};

const create = async ({ cat_id, photo_url, is_primary }) => {
    const [result] = await db.query(
        'INSERT INTO cat_photos (cat_id, photo_url, is_primary) VALUES (?, ?, ?)',
        [cat_id, photo_url, is_primary]
    );
    return result.insertId;
};

const remove = async (id) => {
    const [result] = await db.query('DELETE FROM cat_photos WHERE id = ?', [id]);
    return result.affectedRows;
};

const clearPrimary = async (catId) => {
    await db.query('UPDATE cat_photos SET is_primary = FALSE WHERE cat_id = ?', [catId]);
};

const setPrimary = async (id) => {
    const [result] = await db.query('UPDATE cat_photos SET is_primary = TRUE WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { getByCatId, getById, countByCatId, create, remove, clearPrimary, setPrimary };
