const jwt = require('jsonwebtoken');

exports.authenticate_token = function authenticateToken(req, res, next) {
    if (req.headers.cookie != undefined) {
        const authHeader = req.headers.cookie.split('; ');
        const parsedCookies = {};
        authHeader.forEach(rawCookie=>{
        const parsedCookie = rawCookie.split('=');
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });

        const decodedString = decodeURIComponent(parsedCookies.jwt)
        const token = JSON.parse(decodedString).token;

        if (token == null) return res.sendStatus(401)

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {

            if (err) return res.sendStatus(403)

            console.log("Logging the userId: " + JSON.stringify(user))

            req.user = user

            next()
        })
    } else {
        return res.sendStatus(401);
    }

}

exports.generate_token = function generateToken(data) {
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {expiresIn: '90d'});
}
