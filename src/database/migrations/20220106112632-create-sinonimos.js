'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('sinonimos', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            id_sinal: {
                type: Sequelize.INTEGER,
                allowNull: false,
                //references: { model: 'sinais', key: 'id' },
                //onUpdate: 'CASCADE',
                //onDelete: 'CASCADE'
            },
            id_sinal_sinonimos: {
                type: Sequelize.INTEGER,
                allowNull: false,
                // references: { model: 'sinais', key: 'id' },
                //onUpdate: 'CASCADE',
                //onDelete: 'CASCADE'
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
        await queryInterface.dropTable('sinonimos');
    }
};