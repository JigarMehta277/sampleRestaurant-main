const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
