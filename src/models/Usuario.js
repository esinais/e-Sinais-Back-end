const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

class Usuario extends Model {
    static init(sequelize) {
            super.init({
                cpf: DataTypes.STRING,
                nome: DataTypes.STRING,
                email: DataTypes.STRING,
                endereco: DataTypes.STRING,
                telefone: DataTypes.STRING,
                senha: DataTypes.STRING,
                perfil: DataTypes.STRING,
                statusUsuario: DataTypes.STRING,
                logado: DataTypes.BOOLEAN,
                quantidadeSinais: DataTypes.INTEGER,
                sexo: DataTypes.STRING,
                fotoPerfil: DataTypes.STRING
            }, {
                sequelize,
                //PROPRIEDADE DO SEQUELIZE, ANTES DE CRIAR O USUARIO, CRIPTOGRAFA A SENHA USANDO A BIBLIOTECA BCRYPT
                hooks: {
                    beforeCreate: (usuario) => {
                        
                        const salt = bcrypt.genSaltSync();
                        usuario.senha = bcrypt.hashSync(usuario.senha, salt);
                    },
                    beforeUpdate: (usuario) => {
                        const salt = bcrypt.genSaltSync();
                        console.log(usuario.senha);
                        usuario.senha = bcrypt.hashSync(usuario.senha, salt);
                    },
                    
                },
               
                       
                     
            })
        }
        //criando relacionamento de 1 para N
    static associate(models) {
        this.hasMany(models.Sinal, { foreignKey: 'id_usuario', as: 'sinal' });
    }
}

module.exports = Usuario;