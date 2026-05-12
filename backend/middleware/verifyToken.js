const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const header = req.header('Authorization');

    if (!header) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;
