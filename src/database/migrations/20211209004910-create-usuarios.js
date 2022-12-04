'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {

        await queryInterface.createTable('usuarios', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            cpf: {
                type: Sequelize.STRING,
                allowNull: false
            },
            nome: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            endereco: {
                type: Sequelize.STRING
            },
            telefone: {
                type: Sequelize.STRING
            },
            senha: {
                type: Sequelize.STRING,
                allowNull: false
            },
            perfil: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status_usuario: {
                type: Sequelize.STRING,
                allowNull: false
            },
            logado: {
                type: Sequelize.BOOLEAN,
                allowNull: false 
            },
            quantidade_sinais: {
                type: Sequelize.INTEGER,
                allowNull: false 
            },
            sexo: {
                type: Sequelize.STRING,
                allowNull: false 
            },
            foto_perfil: {
                type: Sequelize.STRING,
                allowNull: false 
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            }

        });

    },

    down: async(queryInterface, Sequelize) => {

        await queryInterface.dropTable('usuarios');

    }
};