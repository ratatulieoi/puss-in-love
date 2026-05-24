const db = require('../config/database');

const getByPair = async (userId, ownerCatId, targetCatId) => {
    const [rows] = await db.query(
        'SELECT * FROM swipes WHERE user_id = ? AND owner_cat_id = ? AND target_cat_id = ?',
        [userId, ownerCatId, targetCatId]
    );
    return rows[0];
};

const create = async ({ user_id, owner_cat_id, target_cat_id, direction }) => {
    const [result] = await db.query(
        'INSERT INTO swipes (user_id, owner_cat_id, target_cat_id, direction) VALUES (?, ?, ?, ?)',
        [user_id, owner_cat_id, target_cat_id, direction]
    );
    return result.insertId;
};

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM swipes WHERE id = ?', [id]);
    return rows[0];
};

const findMutualLike = async (ownerCatId, targetCatId) => {
    const [rows] = await db.query(
        `SELECT * FROM swipes 
         WHERE owner_cat_id = ? AND target_cat_id = ? AND direction = 'like'`,
        [targetCatId, ownerCatId]
    );
    return rows[0];
};

const clearByOwnerCatId = async (ownerCatId) => {
    const [result] = await db.query('DELETE FROM swipes WHERE owner_cat_id = ?', [ownerCatId]);
    return result.affectedRows;
};

const clearPassesByOwnerCatId = async (ownerCatId) => {
    const [result] = await db.query(
        "DELETE FROM swipes WHERE owner_cat_id = ? AND direction = 'pass'",
        [ownerCatId]
    );
    return result.affectedRows;
};

const remove = async (id) => {
    const [result] = await db.query('DELETE FROM swipes WHERE id = ?', [id]);
    return result.affectedRows;
};

const getPendingLikesByUserId = async (userId) => {
    const [rows] = await db.query(
        `SELECT s.*, 
                oc.name AS owner_cat_name,
                tc.name AS target_cat_name,
                b.name AS target_breed_name,
                u.full_name AS target_owner_name,
                u.location AS target_owner_location,
                p.photo_url AS target_photo
         FROM swipes s
         JOIN cats oc ON oc.id = s.owner_cat_id
         JOIN cats tc ON tc.id = s.target_cat_id
         LEFT JOIN breeds b ON b.id = tc.breed_id
         JOIN users u ON u.id = tc.user_id
         LEFT JOIN cat_photos p ON p.cat_id = tc.id AND p.is_primary = TRUE
         WHERE s.user_id = ?
           AND s.direction = 'like'
           AND NOT EXISTS (
                SELECT 1 FROM matches m
                WHERE m.is_active = TRUE
                  AND (
                    (m.cat_a_id = s.owner_cat_id AND m.cat_b_id = s.target_cat_id)
                    OR (m.cat_a_id = s.target_cat_id AND m.cat_b_id = s.owner_cat_id)
                  )
           )
         ORDER BY s.created_at DESC`,
        [userId]
    );
    return rows;
};

module.exports = { getByPair, create, getById, findMutualLike, clearByOwnerCatId, clearPassesByOwnerCatId, remove, getPendingLikesByUserId };
