import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        dialect: 'mysql',       
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,  // <- porta padrão do MySQL
        
        timezone: '-03:00',
        logging: false
    }
);

export default sequelize;