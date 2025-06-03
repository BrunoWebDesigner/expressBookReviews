const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists and has a valid token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        
        // Verify JWT token
        jwt.verify(token, "fingerprint_customer", (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            // Store decoded user information in request for further use
            req.user = decoded;
            next();
        });
    } else {
        // Check for token in Authorization header as fallback
        let token = req.headers['authorization'];
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7); // Remove 'Bearer ' prefix
            
            jwt.verify(token, "fingerprint_customer", (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: "Invalid or expired token" });
                }
                req.user = decoded;
                // Store token in session for subsequent requests
                req.session.authorization = { accessToken: token };
                next();
            });
        } else {
            return res.status(401).json({ message: "No token provided" });
        }
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));