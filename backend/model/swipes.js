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

const findMutualLike = async (ownerCatId, targetCatId) => {
    const [rows] = await db.query(
        `SELECT * FROM swipes 
         WHERE owner_cat_id = ? AND target_cat_id = ? AND direction = 'like'`,
        [targetCatId, ownerCatId]
    );
    return rows[0];
};

module.exports = { getByPair, create, findMutualLike };
