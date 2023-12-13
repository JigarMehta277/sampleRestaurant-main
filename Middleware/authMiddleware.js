const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).redirect('/');;
    }

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            console.log(err)
            return res.status(403).redirect('/');
        }

        req.user = user; // Attach user information to the request object
        next();
    });
}

module.exports = { authenticateJWT };