const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const dotenv = require('dotenv');

dotenv.config();

// Fetch variables
const USER = process.env.user;
const PASSWORD = process.env.password;
const HOST = process.env.host;
const PORT = process.env.port;
const DBNAME = process.env.dbname;

// Initialize express app and database connection
const app = express();
const sequelize = new Sequelize(`postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DBNAME}`);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());

// Define User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Initialize the database
sequelize.sync();

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Flask to Node.js Conversion</h1>'); // Replace with actual HTML templates
});

app.get('/register', (req, res) => {
    res.send('<form method="POST" action="/register"><input name="username" /><input name="password" type="password" /><button type="submit">Register</button></form>');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await User.create({ username, password: hashedPassword });
        req.flash('success', 'User registered successfully!');
        res.redirect('/login');
    } catch (e) {
        req.flash('error', 'Username already exists. Please choose a different username.');
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.send('<form method="POST" action="/login"><input name="username" /><input name="password" type="password" /><button type="submit">Login</button></form>');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.username = user.username;
        req.flash('success', 'Login successful!');
        res.redirect('/');
    } else {
        req.flash('error', 'Invalid username or password.');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    req.flash('success', 'You have been logged out.');
    res.redirect('/');
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});