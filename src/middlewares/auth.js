const jwt = require("jsonwebtoken");

const authConfig = require('../config/auth.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    //verificando se existe o token
    if (!authHeader) {
        return res.status(401).send({ error: 'No token provider' });
    }
    //se existir o token, dividir o token em duas partes, pois o token tem este formato BEARER e um hash
    const parts = authHeader.split(' ');

    //verificando se o array tem duas partes
    if (!parts.length == 2) {
        return res.status(401).send({ error: 'token error!' });
    }

    //desestruturar o array
    const [scheme, token] = parts;
    //verificando se existe o BEARER dentro do token
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ error: 'token malFormatted' });
    }
    //verificando se o token é válido
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: 'token invalid' });

        req.userId = decoded.id;
        console.log(decoded.id)

        return next();
    });
};