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

const remove = async (id) => {
    const [result] = await db.query('DELETE FROM cats WHERE id = ?', [id]);
    return result.affectedRows;
};

const browse = async ({ search, breedId, gender, location }) => {
    let sql = `SELECT c.*, b.name AS breed_name, u.full_name AS owner_name, u.location,
                      p.photo_url AS primary_photo
               FROM cats c
               LEFT JOIN breeds b ON b.id = c.breed_id
               LEFT JOIN users u ON u.id = c.user_id
               LEFT JOIN cat_photos p ON p.cat_id = c.id AND p.is_primary = TRUE
               WHERE c.is_active = TRUE`;
    const params = [];

    if (search) {
        sql += ' AND (c.name LIKE ? OR u.full_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (breedId) {
        sql += ' AND c.breed_id = ?';
        params.push(breedId);
    }

    if (gender) {
        sql += ' AND c.gender = ?';
        params.push(gender);
    }

    if (location) {
        sql += ' AND u.location LIKE ?';
        params.push(`%${location}%`);
    }

    sql += ' ORDER BY c.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
};

const getSwipeCandidates = async (userId, ownerCatId) => {
    const [rows] = await db.query(
        `SELECT c.*, b.name AS breed_name, u.full_name AS owner_name, u.location,
                p.photo_url AS primary_photo
         FROM cats c
         LEFT JOIN breeds b ON b.id = c.breed_id
         LEFT JOIN users u ON u.id = c.user_id
         LEFT JOIN cat_photos p ON p.cat_id = c.id AND p.is_primary = TRUE
         WHERE c.is_active = TRUE
           AND c.user_id != ?
           AND c.id NOT IN (
                SELECT target_cat_id FROM swipes WHERE owner_cat_id = ?
           )
         ORDER BY RAND()`,
        [userId, ownerCatId]
    );
    return rows;
};

module.exports = { getByUserId, getById, create, update, remove, browse, getSwipeCandidates };
