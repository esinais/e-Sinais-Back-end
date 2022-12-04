'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {

        await queryInterface.createTable('sinais', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            id_usuario: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'usuarios', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            nome_sinal: {
                type: Sequelize.STRING,
                allowNull: false
            },
            endereco_sinal: {
                type: Sequelize.STRING,
                allowNull: false
            },
            endereco_img_associativa: {
                type: Sequelize.STRING
            },
            classificacao_gramatical: {
                type: Sequelize.STRING,
                allowNull: false
            },
            regiao: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status_sinal: {
                type: Sequelize.STRING,
                allowNull: false
            },
            situacao: {
                type: Sequelize.STRING,
                allowNull: false
            },
            polissemico: {
                type: Sequelize.BOOLEAN,
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

        await queryInterface.dropTable('sinais');

    }
};