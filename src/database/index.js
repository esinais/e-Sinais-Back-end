const Sequelize = require('sequelize')

const dbConfig = require("../config/database");

const Usuario = require('../models/Usuario');
const Sinal = require('../models/Sinal');
const Sinonimo = require('../models/Sinonimo');


const connection = new Sequelize(dbConfig);

Usuario.init(connection);
Sinal.init(connection);
Sinonimo.init(connection);
//Cadastrar.init(connection);

//chamando os relacionamentos
Sinal.associate(connection.models);
Usuario.associate(connection.models);



 //Apenas para fazer teste se a comunicação com dados foi executada com sucesso
try {
    connection.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso');
} catch (error) {
    console.error('erro ao tentar conectar com o banco de dados', error);
}


module.exports = connection;