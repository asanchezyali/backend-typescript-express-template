import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
// import { Product } from '../entities/Product.js'; // Descomenta si tienes Product
import config from '../config.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: true,
  logging: config.nodeEnv === 'development',
  entities: [User /*, Product */],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  }
};
