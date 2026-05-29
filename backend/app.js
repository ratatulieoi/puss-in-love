require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const catsRouter = require('./routes/cats');
const breedsRouter = require('./routes/breeds');
const photosRouter = require('./routes/photos');
const vaccinationsRouter = require('./routes/vaccinations');
const swipesRouter = require('./routes/swipes');
const matchesRouter = require('./routes/matches');
const messagesRouter = require('./routes/messages');
const adminRouter = require('./routes/admin');
const reportsRouter = require('./routes/reports');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/cats', catsRouter);
app.use('/api/breeds', breedsRouter);
app.use('/api', photosRouter);
app.use('/api', vaccinationsRouter);
app.use('/api/swipes', swipesRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportsRouter);

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
