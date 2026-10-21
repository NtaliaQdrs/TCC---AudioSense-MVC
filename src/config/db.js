import { Sequelize } from 'sequelize';
import 'dotenv/config';

const variaveisObrigatorias = ['DB_DATABASE', 'DB_USER', 'DB_HOST'];
const variaveisAusentes = variaveisObrigatorias.filter(nome => !process.env[nome]?.trim());
if (variaveisAusentes.length) {
    throw new Error(
        `Configure as variáveis do banco no arquivo .env: ${variaveisAusentes.join(', ')}.`
    );
}

const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        dialect: 'postgres',       
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,

        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },

        timezone: '-03:00',
        logging: false
    }
);

console.log('Conectando em:', process.env.DB_HOST, process.env.DB_DATABASE);

export default sequelize;