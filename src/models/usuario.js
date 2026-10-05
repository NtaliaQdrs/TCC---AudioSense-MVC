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
        },
        // Data da última troca de nome de usuário (para limitar mudanças frequentes)
        ultima_troca_nome: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // NOVO — status da conta, usado pelo painel de administrador.
        // 'ativo': uso normal. 'banido': impedido de logar/usar o site,
        // reversível pelo admin. 'excluido': exclusão "suave" — a conta e
        // o conteúdo ligado a ela continuam no banco (preservando
        // referências de posts/materiais), mas o login fica bloqueado e
        // o usuário some das listagens públicas.
        status_conta: {
            type: DataTypes.ENUM('ativo', 'banido', 'excluido'),
            allowNull: false,
            defaultValue: 'ativo'
        },

        // Motivo opcional informado pelo admin ao banir/excluir
        motivo_status: {
            type: DataTypes.STRING(300),
            allowNull: true
        }

    }, {
        tableName: 'usuario',
        timestamps: false
    });

    Usuario.associate = (models) => {
        Usuario.hasOne(models.UsuarioDocente, {
            foreignKey: 'usuario_id',
            as: 'docente'
        });
        Usuario.hasOne(models.UsuarioDiscente, {
            foreignKey: 'usuario_id',
            as: 'discente'
        });
    };

    return Usuario;
};