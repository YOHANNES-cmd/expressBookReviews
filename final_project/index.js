const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))


// index.js
app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "User not logged in" });
    }
    

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "fingerprint_customer"); // same secret as login
        req.user = decoded.username; // store username for route use
        next(); // allow request to continue to the route
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
