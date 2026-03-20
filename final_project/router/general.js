const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    let userExists = users.find((user) => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: `User ${username} successfully registered` });
});

// Task 10: Get all books (async-await)
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await new Promise((resolve, reject) => {
            if (books) resolve(books);
            else reject("No books available");
        });
        res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

// Task 11: Get book details by ISBN (async-await)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) resolve(books[isbn]);
            else reject(`Book with ISBN ${isbn} not found`);
        });
        res.status(200).send(JSON.stringify(book, null, 4));
    } catch (err) {
        res.status(404).json({ message: err });
    }
});


// Get book review based on ISBN (remains synchronous)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;