const { Model, DataTypes } = require('sequelize');

class Sinonimo extends Model {
    static init(sequelize) {
            super.init({
                id_sinal: DataTypes.INTEGER,
                id_sinal_sinonimos: DataTypes.INTEGER,

            }, {
                sequelize,
                //forçando a criar a tabela com este nome - lembrando que tem que estar no plural
                tableName: 'sinonimos'
            })
        }
        //criando relacionamento entre as tabelas

}

module.exports = Sinonimo;