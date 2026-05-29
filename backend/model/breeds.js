const db = require('../config/database');

const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM breeds ORDER BY name ASC');
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM breeds WHERE id = ?', [id]);
    return rows[0];
};

const create = async ({ name, description, origin }) => {
    const [result] = await db.query(
        'INSERT INTO breeds (name, description, origin) VALUES (?, ?, ?)',
        [name, description || null, origin || null]
    );
    return result.insertId;
};

const update = async (id, { name, description, origin }) => {
    const [result] = await db.query(
        'UPDATE breeds SET name = ?, description = ?, origin = ? WHERE id = ?',
        [name, description || null, origin || null, id]
    );
    return result.affectedRows;
};

const remove = async (id) => {
    const [result] = await db.query('DELETE FROM breeds WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { getAll, getById, create, update, remove };
