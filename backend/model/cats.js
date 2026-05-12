const db = require('../config/database');

const getByUserId = async (userId) => {
    const [rows] = await db.query(
        `SELECT c.*, b.name AS breed_name 
         FROM cats c 
         LEFT JOIN breeds b ON b.id = c.breed_id 
         WHERE c.user_id = ? AND c.is_active = TRUE 
         ORDER BY c.created_at DESC`,
        [userId]
    );
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query(
        `SELECT c.*, b.name AS breed_name 
         FROM cats c 
         LEFT JOIN breeds b ON b.id = c.breed_id 
         WHERE c.id = ?`,
        [id]
    );
    return rows[0];
};

const create = async ({ user_id, breed_id, name, gender, birth_date, color, description }) => {
    const [result] = await db.query(
        'INSERT INTO cats (user_id, breed_id, name, gender, birth_date, color, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, breed_id || null, name, gender, birth_date || null, color, description]
    );
    return result.insertId;
};

const update = async (id, { breed_id, name, gender, birth_date, color, description }) => {
    const [result] = await db.query(
        'UPDATE cats SET breed_id = ?, name = ?, gender = ?, birth_date = ?, color = ?, description = ? WHERE id = ?',
        [breed_id || null, name, gender, birth_date || null, color, description, id]
    );
    return result.affectedRows;
};

const softDelete = async (id) => {
    const [result] = await db.query(
        'UPDATE cats SET is_active = FALSE WHERE id = ?',
        [id]
    );
    return result.affectedRows;
};

module.exports = { getByUserId, getById, create, update, softDelete };
