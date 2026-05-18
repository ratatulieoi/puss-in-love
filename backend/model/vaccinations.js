const db = require('../config/database');

const getByCatId = async (catId) => {
    const [rows] = await db.query(
        'SELECT * FROM vaccinations WHERE cat_id = ? ORDER BY date_given DESC, created_at DESC',
        [catId]
    );
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM vaccinations WHERE id = ?', [id]);
    return rows[0];
};

const create = async ({ cat_id, vaccine_name, date_given, certificate_url }) => {
    const [result] = await db.query(
        'INSERT INTO vaccinations (cat_id, vaccine_name, date_given, certificate_url) VALUES (?, ?, ?, ?)',
        [cat_id, vaccine_name, date_given || null, certificate_url || null]
    );
    return result.insertId;
};

const remove = async (id) => {
    const [result] = await db.query('DELETE FROM vaccinations WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { getByCatId, getById, create, remove };
