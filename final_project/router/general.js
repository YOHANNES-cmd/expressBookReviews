const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    let userExists = users.find((user) => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username: username, password: password });
    return res.status(200).json({ message: `User ${username} successfully registered` });
});

// Get the book list available in the shop
  public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;   // Retrieve ISBN from request parameters

    if (books[isbn]) {
        // Book exists
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    } else {
        // Book not found
        return res.status(404).json({ message: "Book not found" });
    }
});
  

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase(); // get author from request and convert to lowercase
    const bookKeys = Object.keys(books);           // get all keys of books object
    let results = {};

    // iterate over all books and find matches
    bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
            results[key] = books[key];
        }
    });

    if (Object.keys(results).length > 0) {
        return res.status(200).send(JSON.stringify(results, null, 4));
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();  // get title from URL
    const bookKeys = Object.keys(books);
    let results = {};

    // iterate over all books and check title match
    bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === title) {
            results[key] = books[key];
        }
    });

    if (Object.keys(results).length > 0) {
        return res.status(200).send(JSON.stringify(results, null, 4));
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // get ISBN from URL

    if (books[isbn]) {
        // Send only the reviews part of the book
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
