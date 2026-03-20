const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];  // this array stores registered users

// Check if username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Check if username and password match
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// Secret key for JWT
const jwtSecret = "fingerprint_customer"; // same as in your login route

// Login endpoint for registered users
// Login endpoint for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validate username and password
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT token valid for 1 hour
        const accessToken = jwt.sign({ username: username }, jwtSecret, { expiresIn: '1h' });

        // DO NOT save to req.session.authorization — remove this line
        // req.session.authorization = { accessToken, username };

        return res.status(200).json({
            message: `User ${username} successfully logged in`,
            token: accessToken
        });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});
// Add/modify book review

// Add or modify book review using JWT header
// Add or modify book review using JWT
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    let username;
    try {
        const decoded = jwt.verify(token, jwtSecret);
        username = decoded.username;
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review by ${username} for ISBN ${isbn} added/updated`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review (Task 9)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    let username;
    try {
        const decoded = jwt.verify(token, jwtSecret);
        username = decoded.username;
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Delete the user's review if it exists
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({
            message: `Review by ${username} for ISBN ${isbn} deleted`,
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: "No review by this user found to delete" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;