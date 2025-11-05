import { DataSourceOptions } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Wallet } from './src/entities/wallet.entity';
import { PaymentSession } from './src/entities/payment-session.entity';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'wallet_db',
  entities: [User, Wallet, PaymentSession],
  synchronize: true,
  logging: false,
};

export default config;
