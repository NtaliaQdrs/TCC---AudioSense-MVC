// Model que representa a tabela 'usuario' já existente no banco de dados
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Usuario = sequelize.define('Usuario', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        nome_usuario: {
            type: DataTypes.STRING(255),
            allowNull: true, // preenchido na etapa de customização
            unique: true
        },

        nome_completo: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        // Senha armazenada como hash — nunca salvar em texto puro
        senha: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        tipo_usuario: {
            type: DataTypes.ENUM('docente', 'discente', 'admin'),
            allowNull: false
        },

        data_cadastro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

        // Biografia exibida no perfil do usuário
        biografia: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        // URL da foto de perfil
        foto_perfil: {
            type: DataTypes.STRING(255),
            allowNull: true
        }

    }, {
        tableName: 'usuario',
        timestamps: false
    });

    return Usuario;
};