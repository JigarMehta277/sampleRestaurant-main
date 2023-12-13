const mongoose = require('mongoose');
const connectDB = require("../config/db");
const Restaurant = require('../models/Restaurant');
// controllers/userController.js
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bodyParser = require('body-parser');
const app = express();
const cookie = require('cookie');

app.use(bodyParser.json());

connectDB();

async function registerUser(req, res) {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();

        res.status(201).redirect('/api/restaurants');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function loginUser(req, res) {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, username }, 'your_secret_key', { expiresIn: '1h' });

        // Set the token as a cookie
        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true,
            maxAge: 3600, // 1 hour in seconds
            sameSite: 'strict',
            path: '/', // Set the path to the root so it's accessible across the entire site
        }));

        res.redirect("/api/restaurants");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { connectDB,registerUser, loginUser };