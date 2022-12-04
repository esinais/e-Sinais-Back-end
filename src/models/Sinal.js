const { Model, DataTypes } = require('sequelize');

class Sinal extends Model {
    static init(sequelize) {
            super.init({
                nomeSinal: DataTypes.STRING,
                enderecoSinal: DataTypes.STRING,
                enderecoImgAssociativa: DataTypes.STRING,
                classificacaoGramatical: DataTypes.STRING,
                regiao: DataTypes.STRING,
                statusSinal: DataTypes.STRING,
                situacao: DataTypes.STRING,
                polissemico: DataTypes.BOOLEAN,
            }, {
                sequelize,
                //forçando a criar a tabela com este nome - lembrando que tem que estar no plural
                tableName: 'sinais'
            })
        }
        //criando relacionamento entre as tabelas
    static associate(models) {
        // relacionamento de 1 para N
        this.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
        //relacionamento de N para N (relacionamento unário de sinais com sinais gerando a tabela sinônimos)
        /*this.belongsToMany(models.Sinal, {
            through: 'sinonimos',
            foreignKey: 'id_sinal',
            otherKey: 'id_sinal_sinonimos',
            as: 'sinonimos_sinais'
        });
        this.belongsToMany(models.Sinal, {
            through: 'sinonimos',
            foreignKey: 'id_sinal_sinonimos',
            otherKey: 'id_sinal',
            as: 'sinais_sinonimos'
        });*/
    }
}

module.exports = Sinal;