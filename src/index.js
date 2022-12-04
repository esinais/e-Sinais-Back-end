const express = require("express");
var cors = require('cors');
const path = require('path'); //permitire acesso a imagens

const routes = require('./routes.js');

require('./database');

const app = express();

app.use(express.json());

app.use('/files', express.static(path.resolve(__dirname, "public", "upload")));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization")
    app.use(cors());
    next();
});

app.use(routes);

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});